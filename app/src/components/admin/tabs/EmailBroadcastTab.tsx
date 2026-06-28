import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Plus, Send, Trash2, Loader2, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Broadcast {
  id: string;
  subject: string;
  body: string;
  recipient_filter: string;
  sent_count: number;
  status: 'draft' | 'sent' | 'failed';
  sent_at: string | null;
  created_at: string;
}

export function EmailBroadcastTab() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', body: '', recipient_filter: 'all' });

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from('email_broadcasts').select('*').order('created_at', { ascending: false });
    setBroadcasts((data || []) as Broadcast[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!form.subject || !form.body) { toast.error('Subject and body are required'); return; }
    const { error } = await supabase.from('email_broadcasts').insert([{ ...form, status: 'draft' }]);
    if (error) { toast.error(error.message); return; }
    toast.success('Broadcast draft saved!');
    setForm({ subject: '', body: '', recipient_filter: 'all' });
    setShowForm(false);
    fetch();
  };

  const handleSend = async (id: string, broadcast: any) => {
    setSending(id);
    try {
      // 1. Get recipients - for demo we'll search the submissions table
      const { data: subs } = await supabase.from('submissions').select('author_email').not('author_email', 'is', null);
      const emails = Array.from(new Set(subs?.map(s => s.author_email) || []));

      if (emails.length === 0) throw new Error('No recipients found');

      // 2. Call Resend edge function
      const { error } = await supabase.functions.invoke('resend-email', {
        body: {
          type: 'broadcast',
          payload: {
            subject: broadcast.subject,
            body: broadcast.body,
            recipients: emails,
          },
        },
      });

      if (error) throw error;

      // 3. Mark as sent in DB
      const { error: dbError } = await supabase.from('email_broadcasts').update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_count: emails.length,
      }).eq('id', id);
      if (dbError) throw dbError;

      toast.success(`Broadcast sent to ${emails.length} recipients!`);
      fetch();
    } catch (err: any) {
      toast.error('Failed to send broadcast: ' + err.message);
    } finally {
      setSending(null);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('email_broadcasts').delete().eq('id', id);
    setBroadcasts(b => b.filter(x => x.id !== id));
    toast.success('Deleted');
  };

  return (
    <motion.div key="emails" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Email Broadcasts</h2>
                <p className="text-xs text-gray-400">Send mass emails to authors or all users via Resend API</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(f => !f)} size="sm"
              className="bg-[#d63384] hover:bg-pink-700 text-white rounded-xl h-9 px-4 text-xs font-bold gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Broadcast
            </Button>
          </div>

          {/* Resend notice */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100 mb-5">
            <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-800 mb-0.5">Resend API Integration</p>
              <p className="text-xs text-blue-600">Drafts are saved to Supabase. When you click Send, it will call your Resend edge function to deliver emails. Add your <code className="bg-blue-100 px-1 rounded">RESEND_API_KEY</code> in Supabase secrets to activate.</p>
            </div>
          </div>

          {/* Create form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                className="overflow-hidden mb-6">
                <div className="p-5 rounded-2xl border border-green-100 bg-green-50/30 space-y-3">
                  <input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} placeholder="Email subject"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384]" />
                  <textarea value={form.body} onChange={e => setForm(f => ({...f, body: e.target.value}))} placeholder="Email body (HTML or plain text)..." rows={5}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384] resize-none font-mono" />
                  <div className="flex gap-3">
                    <select value={form.recipient_filter} onChange={e => setForm(f => ({...f, recipient_filter: e.target.value}))}
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none">
                      <option value="all">All Users</option>
                      <option value="authors">Authors (who submitted)</option>
                      <option value="accepted">Accepted Authors</option>
                    </select>
                    <Button onClick={handleCreate} className="bg-[#d63384] hover:bg-pink-700 text-white rounded-xl text-sm font-bold px-5">
                      Save Draft
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-50 animate-pulse" />)}
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No broadcasts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map(b => (
                <motion.div key={b.id} layout initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm truncate">{b.subject}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          b.status === 'sent' ? 'bg-green-100 text-green-700' :
                          b.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>{b.status}</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{b.body.slice(0, 100)}...</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                          <Users className="w-3 h-3" /> {b.recipient_filter}
                        </span>
                        {b.sent_at && (
                          <span className="text-[10px] text-gray-400">Sent {new Date(b.sent_at).toLocaleDateString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {b.status === 'draft' && (
                        <button onClick={() => handleSend(b.id, b)} disabled={sending === b.id}
                          className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#d63384] hover:bg-pink-700 transition-colors px-4 py-2 rounded-xl">
                          {sending === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          Send
                        </button>
                      )}
                      <button onClick={() => handleDelete(b.id)} className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
