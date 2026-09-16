-- Migration 002 — Admin-only writes for the Current Issue / published papers
--
-- Goal
--   * ANY visitor (logged out included) may READ published papers.
--   * ONLY administrators may INSERT / UPDATE / DELETE papers, and only
--     administrators may upload article PDFs.
--   * The rule is enforced by Postgres, so it holds even when someone bypasses
--     the UI and calls PostgREST / supabase-js / the storage API directly with
--     the public anon key.
--
-- Definition of "administrator" — identical to src/hooks/useIsAdmin.ts:
--   public.profiles.role = 'admin', OR the primary admin account.
--   No new role system is introduced; this reads the existing profiles table.
--
-- How to apply
--   Supabase Dashboard → SQL Editor → New query → paste → Run.
--   (Or `supabase db push` if you manage migrations through the CLI.)
--   Editing this file alone changes nothing — it must be run against the
--   live project.
--
-- Re-runnable: yes, the whole file is idempotent.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. The single server-side role check
-- ─────────────────────────────────────────────────────────────────────────────
-- SECURITY DEFINER so it can read profiles/auth.users without tripping over
-- the RLS policies that themselves call this function (no recursion).
-- Do NOT enable FORCE ROW LEVEL SECURITY on public.profiles or that guarantee
-- disappears.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND lower(u.email) = 'info.cornerstoneresearch@gmail.com'
    );
$$;

-- Anonymous callers have auth.uid() = NULL, so this returns false for them.
REVOKE ALL     ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. public.articles — the published-papers table behind Current Issue
-- ─────────────────────────────────────────────────────────────────────────────
-- This repository contains no SQL for public.articles, so what is live is
-- unknown. Drop every existing policy first: a single leftover permissive
-- policy (e.g. "enable all for everyone") would keep public writes open and
-- silently defeat everything below.
-- NOTE: this drops policies only. No rows are touched — existing published
-- papers are left exactly as they are.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'articles'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.articles', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- READ: everyone, including logged-out visitors, sees published papers.
-- Admins additionally see drafts (the admin portal's article list needs this).
CREATE POLICY "articles_read_published_or_admin"
  ON public.articles FOR SELECT
  TO anon, authenticated
  USING (published IS TRUE OR public.is_admin());

-- WRITE: administrators only.
CREATE POLICY "articles_admin_insert"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "articles_admin_update"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "articles_admin_delete"
  ON public.articles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Defence in depth: the anon role has no business writing here at all, so take
-- the privilege away as well as relying on RLS. (Admins are `authenticated`,
-- so their grants are untouched.)
REVOKE INSERT, UPDATE, DELETE ON public.articles FROM anon;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Storage: the article-pdfs bucket
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-pdfs', 'article-pdfs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Only policies scoped to this bucket are touched — the manuscript_files
-- policies from SUPABASE_SUBMISSIONS_FIX.sql keep working unchanged.
DROP POLICY IF EXISTS "article_pdfs_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "article_pdfs_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "article_pdfs_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "article_pdfs_admin_delete" ON storage.objects;

-- Anyone can download a published paper's PDF.
CREATE POLICY "article_pdfs_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'article-pdfs');

-- Only administrators can put files in, replace them, or remove them.
CREATE POLICY "article_pdfs_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-pdfs' AND public.is_admin());

CREATE POLICY "article_pdfs_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'article-pdfs' AND public.is_admin())
  WITH CHECK (bucket_id = 'article-pdfs' AND public.is_admin());

CREATE POLICY "article_pdfs_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-pdfs' AND public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Stop privilege escalation into the 'admin' role
-- ─────────────────────────────────────────────────────────────────────────────
-- Everything above is worthless if a normal user can just make themselves an
-- admin. Two existing routes allowed exactly that:
--
--   a) supabase_setup.sql's "allow_own_profile_update" has USING (id =
--      auth.uid()) and NO WITH CHECK, so any signed-in user could run
--      supabase.from('profiles').update({ role: 'admin' }) on their own row.
--   b) handle_new_user() copies raw_user_meta_data->>'role' into
--      profiles.role, so anyone could call supabase.auth.signUp() with
--      { data: { role: 'admin' } } and be created as an admin.
--
-- Policies alone cannot express "you may update your row but not this column",
-- so a trigger enforces the column rule and the policies handle row access.

DROP POLICY IF EXISTS "allow_own_profile_select" ON public.profiles;
DROP POLICY IF EXISTS "allow_own_profile_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_self_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Read your own profile; admins read everyone (the Authors tab needs this).
CREATE POLICY "profiles_select_self_or_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin());

-- AuthContext upserts a missing profile for the signed-in user.
CREATE POLICY "profiles_insert_self_or_admin"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "profiles_update_self_or_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- The column-level rule: only an admin may set or change `role`.
CREATE OR REPLACE FUNCTION public.profiles_guard_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Silently downgrade a self-declared role instead of failing the signup.
    IF NEW.role IS DISTINCT FROM 'client' AND NOT public.is_admin() THEN
      NEW.role := 'client';
    END IF;
  ELSIF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only an administrator can change a profile role'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_role ON public.profiles;
CREATE TRIGGER profiles_guard_role
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_guard_role();

COMMIT;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Promote your admin account (run once, edit the email if needed)
-- ─────────────────────────────────────────────────────────────────────────────
-- The trigger above blocks role changes from non-admins, but statements you
-- run in the SQL editor execute as a superuser, so this works.
UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE u.id = p.id
  AND lower(u.email) = 'info.cornerstoneresearch@gmail.com'
  AND p.role <> 'admin';


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Verify
-- ─────────────────────────────────────────────────────────────────────────────
-- Expect: articles = 4 policies (1 read, 3 admin writes), rowsecurity = true.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('articles', 'profiles')
ORDER BY tablename, cmd, policyname;

SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('articles', 'profiles');

-- Review this list by hand: any storage policy that grants INSERT/UPDATE/DELETE
-- without a bucket_id filter would also apply to article-pdfs.
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY cmd, policyname;
