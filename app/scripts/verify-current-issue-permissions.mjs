// Verifies that Current Issue / published-paper permissions are enforced by the
// DATABASE, not just by the UI. Run this AFTER applying
// app/migrations/002_current_issue_admin_rls.sql.
//
//   node app/scripts/verify-current-issue-permissions.mjs
//
// It always runs the anonymous checks. To also exercise real signed-in
// accounts, set credentials before running, e.g.
//
//   NONADMIN_EMAIL=author@x.com NONADMIN_PASSWORD=... \
//   ADMIN_EMAIL=info.cornerstoneresearch@gmail.com ADMIN_PASSWORD=... \
//   node app/scripts/verify-current-issue-permissions.mjs
//
// Any probe row that gets created is deleted again before the script exits.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs.readFileSync(path.join(here, '..', '.env'), 'utf8')
    .split(/\r?\n/)
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    }),
);

const BASE = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_ANON_KEY;
if (!BASE || !ANON) {
  console.error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing from app/.env');
  process.exit(1);
}

let pass = 0;
let fail = 0;
let skip = 0;
function check(name, ok, detail) {
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? `  - ${detail}` : ''}`);
  if (ok) pass++; else fail++;
}
/**
 * PostgREST answers an UPDATE/DELETE that matched no rows and one that RLS
 * filtered out identically (204, empty). On an empty table the two cannot be
 * told apart, so report that honestly instead of claiming a pass or a fail.
 */
function inconclusive(name, detail) {
  console.log(`  SKIP  ${name}  - INCONCLUSIVE: ${detail}`);
  skip++;
}

const headers = token => ({
  apikey: ANON,
  Authorization: `Bearer ${token ?? ANON}`,
  'Content-Type': 'application/json',
});

const denied = s => s === 401 || s === 403;

async function signIn(email, password) {
  const r = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) {
    console.log(`  (could not sign in as ${email}: ${r.status} ${await r.text()})`);
    return null;
  }
  return (await r.json()).access_token;
}

const PROBE = {
  title: 'ZZ_PERMISSION_PROBE_DELETE_ME',
  author_name: 'permission probe',
  published: false,
};

async function tryInsert(token) {
  const r = await fetch(`${BASE}/rest/v1/articles`, {
    method: 'POST',
    headers: { ...headers(token), Prefer: 'return=representation' },
    body: JSON.stringify([PROBE]),
  });
  return { status: r.status, body: await r.text() };
}

async function tryDelete(token, id) {
  const r = await fetch(`${BASE}/rest/v1/articles?id=eq.${id}`, {
    method: 'DELETE',
    headers: headers(token),
  });
  return { status: r.status, body: await r.text() };
}

async function cleanUp(token, body) {
  try {
    const id = JSON.parse(body)?.[0]?.id;
    if (id != null) {
      await tryDelete(token, id);
      console.log(`    (removed leaked probe row ${id})`);
    }
  } catch {
    /* body was not a row array */
  }
}

// ── Anonymous visitor ───────────────────────────────────────────────────────
console.log('\nAnonymous visitor (logged out)');

// How many published articles anon can see. Several checks below are only
// meaningful when this is non-zero.
let visiblePublished = 0;

{
  // Tests 7 and 10: published papers must stay readable by everyone.
  const r = await fetch(
    `${BASE}/rest/v1/articles?select=id,title,published&published=eq.true&limit=5`,
    { headers: headers() },
  );
  const rows = r.ok ? JSON.parse(await r.text()) : [];
  visiblePublished = rows.length;
  check('can read published papers', r.ok, `status ${r.status}, ${rows.length} row(s)`);
  if (r.ok && rows.length === 0) {
    console.log('        (no published articles exist yet — publish one to make the write checks meaningful)');
  }
}

{
  const r = await fetch(`${BASE}/rest/v1/articles?select=id&published=eq.false&limit=5`, {
    headers: headers(),
  });
  const rows = r.ok ? JSON.parse(await r.text()) : [];
  check('cannot read unpublished drafts', r.ok && rows.length === 0,
    `status ${r.status}, ${rows.length} row(s)`);
}

{
  // Test 9: a direct API insert must be rejected.
  const { status, body } = await tryInsert(null);
  check('cannot INSERT an article', denied(status), `status ${status} ${body.slice(0, 120)}`);
  if (!denied(status)) await cleanUp(null, body);
}

{
  // Uses Prefer: return=representation so a permitted-but-empty update is
  // distinguishable from a blocked one by the returned row count.
  const r = await fetch(`${BASE}/rest/v1/articles?published=eq.true`, {
    method: 'PATCH',
    headers: { ...headers(), Prefer: 'return=representation' },
    body: JSON.stringify({ title: 'ZZ_HIJACK_PROBE' }),
  });
  const body = await r.text();
  if (denied(r.status)) {
    check('cannot UPDATE articles', true, `status ${r.status}`);
  } else if (visiblePublished === 0) {
    inconclusive('cannot UPDATE articles',
      `status ${r.status} but there are no published rows to update`);
  } else {
    const changed = (() => { try { return JSON.parse(body).length; } catch { return -1; } })();
    check('cannot UPDATE articles', changed === 0, `status ${r.status}, ${changed} row(s) changed`);
  }
}

{
  const r = await fetch(`${BASE}/rest/v1/articles?published=eq.true`, {
    method: 'DELETE',
    headers: { ...headers(), Prefer: 'return=representation' },
  });
  const body = await r.text();
  if (denied(r.status)) {
    check('cannot DELETE articles', true, `status ${r.status}`);
  } else if (visiblePublished === 0) {
    inconclusive('cannot DELETE articles',
      `status ${r.status} but there are no published rows to delete`);
  } else {
    const removed = (() => { try { return JSON.parse(body).length; } catch { return -1; } })();
    check('cannot DELETE articles', removed === 0, `status ${r.status}, ${removed} row(s) deleted`);
  }
}

{
  // The storage API reports an RLS rejection as HTTP 400 with an inner
  // statusCode of 403, so status alone is not enough to judge it.
  const r = await fetch(`${BASE}/storage/v1/object/article-pdfs/zz_probe_anon.txt`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'text/plain' },
    body: 'probe',
  });
  const body = await r.text();
  const blocked = denied(r.status) || /row-level security|Unauthorized|AccessDenied/i.test(body);
  check('cannot UPLOAD to article-pdfs', blocked, `status ${r.status} ${body.slice(0, 90)}`);
}

// ── The public submission path must WORK for an anonymous author ────────────
// (Part 3.) These are the three steps that were each independently broken.
console.log('\nPublic manuscript submission path (anonymous author)');

{
  const path = `manuscripts/zz_probe_${Date.now()}.txt`;
  const r = await fetch(`${BASE}/storage/v1/object/manuscript_files/${path}`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Content-Type': 'text/plain' },
    body: 'probe',
  });
  const body = await r.text();
  check('CAN upload a manuscript file', r.ok, `status ${r.status} ${body.slice(0, 120)}`);
}

{
  // Exactly the row shape AND the Prefer header src/pages/Submission.tsx sends.
  // return=minimal matters: asking for the row back (return=representation)
  // needs a SELECT policy that anonymous submitters correctly do not have, so
  // it fails even though the insert itself is permitted.
  const r = await fetch(`${BASE}/rest/v1/submissions`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify([{
      author_name: 'ZZ Probe', author_email: 'zz@probe.invalid', country: 'Testland',
      code: 'ZZ', affiliation: 'Probe Institute', message: 'automated check',
      manuscript_title: 'ZZ_SUBMISSION_PROBE_DELETE_ME', journal: 'Probe Journal',
      manuscript_url: '', supplementary_url: '', status: 'Pending Review',
    }]),
  });
  const body = await r.text();
  const ok = r.status === 201;
  check('CAN create a submission row', ok, `status ${r.status} ${body.slice(0, 140)}`);

  if (ok) {
    // The row cannot be read back as anon by design, so clean it up with the
    // admin account when credentials are available. Otherwise say so plainly.
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const t = await signIn(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
      if (t) {
        const find = await fetch(
          `${BASE}/rest/v1/submissions?select=id,status&manuscript_title=eq.ZZ_SUBMISSION_PROBE_DELETE_ME`,
          { headers: headers(t) });
        const rows = find.ok ? JSON.parse(await find.text()) : [];
        check('admin CAN see the new submission', rows.length > 0,
          `${rows.length} row(s), status "${rows[0]?.status ?? '-'}"`);
        check('status was forced to Pending Review',
          rows.every(x => x.status === 'Pending Review'),
          rows.map(x => x.status).join(', ') || 'n/a');

        let deleted = 0;
        for (const row of rows) {
          const d = await fetch(`${BASE}/rest/v1/submissions?id=eq.${row.id}`, {
            method: 'DELETE', headers: headers(t) });
          if (d.status === 204 || d.status === 200) deleted++;
        }
        check('admin CAN delete the probe submission(s)', deleted === rows.length,
          `${deleted}/${rows.length} removed`);
      }
    } else {
      console.log('        NOTE: a probe row titled ZZ_SUBMISSION_PROBE_DELETE_ME was created.');
      console.log('        Delete it from the Submission Manager, or re-run with ADMIN_EMAIL/ADMIN_PASSWORD set.');
    }
  }
}

// ── Signed-in non-admin: tests 4, 5, 6, 8, 9 ────────────────────────────────
if (process.env.NONADMIN_EMAIL && process.env.NONADMIN_PASSWORD) {
  console.log('\nSigned-in non-admin (author / reviewer / editor)');
  const token = await signIn(process.env.NONADMIN_EMAIL, process.env.NONADMIN_PASSWORD);
  if (token) {
    const me = await fetch(`${BASE}/rest/v1/profiles?select=id,role`, { headers: headers(token) });
    const rows = me.ok ? JSON.parse(await me.text()) : [];
    console.log(`  role reported by the database: ${rows[0]?.role ?? 'unknown'}`);

    const read = await fetch(`${BASE}/rest/v1/articles?select=id&published=eq.true&limit=3`, {
      headers: headers(token),
    });
    check('can still read published papers', read.ok, `status ${read.status}`);

    const ins = await tryInsert(token);
    check('cannot INSERT an article', denied(ins.status),
      `status ${ins.status} ${ins.body.slice(0, 120)}`);
    if (!denied(ins.status)) await cleanUp(token, ins.body);

    const up = await fetch(`${BASE}/storage/v1/object/article-pdfs/zz_probe_user.txt`, {
      method: 'POST',
      headers: { apikey: ANON, Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' },
      body: 'probe',
    });
    check('cannot UPLOAD to article-pdfs', denied(up.status), `status ${up.status}`);

    // Privilege escalation: self-promotion to admin must be refused, otherwise
    // every check above can be walked around.
    const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const esc = await fetch(`${BASE}/rest/v1/profiles?id=eq.${claims.sub}`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify({ role: 'admin' }),
    });
    check('cannot promote self to admin', esc.status >= 400, `status ${esc.status}`);
  }
} else {
  console.log('\nSigned-in non-admin: skipped (set NONADMIN_EMAIL / NONADMIN_PASSWORD)');
}

// ── Signed-in admin: tests 1, 2, 3 ──────────────────────────────────────────
if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  console.log('\nSigned-in admin');
  const token = await signIn(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  if (token) {
    const ins = await tryInsert(token);
    const ok = ins.status === 201;
    check('CAN INSERT an article', ok, `status ${ins.status} ${ins.body.slice(0, 120)}`);
    if (ok) {
      const id = JSON.parse(ins.body)?.[0]?.id;
      const del = await tryDelete(token, id);
      check('CAN DELETE an article', del.status === 204, `status ${del.status}`);
    }
  }
} else {
  console.log('\nSigned-in admin: skipped (set ADMIN_EMAIL / ADMIN_PASSWORD)');
}

console.log(`\n${pass} passed, ${fail} failed${skip ? `, ${skip} inconclusive` : ''}`);
process.exit(fail === 0 ? 0 : 1);
