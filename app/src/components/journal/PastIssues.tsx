// src/components/journal/PastIssues.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, ChevronRight, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Issue {
  id: string;
  year: number;
  volume: number;
  issue_range: string;
  label: string;
}

interface Article {
  id: number;
  title: string;
  author_name: string;
  volume_issue: string | null;
  pdf_url: string | null;
  abstract: string | null;
}

export function PastIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [{ data: issuesData }, { data: articlesData }] = await Promise.all([
          supabase.from('past_issues').select('*').order('year', { ascending: false }).order('volume', { ascending: false }),
          supabase.from('articles').select('id, title, author_name, volume_issue, pdf_url, abstract, volume, year').eq('published', true)
        ]);
        setIssues(issuesData || []);
        setArticles(articlesData || []);
        if (issuesData && issuesData.length > 0) {
          setSelectedIssueId(issuesData[0].id);
        }
      } catch (err) {
        console.error('Error fetching past issues:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#d63384]" />
      <p className="font-medium">Loading archive...</p>
    </div>
  );

  if (issues.length === 0) return (
    <div className="text-center py-20 text-gray-400">
      <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
      <p className="text-xl font-bold text-gray-600">No past issues yet</p>
      <p>The journal archive is being compiled. Please check back soon.</p>
    </div>
  );

  const selectedIssue = issues.find(i => i.id === selectedIssueId);
  
  // Filter articles that match the selected issue's label or volume/issue string
  const issueArticles = articles.filter(a => {
    if (!selectedIssue) return false;
    
    // 1. Direct match on volume/year (best)
    const matchesNumeric = (a as any).volume === selectedIssue.volume && (a as any).year === selectedIssue.year;
    if (matchesNumeric) return true;

    // 2. String search fallback
    const searchStr = `${selectedIssue.year} Vol ${selectedIssue.volume}`.toLowerCase();
    const articleVol = (a.volume_issue || '').toLowerCase();
    return articleVol.includes(searchStr) || 
           articleVol.includes(`volume ${selectedIssue.volume}`) || 
           articleVol.includes(`vol ${selectedIssue.volume}`);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar: List of Issues */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Archive List</h3>
          {issues.map((issue) => (
            <button
              key={issue.id}
              onClick={() => setSelectedIssueId(issue.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border ${
                selectedIssueId === issue.id
                  ? 'bg-[#d63384] text-white border-[#d63384] shadow-lg shadow-pink-100'
                  : 'bg-white text-gray-600 border-gray-100 hover:border-pink-200 hover:text-[#d63384]'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="text-sm font-black">{issue.label}</span>
                <span className={`text-[10px] font-bold ${selectedIssueId === issue.id ? 'text-white/70' : 'text-gray-400'}`}>
                  {issue.issue_range}
                </span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${selectedIssueId === issue.id ? 'translate-x-1' : ''}`} />
            </button>
          ))}
        </div>

        {/* Content: Articles in Selected Issue */}
        <div className="flex-1 min-w-0">
          {selectedIssue && (
            <motion.div
              key={selectedIssue.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#d63384]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedIssue.label}</h2>
                  <p className="text-sm text-gray-400 font-medium">Volume {selectedIssue.volume} · Published {issueArticles.length} papers</p>
                </div>
              </div>

              {issueArticles.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="font-bold text-gray-600">No papers published for this issue yet</p>
                  <p className="text-sm">Articles appear here after editorial processing.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {issueArticles.map((article) => (
                    <div
                      key={article.id}
                      className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#d63384]/30 transition-all hover:shadow-xl hover:shadow-pink-50"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-[#d63384] transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                          <p className="text-sm text-gray-500 font-medium mb-4">By {article.author_name}</p>
                          {article.abstract && (
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                              {article.abstract}
                            </p>
                          )}
                          <div className="flex items-center gap-4">
                            {article.pdf_url && (
                              <a
                                href={article.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 text-[#d63384] text-xs font-black rounded-lg hover:bg-[#d63384] hover:text-white transition-all"
                              >
                                PDF DOWNLOAD
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
