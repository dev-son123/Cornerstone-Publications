// src/components/journal/PublishedArticlesList.tsx
// Shows all published articles from Supabase on the journal page
//
// HOW TO USE — In your Journal.tsx, find the 'home' view section and add:
//   import { PublishedArticlesList } from '@/components/journal/PublishedArticlesList';
//   Then inside view === 'home', add <PublishedArticlesList /> wherever you want

import { useState } from 'react';
import { usePublishedArticles } from '@/hooks/usePublishedArticles';

export function PublishedArticlesList() {
  const { articles, loading, error } = usePublishedArticles();
  const [expanded, setExpanded] = useState<number | null>(null);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: '#888', fontFamily: 'system-ui' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #fce7f3', borderTopColor: '#d63384', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <p>Loading articles...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: '20px', background: '#ffebee', borderRadius: 10, color: '#c62828', fontFamily: 'system-ui', fontSize: 14 }}>
      Could not load articles. Please refresh the page.
    </div>
  );

  if (articles.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa', fontFamily: 'system-ui' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
      <p style={{ fontSize: 16, margin: 0 }}>No articles published yet.</p>
      <p style={{ fontSize: 13, margin: '8px 0 0' }}>Check back soon — articles are added regularly.</p>
    </div>
  );

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: '#0b1120', marginBottom: 8, borderBottom: '4px solid #d63384', paddingBottom: 8, display: 'inline-block' }}>
        Published Articles
      </h2>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
        {articles.length} article{articles.length !== 1 ? 's' : ''} published
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {articles.map((article, idx) => (
          <div key={article.id} style={{
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 16,
            padding: '20px 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.2s',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                {article.featured && (
                  <span style={{ display: 'inline-block', background: '#fce7f3', color: '#d63384', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, marginBottom: 8, textTransform: 'uppercase' }}>
                    ⭐ Featured
                  </span>
                )}
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px', lineHeight: 1.4 }}>
                  {article.title}
                </h3>
                <p style={{ fontSize: 13, color: '#666', margin: '0 0 4px' }}>
                  <strong>Author:</strong> {article.author_name}
                  {article.author_email && (
                    <> · <a href={`mailto:${article.author_email}`} style={{ color: '#d63384', textDecoration: 'none' }}>{article.author_email}</a></>
                  )}
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#999', marginTop: 4 }}>
                  {article.year && <span>📅 {article.year}</span>}
                  {article.location && <span>📍 {article.location}</span>}
                  {article.volume_issue && <span>📖 {article.volume_issue}</span>}
                </div>
              </div>
              {article.pdf_url && (
                <a
                  href={article.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flexShrink: 0, padding: '8px 16px', background: '#d63384', color: '#fff', borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                >
                  PDF ↗
                </a>
              )}
            </div>

            {/* Abstract preview */}
            {article.abstract && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
                  <strong>Abstract:</strong>{' '}
                  {expanded === idx
                    ? article.abstract
                    : article.abstract.slice(0, 200) + (article.abstract.length > 200 ? '...' : '')}
                </p>
                {article.abstract.length > 200 && (
                  <button
                    onClick={() => setExpanded(expanded === idx ? null : idx)}
                    style={{ background: 'none', border: 'none', color: '#d63384', fontSize: 13, cursor: 'pointer', padding: '4px 0', fontWeight: 600 }}
                  >
                    {expanded === idx ? 'Show less ↑' : 'Read more ↓'}
                  </button>
                )}
              </div>
            )}

            {/* Structured abstract (when expanded) */}
            {expanded === idx && (article.abstract_background || article.abstract_methods) && (
              <div style={{ marginTop: 12, background: '#f9fafb', borderRadius: 10, padding: '14px 16px', fontSize: 13, lineHeight: 1.7 }}>
                {article.abstract_background  && <p style={{ margin: '0 0 6px' }}><strong>Background:</strong> {article.abstract_background}</p>}
                {article.abstract_objectives  && <p style={{ margin: '0 0 6px' }}><strong>Objectives:</strong> {article.abstract_objectives}</p>}
                {article.abstract_methods     && <p style={{ margin: '0 0 6px' }}><strong>Methods:</strong> {article.abstract_methods}</p>}
                {article.abstract_results     && <p style={{ margin: '0 0 6px' }}><strong>Results:</strong> {article.abstract_results}</p>}
                {article.abstract_conclusion  && <p style={{ margin: 0 }}><strong>Conclusion:</strong> {article.abstract_conclusion}</p>}
              </div>
            )}

            {/* Keywords */}
            {article.keywords && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {article.keywords.split(',').map((kw, i) => (
                  <span key={i} style={{ background: '#fce7f3', color: '#d63384', fontSize: 11, padding: '2px 10px', borderRadius: 20, border: '1px solid #f9a8d4' }}>
                    {kw.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
