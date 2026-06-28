import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageCircle, Phone, RefreshCw, CheckCircle2, Clock, Eye, Trash2, Loader2, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  email: string;
  phonenumber: string | null;
  subject: string | null;
  message: string | null;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}

const STATUS_STYLE = {
  new:     { bg: 'bg-pink-100',   text: 'text-pink-700',  icon: Clock },
  read:    { bg: 'bg-blue-100',   text: 'text-blue-700',  icon: Eye },
  replied: { bg: 'bg-green-100',  text: 'text-green-700', icon: CheckCircle2 },
};

export function ContactsTab() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    setContacts((data || []) as Contact[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const markStatus = async (id: string, status: 'read' | 'replied') => {
    setProcessingId(id);
    const { error } = await supabase.from('contacts').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Marked as ${status}`);
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    }
    setProcessingId(null);
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Delete this contact enquiry?')) return;
    setProcessingId(id);
    await supabase.from('contacts').delete().eq('id', id);
    setContacts(prev => prev.filter(c => c.id !== id));
    toast.success('Deleted');
    setProcessingId(null);
  };

  const replyEmail = (c: Contact) => {
    const subject = encodeURIComponent(`Re: ${c.subject || 'Your enquiry at Cornerstone'}`);
    const body = encodeURIComponent(`Dear ${c.name},\n\nThank you for reaching out to Cornerstone Research and Publication Services.\n\n[Your reply here]\n\nBest regards,\nCornerstone Research Team`);
    window.open(`mailto:${c.email}?subject=${subject}&body=${body}`, '_blank');
    markStatus(c.id, 'replied');
  };

  const replyWhatsApp = (c: Contact) => {
    const phone = c.phonenumber?.replace(/\D/g, '');
    if (!phone) { toast.error('No phone number provided'); return; }
    const msg = encodeURIComponent(`Hello ${c.name}! 👋 Thank you for contacting Cornerstone Research. We received your enquiry about "${c.subject || 'our services'}". How can we help you?`);
    const wPhone = phone.startsWith('91') ? phone : `91${phone}`;
    window.open(`https://wa.me/${wPhone}?text=${msg}`, '_blank');
    markStatus(c.id, 'replied');
  };

  const filtered = filter === 'all' ? contacts : contacts.filter(c => c.status === filter);
  const newCount = contacts.filter(c => c.status === 'new').length;

  return (
    <motion.div key="contacts" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center relative">
                <Inbox className="w-5 h-5 text-[#d63384]" />
                {newCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#d63384] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {newCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Contact Enquiries</h2>
                <p className="text-xs text-gray-400">All enquiries from the contact form — reply via Email or WhatsApp</p>
              </div>
            </div>
            <button onClick={fetch} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {(['all', 'new', 'read', 'replied'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-[#d63384] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {f === 'all' ? `All (${contacts.length})` : f === 'new' ? `New (${contacts.filter(c=>c.status==='new').length})` : f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-50 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No enquiries yet</p>
              <p className="text-xs mt-1">Contact form submissions will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((c, i) => {
                const style = STATUS_STYLE[c.status];
                const StatusIcon = style.icon;
                const isOpen = expanded === c.id;
                return (
                  <motion.div key={c.id} layout initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border rounded-2xl overflow-hidden transition-colors ${
                      c.status === 'new' ? 'border-pink-200 bg-pink-50/30' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                    {/* Row */}
                    <button onClick={() => { setExpanded(isOpen ? null : c.id); if (c.status === 'new') markStatus(c.id, 'read'); }}
                      className="w-full flex items-center gap-4 p-4 text-left">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black text-white"
                        style={{ background: 'linear-gradient(135deg, #d63384, #b5165a)' }}>
                        {c.name[0]?.toUpperCase()}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{c.name}</p>
                        <p className="text-xs text-gray-400 truncate">{c.subject || c.message?.slice(0,60) || 'No message'}</p>
                      </div>
                      {/* Status badge */}
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${style.bg} ${style.text}`}>
                        <StatusIcon className="w-3 h-3" /> {c.status}
                      </span>
                      {/* Date */}
                      <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                        {new Date(c.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      </span>
                    </button>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                          className="overflow-hidden border-t border-gray-100">
                          <div className="p-4 bg-gray-50/50 space-y-4">
                            {/* Contact details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                <span className="truncate font-medium">{c.email}</span>
                              </div>
                              {c.phonenumber && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="font-medium">{c.phonenumber}</span>
                                </div>
                              )}
                            </div>

                            {c.message && (
                              <div className="p-3 rounded-xl bg-white border border-gray-100">
                                <p className="text-xs font-bold text-gray-500 mb-1">Message</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{c.message}</p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => replyEmail(c)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#d63384] hover:bg-pink-700 text-white text-xs font-bold rounded-xl transition-colors">
                                <Mail className="w-3.5 h-3.5" /> Reply via Email
                              </button>
                              {c.phonenumber && (
                                <button onClick={() => replyWhatsApp(c)}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors">
                                  <MessageCircle className="w-3.5 h-3.5" /> Reply via WhatsApp
                                </button>
                              )}
                              {c.status !== 'replied' && (
                                <button onClick={() => markStatus(c.id, 'replied')} disabled={processingId === c.id}
                                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors">
                                  {processingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                  Mark Replied
                                </button>
                              )}
                              <button onClick={() => deleteContact(c.id)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-500 text-xs font-bold rounded-xl transition-colors ml-auto">
                                <Trash2 className="w-3.5 h-3.5" /> Delete
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
        </div>
      </div>
    </motion.div>
  );
}
