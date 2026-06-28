// src/hooks/useAdminAuth.ts
// Magic Link (Email OTP) login — no TOTP/QR code needed
// Flow: enter email → receive magic link email → click link → logged in

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

type AuthStep = "idle" | "email" | "sent" | "dashboard";

const ADMIN_EMAIL = "info.cornerstoneresearch@gmail.com";

export function useAdminAuth() {
  const [step, setStep]       = useState<AuthStep>("idle");
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ── Restore session on mount ─────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // Only allow admin email
        if (data.session.user.email === ADMIN_EMAIL) {
          setSession(data.session);
          setStep("dashboard");
        } else {
          // Wrong user — sign them out
          supabase.auth.signOut();
          setStep("email");
        }
      } else {
        setStep("email");
      }
      setLoading(false);
    });

    // Listen for magic link callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (s) {
          if (s.user.email === ADMIN_EMAIL) {
            setSession(s);
            setStep("dashboard");
          } else {
            await supabase.auth.signOut();
            setError("Access denied. This portal is for admins only.");
            setStep("email");
          }
        } else {
          setSession(null);
          setStep("email");
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  // ── Send Magic Link ───────────────────────────────────────
  const sendMagicLink = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    // Block non-admin emails immediately
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setError("Access denied. Only the admin email can log in.");
      setLoading(false);
      return;
    }

    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/portal-cRs7x9mK`,
      },
    });

    setLoading(false);
    if (otpErr) {
      setError(otpErr.message);
      return;
    }
    setStep("sent");
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setStep("email");
    setError(null);
  }, []);

  return {
    step, session, loading, error,
    sendMagicLink, logout,
  };
}
