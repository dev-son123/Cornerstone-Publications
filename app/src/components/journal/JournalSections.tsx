// src/components/journal/JournalSections.tsx
// All data comes live from Supabase.
// When admin toggles Published/Visible → change appears here immediately.

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
    // published = true is the single source of truth for "publicly visible".
    // past_issue_id IS NULL keeps Current Issue and Past Issues disjoint: once a
    // paper is filed into an archive collection it belongs to that collection,
    // not to the current issue. RLS additionally hides anything unpublished.
    supabase
      .from("articles")
      .select("*")
      .eq("published", true)
      .is("past_issue_id", null)
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
// Two views in one component: the grid of collections, and — once a collection
// is clicked — that collection's published papers grouped by issue number.
// Everything is read from the database; nothing here is hardcoded.

type ArchivePaper = Pick<
  Article,
  "id" | "title" | "author_name" | "abstract" | "keywords" | "pdf_url" | "issue" | "year"
> & { pages?: string; doi?: string };

export function PastIssuesSection() {
  const [issues, setIssues] = useState<PastIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIssue, setOpenIssue] = useState<PastIssue | null>(null);

  useEffect(() => {
    // No .eq("visible", true) needed — RLS (migration 004, Part D) only returns
    // visible collections to non-admins, and an admin legitimately sees the
    // hidden ones here too. Ordering by year keeps it correct even when
    // sort_order was never set.
    supabase
      .from("past_issues")
      .select("*")
      .order("year", { ascending: false })
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setIssues(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-gray-400 italic py-5">Loading past issues...</p>;

  if (openIssue) {
    return <CollectionView issue={openIssue} onBack={() => setOpenIssue(null)} />;
  }

  if (issues.length === 0) return (
    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-10 text-center">
      <div className="text-5xl mb-3">📄</div>
      <p className="text-gray-400 m-0">Archived issues are being updated.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {issues.map(issue => (
        <button
          key={issue.id}
          type="button"
          onClick={() => setOpenIssue(issue)}
          className="bg-white border border-gray-200 rounded-lg p-5 text-center hover:shadow-md hover:border-pink-300 transition-all cursor-pointer w-full"
        >
          <p className="text-lg font-bold text-gray-900 mb-1">{issue.label}</p>
          <p className="text-xs text-gray-500 m-0">Volume {issue.volume} · {issue.issue_range}</p>
          <p className="text-[11px] text-pink-600 font-semibold mt-2 m-0">View papers →</p>
        </button>
      ))}
    </div>
  );
}

// ── ONE COLLECTION'S PAPERS ──────────────────────────────────
function CollectionView({ issue, onBack }: { issue: PastIssue; onBack: () => void }) {
  const [papers, setPapers] = useState<ArchivePaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Papers are linked by past_issue_id (migration 004, Part D). Older rows published
    // before that column existed are matched on (year, volume) as a fallback so
    // nothing already in the archive disappears.
    (async () => {
      const cols = "id,title,author_name,abstract,keywords,pdf_url,issue,year,pages,doi";
      const { data: linked } = await supabase
        .from("articles").select(cols)
        .eq("past_issue_id", issue.id).eq("published", true);

      let rows = linked ?? [];
      if (rows.length === 0) {
        const { data: legacy } = await supabase
          .from("articles").select(cols)
          .eq("published", true).eq("year", issue.year).eq("volume", issue.volume);
        rows = legacy ?? [];
      }
      if (!cancelled) {
        rows.sort((a, b) => (a.issue ?? 0) - (b.issue ?? 0));
        setPapers(rows as ArchivePaper[]);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [issue.id, issue.year, issue.volume]);

  // Group by issue number so a collection with several issues reads clearly.
  const groups = papers.reduce<Record<string, ArchivePaper[]>>((acc, p) => {
    const key = p.issue != null ? String(p.issue) : "other";
    (acc[key] ||= []).push(p);
    return acc;
  }, {});
  const groupKeys = Object.keys(groups).sort((a, b) =>
    a === "other" ? 1 : b === "other" ? -1 : Number(a) - Number(b));

  return (
    <div>
      <button type="button" onClick={onBack}
        className="text-sm font-semibold text-pink-600 hover:text-pink-700 mb-4">
        ← Back to Past Issues
      </button>

      <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg border border-pink-200">
        <p className="m-0 text-base font-bold text-pink-900">{issue.label}</p>
        <p className="m-0 text-sm text-pink-800">
          Volume {issue.volume} · {issue.year} · {issue.issue_range}
        </p>
      </div>

      {loading ? (
        <p className="text-gray-400 italic py-5">Loading papers...</p>
      ) : papers.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-10 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-400 m-0">No papers have been published in this collection yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupKeys.map(key => (
            <div key={key}>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                {key === "other" ? "Other papers" : `Issue ${key}`}
              </p>
              <div className="space-y-4">
                {groups[key].map(p => <ArchivePaperCard key={p.id} p={p} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArchivePaperCard({ p }: { p: ArchivePaper }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-pink-300 transition-all">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
      {p.author_name && (
        <p className="text-sm text-gray-600 mb-1"><strong>Authors:</strong> {p.author_name}</p>
      )}
      <p className="text-xs text-gray-500 mb-2">
        {p.issue != null && <><strong>Issue:</strong> {p.issue}&nbsp;&nbsp;</>}
        {p.pages && <><strong>Pages:</strong> {p.pages}&nbsp;&nbsp;</>}
        {p.doi && <><strong>DOI:</strong> {p.doi}</>}
      </p>
      {open && p.abstract && (
        <p className="text-xs text-gray-700 leading-relaxed mb-2">{p.abstract}</p>
      )}
      {open && p.keywords && (
        <p className="text-xs text-gray-500 mb-2"><strong>Keywords:</strong> {p.keywords}</p>
      )}
      <div className="flex gap-2 mt-3">
        {p.abstract && (
          <button type="button" onClick={() => setOpen(o => !o)}
            className="bg-white border border-pink-300 text-pink-600 px-4 py-2 rounded text-xs font-semibold hover:bg-pink-50 transition-colors">
            {open ? "Hide" : "Read Paper"}
          </button>
        )}
        {p.pdf_url && (
          <a href={p.pdf_url} target="_blank" rel="noopener noreferrer"
            className="inline-block bg-pink-500 text-white px-4 py-2 rounded text-xs font-semibold hover:bg-pink-600 transition-colors">
            View PDF ↓
          </a>
        )}
      </div>
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
