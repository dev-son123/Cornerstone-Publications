import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Shield, Ban, Trash2, CheckCircle2, MoreVertical, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Author {
  id: string;
  full_name: string | null;
  role: string;
  orcid_id: string | null;
  created_at: string;
  email?: string;
  submission_count?: number;
}

export function AuthorsTab() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: subs } = await supabase.from('submissions').select('user_id');
      const countMap: Record<string, number> = {};
      (subs || []).forEach((s: any) => { if (s.user_id) countMap[s.user_id] = (countMap[s.user_id] || 0) + 1; });
      const enriched = (profiles || []).map((p: any) => ({
        ...p,
        submission_count: countMap[p.id] || 0,
      }));
      setAuthors(enriched as Author[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const toggleBan = async (id: string, currentRole: string) => {
    setProcessingId(id);
    const newRole = currentRole === 'banned' ? 'client' : 'banned';
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
      if (error) throw error;
      toast.success(newRole === 'banned' ? 'User banned successfully' : 'User unbanned');
      fetch();
    } catch (err: any) {
      toast.error('Failed to update: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const removeUser = async (id: string) => {
    if (!confirm('Are you sure you want to remove this client? This will delete their profile and manuscript records.')) return;
    setProcessingId(id);
    try {
      // 1. Delete submissions first (foreign key)
      const { error: subErr } = await supabase.from('submissions').delete().eq('user_id', id);
      if (subErr) throw subErr;
      // 2. Delete profile
      const { error: profErr } = await supabase.from('profiles').delete().eq('id', id);
      if (profErr) throw profErr;

      toast.success('Client removed successfully');
      fetch();
    } catch (err: any) {
      toast.error('Failed to remove: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <motion.div key="authors" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Author Dashboard</h2>
              <p className="text-xs text-gray-400">All registered users and their submission activity</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-2xl bg-gray-50 animate-pulse" />)}
            </div>
          ) : authors.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No registered users yet</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2 text-xs text-gray-400 font-medium px-2">
                <span className="flex-1">Author</span>
                <span className="w-24 text-center">Role</span>
                <span className="w-24 text-center">Submissions</span>
                <span className="w-28 text-center">Joined</span>
                <span className="w-8" />
              </div>
              <div className="space-y-2">
                {authors.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-colors">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black text-white"
                      style={{ background: 'linear-gradient(135deg, #d63384, #b5165a)' }}>
                      {(a.full_name || '?')[0].toUpperCase()}
                    </div>
                    {/* Name & email */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{a.full_name || 'Unnamed User'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {a.orcid_id && (
                          <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">ORCID: {a.orcid_id}</span>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono truncate">{a.id.slice(0, 8)}…</span>
                      </div>
                    </div>
                    {/* Role */}
                    <span className={`w-24 text-center text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                      a.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {a.role === 'admin' ? <><Shield className="w-3 h-3 inline mr-0.5" />Admin</> : a.role}
                    </span>
                    {/* Submissions */}
                    <div className="w-24 text-center flex-shrink-0">
                      <span className={`text-sm font-black ${a.submission_count! > 0 ? 'text-[#d63384]' : 'text-gray-300'}`}>
                        {a.submission_count}
                      </span>
                    </div>
                    {/* Joined */}
                    <div className="w-28 text-right flex-shrink-0 hidden md:block">
                      <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                        <Calendar className="w-3 h-3" />
                        {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="w-8 flex justify-end">
                      {processingId === a.id ? (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-100">
                            {a.role !== 'admin' && (
                              <>
                                <DropdownMenuItem onClick={() => toggleBan(a.id, a.role)} className="gap-2 py-2.5 cursor-pointer">
                                  {a.role === 'banned' ? (
                                    <><CheckCircle2 className="w-4 h-4 text-green-500" /> Unban Client</>
                                  ) : (
                                    <><Ban className="w-4 h-4 text-amber-500" /> Ban Client</>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => removeUser(a.id)} className="gap-2 py-2.5 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                  <Trash2 className="w-4 h-4" /> Remove Client
                                </DropdownMenuItem>
                              </>
                            )}
                            {a.role === 'admin' && (
                              <DropdownMenuItem disabled className="text-xs text-gray-400 italic">
                                Admin actions restricted
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
