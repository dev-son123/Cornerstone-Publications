// src/hooks/useIsAdmin.ts
// Single source of truth for "is the signed-in user an administrator?".
//
// This is a thin wrapper over the EXISTING auth/role system (AuthContext →
// public.profiles.role). It deliberately does not introduce a second auth or
// role store.
//
// The same rule is implemented server-side as public.is_admin() in
// app/migrations/002_current_issue_admin_rls.sql. Keep the two in sync: a user
// is an admin when profiles.role = 'admin' OR they are the primary admin
// account. Everything this hook does is UX only — the database is what
// actually enforces the permission.

import { useAuth } from '@/context/AuthContext';

/** Mirrored by the email literal inside public.is_admin(). */
export const PRIMARY_ADMIN_EMAIL = 'info.cornerstoneresearch@gmail.com';

/** Role check usable outside React (mirrors public.is_admin()). */
export function isAdminUser(
  user: { email?: string | null; role?: string | null } | null | undefined,
): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL;
}

/**
 * `isAdmin` stays false while the session is still being restored, so an
 * admin-only control never flashes in before the role is known.
 */
export function useIsAdmin(): { isAdmin: boolean; isLoading: boolean } {
  const { user, isLoading } = useAuth();
  return { isAdmin: !isLoading && isAdminUser(user), isLoading };
}
