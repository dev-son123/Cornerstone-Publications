// src/components/admin/ArticlesTab.tsx
// Uses YOUR exact articles table columns

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Article } from "../../lib/supabaseClient";

const s = {
  h3:       { fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 } as React.CSSProperties,
  card:     { background: "#fff", borderRadius: 10, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" } as React.CSSProperties,
  smBtn:    { fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "none", background: "#f5f5f5", cursor: "pointer", color: "#333" } as React.CSSProperties,
  primBtn:  { padding: "9px 18px", background: "#e91e8c", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" } as React.CSSProperties,
  ghostBtn: { padding: "9px 18px", background: "#fff", color: "#555", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, cursor: "pointer" } as React.CSSProperties,
  backBtn:  { background: "none", border: "none", color: "#1565c0", cursor: "pointer", fontSize: 13, padding: "0 0 12px", display: "block" } as React.CSSProperties,
  lbl:      { fontSize: 13, fontWeight: 500, color: "#444", display: "block", marginBottom: 5 } as React.CSSProperties,
  inp:      { width: "100%", boxSizing: "border-box" as const, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "9px 12px", fontSize: 14, fontFamily: "inherit", outline: "none" } as React.CSSProperties,
  togLbl:   { display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", color: "#555" } as React.CSSProperties,
  hint:     { color: "#999", fontSize: 14 } as React.CSSProperties,
};

export function ArticlesTab() {
  const [items,    setItems]   = useState<Article[]>([]);
  const [editing,  setEditing] = useState<Partial<Article> | null>(null);
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving]  = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    if (editing.id) {
      await supabase.from("articles").update(editing).eq("id", editing.id);
    } else {
      await supabase.from("articles").insert([{
        ...editing,
        published: editing.published ?? false,
        featured:  editing.featured  ?? false,
        status:    editing.status    ?? "draft",
      }]);
    }
    setSaving(false);
    setEditing(null);
    load();
  };

  const toggle = async (id: number, field: "published" | "featured", val: boolean) => {
    await supabase.from("articles").update({ [field]: val }).eq("id", id);
    setItems(p => p.map(a => a.id === id ? { ...a, [field]: val } : a));
  };

  const del = async (id: number) => {
    if (!confirm("Delete this article?")) return;
    await supabase.from("articles").delete().eq("id", id);
    setItems(p => p.filter(a => a.id !== id));
  };

  if (loading) return <p style={s.hint}>Loading...</p>;

  // ── Edit form ──────────────────────────────────────────
  if (editing !== null) return (
    <div>
      <button style={s.backBtn} onClick={() => setEditing(null)}>← Back to articles</button>
      <h3 style={s.h3}>{editing.id ? "Edit Article" : "New Article"}</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <label style={s.lbl}>Title *</label>
          <input style={s.inp} value={editing.title ?? ""}
            onChange={e => setEditing(p => ({ ...p!, title: e.target.value }))} />
        </div>
        <div>
          <label style={s.lbl}>Author name</label>
          <input style={s.inp} value={editing.author_name ?? ""}
            onChange={e => setEditing(p => ({ ...p!, author_name: e.target.value }))} />
        </div>
        <div>
          <label style={s.lbl}>Author email</label>
          <input style={s.inp} value={editing.author_email ?? ""}
            onChange={e => setEditing(p => ({ ...p!, author_email: e.target.value }))} />
        </div>
        <div>
          <label style={s.lbl}>Location / Address</label>
          <input style={s.inp} value={editing.location ?? ""}
            onChange={e => setEditing(p => ({ ...p!, location: e.target.value }))} />
        </div>
        <div>
          <label style={s.lbl}>Year</label>
          <input style={s.inp} type="number" value={editing.year ?? ""}
            onChange={e => setEditing(p => ({ ...p!, year: +e.target.value }))} />
        </div>
        <div>
          <label style={s.lbl}>Volume / Issue (e.g. Vol 3, Issue 2)</label>
          <input style={s.inp} value={editing.volume_issue ?? ""}
            onChange={e => setEditing(p => ({ ...p!, volume_issue: e.target.value }))} />
        </div>
        <div>
          <label style={s.lbl}>Keywords</label>
          <input style={s.inp} value={editing.keywords ?? ""}
            onChange={e => setEditing(p => ({ ...p!, keywords: e.target.value }))} />
        </div>
        <div>
          <label style={s.lbl}>PDF URL</label>
          <input style={s.inp} value={editing.pdf_url ?? ""}
            onChange={e => setEditing(p => ({ ...p!, pdf_url: e.target.value }))} />
        </div>
      </div>

      {/* Abstract sections */}
      {([
        ["abstract",              "Abstract (general)"],
        ["abstract_background",   "Abstract — Background"],
        ["abstract_objectives",   "Abstract — Objectives"],
        ["abstract_methods",      "Abstract — Methods"],
        ["abstract_results",      "Abstract — Results"],
        ["abstract_conclusion",   "Abstract — Conclusion"],
        ["references",            "References"],
      ] as [keyof Article, string][]).map(([field, label]) => (
        <div key={field} style={{ marginBottom: 12 }}>
          <label style={s.lbl}>{label}</label>
          <textarea style={{ ...s.inp, minHeight: 80, resize: "vertical" }}
            value={(editing[field] as string) ?? ""}
            onChange={e => setEditing(p => ({ ...p!, [field]: e.target.value }))} />
        </div>
      ))}

      <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
        <label style={s.togLbl}>
          <input type="checkbox" checked={!!editing.published}
            onChange={e => setEditing(p => ({ ...p!, published: e.target.checked }))} />
          Published (visible on journal page)
        </label>
        <label style={s.togLbl}>
          <input type="checkbox" checked={!!editing.featured}
            onChange={e => setEditing(p => ({ ...p!, featured: e.target.checked }))} />
          Featured (shows as Sample Article)
        </label>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button style={s.primBtn} onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Article"}
        </button>
        <button style={s.ghostBtn} onClick={() => setEditing(null)}>Cancel</button>
      </div>
    </div>
  );

  // ── List view ──────────────────────────────────────────
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ ...s.h3, margin: 0 }}>Articles ({items.length})</h3>
        <button style={s.primBtn} onClick={() => setEditing({ published: false, featured: false })}>
          + New Article
        </button>
      </div>

      {items.length === 0 && <p style={s.hint}>No articles yet. Click + New Article to add one.</p>}

      {items.map(a => (
        <div key={a.id} style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 15 }}>{a.title}</strong>
              <p style={{ fontSize: 13, color: "#666", margin: "3px 0" }}>
                {a.author_name ?? "—"} · {a.year ?? "—"}
                {a.volume_issue ? ` · ${a.volume_issue}` : ""}
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
              <label style={s.togLbl}>
                <input type="checkbox" checked={a.published}
                  onChange={e => toggle(a.id, "published", e.target.checked)} />
                <span style={{ fontSize: 12 }}>Published</span>
              </label>
              <label style={s.togLbl}>
                <input type="checkbox" checked={a.featured}
                  onChange={e => toggle(a.id, "featured", e.target.checked)} />
                <span style={{ fontSize: 12 }}>Featured</span>
              </label>
            </div>
          </div>

          {a.abstract && (
            <p style={{ fontSize: 12, color: "#777", margin: "6px 0 8px", lineHeight: 1.4 }}>
              {a.abstract.slice(0, 140)}…
            </p>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button style={s.smBtn} onClick={() => setEditing(a)}>Edit</button>
            <button style={{ ...s.smBtn, color: "#c62828", background: "#ffebee" }}
              onClick={() => del(a.id)}>Delete</button>
            {a.pdf_url && (
              <a href={a.pdf_url} target="_blank" rel="noopener noreferrer"
                style={{ ...s.smBtn, textDecoration: "none", background: "#e3f2fd", color: "#1565c0" }}>
                PDF ↗
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
