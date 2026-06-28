// src/components/admin/tabs/IssuesTab.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Trash2, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Issue {
  id: string;
  year: number;
  volume: number;
  issue_range: string;
  label: string;
  visible: boolean;
}

export function IssuesTab() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newIssue, setNewIssue] = useState({
    year: new Date().getFullYear(),
    volume: 1,
    issue_range: 'Issue 1-4',
    label: ''
  });

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('past_issues')
        .select('*')
        .order('year', { ascending: false })
        .order('volume', { ascending: false });
      if (error) throw error;
      setIssues(data || []);
    } catch (err: any) {
      toast.error('Failed to fetch issues: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssues(); }, []);

  const handleCreate = async () => {
    if (!newIssue.label) {
      toast.error('Please enter a label (e.g. 2026 Collection)');
      return;
    }
    try {
      const { error } = await supabase.from('past_issues').insert([newIssue]);
      if (error) throw error;
      toast.success('Past issue folder created!');
      setIsAdding(false);
      fetchIssues();
    } catch (err: any) {
      toast.error('Failed to create: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? Articles tagged with this issue will remain, but the "Folder" will be removed from the archive view.')) return;
    try {
      const { error } = await supabase.from('past_issues').delete().eq('id', id);
      if (error) throw error;
      toast.success('Issue removed');
      fetchIssues();
    } catch (err: any) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  return (
    <motion.div key="issues" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Journal Archive Manager</h2>
                <p className="text-gray-400 text-sm">Create and manage "Issues" folders for the journal archive</p>
              </div>
            </div>
            <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'ghost' : 'default'} className={isAdding ? 'text-gray-400' : 'bg-[#d63384]'}>
              {isAdding ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> New Issue Folder</>}
            </Button>
          </div>

          {isAdding && (
            <div className="mb-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-amber-900 uppercase">Folder Label</label>
                <input placeholder="e.g. 2026 Collection" value={newIssue.label} onChange={e => setNewIssue({...newIssue, label: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-900 uppercase">Year</label>
                <input type="number" value={newIssue.year} onChange={e => setNewIssue({...newIssue, year: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none text-sm" />
              </div>
              <Button onClick={handleCreate} className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-[42px] px-8 rounded-xl shadow-lg shadow-amber-200">
                Create Folder
              </Button>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-gray-400 font-medium">Fetching issues...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <p>No archive folders found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <div key={issue.id} className="flex items-center gap-4 p-4 rounded-3xl border border-gray-100 hover:border-amber-100 hover:bg-amber-50/20 transition-all">
                   <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                     <Calendar className="w-5 h-5 text-amber-600" />
                   </div>
                   <div className="flex-1">
                     <p className="font-bold text-gray-900">{issue.label}</p>
                     <p className="text-xs text-gray-400 font-medium">Vol {issue.volume} · {issue.year} · {issue.issue_range}</p>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase text-green-500 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
                       <CheckCircle2 className="w-3 h-3" /> Visible
                     </span>
                     <button onClick={() => handleDelete(issue.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
