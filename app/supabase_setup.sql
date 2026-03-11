-- ────────────────────────────────────────────────────────────────────────────
-- Cornerstone – Supabase SQL Setup
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ────────────────────────────────────────────────────────────────────────────

-- ── 1. Payments table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name     TEXT        NOT NULL,
  amount        NUMERIC     NOT NULL,
  currency      TEXT        NOT NULL DEFAULT 'INR',
  method        TEXT        NOT NULL DEFAULT 'UPI',
  upi_app       TEXT,                           -- gpay | phonepe | paytm | bhim | other
  txn_id        TEXT        NOT NULL,           -- UTR / transaction reference from UPI app
  buyer_email   TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'pending_verification',
                                                -- pending_verification | verified | failed
  verified_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Row-level security ────────────────────────────────────────────────────
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Anyone can INSERT (create a payment record without being logged in)
CREATE POLICY "allow_insert_payments"
  ON public.payments FOR INSERT
  WITH CHECK (true);

-- Only the matching email can read their own payments (or admins via service role)
CREATE POLICY "allow_select_own_payments"
  ON public.payments FOR SELECT
  USING (
    buyer_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

-- ── 3. Profiles table (optional – extends auth.users) ────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'client',
  orcid_id    TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update only their own profile
CREATE POLICY "allow_own_profile_select"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "allow_own_profile_update"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Auto-create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
