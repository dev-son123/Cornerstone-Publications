// src/hooks/usePublishedArticles.ts
// Fetches published articles from Supabase for the journal page
// Usage: const { articles, loading } = usePublishedArticles();

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Article {
  id: number;
  title: string;
  author_name: string;
  author_email: string;
  abstract: string;
  keywords: string;
  location: string;
  year: number;
  volume_issue: string;
  publication_date: string;
  pdf_url: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
  // Structured abstract fields
  abstract_background: string;
  abstract_objectives: string;
  abstract_methods: string;
  abstract_results: string;
  abstract_conclusion: string;
  references: string;
}

export function usePublishedArticles() {
  const [articles, setArticles]   = useState<Article[]>([]);
  const [featured, setFeatured]   = useState<Article | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        // Fetch all published articles
        const { data, error: err } = await supabase
          .from('articles')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (err) throw err;

        setArticles(data ?? []);

        // Find featured article
        const featuredArticle = (data ?? []).find(a => a.featured);
        setFeatured(featuredArticle ?? null);

      } catch (err: any) {
        console.error('[usePublishedArticles] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return { articles, featured, loading, error };
}
