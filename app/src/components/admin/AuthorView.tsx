import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle2, XCircle, RefreshCw, Send, AlertCircle, FileUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';

interface Submission {
  id: number;
  manuscript_title: string;
  status: string;
  created_at: string;
  journal: string;
}

const STATUS_MAP: Record<string, { color: string; bg: string; icon: any; desc: string }> = {
  'Pending Review':    { color: '#f59e0b', bg: 'bg-amber-50',  icon: Clock,       desc: 'Awaiting initial check by editorial team.' },
  'Under Review':      { color: '#3b82f6', bg: 'bg-blue-50',   icon: RefreshCw,   desc: 'Currently being reviewed by peer experts.' },
  'Revision Required': { color: '#8b5cf6', bg: 'bg-purple-50', icon: AlertCircle, desc: 'Changes requested. Please check your email.' },
  'Accepted':          { color: '#10b981', bg: 'bg-green-50',  icon: CheckCircle2,desc: 'Approved! Moving to production/formatting.' },
  'Rejected':          { color: '#ef4444', bg: 'bg-red-50',    icon: XCircle,     desc: 'Does not meet current criteria for publication.' },
};

export function AuthorView({ userId }: { userId: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setSubmissions((data || []) as Submission[]);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Welcome Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">My Author Dashboard</h1>
        <p className="text-gray-500">Track your manuscript submissions and publication status in real-time.</p>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1,2].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)}
        </div>
      ) : submissions.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-100 bg-white/50 py-20">
          <CardContent className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-4">
              <FileUp className="w-8 h-8 text-[#d63384]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No submissions found</h3>
            <p className="text-gray-400 mb-6 text-center max-w-xs">You haven't submitted any manuscripts to Cornerstone yet.</p>
            <button className="px-6 py-2.5 bg-[#d63384] text-white rounded-xl font-bold hover:shadow-lg transition-all">
              Submit Now
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {submissions.map((s, idx) => {
            const meta = STATUS_MAP[s.status] || STATUS_MAP['Pending Review'];
            const Icon = meta.icon;
            return (
              <motion.div key={s.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx * 0.1 }}
                className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/5 transition-all">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Status Circle */}
                  <div className={`w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center flex-shrink-0 ${meta.bg}`}>
                    <Icon className="w-8 h-8 mb-1" style={{ color: meta.color }} />
                    <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: meta.color }}>Status</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[#d63384] bg-pink-50 px-2 py-0.5 rounded-full">{s.journal || 'General Journal'}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Sub ID #{s.id}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-[#d63384] transition-colors">
                      {s.manuscript_title}
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">{meta.desc}</p>
                  </div>

                  {/* Date & Actions */}
                  <div className="flex md:flex-col items-end justify-between gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Submitted On</p>
                      <p className="text-sm font-black text-gray-700">{new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-pink-50 hover:text-[#d63384] transition-colors" title="Message Support">
                         <Send className="w-4 h-4" />
                       </button>
                       <button className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-pink-50 hover:text-[#d63384] transition-colors" title="View Manuscript">
                         <FileText className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>

                {/* Status Timeline Preview */}
                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center gap-4">
                   <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: s.status === 'Accepted' ? '100%' : s.status === 'Under Review' ? '60%' : '20%' }}
                        className="h-full rounded-full" 
                        style={{ background: meta.color }} 
                      />
                   </div>
                   <span className="text-xs font-black" style={{ color: meta.color }}>{s.status}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
