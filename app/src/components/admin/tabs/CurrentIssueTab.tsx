// src/components/admin/tabs/CurrentIssueTab.tsx
//
// The single control point for what appears under Journal → Current Issue.
// It reads and writes the same public.articles rows the public page renders —
// there is no second list anywhere. Every write here is additionally enforced
// by RLS (migration 002): only public.is_admin() may update or delete an
// article, so hiding these controls is presentation, not the security boundary.
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Newspaper, Loader2, Trash2, AlertTriangle, ExternalLink,
  EyeOff, Eye, Plus, RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CurrentArticle {
  id: number;
  title: string;
  author_name?: string;
  author_email?: string;
  volume?: number;
  issue?: number;
  year?: number;
  journal?: string;
  pdf_url?: string;
  published: boolean;
  status?: string;
  source_submission_id?: number | null;
  created_at: string;
}

interface Props {
  /** Jumps to the Publish Article tab — the only way to add a document. */
  onAddClick?: () => void;
}

/** Deletes the article's PDF from storage when it is one we uploaded.
 *  Returns a human-readable note about what happened to the file. */
async function removePdf(url?: string): Promise<string> {
  if (!url) return '';
  const marker = '/article-pdfs/';
  const i = url.indexOf(marker);
  // Only touch files inside our own bucket — never an external link.
  if (i === -1) return ' The linked PDF is external and was left untouched.';
  const path = decodeURIComponent(url.slice(i + marker.length).split('?')[0]);
  const { error } = await supabase.storage.from('article-pdfs').remove([path]);
  return error
    ? ` The PDF could not be removed (${error.message}) — delete it manually if needed.`
    : ' Its PDF was removed from storage.';
}

export function CurrentIssueTab({ onAddClick }: Props) {
  const [articles, setArticles] = useState<CurrentArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    // Mirrors CurrentIssueSection exactly: unarchived articles, newest issue
    // first. Drafts are included here (and flagged) so the admin can see and
    // fix anything that is not yet public.
    const { data, error } = await supabase
      .from('articles')
      .select('id,title,author_name,author_email,volume,issue,year,journal,pdf_url,published,status,source_submission_id,created_at')
      .is('past_issue_id', null)
      .order('volume', { ascending: false })
      .order('issue', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) toast.error('Could not load: ' + error.message);
    setArticles((data || []) as CurrentArticle[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const togglePublished = async (a: CurrentArticle) => {
    setBusyId(a.id);
    const next = !a.published;
    const { data, error } = await supabase
      .from('articles')
      .update({ published: next, status: next ? 'published' : 'draft' })
      .eq('id', a.id)
      .select('id');
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    // An RLS denial comes back as 0 rows with no error — do not claim success.
    if (!data || data.length === 0) {
      toast.error('Not permitted — administrator access is required.');
      return;
    }
    setArticles(prev => prev.map(x => (x.id === a.id ? { ...x, published: next } : x)));
    toast.success(next ? 'Now visible on the public Current Issue' : 'Unpublished — hidden from visitors');
  };

  const doDelete = async (a: CurrentArticle) => {
    setBusyId(a.id);
    const fileNote = await removePdf(a.pdf_url);

    const { data, error } = await supabase
      .from('articles').delete().eq('id', a.id).select('id');
    setBusyId(null);
    setConfirmId(null);

    if (error) { toast.error('Delete failed: ' + error.message); return; }
    if (!data || data.length === 0) {
      toast.error('Not permitted — administrator access is required to delete.');
      return;
    }
    // The originating submission is deliberately left alone: deleting a
    // published article must not destroy the author's submission record.
    toast.success(`"${a.title}" deleted from the Current Issue.${fileNote}`);
    setArticles(prev => prev.filter(x => x.id !== a.id));
  };

  const live = articles.filter(a => a.published).length;

  return (
    <motion.div key="currentissue" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#d63384] flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Current Issue</h2>
                <p className="text-gray-400 text-sm">
                  {live} paper{live === 1 ? '' : 's'} live on the public journal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} title="Refresh"
                className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all">
                <RefreshCw className="w-4 h-4" />
              </button>
              {onAddClick && (
                <button onClick={onAddClick}
                  className="px-4 py-2.5 bg-[#d63384] hover:bg-[#b5165a] text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors">
                  <Plus className="w-4 h-4" /> Add Document
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-6">
            This is the same set of records the public page reads. Anything listed as
            Draft here is invisible to visitors.
          </p>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-50 animate-pulse" />)}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No documents in the Current Issue</p>
              <p className="text-xs mt-1">Use Add Document to publish one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {articles.map(a => (
                <div key={a.id} className="border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-[#d63384]">
                      #{a.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{a.title || 'Untitled'}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {a.author_name || 'Unknown author'}
                        {a.volume != null ? ` · Vol ${a.volume}` : ''}
                        {a.issue != null ? ` · Issue ${a.issue}` : ''}
                        {a.year ? ` · ${a.year}` : ''}
                        {a.journal ? ` · ${a.journal}` : ''}
                        {a.source_submission_id ? ` · from submission #${a.source_submission_id}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => togglePublished(a)} disabled={busyId === a.id}
                        title={a.published ? 'Live — click to unpublish' : 'Draft — click to publish'}
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                          a.published ? 'text-green-600 bg-green-50 hover:bg-green-100'
                                      : 'text-amber-600 bg-amber-50 hover:bg-amber-100'}`}>
                        {busyId === a.id ? <Loader2 className="w-3 h-3 animate-spin" />
                          : a.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {a.published ? 'Live' : 'Draft'}
                      </button>

                      {a.pdf_url && (
                        <a href={a.pdf_url} target="_blank" rel="noopener noreferrer" title="Open PDF"
                          className="p-2 text-gray-400 hover:text-[#d63384] hover:bg-pink-50 rounded-lg transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button onClick={() => setConfirmId(a.id)} title="Delete from Current Issue"
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {confirmId === a.id && (
                    <div className="mx-4 mb-4 p-4 rounded-2xl bg-red-50 border border-red-200">
                      <p className="text-sm font-bold text-red-900 flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        Are you sure you want to delete this document from the Current Issue?
                      </p>
                      <p className="text-xs text-red-800 mb-3">
                        &quot;{a.title}&quot; will be permanently removed and will disappear from the
                        public page.
                        {a.pdf_url?.includes('/article-pdfs/')
                          ? ' Its uploaded PDF will also be deleted from storage.'
                          : ''}
                        {a.source_submission_id
                          ? ` The original submission #${a.source_submission_id} will NOT be deleted.`
                          : ''}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmId(null)}
                          className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                          Cancel
                        </button>
                        <button onClick={() => doDelete(a)} disabled={busyId === a.id}
                          className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2">
                          {busyId === a.id && <Loader2 className="w-3 h-3 animate-spin" />}
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
