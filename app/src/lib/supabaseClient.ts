// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

// ── Article — matches YOUR exact articles table ───────────
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
  abstract?: string;          // general abstract field
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

// ── Submission — matches YOUR exact submissions table ─────
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
  status: string;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message?: string;
  status: "new" | "read" | "replied";
  created_at: string;
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
