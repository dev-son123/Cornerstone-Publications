// src/hooks/useAdminAuth.ts
// Handles: login with email+password, then TOTP verification (Google Authenticator)

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Session, AuthMFAChallengeResponse } from "@supabase/supabase-js";

type AuthStep = "idle" | "password" | "totp" | "dashboard" | "enroll_totp";

export function useAdminAuth() {
  const [step, setStep]           = useState<AuthStep>("idle");
  const [session, setSession]     = useState<Session | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [factorId, setFactorId]   = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  // For TOTP enrollment
  const [totpQR, setTotpQR]       = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);

  // ── Restore session on mount ─────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const mfaLevel = await getAssuranceLevel();
        if (mfaLevel === "aal2") {
          setSession(data.session);
          setStep("dashboard");
        } else if (mfaLevel === "aal1") {
          // Session exists but TOTP not verified yet this session
          await startTOTPChallenge();
        }
      } else {
        setStep("password");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => { if (!s) { setSession(null); setStep("password"); } }
    );
    return () => subscription.unsubscribe();
  }, []);

  // ── Helpers ──────────────────────────────────────────────
  async function getAssuranceLevel(): Promise<string> {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    return data?.currentLevel ?? "aal1";
  }

  const startTOTPChallenge = useCallback(async () => {
    setError(null);
    // Get enrolled factors
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const totp = factorsData?.totp?.[0];

    if (!totp) {
      // No TOTP enrolled yet — begin enrollment
      setStep("enroll_totp");
      await enrollTOTP();
      return;
    }

    setFactorId(totp.id);
    const { data: challenge, error: challengeErr } =
      await supabase.auth.mfa.challenge({ factorId: totp.id });

    if (challengeErr) { setError(challengeErr.message); return; }
    setChallengeId((challenge as AuthMFAChallengeResponse["data"])!.id);
    setStep("totp");
  }, []);

  // ── Step 1: Email + Password login ───────────────────────
  const loginWithPassword = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { data, error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (loginErr) { setError(loginErr.message); return; }
    if (!data.session) { setError("Login failed — no session returned."); return; }

    // Check if TOTP is enrolled
    await startTOTPChallenge();
  }, [startTOTPChallenge]);

  // ── Step 2: Verify TOTP code ─────────────────────────────
  const verifyTOTP = useCallback(async (code: string) => {
    if (!factorId || !challengeId) { setError("Challenge not initialised."); return; }
    setLoading(true);
    setError(null);

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: code.replace(/\s/g, ""),
    });

    setLoading(false);
    if (verifyErr) { setError("Invalid code. Try again."); return; }

    // After successful verification, get the updated session
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      setSession(sessionData.session);
    }
    setStep("dashboard");
  }, [factorId, challengeId]);

  // ── Enroll TOTP (first-time setup) ───────────────────────
  const enrollTOTP = useCallback(async () => {
    const { data, error: enrollErr } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Cornerstone Admin",
    });
    if (enrollErr) { setError(enrollErr.message); return; }

    setFactorId(data.id);
    setTotpQR(data.totp.qr_code);    // SVG string — render directly
    setTotpSecret(data.totp.secret);  // Show as backup
    setStep("enroll_totp");
  }, []);

  // ── Confirm enrollment with first TOTP code ───────────────
  const confirmEnrollment = useCallback(async (code: string) => {
    if (!factorId) { setError("No factor ID."); return; }
    setLoading(true);
    setError(null);

    // Challenge then verify to confirm enrollment
    const { data: challenge, error: challengeErr } =
      await supabase.auth.mfa.challenge({ factorId });
    if (challengeErr) { setError(challengeErr.message); setLoading(false); return; }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.replace(/\s/g, ""),
    });

    setLoading(false);
    if (verifyErr) { setError("Invalid code. Make sure you scanned the QR correctly."); return; }

    // After successful verification, get the updated session
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      setSession(sessionData.session);
    }
    setStep("dashboard");
  }, [factorId]);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setStep("password");
    setFactorId(null);
    setChallengeId(null);
  }, []);

  return {
    step, session, loading, error,
    totpQR, totpSecret,
    loginWithPassword, verifyTOTP,
    enrollTOTP, confirmEnrollment,
    logout,
  };
}
