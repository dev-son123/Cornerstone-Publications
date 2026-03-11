import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    /** Optional: only these roles may access. Omit = any authenticated user. */
    allowedRoles?: string[];
}

/**
 * Guards a route behind authentication.
 * - While Supabase is restoring the session (isLoading) → shows a spinner
 * - Unauthenticated → redirects to /login, preserving current path in state
 * - Wrong role → redirects to /dashboard
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    // Wait for Supabase to restore the session before making a routing decision
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#FFB7C5]" />
                <p className="text-sm text-gray-400">Loading your session…</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Preserve intended destination so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
