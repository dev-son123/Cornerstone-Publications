// src/components/journal/JournalSections.tsx
// All data comes live from Supabase.
// When admin toggles Published/Featured/Visible → change appears here immediately.

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Article, PastIssue, EditorialMember } from "../../lib/supabaseClient";

// ── EDITORIAL BOARD ──────────────────────────────────────────
export function EditorialBoardSection() {
  const [members, setMembers]   = useState<EditorialMember[]>([]);
  const [content, setContent]   = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("editorial_board").select("*").eq("visible", true).order("sort_order"),
      supabase.from("journal_sections").select("content").eq("section","editorial").single(),
    ]).then(([b, sec]) => {
      setMembers(b.data ?? []);
      setContent(sec.data?.content ?? "");
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={st.loading}>Loading editorial board...</p>;

  const chiefs     = members.filter(m => m.role === "editor_in_chief");
  const associates = members.filter(m => m.role === "associate_editor");
  const regular    = members.filter(m => m.role === "member");

  return (
    <div>
      {content && <p style={{ fontSize:15, lineHeight:1.7, color:"#444", marginBottom:20 }}>{content}</p>}
      {members.length === 0 && <div style={st.empty}><p style={{ color:"#aaa", margin:0 }}>Editorial board information is being updated.</p></div>}
      {chiefs.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <p style={st.roleTitle}>Editor in Chief</p>
          {chiefs.map(m => <MemberCard key={m.id} m={m} highlight />)}
        </div>
      )}
      {associates.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <p style={st.roleTitle}>Associate Editors</p>
          {associates.map(m => <MemberCard key={m.id} m={m} />)}
        </div>
      )}
      {regular.length > 0 && (
        <div>
          <p style={st.roleTitle}>Board Members</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
            {regular.map(m => <MemberCard key={m.id} m={m} compact />)}
          </div>
        </div>
      )}
    </div>
  );
}

function MemberCard({ m, highlight, compact }: { m: EditorialMember; highlight?: boolean; compact?: boolean }) {
  return (
    <div style={{ background:"#fff", border:`1px solid ${highlight?"#e91e8c44":"#eee"}`, borderLeft:highlight?"3px solid #e91e8c":undefined, borderRadius:10, padding:compact?"10px 14px":"14px 18px", marginBottom:compact?0:8 }}>
      <strong style={{ fontSize:compact?14:15 }}>{m.name}</strong>
      {m.title       && <p style={{ fontSize:13, color:"#555", margin:"3px 0 2px" }}>{m.title}</p>}
      {m.institution && <p style={{ fontSize:12, color:"#888", margin:0 }}>{m.institution}{m.country?`, ${m.country}`:""}</p>}
    </div>
  );
}

// ── PAST ISSUES ──────────────────────────────────────────────
export function PastIssuesSection() {
  const [issues,  setIssues]  = useState<PastIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("past_issues").select("*").eq("visible",true).order("sort_order")
      .then(({ data }) => { setIssues(data??[]); setLoading(false); });
  }, []);

  if (loading) return <p style={st.loading}>Loading past issues...</p>;

  if (issues.length === 0) return (
    <div style={st.empty}>
      <div style={{ fontSize:48, marginBottom:12 }}>📄</div>
      <p style={{ color:"#aaa", margin:0 }}>Archived issues are being updated.</p>
    </div>
  );

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16 }}>
      {issues.map(issue => (
        <div key={issue.id} style={{ background:"#fff", border:"1px solid #eee", borderRadius:10, padding:"20px 18px", textAlign:"center" }}>
          <p style={{ fontSize:18, fontWeight:700, color:"#1a1a2e", margin:"0 0 4px" }}>{issue.label}</p>
          <p style={{ fontSize:13, color:"#888", margin:0 }}>Volume {issue.volume} · {issue.issue_range}</p>
        </div>
      ))}
    </div>
  );
}

// ── SAMPLE ARTICLE ───────────────────────────────────────────
export function SampleArticleSection() {
  const [article, setArticle] = useState<Article|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("articles").select("*")
      .eq("featured",true).eq("published",true)
      .order("updated_at",{ascending:false})
      .limit(1).single()
      .then(({ data }) => { setArticle(data); setLoading(false); });
  }, []);

  if (loading) return <p style={st.loading}>Loading sample article...</p>;

  if (!article) return (
    <div style={st.empty}>
      <p style={{ fontStyle:"italic", color:"#999", margin:0 }}>No sample article currently featured.</p>
    </div>
  );

  return (
    <div style={{ background:"#fff", borderRadius:14, padding:"28px 24px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
      <h2 style={{ fontSize:22, fontWeight:700, color:"#1a1a2e", marginTop:0, marginBottom:16 }}>{article.title}</h2>
      <div style={{ fontSize:14, lineHeight:2, color:"#444", borderLeft:"3px solid #e91e8c", paddingLeft:16, marginBottom:18 }}>
        {article.author_name  && <p style={{margin:0}}><strong>Author:</strong> {article.author_name}</p>}
        {article.author_email   && <p style={{margin:0}}><strong>Email:</strong> {article.author_email}</p>}
        {article.year    && <p style={{margin:0}}><strong>Date:</strong> {article.year}</p>}
        {article.location && <p style={{margin:0}}><strong>Address:</strong> {article.location}</p>}
      </div>
      {article.pdf_url && (
        <a href={article.pdf_url} target="_blank" rel="noopener noreferrer"
          style={{ display:"inline-block", background:"#e91e8c", color:"#fff", padding:"10px 22px", borderRadius:8, textDecoration:"none", fontWeight:600, fontSize:14, marginBottom:20 }}>
          Download PDF ↓
        </a>
      )}
      {article.abstract && (
        <div>
          <h3 style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>Abstract</h3>
          <p style={{ fontSize:14, lineHeight:1.7, color:"#444" }}>{article.abstract}</p>
        </div>
      )}
      {article.keywords && (
        <p style={{ marginTop:16, fontSize:13 }}>
          <strong>Keywords:</strong> <span style={{ color:"#555" }}>{article.keywords}</span>
        </p>
      )}
    </div>
  );
}

// ── MANUSCRIPT SUBMISSION FORM ───────────────────────────────
// Matches YOUR exact submissions table schema
export function ManuscriptForm() {
  const empty = { author_name:"", author_email:"", country:"", code:"", affiliation:"", journal:"", manuscript_title:"", message:"" };
  const [form, setForm]       = useState(empty);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState<string|null>(null);

  const set = (f: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [f]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error: err } = await supabase.from("submissions").insert([{
      author_name:      form.author_name.trim(),
      author_email:     form.author_email.trim(),
      country:          form.country.trim()          || null,
      code:             form.code.trim()             || null,
      affiliation:      form.affiliation.trim()      || null,
      journal:          form.journal.trim()          || null,
      manuscript_title: form.manuscript_title.trim() || null,
      message:          form.message.trim()          || null,
      status:           "Pending Review",
    }]);
    setLoading(false);
    if (err) { setError("Submission failed. Please try again."); return; }
    setSuccess(true); setForm(empty);
  };

  if (success) return (
    <div style={{ textAlign:"center", padding:"40px 20px" }}>
      <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
      <h3 style={{ color:"#2e7d32" }}>Manuscript submitted!</h3>
      <p style={{ color:"#555" }}>We'll review and respond within 5–7 business days.</p>
      <button onClick={() => setSuccess(false)} style={{ marginTop:16, padding:"8px 20px", borderRadius:8, border:"1px solid #ddd", cursor:"pointer", background:"#fff" }}>
        Submit another
      </button>
    </div>
  );

  const I: React.CSSProperties = { width:"100%", boxSizing:"border-box", border:"1.5px solid #e0e0e0", borderRadius:8, padding:"9px 12px", fontSize:14, fontFamily:"inherit", outline:"none" };
  const L: React.CSSProperties = { display:"block", fontSize:13, fontWeight:500, marginBottom:5 };

  return (
    <div style={{ maxWidth:700, margin:"0 auto" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div><label style={L}>Author name <span style={{color:"#e91e8c"}}>*</span></label><input style={I} value={form.author_name} onChange={set("author_name")} placeholder="First Last" required /></div>
        <div><label style={L}>Email <span style={{color:"#e91e8c"}}>*</span></label><input style={I} type="email" value={form.author_email} onChange={set("author_email")} placeholder="you@university.edu" required /></div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:14 }}>
        <div><label style={L}>Country</label><input style={I} value={form.country} onChange={set("country")} placeholder="India" /></div>
        <div><label style={L}>Code</label><input style={I} value={form.code} onChange={set("code")} placeholder="Institutional code" /></div>
      </div>
      <div style={{ marginTop:14 }}><label style={L}>Affiliation</label><input style={I} value={form.affiliation} onChange={set("affiliation")} placeholder="Department, Organization, City, Country" /></div>
      <div style={{ marginTop:14 }}><label style={L}>Journal</label><input style={I} value={form.journal} onChange={set("journal")} placeholder="Journal name" /></div>
      <div style={{ marginTop:14 }}><label style={L}>Manuscript title <span style={{color:"#e91e8c"}}>*</span></label><input style={I} value={form.manuscript_title} onChange={set("manuscript_title")} placeholder="Title of your paper" required /></div>
      <div style={{ marginTop:14, marginBottom:20 }}><label style={L}>Message</label><textarea style={{...I,minHeight:100,resize:"vertical"}} value={form.message} onChange={set("message")} placeholder="Additional notes..." /></div>
      {error && <p style={{ color:"#c62828", background:"#ffebee", padding:"8px 12px", borderRadius:8, fontSize:13, marginBottom:12 }}>{error}</p>}
      <button onClick={submit} disabled={loading || !form.author_name || !form.author_email || !form.manuscript_title}
        style={{ width:"100%", padding:"12px 0", background:"#e91e8c", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", opacity:loading?0.7:1 }}>
        {loading ? "Submitting..." : "Submit Manuscript →"}
      </button>
    </div>
  );
}

const st = {
  loading:  { color:"#aaa", fontStyle:"italic", padding:"20px 0" } as React.CSSProperties,
  roleTitle:{ fontSize:13, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.05em", color:"#888", marginBottom:12 },
  empty:    { background:"#fafafa", border:"1px dashed #ddd", borderRadius:12, padding:"40px 24px", textAlign:"center" as const },
};
