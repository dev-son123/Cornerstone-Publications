import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

/**
 * AuthCallback
 *
 * Supabase redirects here after Google (or any OAuth) login.
 * The URL hash contains access_token, refresh_token etc.
 * Supabase JS client auto-detects hash tokens and establishes a session.
 * We listen for auth state changes and redirect once signed in.
 */
export default function AuthCallback() {
    const navigate = useNavigate();
    const handled = useRef(false);

    useEffect(() => {
        // Listen for the auth state change triggered by hash token processing
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            // Supabase fires SIGNED_IN or INITIAL_SESSION when it processes hash tokens
            if (session && !handled.current) {
                handled.current = true;
                // Clear the hash from the URL
                window.history.replaceState(null, '', window.location.pathname);
                sessionStorage.setItem('adminPortalSession', 'true');
                const adminPath = import.meta.env.VITE_ADMIN_PORTAL_PATH || '/portal-cRs7x9mK';
                navigate(adminPath, { replace: true, state: { fromAuth: true } });
            }
        });

        // Fallback: if Supabase already processed the hash before our listener attached
        const fallbackCheck = async () => {
            // Small delay to let Supabase process the hash fragment
            await new Promise(r => setTimeout(r, 1000));
            
            if (handled.current) return;
            
            const { data: { session } } = await supabase.auth.getSession();
            if (session && !handled.current) {
                handled.current = true;
                window.history.replaceState(null, '', window.location.pathname);
                sessionStorage.setItem('adminPortalSession', 'true');
                navigate('/portal-cRs7x9mK', { replace: true, state: { fromAuth: true } });
            }
        };

        fallbackCheck();

        return () => {
            listener.subscription.unsubscribe();
        };
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4 text-gray-600">
                <Loader2 className="w-10 h-10 animate-spin text-[#FFB7C5]" />
                <p className="text-lg font-medium">Finishing sign-in…</p>
                <p className="text-sm text-gray-400">Please wait, you'll be redirected shortly.</p>
            </div>
        </div>
    );
}
