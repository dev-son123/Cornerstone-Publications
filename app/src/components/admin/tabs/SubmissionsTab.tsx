import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, Loader2, Mail, CheckCircle2, XCircle, Clock, RefreshCw, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Submission {
  id: number;
  author_name: string;
  author_email: string;
  manuscript_title: string;
  manuscript_url?: string;
  status: string;
  created_at: string;
  status_email_sent: boolean;
}

interface Props {
  onPublishClick?: (sub: Submission) => void;
}

const STATUSES = ['Pending Review', 'Under Review', 'Revision Required', 'Accepted', 'Rejected'];

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

export function SubmissionsTab({ onPublishClick }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });
    setSubmissions((data || []) as Submission[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: number, newStatus: string, title: string, authorEmail: string, authorName: string) => {
    setUpdatingId(id);
    const { error } = await supabase.from('submissions').update({
      status: newStatus,
      status_updated_at: new Date().toISOString(),
    }).eq('id', id);

    if (error) { toast.error(error.message); setUpdatingId(null); return; }

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

  return (
    <motion.div key="submissions" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Submission Manager</h2>
              <p className="text-xs text-gray-400">Update status — authors receive an email notification automatically</p>
            </div>
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
                            <p className="text-xs text-gray-500 mb-3">
                              Submitted: {new Date(s.created_at).toLocaleString('en-IN')}
                            </p>
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
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
