import { motion } from 'framer-motion';
import { FileText, Users, Upload, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  submissionsCount: number;
  registeredUsersCount: number;
  processedTodayCount: number;
  recentProcesses: any[];
  isLoading: boolean;
  onNavigate: (tab: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  'Pending Review': 'bg-amber-100 text-amber-700',
  'Under Review': 'bg-blue-100 text-blue-700',
  'Accepted': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
  'Revision Required': 'bg-purple-100 text-purple-700',
};

export function OverviewTab({ submissionsCount, registeredUsersCount, processedTodayCount, recentProcesses, isLoading, onNavigate }: Props) {
  const stats = [
    { label: 'Total Submissions', value: submissionsCount, sub: 'Active manuscripts', icon: FileText, color: 'pink' },
    { label: 'Registered Users',  value: registeredUsersCount, sub: 'Accounts created', icon: Users, color: 'blue' },
    { label: 'Processed Today',   value: processedTodayCount, sub: 'In the last 24h',  icon: Upload, color: 'purple' },
    { label: 'Published Articles',value: 1,  sub: 'In the journal', icon: TrendingUp, color: 'green' },
  ];

  const quickActions = [
    { label: 'Add Publication',   icon: FileText,   color: '#d63384', bg: '#fdf2f8', tab: 'publications' },
    { label: 'Upload Article PDF',icon: Upload,     color: '#7c3aed', bg: '#f5f3ff', tab: 'publications' },
    { label: 'Send Notification', icon: Clock,      color: '#0891b2', bg: '#ecfeff', tab: 'notifications' },
    { label: 'Email Broadcast',   icon: Users,      color: '#059669', bg: '#f0fdf4', tab: 'emails' },
    { label: 'Manage Authors',    icon: Users,      color: '#d97706', bg: '#fffbeb', tab: 'authors' },
    { label: 'Analytics',         icon: TrendingUp, color: '#dc2626', bg: '#fef2f2', tab: 'analytics' },
  ];

  return (
    <motion.div key="overview" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.07 }}>
            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
                <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{s.label}</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-[#d63384]" />
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <div className="text-3xl font-black text-gray-900">{s.value}</div>
                <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((a, i) => (
            <motion.button key={i} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(a.tab)}
              className="flex flex-col items-center gap-2.5 py-5 px-3 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-lg transition-all text-center"
              style={{ background: a.bg }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: a.color + '20' }}>
                <a.icon className="w-5 h-5" style={{ color: a.color }} />
              </div>
              <span className="text-xs font-bold text-gray-700 leading-tight">{a.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800">Recent Submissions</h2>
          <button onClick={() => onNavigate('submissions')} className="text-xs font-semibold text-[#d63384] hover:underline">View all →</button>
        </div>
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
            ))
          ) : recentProcesses.length > 0 ? recentProcesses.map((p, idx) => (
            <motion.div key={idx} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[#d63384]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{p.manuscript_title || p.title || 'Manuscript'}</p>
                <p className="text-xs text-gray-400">By {p.author_name || p.email || 'Unknown'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                {p.status}
              </span>
            </motion.div>
          )) : (
            <p className="text-gray-400 text-sm text-center py-8">No submissions yet.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
