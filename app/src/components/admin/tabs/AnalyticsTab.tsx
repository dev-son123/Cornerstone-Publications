import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, FileText, Users, Clock, Eye, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalSubmissions: number;
  pendingSubmissions: number;
  acceptedSubmissions: number;
  rejectedSubmissions: number;
  totalArticles: number;
  totalContacts: number;
  thisMonthSubmissions: number;
  statusBreakdown: { status: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: number; sub: string; color: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '15' }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
      <p className="text-xs text-gray-400">{sub}</p>
    </motion.div>
  );
}

export function AnalyticsTab() {
  const [stats, setStats] = useState<Stats>({
    totalSubmissions: 0, pendingSubmissions: 0, acceptedSubmissions: 0,
    rejectedSubmissions: 0, totalArticles: 0, totalContacts: 0,
    thisMonthSubmissions: 0, statusBreakdown: [], monthlyTrend: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [
          { count: totalSub },
          { count: pending },
          { count: accepted },
          { count: rejected },
          { count: articles },
          { count: contacts },
          { data: recentSubs },
        ] = await Promise.all([
          supabase.from('submissions').select('*', { count: 'exact', head: true }),
          supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'Pending Review'),
          supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'Accepted'),
          supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'Rejected'),
          supabase.from('articles').select('*', { count: 'exact', head: true }),
          supabase.from('contacts').select('*', { count: 'exact', head: true }),
          supabase.from('submissions').select('status, created_at').order('created_at', { ascending: true }),
        ]);

        // Monthly trend (last 6 months)
        const now = new Date();
        const monthlyMap: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
          monthlyMap[key] = 0;
        }
        (recentSubs || []).forEach((s: any) => {
          const d = new Date(s.created_at);
          const key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
          if (key in monthlyMap) monthlyMap[key]++;
        });

        // Status breakdown
        const statusMap: Record<string, number> = {};
        (recentSubs || []).forEach((s: any) => {
          statusMap[s.status] = (statusMap[s.status] || 0) + 1;
        });

        // This month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const thisMonth = (recentSubs || []).filter((s: any) => s.created_at >= startOfMonth).length;

        setStats({
          totalSubmissions: totalSub ?? 0,
          pendingSubmissions: pending ?? 0,
          acceptedSubmissions: accepted ?? 0,
          rejectedSubmissions: rejected ?? 0,
          totalArticles: articles ?? 0,
          totalContacts: contacts ?? 0,
          thisMonthSubmissions: thisMonth,
          statusBreakdown: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
          monthlyTrend: Object.entries(monthlyMap).map(([month, count]) => ({ month, count })),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const maxTrend = Math.max(...stats.monthlyTrend.map(m => m.count), 1);

  const STATUS_COLORS: Record<string, string> = {
    'Pending Review': '#f59e0b',
    'Under Review': '#3b82f6',
    'Accepted': '#10b981',
    'Rejected': '#ef4444',
    'Revision Required': '#8b5cf6',
  };

  if (loading) {
    return (
      <motion.div key="analytics-load" initial={{ opacity:0 }} animate={{ opacity:1 }} className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl bg-white border border-gray-100 animate-pulse" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-white border border-gray-100 animate-pulse" />
          <div className="h-64 rounded-2xl bg-white border border-gray-100 animate-pulse" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div key="analytics" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText}    label="Total Submissions" value={stats.totalSubmissions}   sub="All time" color="#d63384" />
          <StatCard icon={Clock}       label="Pending Review"    value={stats.pendingSubmissions} sub="Awaiting action" color="#f59e0b" />
          <StatCard icon={Award}       label="Accepted"          value={stats.acceptedSubmissions} sub="Approved articles" color="#10b981" />
          <StatCard icon={TrendingUp}  label="This Month"        value={stats.thisMonthSubmissions} sub="New submissions" color="#7c3aed" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Eye}   label="Published Articles" value={stats.totalArticles}   sub="In journal" color="#0891b2" />
          <StatCard icon={Users} label="Contact Enquiries"  value={stats.totalContacts}   sub="All time" color="#d97706" />
          <StatCard icon={FileText} label="Rejected"        value={stats.rejectedSubmissions} sub="Not accepted" color="#ef4444" />
          <StatCard icon={Clock} label="Acceptance Rate"
            value={stats.totalSubmissions > 0 ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100) : 0}
            sub="% of submissions" color="#059669" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Trend Bar Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-5 text-sm">Monthly Submission Trend</h3>
            <div className="flex items-end gap-2 h-40">
              {stats.monthlyTrend.map((m, i) => {
                const pct = maxTrend > 0 ? (m.count / maxTrend) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-gray-500">{m.count > 0 ? m.count : ''}</span>
                    <div className="w-full rounded-t-lg transition-all duration-500" style={{ height: `${Math.max(pct, 4)}%`, background: 'linear-gradient(to top, #d63384, #f472b6)', opacity: pct > 0 ? 1 : 0.15 }} />
                    <span className="text-[9px] text-gray-400 font-medium">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-5 text-sm">Submission Status Breakdown</h3>
            {stats.statusBreakdown.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No submissions yet</div>
            ) : (
              <div className="space-y-3">
                {stats.statusBreakdown.map((s, i) => {
                  const pct = stats.totalSubmissions > 0 ? Math.round((s.count / stats.totalSubmissions) * 100) : 0;
                  const color = STATUS_COLORS[s.status] || '#9ca3af';
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-700">{s.status}</span>
                        <span className="text-gray-400">{s.count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full" style={{ background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
