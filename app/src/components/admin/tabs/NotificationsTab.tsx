import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Send, Trash2, Loader2, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  target: 'all' | 'authors' | 'admin';
  sent_at: string | null;
  created_at: string;
}

const TYPE_META = {
  info:    { icon: Info,         color: '#0891b2', bg: '#ecfeff', label: 'Info' },
  success: { icon: CheckCircle2, color: '#059669', bg: '#f0fdf4', label: 'Success' },
  warning: { icon: AlertTriangle,color: '#d97706', bg: '#fffbeb', label: 'Warning' },
  error:   { icon: XCircle,      color: '#dc2626', bg: '#fef2f2', label: 'Error' },
};

export function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', type: 'info' as const, target: 'all' as const });

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    setNotifications((data || []) as Notification[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.body) { toast.error('Title and body are required'); return; }
    const { error } = await supabase.from('notifications').insert([form]);
    if (error) { toast.error(error.message); return; }
    toast.success('Notification created!');
    setForm({ title: '', body: '', type: 'info', target: 'all' });
    setShowForm(false);
    fetch();
  };

  const handleSend = async (id: string) => {
    setSending(id);
    const { error } = await supabase.from('notifications').update({ sent_at: new Date().toISOString() }).eq('id', id);
    if (error) toast.error(error.message);
    else toast.success('Notification marked as sent!');
    setSending(null);
    fetch();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(n => n.filter(x => x.id !== id));
    toast.success('Deleted');
  };

  return (
    <motion.div key="notifications" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                <p className="text-xs text-gray-400">Create and send notifications to authors or all users</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(f => !f)} size="sm"
              className="bg-[#d63384] hover:bg-pink-700 text-white rounded-xl h-9 px-4 text-xs font-bold gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New
            </Button>
          </div>

          {/* Create Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                className="overflow-hidden mb-6">
                <div className="p-5 rounded-2xl border border-pink-100 bg-pink-50/30 space-y-3">
                  <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Notification title"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384]" />
                  <textarea value={form.body} onChange={e => setForm(f => ({...f, body: e.target.value}))} placeholder="Notification body..." rows={3}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384] resize-none" />
                  <div className="flex gap-3">
                    <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value as any}))}
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none">
                      {(['info','success','warning','error'] as const).map(t => <option key={t} value={t}>{TYPE_META[t].label}</option>)}
                    </select>
                    <select value={form.target} onChange={e => setForm(f => ({...f, target: e.target.value as any}))}
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none">
                      <option value="all">All Users</option>
                      <option value="authors">Authors Only</option>
                      <option value="admin">Admin Only</option>
                    </select>
                    <Button onClick={handleCreate} className="bg-[#d63384] hover:bg-pink-700 text-white rounded-xl text-sm font-bold px-5">
                      Create
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-50 animate-pulse" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(n => {
                const meta = TYPE_META[n.type];
                return (
                  <motion.div key={n.id} layout initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                    className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
                      <meta.icon className="w-4.5 h-4.5" style={{ color: meta.color, width: 18, height: 18 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium capitalize">{n.target}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {n.sent_at ? `✓ Sent ${new Date(n.sent_at).toLocaleDateString()}` : `Created ${new Date(n.created_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.sent_at && (
                        <button onClick={() => handleSend(n.id)} disabled={sending === n.id}
                          className="flex items-center gap-1 text-xs font-bold text-[#d63384] hover:text-pink-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-pink-50">
                          {sending === n.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          Send
                        </button>
                      )}
                      <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
