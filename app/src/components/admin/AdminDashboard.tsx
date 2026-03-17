import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Contact, Submission, Article, EditorialMember, PastIssue } from '@/lib/supabaseClient';

type Tab = "overview"|"contacts"|"submissions"|"articles"|"board"|"issues";

const s = {
  shell:    { display:"flex", minHeight:"100vh", fontFamily:"system-ui,sans-serif" } as React.CSSProperties,
  side:     { width:220, background:"#1a1a2e", display:"flex", flexDirection:"column" as const, padding:"24px 0", flexShrink:0 },
  logo:     { padding:"0 20px 24px", borderBottom:"1px solid #333", marginBottom:8 },
  sBtn:     { display:"block", width:"100%", textAlign:"left" as const, padding:"10px 20px", background:"none", border:"none", color:"#ccc", fontSize:14, cursor:"pointer" },
  sActive:  { background:"#e91e8c22", color:"#e91e8c", borderRight:"3px solid #e91e8c" },
  main:     { flex:1, padding:32, background:"#f8f9fa", overflowY:"auto" as const },
  h3:       { fontSize:20, fontWeight:700, color:"#1a1a2e", marginBottom:16 } as React.CSSProperties,
  card:     { background:"#fff", borderRadius:10, padding:"14px 16px", marginBottom:10, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" } as React.CSSProperties,
  kpi:      { background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" } as React.CSSProperties,
  row:      { display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap" as const, gap:8 },
  badge:    { fontSize:11, padding:"2px 8px", borderRadius:10, fontWeight:500 } as React.CSSProperties,
  smBtn:    { fontSize:12, padding:"5px 12px", borderRadius:6, border:"none", background:"#f5f5f5", cursor:"pointer", color:"#333" } as React.CSSProperties,
  primBtn:  { padding:"9px 18px", background:"#e91e8c", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" } as React.CSSProperties,
  ghostBtn: { padding:"9px 18px", background:"#fff", color:"#555", border:"1px solid #ddd", borderRadius:8, fontSize:13, cursor:"pointer" } as React.CSSProperties,
  backBtn:  { background:"none", border:"none", color:"#1565c0", cursor:"pointer", fontSize:13, padding:"0 0 12px", display:"block" } as React.CSSProperties,
  lbl:      { fontSize:13, fontWeight:500, color:"#444", display:"block", marginBottom:5 } as React.CSSProperties,
  inp:      { width:"100%", boxSizing:"border-box" as const, border:"1.5px solid #e0e0e0", borderRadius:8, padding:"9px 12px", fontSize:14, fontFamily:"inherit", outline:"none" } as React.CSSProperties,
  hint:     { color:"#999", fontSize:14 } as React.CSSProperties,
  togLbl:   { display:"flex", alignItems:"center", gap:6, fontSize:13, cursor:"pointer", color:"#555" } as React.CSSProperties,
};

// ── OVERVIEW ─────────────────────────────────────────────────
function Overview() {
  const [counts, setCounts] = useState({contacts:0, submissions:0, articles:0, users:0 });
  useEffect(() => {
    Promise.all([
      supabase.from("contacts").select("id",{count:"exact",head:true}),
      supabase.from("submissions").select("id",{count:"exact",head:true}),
      supabase.from("articles").select("id",{count:"exact",head:true}),
      supabase.rpc("get_user_count"),
    ]).then(([c,sub,a,u]) => setCounts({ contacts:c.count??0, submissions:sub.count??0, articles:a.count??0, users:u.data??0 }));
  },[]);
  const cards = [
    {label:"Contact messages", value:counts.contacts,    color:"#e91e8c"},
    {label:"Submissions",      value:counts.submissions, color:"#1565c0"},
    {label:"Articles",         value:counts.articles,    color:"#2e7d32"},
    {label:"Registered users", value:counts.users,       color:"#6a1b9a"},
  ];
  return (
    <div>
      <h3 style={s.h3}>Overview</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16,marginBottom:32}}>
        {cards.map(c=>(
          <div key={c.label} style={{...s.kpi,borderTop:`3px solid ${c.color}`}}>
            <p style={{fontSize:36,fontWeight:700,margin:"0 0 4px",color:c.color}}>{c.value}</p>
            <p style={{fontSize:13,color:"#888",margin:0}}>{c.label}</p>
          </div>
        ))}
      </div>
      <div style={{background:"#e3f2fd",borderRadius:10,padding:"14px 18px",fontSize:14}}>
        <strong>Live links</strong>
        <ul style={{margin:"8px 0 0",paddingLeft:20,lineHeight:2.2}}>
          <li>Journal → <a href="/journal" target="_blank" style={{color:"#e91e8c"}}>cornerstonepublications.in/journal</a></li>
          <li>Contact → <a href="/contact" target="_blank" style={{color:"#e91e8c"}}>cornerstonepublications.in/contact</a></li>
        </ul>
      </div>
    </div>
  );
}

// ── CONTACTS ─────────────────────────────────────────────────
function ContactsTab() {
  const [items,setItems] = useState<Contact[]>([]);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{
    supabase.from("contacts").select("*").order("created_at",{ascending:false})
      .then(({data})=>{setItems(data??[]);setLoading(false);});
  },[]);
  const mark = async(id:string, status:string)=>{
    await supabase.from("contacts").update({status}).eq("id",id);
    setItems(p=>p.map(c=>c.id===id?{...c,status:status as "new"|"read"|"replied"}:c));
  };
  const statusColor: Record<string,string> = {new:"#fce4ec",read:"#fff3e0",replied:"#e8f5e9"};
  const statusText: Record<string,string>   = {new:"#c2185b",read:"#e65100",replied:"#2e7d32"};
  if(loading) return <p style={s.hint}>Loading...</p>;
  return (
    <div>
      <h3 style={s.h3}>Contact Messages ({items.length})</h3>
      {items.length===0 && <p style={s.hint}>No messages yet.</p>}
      {items.map(c=>(
        <div key={c.id} style={{...s.card, borderLeft:`3px solid ${statusText[c.status]}`}}>
          <div style={s.row}>
            <div>
              <strong style={{fontSize:15}}>{c.name}</strong>
              <span style={{...s.badge,background:statusColor[c.status],color:statusText[c.status],marginLeft:8}}>{c.status}</span>
            </div>
            <small style={{color:"#999"}}>{new Date(c.created_at).toLocaleString("en-IN")}</small>
          </div>
          <p style={{margin:"4px 0 2px",fontSize:13}}>
            <a href={`mailto:${c.email}`} style={{color:"#1565c0"}}>{c.email}</a>
          </p>
          {c.subject && <p style={{margin:"2px 0",fontWeight:500,fontSize:13}}>{c.subject}</p>}
          {c.message && <p style={{margin:"8px 0 10px",fontSize:14,lineHeight:1.5,color:"#333"}}>{c.message}</p>}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button style={s.smBtn} onClick={()=>mark(c.id,"read")}>Mark read</button>
            <button style={{...s.smBtn,background:"#e8f5e9",color:"#2e7d32"}} onClick={()=>mark(c.id,"replied")}>Mark replied</button>
            <a href={`mailto:${c.email}?subject=Re: ${c.subject||"Your enquiry"}`}
              style={{...s.smBtn,textDecoration:"none",background:"#e3f2fd",color:"#1565c0"}}>Reply ↗</a>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── SUBMISSIONS (matches YOUR exact schema) ───────────────────
function SubmissionsTab() {
  const [items,setItems] = useState<Submission[]>([]);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{
    supabase.from("submissions").select("*").order("created_at",{ascending:false})
      .then(({data})=>{setItems(data??[]);setLoading(false);});
  },[]);
  const updateStatus = async(id:number, status:string)=>{
    await supabase.from("submissions").update({status}).eq("id",id);
    setItems(p=>p.map(x=>x.id===id?{...x,status}:x));
  };
  const statuses = ["Pending Review","Under Review","Accepted","Rejected"];
  const statusBg:Record<string,string> = {"Pending Review":"#fff3e0","Under Review":"#e3f2fd","Accepted":"#e8f5e9","Rejected":"#ffebee"};
  if(loading) return <p style={s.hint}>Loading...</p>;
  return (
    <div>
      <h3 style={s.h3}>Manuscript Submissions ({items.length})</h3>
      {items.length===0 && <p style={s.hint}>No submissions yet.</p>}
      {items.map(sub=>(
        <div key={sub.id} style={{...s.card, background:statusBg[sub.status]??"#fff"}}>
          <div style={s.row}>
            <div>
              <strong style={{fontSize:15}}>{sub.manuscript_title??"(No title)"}</strong>
              <span style={{...s.badge,marginLeft:8,background:statusBg[sub.status]??"#eee",color:"#333"}}>{sub.status}</span>
            </div>
            <small style={{color:"#999"}}>{new Date(sub.created_at).toLocaleString("en-IN")}</small>
          </div>
          {sub.author_name && (
            <p style={{fontSize:13,color:"#555",margin:"5px 0 2px"}}>
              <strong>Author:</strong> {sub.author_name}
              {sub.author_email && <> · <a href={`mailto:${sub.author_email}`} style={{color:"#1565c0"}}>{sub.author_email}</a></>}
            </p>
          )}
          {sub.journal && <p style={{fontSize:13,color:"#555",margin:"2px 0"}}><strong>Journal:</strong> {sub.journal}</p>}
          {sub.affiliation && <p style={{fontSize:12,color:"#777",margin:"2px 0"}}>{sub.affiliation}{sub.country?` · ${sub.country}`:""}</p>}
          {sub.message && <p style={{fontSize:13,color:"#333",margin:"6px 0 8px",lineHeight:1.5}}>{sub.message}</p>}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
            {statuses.map(st=>(
              <button key={st} onClick={()=>updateStatus(sub.id,st)}
                style={{...s.smBtn, background:sub.status===st?"#1565c0":"#f0f0f0", color:sub.status===st?"#fff":"#333", fontWeight:sub.status===st?600:400}}>
                {st}
              </button>
            ))}
            {sub.manuscript_url && <a href={sub.manuscript_url} target="_blank" rel="noopener noreferrer" style={{...s.smBtn,textDecoration:"none",background:"#e3f2fd",color:"#1565c0"}}>Manuscript ↗</a>}
            {sub.supplementary_url && <a href={sub.supplementary_url} target="_blank" rel="noopener noreferrer" style={{...s.smBtn,textDecoration:"none",background:"#f3e5f5",color:"#6a1b9a"}}>Supplementary ↗</a>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ARTICLES ─────────────────────────────────────────────────
function ArticlesTab() {
  const [items,setItems]   = useState<Article[]>([]);
  const [editing,setEditing] = useState<Partial<Article>|null>(null);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving]   = useState(false);

  const load = useCallback(async()=>{
    const {data} = await supabase.from("articles").select("*").order("created_at",{ascending:false});
    setItems(data??[]); setLoading(false);
  },[]);
  useEffect(()=>{load();},[load]);

  const save = async()=>{
    if(!editing) return;
    setSaving(true);
    if(editing.id) await supabase.from("articles").update(editing).eq("id",editing.id);
    else           await supabase.from("articles").insert([{...editing,published:editing.published??false,featured:editing.featured??false}]);
    setSaving(false); setEditing(null); load();
  };

  const toggle = async(id:number, field:"published"|"featured", val:boolean)=>{
    await supabase.from("articles").update({[field]:val}).eq("id",id);
    setItems(p=>p.map(a=>a.id===id?{...a,[field]:val}:a));
  };

  const del = async(id:number)=>{
    if(!confirm("Delete this article?")) return;
    await supabase.from("articles").delete().eq("id",id);
    setItems(p=>p.filter(a=>a.id!==id));
  };

  if(loading) return <p style={s.hint}>Loading...</p>;

  if(editing!==null) return (
    <div>
      <button style={s.backBtn} onClick={()=>setEditing(null)}>← Back</button>
      <h3 style={s.h3}>{editing.id?"Edit Article":"New Article"}</h3>
      {(["title","author_name","author_email","location","keywords","pdf_url"] as (keyof Article)[]).map(f=>(
        <div key={String(f)} style={{marginBottom:12}}>
          <label style={s.lbl}>{String(f).replace("_"," ").replace(/\b\w/g,l=>l.toUpperCase())}</label>
          <input style={s.inp} value={(editing[f] as string)??""}
            onChange={e=>setEditing((p: Partial<Article> | null)=>({...p!,[f]:e.target.value}))} />
        </div>
      ))}
      <div style={{marginBottom:12}}>
        <label style={s.lbl}>Abstract</label>
        <textarea style={{...s.inp,minHeight:100,resize:"vertical"}} value={editing.abstract??""}
          onChange={e=>setEditing((p: Partial<Article> | null)=>({...p!,abstract:e.target.value}))} />
      </div>
      <div style={{display:"flex",gap:24,marginBottom:16}}>
        {(["published","featured"] as const).map(f=>(
          <label key={f} style={s.togLbl}>
            <input type="checkbox" checked={!!(editing[f])} onChange={e=>setEditing((p: Partial<Article> | null)=>({...p!,[f]:e.target.checked}))} />
            <span style={{textTransform:"capitalize"}}>{f}</span>
          </label>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button style={s.primBtn} onClick={save} disabled={saving}>{saving?"Saving...":"Save"}</button>
        <button style={s.ghostBtn} onClick={()=>setEditing(null)}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{...s.h3,margin:0}}>Articles ({items.length})</h3>
        <button style={s.primBtn} onClick={()=>setEditing({published:false,featured:false})}>+ New Article</button>
      </div>
      {items.length===0 && <p style={s.hint}>No articles yet.</p>}
      {items.map(a=>(
        <div key={a.id} style={s.card}>
          <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
            <div style={{flex:1}}>
              <strong style={{fontSize:15}}>{a.title}</strong>
              <p style={{fontSize:13,color:"#666",margin:"3px 0"}}>{a.author_name} · {a.year}</p>
            </div>
            <div style={{display:"flex",gap:10,flexShrink:0,alignItems:"center"}}>
              <label style={s.togLbl}>
                <input type="checkbox" checked={a.published} onChange={e=>toggle(a.id,"published",e.target.checked)} />
                <span style={{fontSize:12}}>Published</span>
              </label>
              <label style={s.togLbl}>
                <input type="checkbox" checked={a.featured} onChange={e=>toggle(a.id,"featured",e.target.checked)} />
                <span style={{fontSize:12}}>Featured</span>
              </label>
            </div>
          </div>
          {a.abstract && <p style={{fontSize:12,color:"#777",margin:"6px 0 8px",lineHeight:1.4}}>{a.abstract.slice(0,120)}…</p>}
          <div style={{display:"flex",gap:8}}>
            <button style={s.smBtn} onClick={()=>setEditing(a)}>Edit</button>
            <button style={{...s.smBtn,color:"#c62828",background:"#ffebee"}} onClick={()=>del(a.id)}>Delete</button>
            {a.pdf_url && <a href={a.pdf_url} target="_blank" style={{...s.smBtn,textDecoration:"none",background:"#e3f2fd",color:"#1565c0"}}>PDF ↗</a>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── EDITORIAL BOARD ──────────────────────────────────────────
function BoardTab() {
  const [items,setItems]     = useState<EditorialMember[]>([]);
  const [editing,setEditing] = useState<Partial<EditorialMember>|null>(null);
  const [loading,setLoading] = useState(true);

  const load = useCallback(async()=>{
    const {data} = await supabase.from("editorial_board").select("*").order("sort_order");
    setItems(data??[]); setLoading(false);
  },[]);
  useEffect(()=>{load();},[load]);

  const save = async()=>{
    if(!editing) return;
    if(editing.id) await supabase.from("editorial_board").update(editing).eq("id",editing.id);
    else           await supabase.from("editorial_board").insert([{...editing,visible:true,sort_order:items.length}]);
    setEditing(null); load();
  };

  if(loading) return <p style={s.hint}>Loading...</p>;

  if(editing!==null) return (
    <div>
      <button style={s.backBtn} onClick={()=>setEditing(null)}>← Back</button>
      <h3 style={s.h3}>{editing.id?"Edit Member":"Add Member"}</h3>
      {(["name","title","institution","country"] as (keyof EditorialMember)[]).map(f=>(
        <div key={String(f)} style={{marginBottom:12}}>
          <label style={s.lbl}>{String(f).replace(/\b\w/g,l=>l.toUpperCase())}</label>
          <input style={s.inp} value={(editing[f] as string)??""}
            onChange={e=>setEditing((p: Partial<EditorialMember> | null)=>({...p!,[f]:e.target.value}))} />
        </div>
      ))}
      <div style={{marginBottom:12}}>
        <label style={s.lbl}>Role</label>
        <select style={s.inp} value={editing.role??"member"}
          onChange={e=>setEditing((p: Partial<EditorialMember> | null)=>({...p!,role:e.target.value as EditorialMember["role"]}))}>
          <option value="editor_in_chief">Editor in Chief</option>
          <option value="associate_editor">Associate Editor</option>
          <option value="member">Member</option>
        </select>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button style={s.primBtn} onClick={save}>Save</button>
        <button style={s.ghostBtn} onClick={()=>setEditing(null)}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{...s.h3,margin:0}}>Editorial Board ({items.length})</h3>
        <button style={s.primBtn} onClick={()=>setEditing({role:"member"})}>+ Add Member</button>
      </div>
      {items.length===0 && <p style={s.hint}>No board members yet.</p>}
      {items.map(m=>(
        <div key={m.id} style={s.card}>
          <div style={s.row}>
            <div>
              <strong>{m.name}</strong>
              <span style={{...s.badge,marginLeft:8,background:m.role==="editor_in_chief"?"#fce4ec":"#e3f2fd",color:m.role==="editor_in_chief"?"#c2185b":"#1565c0"}}>
                {m.role.replace("_"," ")}
              </span>
              {m.title && <p style={{fontSize:13,color:"#666",margin:"3px 0 1px"}}>{m.title}</p>}
              {m.institution && <p style={{fontSize:12,color:"#888",margin:0}}>{m.institution}{m.country?`, ${m.country}`:""}</p>}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button style={s.smBtn} onClick={()=>setEditing(m)}>Edit</button>
              <button style={{...s.smBtn,color:"#c62828",background:"#ffebee"}}
                onClick={async()=>{if(!confirm("Remove?")) return; await supabase.from("editorial_board").delete().eq("id",m.id); setItems(p=>p.filter(x=>x.id!==m.id));}}>
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── PAST ISSUES ──────────────────────────────────────────────
function IssuesTab() {
  const [items,setItems]     = useState<PastIssue[]>([]);
  const [editing,setEditing] = useState<Partial<PastIssue>|null>(null);
  const [loading,setLoading] = useState(true);

  const load = useCallback(async()=>{
    const {data} = await supabase.from("past_issues").select("*").order("sort_order");
    setItems(data??[]); setLoading(false);
  },[]);
  useEffect(()=>{load();},[load]);

  const save = async()=>{
    if(!editing) return;
    if(editing.id) await supabase.from("past_issues").update(editing).eq("id",editing.id);
    else           await supabase.from("past_issues").insert([{...editing,visible:true}]);
    setEditing(null); load();
  };

  const toggleVis = async(id:string,visible:boolean)=>{
    await supabase.from("past_issues").update({visible}).eq("id",id);
    setItems(p=>p.map(i=>i.id===id?{...i,visible}:i));
  };

  if(loading) return <p style={s.hint}>Loading...</p>;

  if(editing!==null) return (
    <div>
      <button style={s.backBtn} onClick={()=>setEditing(null)}>← Back</button>
      <h3 style={s.h3}>{editing.id?"Edit Issue":"Add Issue"}</h3>
      {([["year","Year (e.g. 2024)"],["volume","Volume (e.g. 3)"],["issue_range","Issue range (e.g. Issue 1-4)"],["label","Label (e.g. 2024 Collection)"]] as [keyof PastIssue,string][]).map(([f,lbl])=>(
        <div key={String(f)} style={{marginBottom:12}}>
          <label style={s.lbl}>{lbl}</label>
          <input style={s.inp} value={(editing[f] as string)??""}
            onChange={e=>setEditing((p: Partial<PastIssue> | null)=>({...p!,[f]:e.target.value}))} />
        </div>
      ))}
      <div style={{display:"flex",gap:10}}>
        <button style={s.primBtn} onClick={save}>Save</button>
        <button style={s.ghostBtn} onClick={()=>setEditing(null)}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h3 style={{...s.h3,margin:0}}>Past Issues ({items.length})</h3>
        <button style={s.primBtn} onClick={()=>setEditing({})}>+ Add Issue</button>
      </div>
      {items.map(issue=>(
        <div key={issue.id} style={{...s.card,opacity:issue.visible?1:0.5}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <strong>{issue.label}</strong>
              <p style={{fontSize:13,color:"#666",margin:"3px 0 0"}}>Volume {issue.volume} · {issue.issue_range}</p>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <label style={s.togLbl}>
                <input type="checkbox" checked={issue.visible} onChange={e=>toggleVis(issue.id,e.target.checked)} />
                <span style={{fontSize:12}}>Visible on journal</span>
              </label>
              <button style={s.smBtn} onClick={()=>setEditing(issue)}>Edit</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN SHELL ───────────────────────────────────────────────
export function AdminDashboard({ onLogout }: { onLogout: ()=>void }) {
  const [tab,setTab] = useState<Tab>("overview");
  const tabs: {id:Tab;label:string}[] = [
    {id:"overview",    label:"Overview"},
    {id:"contacts",    label:"Contacts"},
    {id:"submissions", label:"Submissions"},
    {id:"articles",    label:"Articles"},
    {id:"board",       label:"Editorial Board"},
    {id:"issues",      label:"Past Issues"},
  ];
  return (
    <div style={s.shell}>
      <aside style={s.side}>
        <div style={s.logo}>
          <span style={{fontWeight:700,color:"#e91e8c",fontSize:15}}>Cornerstone</span>
          <span style={{fontSize:11,color:"#999",display:"block"}}>Admin Portal</span>
        </div>
        {tabs.map(t=>(
          <button key={t.id} style={{...s.sBtn,...(tab===t.id?s.sActive:{})}} onClick={()=>setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <div style={{flex:1}} />
        <button style={{...s.sBtn,color:"#ef9a9a",marginTop:8}} onClick={onLogout}>Sign out</button>
      </aside>
      <main style={s.main}>
        {tab==="overview"    && <Overview />}
        {tab==="contacts"    && <ContactsTab />}
        {tab==="submissions" && <SubmissionsTab />}
        {tab==="articles"    && <ArticlesTab />}
        {tab==="board"       && <BoardTab />}
        {tab==="issues"      && <IssuesTab />}
      </main>
    </div>
  );
}
