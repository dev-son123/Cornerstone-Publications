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

  if (loading) return <p className="text-gray-400 italic">Loading sample article...</p>;

  if (!article) return (
    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-10 text-center">
      <p className="text-gray-400 italic m-0">No sample article currently featured.</p>
      <p className="text-gray-400 text-sm mt-2">Set an article as "Featured" in the admin panel to show it here.</p>
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {article.title}
      </h2>

      {/* Meta */}
      <div className="border-l-4 border-pink-500 pl-4 mb-6 text-sm leading-loose text-gray-700">
        {article.author_name    && <p className="m-0"><strong>Author:</strong> {article.author_name}</p>}
        {article.author_email   && <p className="m-0"><strong>Email:</strong> {article.author_email}</p>}
        {article.publication_date && <p className="m-0"><strong>Date:</strong> {article.publication_date}</p>}
        {article.year           && !article.publication_date && <p className="m-0"><strong>Year:</strong> {article.year}</p>}
        {article.location       && <p className="m-0"><strong>Address:</strong> {article.location}</p>}
        {article.volume_issue   && <p className="m-0"><strong>Volume/Issue:</strong> {article.volume_issue}</p>}
      </div>

      {/* PDF button */}
      {article.pdf_url && (
        <a href={article.pdf_url} target="_blank" rel="noopener noreferrer"
          className="inline-block bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold text-sm mb-6 hover:bg-pink-600 transition-colors">
          Download PDF ↓
        </a>
      )}

      {/* Abstract — structured sections if available, otherwise general */}
      {abstractSections.length > 0 ? (
        <div>
          <h3 className="text-base font-semibold mb-3">Abstract</h3>
          {abstractSections.map(sec => (
            <div key={sec.label} className="mb-3">
              <strong className="text-sm">{sec.label}:</strong>
              <p className="text-sm leading-relaxed text-gray-700 mt-1">{sec.value}</p>
            </div>
          ))}
        </div>
      ) : article.abstract ? (
        <div>
          <h3 className="text-base font-semibold mb-2">Abstract</h3>
          <p className="text-sm leading-relaxed text-gray-700">{article.abstract}</p>
        </div>
      ) : null}

      {/* Keywords */}
      {article.keywords && (
        <p className="mt-4 text-xs">
          <strong>Keywords:</strong>{" "}
          <span className="text-gray-600">{article.keywords}</span>
        </p>
      )}

      {/* References */}
      {article.references && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold mb-2">References</h3>
          <p className="text-xs leading-relaxed text-gray-600 whitespace-pre-line">
            {article.references}
          </p>
        </div>
      )}
    </div>
  );
}
