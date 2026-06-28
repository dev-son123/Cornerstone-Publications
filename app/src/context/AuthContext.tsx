import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'client' | 'editor' | 'senior_editor' | 'admin' | 'banned';

export interface AppUser {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  orcidId?: string;
  emailConfirmed: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<{ needsConfirmation: boolean }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Friendly error messages ──────────────────────────────────────────────────

export function friendlyAuthError(error: AuthError | Error | unknown): string {
  if (!error) return 'Something went wrong. Please try again.';
  const msg = (error as { message?: string }).message ?? String(error);

  if (/invalid login credentials/i.test(msg))
    return 'Incorrect email or password. Please try again.';
  if (/email not confirmed/i.test(msg))
    return 'Please confirm your email. Check your inbox for the confirmation link.';
  if (/user already registered/i.test(msg))
    return 'An account with this email already exists. Try signing in.';
  if (/password should be at least/i.test(msg))
    return 'Password must be at least 6 characters.';
  if (/rate.?limit/i.test(msg))
    return 'Too many attempts. Please wait a minute and try again.';
  if (/network|fetch|failed to fetch|err_name_not_resolved|dns/i.test(msg))
    return 'Could not connect to the database. If you are the administrator, your Supabase project may be paused. Please log in to the Supabase Dashboard and restore/resume the project.';
  if (/phone.*invalid|invalid phone/i.test(msg))
    return 'Invalid phone number. Use format: +91XXXXXXXXXX';
  if (/token.*expired|otp.*expired/i.test(msg))
    return 'OTP expired. Please request a new one.';
  if (/invalid.*token|invalid.*otp/i.test(msg))
    return 'Invalid OTP. Please check the code.';

  return msg;
}

// ─── Map Supabase user ────────────────────────────────────────────────────────

function mapSupabaseUser(u: SupabaseUser): AppUser {
  const meta = u.user_metadata ?? {};
  return {
    id: u.id,
    email: u.email ?? '',
    phone: u.phone ?? undefined,
    name: meta.full_name ?? meta.name ?? u.email?.split('@')[0] ?? u.phone ?? 'User',
    role: (meta.role as UserRole) ?? 'client',
    avatarUrl: meta.avatar_url ?? meta.picture ?? undefined,
    orcidId: meta.orcid_id ?? undefined,
    emailConfirmed: !!u.email_confirmed_at,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Admin portal: never auto-restore session — user must log in fresh each visit
    // Constant string to match the specific portal route
    const fetchProfile = async (u: SupabaseUser | null) => {
      if (!u) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      let appUser = mapSupabaseUser(u);
      
      try {
        // Enforce profile presence & fetch real role/metadata from DB
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, full_name, avatar_url')
          .eq('id', u.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile missing — create it
          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert({
              id: u.id,
              full_name: appUser.name,
              role: 'client',
              avatar_url: appUser.avatarUrl
            })
            .select()
            .single();
          if (newProfile) appUser.role = (newProfile.role as UserRole) ?? 'client';
        } else if (profile) {
          appUser.role = (profile.role as UserRole) ?? 'client';
          if (profile.full_name) appUser.name = profile.full_name;
          if (profile.avatar_url) appUser.avatarUrl = profile.avatar_url;
        }
      } catch (err) {
        console.warn('[AuthContext] Profile fetch failed:', err);
      }
      
      setUser(appUser);
      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      fetchProfile(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      fetchProfile(newSession?.user ?? null);
    });

    return () => { listener.subscription.unsubscribe(); };
  }, []);

  // ── Email / password login ──────────────────────────────────────────────────
  const SUPABASE_FN = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
  const ANON_KEY    = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

  async function callRateLimit(action: string): Promise<void> {
    try {
      const res = await fetch(`${SUPABASE_FN}/rate-limiter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
        body: JSON.stringify({ action }),
      });
      if (res.status === 429) {
        const j = await res.json();
        throw new Error(j.message ?? 'Too many attempts. Please wait and try again.');
      }
    } catch (e: any) {
      if (e.message.includes('Too many')) throw e;
      // Network error — allow through (fail open so users aren't locked out)
      console.warn('[rate-limiter] call failed, allowing:', e.message);
    }
  }

  async function callAuthHardening(email: string, event_type: string): Promise<void> {
    try {
      await fetch(`${SUPABASE_FN}/auth-hardening`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
        body: JSON.stringify({ email, event_type }),
      });
    } catch {
      // Non-critical — log failure silently
    }
  }

  const login = async (email: string, password: string): Promise<void> => {
    // 1. Rate limit check (5 attempts per 15 min per IP)
    await callRateLimit('login');

    // 2. Attempt Supabase login
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (error) {
      // 3. Log failed attempt → may trigger lockout
      await callAuthHardening(email.trim(), 'login_failed');
      throw error;
    }

    // 4. Log success → resets lockout counter
    await callAuthHardening(email.trim(), 'login_success');
  };


  // ── Phone OTP – send ────────────────────────────────────────────────────────
  const sendPhoneOtp = async (phone: string): Promise<void> => {
    const formatted = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    if (error) throw error;
  };

  // ── Phone OTP – verify ──────────────────────────────────────────────────────
  const verifyPhoneOtp = async (phone: string, token: string): Promise<void> => {
    const formatted = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
    const { error } = await supabase.auth.verifyOtp({ phone: formatted, token, type: 'sms' });
    if (error) throw error;
  };

  // ── Register ────────────────────────────────────────────────────────────────
  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole = 'client'
  ): Promise<{ needsConfirmation: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim(), role } },
    });
    if (error) throw error;
    // If identities is empty, user already exists (Supabase silent dupe)
    const needsConfirmation = !data.session;

    // Send Admin Notification about new user registration
    if (data.user) {
      fetch("https://formsubmit.co/ajax/info.cornerstoneresearch@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: `New User Registration: ${name.trim()}`,
          Name: name.trim(),
          Email: email.trim(),
          Role: role,
          Message: "A new user has just registered on the Cornerstone website.",
          _template: "table"
        })
      }).catch(console.error);
    }

    return { needsConfirmation };
  };

  // ── Google OAuth ─────────────────────────────────────────────────────────────
  const loginWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'select_account' }
      },
    });
    if (error) throw error;
  };

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // ── Password reset ───────────────────────────────────────────────────────────
  const resetPassword = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user,
      isLoading,
      login,
      sendPhoneOtp,
      verifyPhoneOtp,
      register,
      loginWithGoogle,
      logout,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
