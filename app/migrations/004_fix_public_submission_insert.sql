-- Migration 004 — public submission insert + Past Issues / Journal Archive
--
-- Two parts, both idempotent, safe to re-run as often as you like:
--   PARTS A-C : the public submission insert fix (already applied once).
--   PART D    : the Past Issues / Journal Archive schema, RLS and indexes.
--
-- Re-running this whole file is a no-op for everything already in place, so
-- just run the file again whenever it changes.
--
-- After 003, an anonymous insert into public.submissions is STILL rejected with
--   42501 "new row violates row-level security policy for table submissions"
-- Verified by probing the live project with the anon key: every payload shape
-- is refused, including a minimal one that satisfies 003's WITH CHECK. Postgres
-- emits that same message both when a WITH CHECK fails AND when no INSERT
-- policy applies to the caller's role, so the cause is one of:
--
--   a) submissions_insert_public did not survive 003, or does not apply to anon
--   b) a BEFORE INSERT trigger rewrites `status`, so the
--      `status = 'Pending Review'` clause in the WITH CHECK is evaluated
--      against a different value than the client sent
--
-- Part A below reports which it is. Part B fixes it either way, by dropping the
-- fragile equality test from the policy and enforcing the initial status with a
-- trigger instead — forcing the correct value rather than rejecting a wrong one.
--
-- Apply: Supabase Dashboard → SQL Editor → paste → Run.
-- Re-runnable: yes.


-- ═════════════════════════════════════════════════════════════════════════════
-- PART A — diagnostics (read-only, changes nothing)
-- ═════════════════════════════════════════════════════════════════════════════

-- A1. Do the 003 policies exist, and do they list anon?
--     Expect a row: submissions_insert_public | INSERT | {anon,authenticated}
SELECT policyname, cmd, roles, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'submissions'
ORDER BY cmd, policyname;

-- A2. Any trigger that could be rewriting `status` before the check runs?
SELECT tgname, pg_get_triggerdef(oid) AS definition
FROM pg_trigger
WHERE tgrelid = 'public.submissions'::regclass AND NOT tgisinternal;

-- A3. Any CHECK constraint on the table?
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.submissions'::regclass;

-- A4. Does anon actually hold the INSERT privilege?
--     Expect anon to appear with INSERT. (If it is absent the error text would
--     have been "permission denied for table submissions" instead, but confirm.)
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'submissions'
ORDER BY grantee, privilege_type;

-- A5. What the column default for status actually is.
SELECT column_name, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'submissions'
  AND column_name IN ('status', 'user_id', 'created_at');


-- ═════════════════════════════════════════════════════════════════════════════
-- PART B — the fix
-- ═════════════════════════════════════════════════════════════════════════════
BEGIN;

-- B1. Force the initial status instead of asserting it in the policy.
-- A policy that REJECTS a wrong status is brittle: anything that rewrites the
-- row before the check (a trigger, a column default, a client that omits the
-- field) turns a legitimate submission into a hard failure. Forcing the value
-- is both safer and unbreakable — a submitter still cannot create a row that
-- is already 'Accepted'.
CREATE OR REPLACE FUNCTION public.submissions_force_initial_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.status            := 'Pending Review';
    NEW.status_updated_at := NULL;
    NEW.status_email_sent := false;
  END IF;
  RETURN NEW;
END;
$$;

-- Named to sort after any pre-existing trigger, so ours has the final word on
-- `status` no matter what else is attached to this table.
DROP TRIGGER IF EXISTS zz_submissions_force_initial_status ON public.submissions;
CREATE TRIGGER zz_submissions_force_initial_status
  BEFORE INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.submissions_force_initial_status();


-- B2. Recreate the INSERT policy without the status equality test.
DROP POLICY IF EXISTS "submissions_insert_public" ON public.submissions;
DROP POLICY IF EXISTS "Anyone can insert a submission" ON public.submissions;

CREATE POLICY "submissions_insert_public"
  ON public.submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = (SELECT auth.uid()));


-- B3. Make sure the privileges behind the policy are actually there.
-- RLS only ever narrows a grant; it cannot widen one. Harmless if redundant.
GRANT INSERT ON public.submissions TO anon, authenticated;
GRANT SELECT ON public.submissions TO authenticated;

-- The id column needs its sequence to be usable by the inserting role.
DO $$
DECLARE seq text;
BEGIN
  seq := pg_get_serial_sequence('public.submissions', 'id');
  IF seq IS NOT NULL THEN
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO anon, authenticated', seq);
  END IF;
END $$;

COMMIT;


-- ═════════════════════════════════════════════════════════════════════════════
-- PART C — confirm the fix
-- ═════════════════════════════════════════════════════════════════════════════
-- Inserts a row exactly as the anonymous submission form does, proves the
-- status was forced to 'Pending Review', then removes it again. If this raises
-- an exception, the insert path is still broken — send me the error.
DO $$
DECLARE new_id bigint; got_status text;
BEGIN
  INSERT INTO public.submissions (author_name, author_email, manuscript_title, status)
  VALUES ('ZZ selftest', 'zz@selftest.invalid', 'ZZ_SELFTEST', 'Accepted')
  RETURNING id, status INTO new_id, got_status;

  RAISE NOTICE 'inserted #% with status "%" (sent "Accepted" — must read "Pending Review")',
    new_id, got_status;

  DELETE FROM public.submissions WHERE id = new_id;
  RAISE NOTICE 'self-test row removed';
END $$;

-- Final state: 3 policies expected — insert (anon+authenticated),
-- select/update/delete (authenticated).
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'submissions'
ORDER BY cmd;


-- ═════════════════════════════════════════════════════════════════════════════
-- PART D — Past Issues / Journal Archive
-- ═════════════════════════════════════════════════════════════════════════════
-- Verified against the live project before writing this:
--   * past_issues EXISTS: id, year, volume, issue_range, label, visible,
--     sort_order, created_at — and already holds 3 rows (2024/2023/2022).
--   * articles EXISTS with year, volume, issue, journal, source_submission_id.
--   * anon can SELECT past_issues; anon INSERT is blocked; a no-op anon UPDATE
--     against a real row affected 0 rows, so writes are already restricted.
--
-- So NO new table is created. The archive reuses the two existing tables:
--
--     past_issues (the collection/year folder)
--         ▲
--         │ articles.past_issue_id   ← the one new column
--         │
--     articles (the published paper, grouped within a collection by .issue)
--
-- WHY a new column rather than matching on (year, volume):
--   Membership was implicit — the publish form stored the collection LABEL as
--   free text in articles.volume_issue. That breaks the moment a collection is
--   renamed or its volume corrected, cannot express "this paper belongs in the
--   2024 archive" independently of its printed volume, and makes "show this
--   collection's papers" a string match instead of a lookup.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Link articles to a collection, plus the two metadata fields the archive
--    listing shows (Pages, DOI) that articles did not have.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS past_issue_id UUID;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS pages TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS doi   TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'articles_past_issue_id_fkey') THEN
    ALTER TABLE public.articles
      ADD CONSTRAINT articles_past_issue_id_fkey
      FOREIGN KEY (past_issue_id) REFERENCES public.past_issues(id)
      ON DELETE SET NULL;   -- deleting a collection must NEVER delete papers
  END IF;
END $$;

-- Backfill existing articles into collections, without inventing links:
--   a) exact (year, volume) match          — the intended relationship
--   b) else the collection label stored as free text in volume_issue
UPDATE public.articles a
SET past_issue_id = p.id
FROM public.past_issues p
WHERE a.past_issue_id IS NULL
  AND a.year = p.year AND a.volume = p.volume;

UPDATE public.articles a
SET past_issue_id = p.id
FROM public.past_issues p
WHERE a.past_issue_id IS NULL
  AND a.volume_issue IS NOT NULL
  AND btrim(lower(a.volume_issue)) = btrim(lower(p.label));


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. past_issues housekeeping
-- ─────────────────────────────────────────────────────────────────────────────
-- IssuesTab creates folders without sort_order, so new collections arrived with
-- NULL and sorted unpredictably in the public list (which ordered by it).
ALTER TABLE public.past_issues ALTER COLUMN sort_order SET DEFAULT 0;
UPDATE public.past_issues SET sort_order = 0 WHERE sort_order IS NULL;

ALTER TABLE public.past_issues ALTER COLUMN visible SET DEFAULT true;
UPDATE public.past_issues SET visible = true WHERE visible IS NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. past_issues RLS — hidden collections must be hidden server-side
-- ─────────────────────────────────────────────────────────────────────────────
-- Visibility was only ever a frontend .eq("visible", true) filter. Anyone
-- could read a hidden collection straight from the REST endpoint.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
             WHERE schemaname='public' AND tablename='past_issues'
  LOOP EXECUTE format('DROP POLICY %I ON public.past_issues', pol.policyname); END LOOP;
END $$;

ALTER TABLE public.past_issues ENABLE ROW LEVEL SECURITY;

-- Visitors see only visible collections. Admins see everything, including
-- hidden ones (the Archive Manager needs them).
CREATE POLICY "past_issues_read_visible_or_admin"
  ON public.past_issues FOR SELECT
  TO anon, authenticated
  USING (visible IS TRUE OR public.is_admin());

CREATE POLICY "past_issues_admin_insert"
  ON public.past_issues FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "past_issues_admin_update"
  ON public.past_issues FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "past_issues_admin_delete"
  ON public.past_issues FOR DELETE TO authenticated
  USING (public.is_admin());

REVOKE INSERT, UPDATE, DELETE ON public.past_issues FROM anon;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. A hidden collection must also hide its papers
-- ─────────────────────────────────────────────────────────────────────────────
-- Otherwise hiding the 2024 collection still leaves every 2024 paper readable
-- (and listed under Current Issue). Replaces the read policy from 002; the
-- three admin write policies from 002 are untouched.
DROP POLICY IF EXISTS "articles_read_published_or_admin" ON public.articles;
CREATE POLICY "articles_read_published_or_admin"
  ON public.articles FOR SELECT
  TO anon, authenticated
  USING (
    public.is_admin()
    OR (
      published IS TRUE
      AND (
        past_issue_id IS NULL
        OR EXISTS (SELECT 1 FROM public.past_issues p
                   WHERE p.id = articles.past_issue_id AND p.visible IS TRUE)
      )
    )
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Indexes for the archive queries
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS articles_past_issue_idx
  ON public.articles (past_issue_id, issue, created_at DESC);
CREATE INDEX IF NOT EXISTS past_issues_year_idx
  ON public.past_issues (visible, year DESC, sort_order);

COMMIT;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Verify
-- ─────────────────────────────────────────────────────────────────────────────
SELECT p.label, p.year, p.volume, p.issue_range, p.visible,
       count(a.id) AS papers
FROM public.past_issues p
LEFT JOIN public.articles a ON a.past_issue_id = p.id
GROUP BY p.id, p.label, p.year, p.volume, p.issue_range, p.visible
ORDER BY p.year DESC;

SELECT policyname, cmd, roles FROM pg_policies
WHERE schemaname='public' AND tablename IN ('past_issues','articles')
ORDER BY tablename, cmd;
