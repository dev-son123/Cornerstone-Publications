import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, ChevronDown, Loader2, Mail, CheckCircle2, XCircle, Clock, RefreshCw,
  Plus, Trash2, FileText, ExternalLink,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Submission {
  id: number;
  author_name: string;
  author_email: string;
  manuscript_title: string;
  manuscript_url?: string;
  supplementary_url?: string;
  journal?: string;
  status: string;
  created_at: string;
  status_email_sent: boolean;
}

interface Props {
  onPublishClick?: (sub: Submission) => void;
}

const STATUSES = ['Pending Review', 'Under Review', 'Revision Required', 'Accepted', 'Rejected'];

// Only the metadata the list actually renders. The previous select('*') pulled
// every column — including the long `message` and `affiliation` text — for
// every submission on every load.
const LIST_COLUMNS =
  'id, author_name, author_email, manuscript_title, manuscript_url, supplementary_url, journal, status, created_at, status_email_sent';

const PAGE_SIZE = 25;

const STATUS_STYLE: Record<string, { bg: string; text: string; icon: any }> = {
  'Pending Review':    { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
  'Under Review':      { bg: 'bg-blue-100',  text: 'text-blue-700',  icon: RefreshCw },
  'Revision Required': { bg: 'bg-purple-100',text: 'text-purple-700',icon: RefreshCw },
  'Accepted':          { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
  'Rejected':          { bg: 'bg-red-100',   text: 'text-red-700',   icon: XCircle },
};

// Call Resend edge function
async function sendStatusEmail(sub: Submission): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke('resend-email', {
      body: {
        type: 'status_update',
        payload: {
          email: sub.author_email,
          authorName: sub.author_name,
          title: sub.manuscript_title,
          status: sub.status,
        },
      },
    });

    if (error) {
      console.error('Email error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Email failed:', err);
    return false;
  }
}

/**
 * Turn a public storage URL back into the object path we can delete.
 * Returns null for anything that is not in the given bucket, so an externally
 * hosted link is never mistaken for one of our files.
 */
export function storagePathFromPublicUrl(url: string | undefined | null, bucket: string): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const at = url.indexOf(marker);
  if (at === -1) return null;
  const path = url.slice(at + marker.length).split('?')[0];
  return path ? decodeURIComponent(path) : null;
}

export function SubmissionsTab({ onPublishClick }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Submission | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (pageIndex: number) => {
    setLoading(true);
    const from = pageIndex * PAGE_SIZE;
    const { data, error, count } = await supabase
      .from('submissions')
      .select(LIST_COLUMNS, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      // Previously this was swallowed, so an RLS rejection looked identical to
      // "no submissions yet".
      console.error('[SubmissionsTab] load failed:', error);
      toast.error(`Could not load submissions: ${error.message}`);
      setSubmissions([]);
    } else {
      setSubmissions((data || []) as unknown as Submission[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  const updateStatus = async (id: number, newStatus: string, title: string, authorEmail: string, authorName: string) => {
    setUpdatingId(id);
    const { data, error } = await supabase
      .from('submissions')
      .update({ status: newStatus, status_updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id');

    if (error) { toast.error(error.message); setUpdatingId(null); return; }

    // RLS returns success with zero rows touched when the policy rejects the
    // write, so an empty result means "not permitted", not "done".
    if (!data || data.length === 0) {
      toast.error('Status not saved — the database rejected the update. Are you signed in as an admin?');
      setUpdatingId(null);
      return;
    }

    // Send notification email
    const sub = { id, author_name: authorName, author_email: authorEmail, manuscript_title: title, status: newStatus, created_at: '', status_email_sent: false };
    const emailSent = await sendStatusEmail(sub);
    if (emailSent) {
      await supabase.from('submissions').update({ status_email_sent: true }).eq('id', id);
      toast.success(`Status updated → "${newStatus}". Email notification sent to ${authorEmail}.`);
    } else {
      toast.success(`Status updated → "${newStatus}".`);
    }

    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus, status_email_sent: emailSent } : s));
    setUpdatingId(null);
  };

  /**
   * Deletes exactly one submission and only the files that submission owns.
   * Published articles survive: articles.source_submission_id is ON DELETE SET
   * NULL, so converting then deleting the submission keeps the article intact.
   */
  const confirmDelete = async () => {
    const sub = pendingDelete;
    if (!sub) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', sub.id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('The database rejected the delete. Admin privileges are required.');
      }

      // Only remove files once the row is definitely gone, and only files that
      // live in our own bucket under this submission's URLs.
      const paths = [
        storagePathFromPublicUrl(sub.manuscript_url, 'manuscript_files'),
        storagePathFromPublicUrl(sub.supplementary_url, 'manuscript_files'),
      ].filter((p): p is string => !!p);

      if (paths.length) {
        const { error: rmErr } = await supabase.storage.from('manuscript_files').remove(paths);
        if (rmErr) {
          console.warn('[SubmissionsTab] file cleanup failed:', rmErr);
          toast.warning(`Submission #${sub.id} deleted, but its files could not be removed: ${rmErr.message}`);
        } else {
          toast.success(`Submission #${sub.id} and its ${paths.length} file(s) deleted.`);
        }
      } else {
        toast.success(`Submission #${sub.id} deleted.`);
      }

      setSubmissions(prev => prev.filter(s => s.id !== sub.id));
      setTotal(t => Math.max(0, t - 1));
      setExpanded(null);
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <motion.div key="submissions" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">Submission Manager</h2>
              <p className="text-xs text-gray-400">Update status — authors receive an email notification automatically</p>
            </div>
            {total > 0 && (
              <span className="text-xs font-bold text-gray-400 flex-shrink-0">{total} total</span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-50 animate-pulse" />)}
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map(s => {
                const style = STATUS_STYLE[s.status] || { bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock };
                const StatusIcon = style.icon;
                const isExpanded = expanded === s.id;

                return (
                  <motion.div key={s.id} layout className="border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 transition-colors">
                    <button onClick={() => setExpanded(isExpanded ? null : s.id)}
                      className="w-full flex items-center gap-4 p-4 text-left">
                      <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0 text-xs font-black text-[#d63384]">
                        #{s.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{s.manuscript_title || 'Untitled Manuscript'}</p>
                        <p className="text-xs text-gray-400 truncate">By {s.author_name || 'Unknown'} · {s.author_email}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${style.bg} ${style.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {s.status}
                      </span>
                      {s.status_email_sent && (
                        <span title="Email sent" className="flex-shrink-0">
                          <Mail className="w-3.5 h-3.5 text-green-500" />
                        </span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                          className="overflow-hidden border-t border-gray-50">
                          <div className="p-4 bg-gray-50/50">
                            <p className="text-xs text-gray-500 mb-1">
                              Submitted: {new Date(s.created_at).toLocaleString('en-IN')}
                            </p>
                            {s.journal && (
                              <p className="text-xs text-gray-500 mb-3">Journal: <span className="font-semibold text-gray-700">{s.journal}</span></p>
                            )}

                            {/* Files open on demand — nothing is downloaded while the list loads. */}
                            {(s.manuscript_url || s.supplementary_url) && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {s.manuscript_url && (
                                  <a href={s.manuscript_url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:border-gray-300">
                                    <FileText className="w-3 h-3" /> Manuscript <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {s.supplementary_url && (
                                  <a href={s.supplementary_url} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:border-gray-300">
                                    <FileText className="w-3 h-3" /> Supplementary <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            )}

                            <p className="text-xs font-bold text-gray-600 mb-2">Change Status → sends email to author</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {STATUSES.map(st => {
                                const st_style = STATUS_STYLE[st] || { bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock };
                                const isActive = s.status === st;
                                return (
                                  <button key={st}
                                    disabled={isActive || updatingId === s.id}
                                    onClick={() => updateStatus(s.id, st, s.manuscript_title, s.author_email, s.author_name)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                      isActive
                                        ? `${st_style.bg} ${st_style.text} ring-2 ring-offset-1 ring-current`
                                        : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}>
                                    {updatingId === s.id && !isActive ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : null}
                                    {st}
                                  </button>
                                );
                              })}
                            </div>

                            {onPublishClick && (
                              <div className="pt-4 border-t border-gray-100">
                                <button
                                  onClick={() => onPublishClick(s)}
                                  className="w-full py-3 bg-pink-50 text-[#d63384] text-[10px] font-black rounded-xl hover:bg-[#d63384] hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  CONVERT TO JOURNAL ARTICLE
                                </button>
                                <p className="text-[9px] text-gray-400 text-center mt-2 font-medium italic">
                                  This will pre-fill the publication form with the submission data.
                                </p>
                              </div>
                            )}

                            {/* Delete — admin only. This whole tab renders only inside the
                                admin branch of AdminDashboard, and the DELETE is additionally
                                gated by the submissions_delete_admin RLS policy. */}
                            <div className="pt-4 mt-4 border-t border-gray-100">
                              <button
                                onClick={() => setPendingDelete(s)}
                                className="w-full py-3 bg-red-50 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                DELETE SUBMISSION
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}

          {pageCount > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <button
                disabled={page === 0 || loading}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 border border-gray-200 disabled:opacity-40 hover:border-gray-300">
                ← Previous
              </button>
              <span className="text-xs font-bold text-gray-400">Page {page + 1} of {pageCount}</span>
              <button
                disabled={page + 1 >= pageCount || loading}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 border border-gray-200 disabled:opacity-40 hover:border-gray-300">
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={pendingDelete !== null} onOpenChange={open => { if (!open) setPendingDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this submission?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && (
                <>
                  Submission <strong>#{pendingDelete.id}</strong> — “{pendingDelete.manuscript_title || 'Untitled Manuscript'}”
                  by {pendingDelete.author_name || 'Unknown'}.
                  <br /><br />
                  Its uploaded manuscript and supplementary files will be removed too.
                  The author’s account, other submissions and any article already published
                  from it are not affected. This cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => { e.preventDefault(); confirmDelete(); }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white">
              {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting…</> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
