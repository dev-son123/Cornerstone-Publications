import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const PLACEHOLDER_URL = 'https://your-project-ref.supabase.co';
const PLACEHOLDER_KEY = 'your-anon-public-key-here';

/** true only when real credentials are present */
export const isSupabaseReady =
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    supabaseUrl !== PLACEHOLDER_URL &&
    supabaseAnonKey !== PLACEHOLDER_KEY;

// Always create a client — if keys are placeholders the client simply won't
// reach the network (calls fail silently; we guard with isSupabaseReady).
export const supabase = createClient(
    isSupabaseReady ? supabaseUrl! : 'https://placeholder.supabase.co',
    isSupabaseReady ? supabaseAnonKey! : 'placeholder',
    { auth: { persistSession: isSupabaseReady } }
);

if (!isSupabaseReady) {
    console.info(
        '[Cornerstone] Running in demo mode — Supabase not configured.\n' +
        'To enable real auth & database: add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to app/.env'
    );
}
