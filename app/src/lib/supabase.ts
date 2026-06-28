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
    { auth: { 
        persistSession: isSupabaseReady,
        detectSessionInUrl: true,
        flowType: 'implicit',
    } }
);

if (!isSupabaseReady) {
    console.info(
        '[Cornerstone] Running in demo mode — Supabase not configured.\n' +
        'To enable real auth & database: add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to app/.env'
    );
}

// ── Type Definitions ───────────────────────────────────────────

export interface Article {
  id: number;
  title: string;
  author_name?: string;
  author_email?: string;
  publication_date?: string;
  location?: string;
  volume_issue?: string;
  abstract_background?: string;
  abstract_objectives?: string;
  abstract_methods?: string;
  abstract_results?: string;
  abstract_conclusion?: string;
  abstract?: string;
  keywords?: string;
  references?: string;
  status?: string;
  pdf_url?: string;
  published: boolean;
  featured: boolean;
  year?: number;
  volume?: number;
  issue?: number;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: number;
  user_id?: string;
  author_name?: string;
  author_email?: string;
  country?: string;
  code?: string;
  affiliation?: string;
  message?: string;
  journal?: string;
  manuscript_title?: string;
  manuscript_url?: string;
  supplementary_url?: string;
  status?: string;
  created_at?: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PastIssue {
  id: string;
  year: number;
  volume: number;
  issue_range: string;
  label: string;
  visible: boolean;
  sort_order: number;
}

export interface EditorialMember {
  id: string;
  name: string;
  title?: string;
  institution?: string;
  country?: string;
  role: "editor_in_chief" | "associate_editor" | "member";
  visible: boolean;
  sort_order: number;
}
