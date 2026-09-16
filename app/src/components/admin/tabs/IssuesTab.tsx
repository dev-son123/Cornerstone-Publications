// src/components/admin/tabs/IssuesTab.tsx
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Calendar, Trash2, Plus, Loader2, CheckCircle2,
  EyeOff, Pencil, FileText, X, Check, AlertTriangle, FolderMinus,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Issue {
  id: string;
  year: number;
  volume: number;
  issue_range: string;
  label: string;
  visible: boolean;
  sort_order?: number;
}

interface Paper {
  id: number;
  title: string;
  author_name?: string;
  issue?: number;
  pages?: string;
  doi?: string;
  published: boolean;
  pdf_url?: string | null;
  source_submission_id?: number | null;
}

/**
 * Deletes a paper's PDF from storage, but only when that file is safe to remove.
 *
 * The architecture (migration 002) gives published papers their own
 * `article-pdfs` bucket, and CurrentIssueTab already treats "delete the article"
 * as "delete its uploaded PDF too". This adds the check the shared case needs:
 * if any OTHER article row points at the same URL, the file is still in use and
 * is left alone. External links (a DOI landing page, a file on another host) are
 * never touched, and manuscripts live in a different bucket entirely
 * (`manuscript_files`), so an author's submission file can never be hit here.
 *
 * Returns a human-readable note describing what happened to the file.
 */
async function removeExclusivePdf(url: string | null | undefined, articleId: number): Promise<string> {
  if (!url) return '';

  const marker = '/article-pdfs/';
  const i = url.indexOf(marker);
  if (i === -1) return ' Its linked PDF is external and was left untouched.';

  // Still referenced by another paper? Then it is shared — keep the file.
  const { data: others, error: refErr } = await supabase
    .from('articles')
    .select('id')
    .eq('pdf_url', url)
    .neq('id', articleId)
    .limit(1);

  if (refErr) {
    return ' Its PDF was left in storage (the reference check failed) — remove it manually if needed.';
  }
  if (others && others.length > 0) {
    return ' Its PDF is shared with another paper and was kept in storage.';
  }

  const path = decodeURIComponent(url.slice(i + marker.length).split('?')[0]);
  const { error } = await supabase.storage.from('article-pdfs').remove([path]);
  return error
    ? ` The PDF could not be removed (${error.message}) — delete it manually if needed.`
    : ' Its PDF was removed from storage.';
}

/** Every write here is additionally enforced by RLS (migration 004, Part D): only
 *  public.is_admin() may insert, update or delete a collection. Hiding these
 *  controls is presentation; the database is what actually refuses. */
export function IssuesTab() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Issue | null>(null);
  const [managing, setManaging] = useState<Issue | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Issue | null>(null);
  const [newIssue, setNewIssue] = useState({
    year: new Date().getFullYear(),
    volume: 1,
    issue_range: 'Issue 1-4',
    label: '',
  });

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('past_issues')
        .select('*')
        .order('year', { ascending: false })
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setIssues((data || []) as Issue[]);

      // One grouped query for the paper counts rather than one per collection.
      const { data: arts } = await supabase
        .from('articles')
        .select('past_issue_id')
        .not('past_issue_id', 'is', null);
      const tally: Record<string, number> = {};
      (arts || []).forEach((a: { past_issue_id: string }) => {
        tally[a.past_issue_id] = (tally[a.past_issue_id] || 0) + 1;
      });
      setCounts(tally);
    } catch (err) {
      toast.error('Failed to fetch collections: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleCreate = async () => {
    if (!newIssue.label.trim()) {
      toast.error('Please enter a label (e.g. 2026 Collection)');
      return;
    }
    try {
      const { error } = await supabase.from('past_issues').insert([{
        ...newIssue,
        label: newIssue.label.trim(),
        visible: true,
        sort_order: 0,
      }]);
      if (error) throw error;
      toast.success('Collection created');
      setIsAdding(false);
      setNewIssue({ year: new Date().getFullYear(), volume: 1, issue_range: 'Issue 1-4', label: '' });
      fetchIssues();
    } catch (err) {
      toast.error('Failed to create: ' + (err as Error).message);
    }
  };

  const toggleVisible = async (issue: Issue) => {
    setBusyId(issue.id);
    const next = !issue.visible;
    const { data, error } = await supabase
      .from('past_issues')
      .update({ visible: next })
      .eq('id', issue.id)
      .select('id');
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    // An RLS denial returns 0 rows with no error — treat that as a failure
    // rather than reporting a success that never happened.
    if (!data || data.length === 0) {
      toast.error('Not permitted — admin access is required to change visibility.');
      return;
    }
    setIssues(prev => prev.map(i => (i.id === issue.id ? { ...i, visible: next } : i)));
    toast.success(next ? 'Collection is now public' : 'Collection hidden from visitors');
  };

  const saveEdit = async () => {
    if (!editing) return;
    setBusyId(editing.id);
    const { data, error } = await supabase
      .from('past_issues')
      .update({
        label: editing.label.trim(),
        year: editing.year,
        volume: editing.volume,
        issue_range: editing.issue_range,
      })
      .eq('id', editing.id)
      .select('id');
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    if (!data || data.length === 0) { toast.error('Not permitted — admin access required.'); return; }
    toast.success('Collection updated');
    setEditing(null);
    fetchIssues();
  };

  const doDelete = async (issue: Issue) => {
    setBusyId(issue.id);
    // articles.past_issue_id is ON DELETE SET NULL, so the papers themselves
    // survive and simply become unfiled. Nothing else is touched.
    const { error } = await supabase.from('past_issues').delete().eq('id', issue.id);
    setBusyId(null);
    setConfirmDelete(null);
    if (error) { toast.error('Delete failed: ' + error.message); return; }
    toast.success('Collection removed. Its papers were kept and are now unfiled.');
    fetchIssues();
  };

  return (
    <motion.div key="issues" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Journal Archive Manager</h2>
                <p className="text-gray-400 text-sm">Create collections and manage the papers filed inside them</p>
              </div>
            </div>
            <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'ghost' : 'default'} className={isAdding ? 'text-gray-400' : 'bg-[#d63384]'}>
              {isAdding ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> New Collection</>}
            </Button>
          </div>

          {isAdding && (
            <div className="mb-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-amber-900 uppercase">Collection Label</label>
                <input placeholder="e.g. 2026 Collection" value={newIssue.label}
                  onChange={e => setNewIssue({ ...newIssue, label: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl outline-none text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-900 uppercase">Year</label>
                <input type="number" value={newIssue.year}
                  onChange={e => setNewIssue({ ...newIssue, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl outline-none text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-900 uppercase">Volume</label>
                <input type="number" value={newIssue.volume}
                  onChange={e => setNewIssue({ ...newIssue, volume: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl outline-none text-sm" />
              </div>
              <Button onClick={handleCreate} className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-[42px] rounded-xl">
                Create
              </Button>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-gray-400 font-medium">Fetching collections...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="py-20 text-center text-gray-400"><p>No archive collections found.</p></div>
          ) : (
            <div className="space-y-3">
              {issues.map(issue => {
                const n = counts[issue.id] || 0;

                if (editing?.id === issue.id) return (
                  <div key={issue.id} className="p-4 rounded-3xl border-2 border-amber-200 bg-amber-50/40 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-amber-900 uppercase">Label</label>
                      <input value={editing.label} onChange={e => setEditing({ ...editing, label: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-900 uppercase">Year</label>
                      <input type="number" value={editing.year}
                        onChange={e => setEditing({ ...editing, year: parseInt(e.target.value) || editing.year })}
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-900 uppercase">Volume</label>
                      <input type="number" value={editing.volume}
                        onChange={e => setEditing({ ...editing, volume: parseInt(e.target.value) || editing.volume })}
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-900 uppercase">Issue range</label>
                      <div className="flex gap-1">
                        <input value={editing.issue_range} onChange={e => setEditing({ ...editing, issue_range: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm outline-none" />
                        <button onClick={saveEdit} disabled={busyId === issue.id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Save">
                          {busyId === issue.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setEditing(null)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg" title="Cancel">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );

                return (
                  <div key={issue.id} className="rounded-3xl border border-gray-100 hover:border-amber-100 transition-all">
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{issue.label}</p>
                        <p className="text-xs text-gray-400 font-medium">
                          Vol {issue.volume} · {issue.year} · {issue.issue_range} · {n} paper{n === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => toggleVisible(issue)} disabled={busyId === issue.id}
                          title={issue.visible ? 'Visible to visitors — click to hide' : 'Hidden — click to publish'}
                          className={`text-[10px] font-black uppercase px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                            issue.visible ? 'text-green-600 bg-green-50 hover:bg-green-100'
                                          : 'text-gray-500 bg-gray-100 hover:bg-gray-200'}`}>
                          {busyId === issue.id ? <Loader2 className="w-3 h-3 animate-spin" />
                            : issue.visible ? <CheckCircle2 className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {issue.visible ? 'Visible' : 'Hidden'}
                        </button>
                        <button onClick={() => setManaging(managing?.id === issue.id ? null : issue)}
                          title="Manage papers"
                          className="p-2 text-gray-400 hover:text-[#d63384] hover:bg-pink-50 rounded-lg transition-all">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditing(issue)} title="Edit collection"
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(issue)} title="Delete collection"
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {confirmDelete?.id === issue.id && (
                      <div className="mx-4 mb-4 p-4 rounded-2xl bg-red-50 border border-red-200">
                        <p className="text-sm font-bold text-red-900 flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4" /> Delete &quot;{issue.label}&quot;?
                        </p>
                        <p className="text-xs text-red-800 mb-3">
                          {n > 0
                            ? `This collection contains ${n} published paper${n === 1 ? '' : 's'}. ${n === 1 ? 'It' : 'They'} will NOT be deleted — ${n === 1 ? 'it stays' : 'they stay'} published and simply become unfiled, ready to re-file into another collection.`
                            : 'This collection is empty. Nothing else is affected.'}
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => setConfirmDelete(null)}
                            className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                            Cancel
                          </button>
                          <button onClick={() => doDelete(issue)} disabled={busyId === issue.id}
                            className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2">
                            {busyId === issue.id && <Loader2 className="w-3 h-3 animate-spin" />}
                            Delete collection
                          </button>
                        </div>
                      </div>
                    )}

                    {managing?.id === issue.id && (
                      <CollectionPapers issue={issue} onChanged={fetchIssues} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/** Papers filed inside one collection: unfile one, or delete it outright. */
function CollectionPapers({ issue, onChanged }: { issue: Issue; onChanged: () => void }) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('articles')
      .select('id,title,author_name,issue,pages,doi,published,pdf_url,source_submission_id')
      .eq('past_issue_id', issue.id)
      .order('issue', { ascending: true });
    setPapers((data || []) as Paper[]);
    setLoading(false);
  }, [issue.id]);

  useEffect(() => { load(); }, [load]);

  const unfile = async (p: Paper) => {
    setBusy(p.id);
    // Removes it from the collection only. The article itself stays published,
    // which means a published paper reappears under Current Issue.
    const { data, error } = await supabase
      .from('articles').update({ past_issue_id: null }).eq('id', p.id).select('id');
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    // An RLS denial returns 0 rows with no error — never report a success that
    // did not happen.
    if (!data || data.length === 0) {
      toast.error('Not permitted — administrator access is required.');
      return;
    }
    toast.success(
      p.published
        ? `"${p.title}" was unfiled from ${issue.label}. It is still published and now appears under Current Issue.`
        : `"${p.title}" was unfiled from ${issue.label}. The article was kept.`
    );
    setConfirmId(null);
    load();
    onChanged();
  };

  /**
   * Permanently deletes the paper.
   *
   * What is and is not touched — checked against the live relationships:
   *   • public.articles row .......... deleted (this IS the paper record)
   *   • past_issue_id association .... goes with the row
   *   • article-pdfs storage file .... deleted only when no other article
   *                                    references the same URL (see
   *                                    removeExclusivePdf)
   *   • public.submissions row ....... KEPT. articles.source_submission_id is
   *                                    ON DELETE SET NULL on the submissions
   *                                    side (migration 003); the author's
   *                                    manuscript record is not ours to destroy.
   *   • past_issues collection ....... untouched
   *
   * The row is deleted BEFORE the file, so a denied delete cannot leave the
   * paper in place with its PDF already gone.
   */
  const doDelete = async (p: Paper) => {
    setBusy(p.id);

    const { data, error } = await supabase
      .from('articles').delete().eq('id', p.id).select('id');

    if (error) {
      setBusy(null);
      toast.error('Delete failed: ' + error.message);
      return;
    }
    if (!data || data.length === 0) {
      setBusy(null);
      toast.error('Not permitted — administrator access is required to delete a paper.');
      return;
    }

    const fileNote = await removeExclusivePdf(p.pdf_url, p.id);
    setBusy(null);
    setConfirmId(null);

    toast.success(
      `"${p.title}" was deleted from ${issue.label}.${fileNote}` +
      (p.source_submission_id ? ` Submission #${p.source_submission_id} was kept.` : '')
    );
    load();
    onChanged();
  };

  return (
    <div className="mx-4 mb-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
      <p className="text-xs font-bold text-gray-600 uppercase mb-3">Papers in {issue.label}</p>
      {loading ? (
        <p className="text-xs text-gray-400 italic">Loading papers...</p>
      ) : papers.length === 0 ? (
        <p className="text-xs text-gray-400 italic">
          No papers filed here yet. Use <strong>Publish Article</strong> and pick &quot;{issue.label}&quot; as the collection.
        </p>
      ) : (
        <div className="space-y-2">
          {papers.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 px-3 py-2">
                <span className="text-[10px] font-black text-[#d63384] bg-pink-50 rounded px-2 py-1 flex-shrink-0">
                  {p.issue != null ? `ISS ${p.issue}` : '—'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {p.author_name || 'Unknown'}
                    {p.pages ? ` · pp. ${p.pages}` : ''}
                    {p.doi ? ` · ${p.doi}` : ''}
                    {p.published ? '' : ' · DRAFT'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => unfile(p)} disabled={busy === p.id}
                    title={`Remove from ${issue.label} but keep the paper — it becomes unfiled and can be re-filed into another collection`}
                    className="text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-all flex items-center gap-1.5">
                    {busy === p.id && confirmId !== p.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <FolderMinus className="w-3 h-3" />}
                    Unfile
                  </button>
                  <button onClick={() => setConfirmId(confirmId === p.id ? null : p.id)}
                    title="Delete Paper — permanently removes this paper"
                    className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-all flex items-center gap-1.5">
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>

              {confirmId === p.id && (
                <div className="mx-3 mb-3 p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-sm font-bold text-red-900 flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4" /> Delete this paper?
                  </p>
                  <p className="text-xs text-red-800 mb-1">
                    Are you sure you want to remove &quot;{p.title}&quot; from the {issue.label}?
                  </p>
                  <p className="text-xs text-red-800 mb-3">
                    The paper is deleted permanently and stops appearing on the public
                    Past Issues page.
                    {p.pdf_url?.includes('/article-pdfs/')
                      ? ' Its uploaded PDF is deleted from storage too, unless another paper still uses the same file.'
                      : ''}
                    {p.source_submission_id
                      ? ` The original submission #${p.source_submission_id} will NOT be deleted.`
                      : ''}
                    {' '}To keep the paper and only take it out of this collection, cancel and use{' '}
                    <strong>Unfile</strong> instead.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmId(null)} disabled={busy === p.id}
                      className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                      Cancel
                    </button>
                    <button onClick={() => doDelete(p)} disabled={busy === p.id}
                      className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-70">
                      {busy === p.id && <Loader2 className="w-3 h-3 animate-spin" />}
                      Delete Paper
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
