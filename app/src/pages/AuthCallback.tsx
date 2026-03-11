import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

/**
 * AuthCallback
 *
 * Supabase redirects here after Google (or any OAuth) login.
 * The URL contains a `code` query param; Supabase exchanges it for a
 * session automatically via `onAuthStateChange`.
 * We just wait for the session, then forward the user to /dashboard.
 */
export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase handles the code exchange when the client is initialised.
        // We listen once for the resulting SIGNED_IN event, then redirect.
        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                listener.subscription.unsubscribe();
                navigate('/admin/dashboard', { replace: true });
            }
        });

        // Safety net: if already signed in (e.g. token in hash), redirect immediately.
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                listener.subscription.unsubscribe();
                navigate('/admin/dashboard', { replace: true });
            }
        });

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
