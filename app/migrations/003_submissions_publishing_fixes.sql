-- Migration 003 — Submissions reaching the admin, publishing, delete, perf
--
-- Fixes, in order:
--   1. Schema drift    — the two submission forms write different column names,
--                        and the admin UI writes columns that were never created.
--   2. RLS             — the admin literally cannot SELECT, UPDATE or DELETE any
--                        submission today. This is why submissions "never arrive".
--   3. Publishing      — articles need a link back to the submission they came
--                        from, plus the journal they belong to.
--   4. Performance     — indexes for the queries the admin portal actually runs.
--
-- Apply: Supabase Dashboard → SQL Editor → paste → Run.
-- Requires migration 002 to have been run first (it defines public.is_admin()).
-- Re-runnable: yes.

BEGIN;

-- Migration 002 must already exist; fail loudly rather than half-applying.
DO $$
BEGIN
  IF to_regprocedure('public.is_admin()') IS NULL THEN
    RAISE EXCEPTION 'Run 002_current_issue_admin_rls.sql first — public.is_admin() is missing';
  END IF;
END $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. public.submissions — reconcile the schema with what the app writes
-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFIED against the live project: submissions has "code" and does NOT have
-- "affiliation_code". src/pages/Submission.tsx was writing "affiliation_code",
-- so PostgREST rejected every submission from /submit with
--   PGRST204 "Could not find the 'affiliation_code' column"
-- *after* the manuscript file had already been uploaded. That is the primary
-- reason submissions never reached the admin portal. The fix is in the app
-- (it now writes "code"); the statement below is only a safety net for a
-- database that has not been through the same history.
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS code TEXT;

-- Verified present on the live table already; kept as no-op safety for other
-- environments. Without them every status change fails with PGRST204.
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS status_email_sent  BOOLEAN     NOT NULL DEFAULT false;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS status_updated_at  TIMESTAMPTZ;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS manuscript_title   TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS journal            TEXT;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS supplementary_url  TEXT;

-- The status vocabulary the Submission Manager renders. Rows inserted with the
-- old lowercase 'pending' show up unstyled and match no status button, so
-- normalise them to the canonical label.
UPDATE public.submissions
SET status = 'Pending Review'
WHERE status IS NULL OR lower(btrim(status)) IN ('pending', 'pending review', '');

ALTER TABLE public.submissions ALTER COLUMN status SET DEFAULT 'Pending Review';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. public.submissions RLS — THE reason submissions never reach the admin
-- ─────────────────────────────────────────────────────────────────────────────
-- The only SELECT policy was:
--     USING (auth.uid() = user_id OR jwt.email = author_email)
-- Submissions are created anonymously, so user_id IS NULL and author_email is
-- the author's, never the admin's. The admin therefore matched zero rows — the
-- Submission Manager was correctly querying an empty result set.
-- There were also NO update and NO delete policies at all, so status changes
-- returned 200 with 0 rows affected and silently did nothing.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'submissions'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.submissions', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Authors keep seeing their own submissions; admins see all of them.
CREATE POLICY "submissions_select_own_or_admin"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR user_id = (SELECT auth.uid())
    OR author_email = (SELECT auth.jwt() ->> 'email')
  );

-- The public submission form is not behind a login, so anon must be able to
-- insert. It may not choose its own status or backdate itself.
CREATE POLICY "submissions_insert_public"
  ON public.submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (user_id IS NULL OR user_id = (SELECT auth.uid()))
    AND status = 'Pending Review'
  );

-- Only the admin moves a submission through the workflow.
CREATE POLICY "submissions_update_admin"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only the admin deletes a submission (Part 5).
CREATE POLICY "submissions_delete_admin"
  ON public.submissions FOR DELETE
  TO authenticated
  USING (public.is_admin());

REVOKE UPDATE, DELETE ON public.submissions FROM anon;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Storage: manuscript_files
-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFIED against the live project: an anonymous upload to manuscript_files is
-- currently rejected with "new row violates row-level security policy". The
-- submission form is public, so this fails at the very first step — before the
-- database insert is even attempted. The policy in SUPABASE_SUBMISSIONS_FIX.sql
-- that was supposed to allow this was evidently never applied to this project.
--
-- Writes stay confined to the "manuscripts/" prefix that Submission.tsx uploads
-- into, so the bucket cannot be used as an arbitrary public file drop.
DROP POLICY IF EXISTS "Anyone can upload into the manuscripts folder" ON storage.objects;
DROP POLICY IF EXISTS "manuscript_files_public_insert" ON storage.objects;
CREATE POLICY "manuscript_files_public_insert"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'manuscript_files' AND name LIKE 'manuscripts/%');

-- Reviewers and the admin need to open the uploaded file from its public URL.
DROP POLICY IF EXISTS "manuscript_files_public_read" ON storage.objects;
CREATE POLICY "manuscript_files_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'manuscript_files');

-- Deleting a submission must also remove its uploaded files, but there was no
-- DELETE policy on this bucket at all, so files would be orphaned forever.
DROP POLICY IF EXISTS "manuscript_files_admin_delete" ON storage.objects;
CREATE POLICY "manuscript_files_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'manuscript_files' AND public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. public.articles — columns the publish workflow needs
-- ─────────────────────────────────────────────────────────────────────────────
-- volume/issue/year VERIFIED already present. They drive which articles
-- CurrentIssueSection shows but were never populated on publish, so a freshly
-- published article could land outside the current issue and appear to
-- "not publish". That part of the fix is in AdminDashboard.handlePublish.
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS volume  INTEGER;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS issue   INTEGER;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS year    INTEGER;

-- VERIFIED MISSING on the live project — the publish handler now writes both,
-- so publishing WILL fail with PGRST204 until this migration has been run.
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS journal TEXT;

-- The submission → published article relationship the workflow requires, and
-- the thing that makes double-clicking Publish idempotent.
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS source_submission_id BIGINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'articles_source_submission_id_fkey'
  ) THEN
    ALTER TABLE public.articles
      ADD CONSTRAINT articles_source_submission_id_fkey
      FOREIGN KEY (source_submission_id)
      REFERENCES public.submissions(id)
      ON DELETE SET NULL;   -- deleting a submission must NOT delete the article
  END IF;
END $$;

-- One published article per submission — a second Publish click cannot create
-- a duplicate even if it slips past the UI guard.
CREATE UNIQUE INDEX IF NOT EXISTS articles_source_submission_id_key
  ON public.articles (source_submission_id)
  WHERE source_submission_id IS NOT NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Indexes for the queries the admin portal and journal actually run
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS submissions_created_at_idx
  ON public.submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS submissions_status_idx
  ON public.submissions (status);
CREATE INDEX IF NOT EXISTS submissions_user_id_idx
  ON public.submissions (user_id);
CREATE INDEX IF NOT EXISTS submissions_author_email_idx
  ON public.submissions (author_email);

-- Matches CurrentIssueSection's filter + ordering.
CREATE INDEX IF NOT EXISTS articles_published_vol_issue_idx
  ON public.articles (published, volume DESC, issue DESC, created_at DESC);

COMMIT;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Verify
-- ─────────────────────────────────────────────────────────────────────────────
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'submissions'
ORDER BY ordinal_position;

-- Expect 4 policies: select (own or admin), insert (public), update, delete.
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'submissions'
ORDER BY cmd;

SELECT status, count(*) FROM public.submissions GROUP BY status ORDER BY 2 DESC;
