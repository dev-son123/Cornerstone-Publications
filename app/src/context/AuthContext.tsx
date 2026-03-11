import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'client' | 'editor' | 'senior_editor' | 'admin';

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
  if (/network|fetch/i.test(msg))
    return 'Network error. Check your internet connection.';
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
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ? mapSupabaseUser(data.session.user) : null);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ? mapSupabaseUser(newSession.user) : null);
      setIsLoading(false);
    });

    return () => { listener.subscription.unsubscribe(); };
  }, []);

  // ── Email / password login ──────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
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
      fetch("https://formsubmit.co/ajax/cornerstoneresearch2022@gmail.com", {
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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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
