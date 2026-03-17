// src/components/journal/SampleArticleSection.tsx
// Uses YOUR exact articles column names

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Article } from "../../lib/supabaseClient";

export function SampleArticleSection() {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("articles")
      .select("*")
      .eq("featured", true)
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => { setArticle(data); setLoading(false); });
  }, []);

  if (loading) return <p style={{ color: "#aaa", fontStyle: "italic" }}>Loading sample article...</p>;

  if (!article) return (
    <div style={{ background: "#fafafa", border: "1px dashed #ddd", borderRadius: 12, padding: "40px 24px", textAlign: "center" }}>
      <p style={{ color: "#aaa", margin: 0, fontStyle: "italic" }}>No sample article currently featured.</p>
      <p style={{ color: "#bbb", margin: "8px 0 0", fontSize: 13 }}>Set an article as "Featured" in the admin panel to show it here.</p>
    </div>
  );

  // Build abstract sections — show structured or general
  const abstractSections = [
    { label: "Background",  value: article.abstract_background  },
    { label: "Objectives",  value: article.abstract_objectives  },
    { label: "Methods",     value: article.abstract_methods     },
    { label: "Results",     value: article.abstract_results     },
    { label: "Conclusion",  value: article.abstract_conclusion  },
  ].filter(s => s.value);

  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "28px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginTop: 0, marginBottom: 16 }}>
        {article.title}
      </h2>

      {/* Meta */}
      <div style={{ borderLeft: "3px solid #e91e8c", paddingLeft: 16, marginBottom: 20, fontSize: 14, lineHeight: 2.2, color: "#444" }}>
        {article.author_name    && <p style={{ margin: 0 }}><strong>Author:</strong> {article.author_name}</p>}
        {article.author_email   && <p style={{ margin: 0 }}><strong>Email:</strong> {article.author_email}</p>}
        {article.publication_date && <p style={{ margin: 0 }}><strong>Date:</strong> {article.publication_date}</p>}
        {article.year           && !article.publication_date && <p style={{ margin: 0 }}><strong>Year:</strong> {article.year}</p>}
        {article.location       && <p style={{ margin: 0 }}><strong>Address:</strong> {article.location}</p>}
        {article.volume_issue   && <p style={{ margin: 0 }}><strong>Volume/Issue:</strong> {article.volume_issue}</p>}
      </div>

      {/* PDF button */}
      {article.pdf_url && (
        <a href={article.pdf_url} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", background: "#e91e8c", color: "#fff", padding: "10px 22px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14, marginBottom: 24 }}>
          Download PDF ↓
        </a>
      )}

      {/* Abstract — structured sections if available, otherwise general */}
      {abstractSections.length > 0 ? (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Abstract</h3>
          {abstractSections.map(sec => (
            <div key={sec.label} style={{ marginBottom: 12 }}>
              <strong style={{ fontSize: 14 }}>{sec.label}:</strong>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#444", margin: "4px 0 0" }}>{sec.value}</p>
            </div>
          ))}
        </div>
      ) : article.abstract ? (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Abstract</h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#444" }}>{article.abstract}</p>
        </div>
      ) : null}

      {/* Keywords */}
      {article.keywords && (
        <p style={{ marginTop: 16, fontSize: 13 }}>
          <strong>Keywords:</strong>{" "}
          <span style={{ color: "#555" }}>{article.keywords}</span>
        </p>
      )}

      {/* References */}
      {article.references && (
        <div style={{ marginTop: 20, borderTop: "1px solid #eee", paddingTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>References</h3>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: "#555", whiteSpace: "pre-line" }}>
            {article.references}
          </p>
        </div>
      )}
    </div>
  );
}
