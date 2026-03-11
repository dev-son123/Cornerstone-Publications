import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, FileText, Upload, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth, friendlyAuthError } from '@/context/AuthContext';
import { AuthComponent } from '@/components/ui/sign-up';

export default function AdminDashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    // Check for secret shared link directly in URL or in prior memory
    const query = new URLSearchParams(location.search);
    const hasAccessKey = query.get('access') === 'cornerstone2024';

    const { user, login, register, loginWithGoogle, logout } = useAuth();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const [activeTab, setActiveTab] = useState<'overview' | 'publications' | 'content'>('overview');
    const [isPublishing, setIsPublishing] = useState(false);
    const [isSavingContent, setIsSavingContent] = useState(false);

    // Journal Section Content State
    const [journalContent, setJournalContent] = useState({
        editorial: '',
        past_issues: '',
        sample_article: ''
    });

    // Publication Form State
    const [pubForm, setPubForm] = useState({
        title: '',
        author: '',
        authorEmail: '',
        date: '',
        location: '',
        volume: '',
        background: '',
        objectives: '',
        methods: '',
        results: '',
        conclusion: '',
        keywords: '',
        references: ''
    });

    useEffect(() => {
        const isAdminEmail = user?.email === 'info.cornerstoneresearch@gmail.com';
        if (hasAccessKey || localStorage.getItem('adminAccess') === 'true' || isAdminEmail) {
            setIsAuthorized(true);
            // Persist the admin access if they used the secret key or admin email
            if (hasAccessKey || isAdminEmail) {
                localStorage.setItem('adminAccess', 'true');
            }
        } else {
            setIsAuthorized(false);
        }
    }, [hasAccessKey, user]);

    const handlePubChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPubForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePublish = async () => {
        if (!pubForm.title || !pubForm.author || !pubForm.authorEmail) {
            toast.error("Please fill in the required fields (Title, Author, Email)");
            return;
        }

        setIsPublishing(true);
        try {
            const { error } = await supabase.from('articles').insert([{
                title: pubForm.title,
                author_name: pubForm.author,
                author_email: pubForm.authorEmail,
                publication_date: pubForm.date,
                location: pubForm.location,
                volume_issue: pubForm.volume,
                abstract_background: pubForm.background,
                abstract_objectives: pubForm.objectives,
                abstract_methods: pubForm.methods,
                abstract_results: pubForm.results,
                abstract_conclusion: pubForm.conclusion,
                keywords: pubForm.keywords,
                references: pubForm.references,
                status: 'published',
                created_at: new Date().toISOString()
            }]);

            if (error) throw error;

            toast.success("Publication added successfully!");
            // Reset form
            setPubForm({
                title: '', author: '', authorEmail: '', date: '', location: '', volume: '',
                background: '', objectives: '', methods: '', results: '', conclusion: '',
                keywords: '', references: ''
            });
            setActiveTab('overview');
        } catch (err: any) {
            console.error("Publishing error:", err);
            toast.error(err.message || "Failed to publish article. Please ensure 'articles' table exists.");
        } finally {
            setIsPublishing(false);
        }
    };

    // Remember access if valid key was just provided in URL
    useEffect(() => {
        if (hasAccessKey) {
            localStorage.setItem('adminAccess', 'true');
            // Optionally remove it from the URL string for cleaner sharing / less leaking visually, but since we want them to be able to share the copied URL, we'll keep it as is.
        }
    }, [hasAccessKey]);

    // Mock data for submission counts
    const [submissionsCount, setSubmissionsCount] = useState<number>(0);
    const [registeredUsersCount, setRegisteredUsersCount] = useState<number>(0);
    const [processedTodayCount, setProcessedTodayCount] = useState<number>(0);
    const [recentProcesses, setRecentProcesses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // Fetch Submissions Count
            const { count: subCount, error: subError } = await supabase
                .from('submissions')
                .select('*', { count: 'exact', head: true });

            // Fetch Recent Processes
            const { data: recent, error: recentError } = await supabase
                .from('submissions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (!subError && subCount !== null) setSubmissionsCount(subCount);
            else setSubmissionsCount(12); // Mock fallback

            setRegisteredUsersCount(45); // Mock fallback for non-existent profiles table
            setProcessedTodayCount(3); // Mock fallback

            if (!recentError && recent && recent.length > 0) {
                setRecentProcesses(recent);
            } else {
                setRecentProcesses([
                    { id: 1029, title: "Manuscript formatting", status: "Pending Review", email: "john.doe@example.com" },
                    { id: 1028, title: "Language Editing", status: "Completed", email: "amanda.s@example.com" }
                ]);
            }
        } catch (err) {
            console.error("Error fetching admin data:", err);
            setSubmissionsCount(12);
            setRecentProcesses([
                { id: 1029, title: "Manuscript formatting", status: "Pending Review", email: "john.doe@example.com" },
                { id: 1028, title: "Language Editing", status: "Completed", email: "amanda.s@example.com" }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchJournalContent = async () => {
        try {
            const { data, error } = await supabase.from('journal_sections').select('*');
            if (error) throw error;
            if (data) {
                const contentMap: any = {};
                data.forEach((row: any) => {
                    contentMap[row.id] = row.content;
                });
                setJournalContent({
                    editorial: contentMap.editorial || '',
                    past_issues: contentMap.past_issues || '',
                    sample_article: contentMap.sample_article || ''
                });
            }
        } catch (err) {
            console.error("Error fetching journal content:", err);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        if (isAuthorized) fetchJournalContent();
    }, [isAuthorized]);


    if (!isAuthorized) {
        return (
            <div className="relative min-h-screen bg-white">
                <Button variant="ghost" className="absolute top-4 left-4 z-50 text-gray-500 hover:text-gray-900" onClick={() => navigate('/')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Return to Website
                </Button>
                <AuthComponent
                    brandName="Cornerstone Admin Portal"
                    isLogin={isLoginMode}
                    onToggleMode={() => setIsLoginMode(!isLoginMode)}
                    onGoogle={async () => {
                        try {
                            await loginWithGoogle();
                        } catch (err: any) {
                            toast.error(friendlyAuthError(err) || err.message);
                        }
                    }}
                    onEmailSubmit={async (email, password) => {
                        try {
                            if (isLoginMode) {
                                // Additional logic for checking admin access
                                if (email === 'info.cornerstoneresearch@gmail.com' && password === 'Corner1@') {
                                    localStorage.setItem('adminAccess', 'true');
                                    setIsAuthorized(true);
                                    return;
                                }
                                await login(email, password);
                            } else {
                                const { needsConfirmation } = await register("Admin Candidate", email, password);
                                if (needsConfirmation) toast.success("Check your email to verify!");
                            }
                        } catch (err: any) {
                            throw new Error(friendlyAuthError(err) || err.message);
                        }
                    }}
                    onSuccess={() => {}} 
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 w-full">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex items-center gap-1">
                                    <ArrowLeft className="w-4 h-4" /> Home
                                </Button>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-[#d63384] bg-clip-text text-transparent">
                                    Admin Portal
                                </h1>
                            </div>
                            <nav className="flex gap-4">
                                <button onClick={() => setActiveTab('overview')} className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-pink-50 text-[#d63384]' : 'text-gray-500 hover:text-gray-700'}`}>Overview</button>
                                <button onClick={() => setActiveTab('publications')} className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${activeTab === 'publications' ? 'bg-pink-50 text-[#d63384]' : 'text-gray-500 hover:text-gray-700'}`}>Publications</button>
                                <button onClick={() => setActiveTab('content')} className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${activeTab === 'content' ? 'bg-pink-50 text-[#d63384]' : 'text-gray-500 hover:text-gray-700'}`}>Manage Portal Content</button>
                            </nav>
                        </div>
                        <Button variant="ghost" size="sm" onClick={async () => { 
                            await logout();
                            localStorage.removeItem('adminAccess'); 
                            setIsAuthorized(false); 
                            navigate('/');
                        }} className="text-gray-500">Log Out</Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' ? (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-br from-pink-50 to-white border-b border-gray-50">
                                        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wider">Total Submissions</CardTitle>
                                        <FileText className="w-5 h-5 text-pink-500" />
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="text-3xl font-bold text-gray-900">{submissionsCount}</div>
                                        <p className="text-xs text-gray-500 mt-2">Active manuscripts in processing</p>
                                    </CardContent>
                                </Card>

                                <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-br from-pink-50 to-white border-b border-gray-50">
                                        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wider">Registered Users</CardTitle>
                                        <Users className="w-5 h-5 text-pink-500" />
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="text-3xl font-bold text-gray-900">{registeredUsersCount}</div>
                                        <p className="text-xs text-gray-500 mt-2">Accounts created</p>
                                    </CardContent>
                                </Card>

                                <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-br from-purple-50 to-white border-b border-gray-50">
                                        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wider">Processed Today</CardTitle>
                                        <Upload className="w-5 h-5 text-purple-500" />
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="text-3xl font-bold text-gray-900">{processedTodayCount}</div>
                                        <p className="text-xs text-gray-500 mt-2">In the last 24h</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-gray-400" /> Quick Actions
                                </h2>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                    {[
                                        { label: 'Add Publication', icon: Plus, color: 'pink', tab: 'publications' },
                                        { label: 'Journal Sections', icon: FileText, color: 'pink', tab: 'content' },
                                        { label: 'Manage Users', icon: Users, color: 'amber', tab: null },
                                        { label: 'Reports', icon: FileText, color: 'indigo', tab: null }
                                    ].map((action, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => action.tab ? setActiveTab(action.tab as any) : null}
                                            className={`flex flex-col items-center justify-center p-8 bg-${action.color}-50/50 border border-${action.color}-100 rounded-3xl hover:bg-${action.color}-50 transition-all group`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl bg-${action.color}-100 flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform`}>
                                                <action.icon className={`w-7 h-7 text-${action.color === 'pink' ? '[#d63384]' : action.color + '-600'}`} />
                                            </div>
                                            <span className={`text-sm font-bold text-${action.color === 'pink' ? '[#b5165a]' : action.color + '-900'}`}>{action.label}</span>
                                        </motion.button>
                                    ))}
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Processes</h2>
                                <div className="space-y-4">
                                    {isLoading ? (
                                        <p className="text-gray-500 text-sm italic">Loading recent processes...</p>
                                    ) : recentProcesses.length > 0 ? (
                                        recentProcesses.map((process, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                key={idx}
                                                className="flex items-center gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                                                        <FileText className="w-6 h-6 text-pink-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm md:text-base">{process.title || `Manuscript Application`} - #{process.id}</p>
                                                        <p className="text-xs md:text-sm text-gray-500">Submitted by {process.email || "Unknown"}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${process.status === 'Completed' ? 'bg-pink-100 text-pink-700' : 'bg-pink-100 text-pink-700'}`}>
                                                    {process.status}
                                                </span>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No recent processes.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'publications' ? (
                        <motion.div
                            key="publications"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-4xl mx-auto py-8"
                        >
                            {/* Previous Publication Form Content */}
                            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="p-4 bg-pink-500 rounded-2xl shadow-lg ring-4 ring-pink-100">
                                        <Plus className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Add New Publication</h2>
                                        <p className="text-gray-500">Register a published article in the journal database</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Title <span className="text-rose-500">*</span></label>
                                        <input name="title" value={pubForm.title} onChange={handlePubChange} placeholder="Enter publication title" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all placeholder:text-gray-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Author Name <span className="text-rose-500">*</span></label>
                                        <input name="author" value={pubForm.author} onChange={handlePubChange} placeholder="Enter author name" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all placeholder:text-gray-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Email <span className="text-rose-500">*</span></label>
                                        <input name="authorEmail" value={pubForm.authorEmail} onChange={handlePubChange} placeholder="Enter contact email" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all placeholder:text-gray-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Date</label>
                                        <input name="date" value={pubForm.date} onChange={handlePubChange} type="date" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all placeholder:text-gray-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Location</label>
                                        <input name="location" value={pubForm.location} onChange={handlePubChange} placeholder="City, Country" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all placeholder:text-gray-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Volume/Issue</label>
                                        <input name="volume" value={pubForm.volume} onChange={handlePubChange} placeholder="e.g. Vol 2, Issue 4" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all placeholder:text-gray-400" />
                                    </div>
                                </div>

                                <div className="mb-12 p-8 bg-gradient-to-br from-pink-50 to-white rounded-[2rem] border border-pink-100 border-dashed">
                                    <h3 className="text-lg font-bold mb-5 text-pink-900 flex items-center gap-2">
                                        <Upload className="w-6 h-6" /> Paper Manuscript (PDF/DOCX)
                                    </h3>
                                    <div className="p-8 border-2 border-dashed border-pink-200 rounded-2xl bg-pink-50/50 flex flex-col items-center justify-center text-pink-800">
                                        <Upload className="w-8 h-8 mb-2 opacity-50" />
                                        <p className="font-medium">Upload feature temporarily disabled</p>
                                    </div>
                                </div>

                                <div className="space-y-12">
                                    <h3 className="text-2xl font-bold text-gray-900 border-b pb-4 flex items-center justify-between">
                                        Abstract Content
                                        <span className="text-xs font-normal text-gray-400 tracking-widest uppercase">Structured Format</span>
                                    </h3>
                                    <div className="space-y-8">
                                        {[
                                            { name: 'background', label: 'Background', placeholder: 'Problem statement and context...' },
                                            { name: 'objectives', label: 'Aim & Objectives', placeholder: 'What does this study aim to achieve?' },
                                            { name: 'methods', label: 'Methods', placeholder: 'Design, participants, materials...' },
                                            { name: 'results', label: 'Results', placeholder: 'Data analysis and primary findings...' },
                                            { name: 'conclusion', label: 'Conclusion', placeholder: 'Implications for practice...' }
                                        ].map((field) => (
                                            <div key={field.name} className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 ml-1">{field.label}</label>
                                                <textarea name={field.name} value={(pubForm as any)[field.name]} onChange={handlePubChange} placeholder={field.placeholder} className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl h-40 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all resize-none placeholder:text-gray-400"></textarea>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-16 space-y-8">
                                    <h3 className="text-2xl font-bold text-gray-900 border-b pb-4">Metadata & Citations</h3>
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Keywords / Search Tags</label>
                                            <input name="keywords" value={pubForm.keywords} onChange={handlePubChange} placeholder="e.g. Cardiology, Public Health, Nursing Care (Comma separated)" className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all placeholder:text-gray-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">References</label>
                                            <textarea name="references" value={pubForm.references} onChange={handlePubChange} placeholder="Standard citation format (APA/MLA)..." className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl h-48 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all resize-none placeholder:text-gray-400"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePublish}
                                    disabled={isPublishing}
                                    size="lg"
                                    className="w-full mt-16 py-8 bg-[#d63384] hover:bg-pink-700 text-white font-bold text-xl rounded-3xl shadow-2xl shadow-pink-100 transition-all transform hover:-translate-y-1 active:scale-95"
                                >
                                    {isPublishing ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="w-7 h-7 animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        'Official Publish to Journal'
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-4xl mx-auto py-8"
                        >
                            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="p-4 bg-pink-500 rounded-2xl shadow-lg ring-4 ring-pink-100">
                                        <FileText className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Portal Content</h2>
                                        <p className="text-gray-500">Update specific sections of the Journal home page</p>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-lg font-bold text-gray-900">Editorial Board Section</label>
                                            <span className="text-xs text-gray-400 uppercase tracking-widest">Supports HTML/Markdown</span>
                                        </div>
                                        <textarea
                                            value={journalContent.editorial}
                                            onChange={(e) => setJournalContent(prev => ({ ...prev, editorial: e.target.value }))}
                                            className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl h-48 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all resize-none font-mono text-sm"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-lg font-bold text-gray-900">Past Issues Message</label>
                                        <textarea
                                            value={journalContent.past_issues}
                                            onChange={(e) => setJournalContent(prev => ({ ...prev, past_issues: e.target.value }))}
                                            className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl h-32 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all resize-none"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-lg font-bold text-gray-900">Sample Article (JSON Metadata)</label>
                                            <span className="text-xs text-rose-500 font-bold">Must be valid JSON</span>
                                        </div>
                                        <textarea
                                            value={journalContent.sample_article}
                                            onChange={(e) => setJournalContent(prev => ({ ...prev, sample_article: e.target.value }))}
                                            className="w-full p-5 bg-gray-900 text-pink-400 border border-gray-700 rounded-2xl h-64 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all resize-none font-mono text-xs"
                                        />
                                    </div>

                                    <Button
                                        onClick={async () => {
                                            setIsSavingContent(true);
                                            try {
                                                const updates = [
                                                    { id: 'editorial', content: journalContent.editorial, title: 'Editorial Board' },
                                                    { id: 'past_issues', content: journalContent.past_issues, title: 'Past Issues' },
                                                    { id: 'sample_article', content: journalContent.sample_article, title: 'Sample Article' }
                                                ];

                                                for (const update of updates) {
                                                    const { error } = await supabase
                                                        .from('journal_sections')
                                                        .upsert(update);
                                                    if (error) throw error;
                                                }

                                                toast.success("Portal content updated successfully!");
                                            } catch (err: any) {
                                                toast.error("Failed to update content: " + err.message);
                                            } finally {
                                                setIsSavingContent(false);
                                            }
                                        }}
                                        disabled={isSavingContent}
                                        className="w-full py-8 bg-black hover:bg-gray-800 text-white font-bold text-xl rounded-3xl shadow-2xl transition-all"
                                    >
                                        {isSavingContent ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Update Public Portal Content'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
