// src/components/journal/JournalSections.tsx
// All data comes live from Supabase.
// When admin toggles Published/Featured/Visible → change appears here immediately.

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Article, PastIssue, EditorialMember } from "../../lib/supabaseClient";

// ── EDITORIAL BOARD ──────────────────────────────────────────
export function EditorialBoardSection() {
  const [members, setMembers] = useState<EditorialMember[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("editorial_board").select("*").eq("visible", true).order("sort_order"),
      supabase.from("journal_sections").select("content").eq("section", "editorial").single(),
    ]).then(([b, sec]) => {
      setMembers(b.data ?? []);
      setContent(sec.data?.content ?? "");
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-gray-400 italic py-5">Loading editorial board...</p>;

  const chiefs = members.filter(m => m.role === "editor_in_chief");
  const associates = members.filter(m => m.role === "associate_editor");
  const regular = members.filter(m => m.role === "member");

  return (
    <div>
      {content && <p className="text-sm leading-relaxed text-gray-700 mb-5">{content}</p>}
      {members.length === 0 && <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center"><p className="text-gray-400 m-0">Editorial board information is being updated.</p></div>}
      {chiefs.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Editor in Chief</p>
          {chiefs.map(m => <MemberCard key={m.id} m={m} highlight />)}
        </div>
      )}
      {associates.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Associate Editors</p>
          {associates.map(m => <MemberCard key={m.id} m={m} />)}
        </div>
      )}
      {regular.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Board Members</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {regular.map(m => <MemberCard key={m.id} m={m} compact />)}
          </div>
        </div>
      )}
    </div>
  );
}

function MemberCard({ m, highlight, compact }: { m: EditorialMember; highlight?: boolean; compact?: boolean }) {
  const highlightBorder = highlight ? "border-pink-500 border-l-4" : "";
  const highlightBg = highlight ? "bg-pink-50" : "bg-white";
  const padding = compact ? "p-3" : "p-4";
  const margin = compact ? "mb-0" : "mb-2";
  
  return (
    <div className={`${highlightBg} border border-gray-200 ${highlightBorder} rounded-lg ${padding} ${margin}`}>
      <strong className={`block ${compact ? "text-sm" : "text-base"}`}>{m.name}</strong>
      {m.title && <p className="text-xs text-gray-600 mt-1 mb-1">{m.title}</p>}
      {m.institution && <p className="text-xs text-gray-500 m-0">{m.institution}{m.country ? `, ${m.country}` : ""}</p>}
    </div>
  );
}

// ── CURRENT ISSUE ────────────────────────────────────────────
export function CurrentIssueSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("articles")
      .select("*")
      .eq("published", true)
      .order("volume", { ascending: false })
      .order("issue", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Get the latest volume & issue
          const latestVolume = data[0].volume;
          const latestIssue = data[0].issue;
          const currentArticles = data.filter(
            (a) => a.volume === latestVolume && a.issue === latestIssue
          );
          setArticles(currentArticles);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-gray-400 italic py-5">Loading current issue...</p>;

  if (articles.length === 0)
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-10 text-center">
        <div className="text-5xl mb-3">📰</div>
        <p className="text-gray-400 m-0">
          Current issue articles are being prepared. Check back soon!
        </p>
      </div>
    );

  const vol = articles[0].volume;
  const iss = articles[0].issue;

  return (
    <div>
      <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg border border-pink-200">
        <p className="m-0 text-sm font-semibold text-pink-900">
          Volume {vol}{iss ? ` · Issue ${iss}` : ""}
        </p>
      </div>
      <div className="space-y-4">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-pink-300 transition-all"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {article.title}
            </h3>
            {article.author_name && (
              <p className="text-sm text-gray-600 mb-1">
                <strong>Author:</strong> {article.author_name}
              </p>
            )}
            {article.year && (
              <p className="text-xs text-gray-500 mb-2">
                <strong>Year:</strong> {article.year}
              </p>
            )}
            {article.abstract && (
              <p className="text-xs text-gray-700 leading-relaxed mb-2">
                {article.abstract.length > 250
                  ? article.abstract.substring(0, 250) + "…"
                  : article.abstract}
              </p>
            )}
            {article.keywords && (
              <p className="text-xs text-gray-500 mb-2">
                <strong>Keywords:</strong> {article.keywords}
              </p>
            )}
            {article.pdf_url && (
              <a
                href={article.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-pink-500 text-white px-4 py-2 rounded text-xs font-semibold hover:bg-pink-600 transition-colors"
              >
                Download PDF ↓
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PAST ISSUES ──────────────────────────────────────────────
export function PastIssuesSection() {
  const [issues, setIssues] = useState<PastIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("past_issues").select("*").eq("visible", true).order("sort_order")
      .then(({ data }) => { setIssues(data ?? []); setLoading(false); });
  }, []);

  if (loading) return <p className="text-gray-400 italic py-5">Loading past issues...</p>;

  if (issues.length === 0) return (
    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-10 text-center">
      <div className="text-5xl mb-3">📄</div>
      <p className="text-gray-400 m-0">Archived issues are being updated.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {issues.map(issue => (
        <div key={issue.id} className="bg-white border border-gray-200 rounded-lg p-5 text-center hover:shadow-md transition-shadow">
          <p className="text-lg font-bold text-gray-900 mb-1">{issue.label}</p>
          <p className="text-xs text-gray-500 m-0">Volume {issue.volume} · {issue.issue_range}</p>
        </div>
      ))}
    </div>
  );
}

// ── SAMPLE ARTICLE ───────────────────────────────────────────
export function SampleArticleSection() {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("articles").select("*")
      .eq("featured", true).eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(1).single()
      .then(({ data }) => { setArticle(data); setLoading(false); });
  }, []);

  if (loading) return <p className="text-gray-400 italic py-5">Loading sample article...</p>;

  if (!article) return (
    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-10 text-center">
      <p className="italic text-gray-400 m-0">No sample article currently featured.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h2>
      <div className="text-sm leading-loose text-gray-700 border-l-4 border-pink-500 pl-4 mb-4">
        {article.author_name && <p className="m-0"><strong>Author:</strong> {article.author_name}</p>}
        {article.author_email && <p className="m-0"><strong>Email:</strong> {article.author_email}</p>}
        {article.year && <p className="m-0"><strong>Date:</strong> {article.year}</p>}
        {article.location && <p className="m-0"><strong>Address:</strong> {article.location}</p>}
      </div>
      {article.pdf_url && (
        <a href={article.pdf_url} target="_blank" rel="noopener noreferrer"
          className="inline-block bg-pink-500 text-white px-6 py-3 rounded text-sm font-semibold mb-5 hover:bg-pink-600 transition-colors">
          Download PDF ↓
        </a>
      )}
      {article.abstract && (
        <div>
          <h3 className="text-base font-semibold mb-2">Abstract</h3>
          <p className="text-sm leading-relaxed text-gray-700">{article.abstract}</p>
        </div>
      )}
      {article.keywords && (
        <p className="mt-4 text-xs">
          <strong>Keywords:</strong> <span className="text-gray-600">{article.keywords}</span>
        </p>
      )}
    </div>
  );
}

// ── MANUSCRIPT SUBMISSION FORM ───────────────────────────────
// Matches YOUR exact submissions table schema
export function ManuscriptForm() {
  const empty = { author_name: "", author_email: "", country: "", code: "", affiliation: "", manuscript_title: "", message: "" };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (f: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [f]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error: err } = await supabase.from("submissions").insert([{
      author_name: form.author_name.trim(),
      author_email: form.author_email.trim(),
      country: form.country.trim() || null,
      code: form.code.trim() || null,
      affiliation: form.affiliation.trim() || null,
      manuscript_title: form.manuscript_title.trim() || null,
      message: form.message.trim() || null,
      status: "Pending Review",
    }]);
    setLoading(false);
    if (err) { setError("Submission failed. Please try again."); return; }
    setSuccess(true); setForm(empty);
  };

  if (success) return (
    <div className="text-center py-10 px-5">
      <div className="text-5xl mb-3">✅</div>
      <h3 className="text-green-700 font-semibold">Manuscript submitted!</h3>
      <p className="text-gray-600">We'll review and respond within 5–7 business days.</p>
      <button onClick={() => setSuccess(false)} className="mt-4 px-5 py-2 rounded border border-gray-300 hover:bg-gray-50 cursor-pointer font-medium text-sm">
        Submit another
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Author name <span className="text-pink-500">*</span></label>
          <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 outline-none" value={form.author_name} onChange={set("author_name")} placeholder="First Last" required />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Email <span className="text-pink-500">*</span></label>
          <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 outline-none" type="email" value={form.author_email} onChange={set("author_email")} placeholder="you@university.edu" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Country</label>
          <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 outline-none" value={form.country} onChange={set("country")} placeholder="India" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Code</label>
          <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 outline-none" value={form.code} onChange={set("code")} placeholder="Institutional code" />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-xs font-semibold mb-1">Affiliation</label>
        <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 outline-none" value={form.affiliation} onChange={set("affiliation")} placeholder="Department, Organization, City, Country" />
      </div>
      <div className="mt-4">
        <label className="block text-xs font-semibold mb-1">Manuscript title <span className="text-pink-500">*</span></label>
        <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 outline-none" value={form.manuscript_title} onChange={set("manuscript_title")} placeholder="Title of your paper" required />
      </div>
      <div className="mt-4 mb-5">
        <label className="block text-xs font-semibold mb-1">Message</label>
        <textarea className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-vertical min-h-24" value={form.message} onChange={set("message")} placeholder="Additional notes..." />
      </div>
      {error && <p className="text-red-600 bg-red-50 px-3 py-2 rounded text-xs mb-3">{error}</p>}
      <button onClick={submit} disabled={loading || !form.author_name || !form.author_email || !form.manuscript_title}
        className="w-full py-3 bg-pink-500 text-white rounded-lg text-sm font-semibold hover:bg-pink-600 disabled:opacity-70 transition-colors">
        {loading ? "Submitting..." : "Submit Manuscript →"}
      </button>
    </div>
  );
}
