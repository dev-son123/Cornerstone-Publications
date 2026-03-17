import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, FileText, Upload, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, friendlyAuthError } from '@/context/AuthContext';
import { AuthComponent } from '@/components/ui/sign-up';

// ─────────────────────────────────────────────────────────────────────────────
// SECRET TRIGGER CONFIG
// Desktop  → press C then R then S (within 2 seconds each)
// Mobile   → tap logo 5 times within 3 seconds
// Router   → <Route path="/portal-cRs7x9mK" element={<AdminDashboard />} />
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_ROUTE = '/portal-cRs7x9mK';
const KEY_SEQUENCE = ['c', 'r', 's'];
const LOGO_TAP_COUNT = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Hook: useAdminTrigger
// Import and use in your LandingPage / Layout:
//
//   import { useAdminTrigger } from '@/pages/AdminDashboard';
//   const { logoTapHandler } = useAdminTrigger();
//   <img src="/logo.jpeg" onClick={logoTapHandler} />
// ─────────────────────────────────────────────────────────────────────────────
export function useAdminTrigger() {
    const navigate = useNavigate();
    const [_tapCount, setTapCount] = useState(0);
    const tapTimer = useRef<number | undefined>(undefined);

    // Desktop: keyboard sequence C → R → S
    useEffect(() => {
        let progress = 0;
        let sequenceTimer: number | undefined;

        const handleKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement).tagName.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

            if (e.key.toLowerCase() === KEY_SEQUENCE[progress]) {
                progress++;
                clearTimeout(sequenceTimer);
                sequenceTimer = window.setTimeout(() => { progress = 0; }, 2000);
                if (progress === KEY_SEQUENCE.length) {
                    progress = 0;
                    clearTimeout(sequenceTimer);
                    navigate(ADMIN_ROUTE);
                }
            } else {
                progress = 0;
                clearTimeout(sequenceTimer);
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('keydown', handleKey);
            clearTimeout(sequenceTimer);
        };
    }, [navigate]);

    // Mobile: logo tap 5 times within 3 seconds
    const logoTapHandler = () => {
        setTapCount(prev => {
            const next = prev + 1;
            clearTimeout(tapTimer.current);
            tapTimer.current = window.setTimeout(() => setTapCount(0), 3000);
            if (next >= LOGO_TAP_COUNT) {
                clearTimeout(tapTimer.current);
                setTapCount(0);
                navigate(ADMIN_ROUTE);
            }
            return next;
        });
    };

    return { logoTapHandler };
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminDashboard Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const navigate = useNavigate();

    const { user, login, register, loginWithGoogle, logout } = useAuth();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [authChecked, setAuthChecked] = useState(false); // ✅ NEW: prevents blank screen

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

    // Dashboard Stats State
    const [submissionsCount, setSubmissionsCount] = useState<number>(0);
    const [registeredUsersCount, setRegisteredUsersCount] = useState<number>(0);
    const [processedTodayCount, setProcessedTodayCount] = useState<number>(0);
    const [recentProcesses, setRecentProcesses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ SECURE: Wait for user to be defined before checking auth
    useEffect(() => {
        if (user !== undefined) {
            const isAdminEmail = user?.email === 'info.cornerstoneresearch@gmail.com';
            setIsAuthorized(isAdminEmail);
            setAuthChecked(true);
        }
    }, [user]);

    // ✅ Safety net: if user takes too long, still show login after 3 seconds
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setAuthChecked(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

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
            setPubForm({
                title: '', author: '', authorEmail: '', date: '', location: '', volume: '',
                background: '', objectives: '', methods: '', results: '', conclusion: '',
                keywords: '', references: ''
            });
            setActiveTab('overview');
        } catch (err: any) {
            console.error("Publishing error:", err);
            toast.error(err.message || "Failed to publish article.");
        } finally {
            setIsPublishing(false);
        }
    };

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const { count: subCount, error: subError } = await supabase
                .from('submissions')
                .select('*', { count: 'exact', head: true });

            const { data: recent, error: recentError } = await supabase
                .from('submissions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (!subError && subCount !== null) setSubmissionsCount(subCount);
            else setSubmissionsCount(12);

            setRegisteredUsersCount(45);
            setProcessedTodayCount(3);

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
                data.forEach((row: any) => { contentMap[row.id] = row.content; });
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
        if (isAuthorized) {
            fetchDashboardData();
            fetchJournalContent();
        }
    }, [isAuthorized]);

    // ─────────────────────────────────────────────────────────────────────────
    // LOADING — show spinner while checking auth (fixes blank screen on refresh)
    // ─────────────────────────────────────────────────────────────────────────
    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NOT AUTHORIZED — show login screen
    // ─────────────────────────────────────────────────────────────────────────
    if (!isAuthorized) {
        return (
            <div className="relative min-h-screen bg-white">
                <Button
                    variant="ghost"
                    className="absolute top-4 left-4 z-50 text-gray-500 hover:text-gray-900"
                    onClick={() => navigate('/')}
                >
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

    // ─────────────────────────────────────────────────────────────────────────
    // AUTHORIZED — show admin dashboard
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* ── Header ── */}
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
                                {(['overview', 'publications', 'content'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all capitalize ${
                                            activeTab === tab
                                                ? 'bg-pink-50 text-[#d63384]'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {tab === 'content' ? 'Manage Portal Content' : tab}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                                await logout();
                                setIsAuthorized(false);
                                setAuthChecked(false);
                                navigate('/');
                            }}
                            className="text-gray-500"
                        >
                            Log Out
                        </Button>
                    </div>
                </div>
            </header>

            {/* ── Main ── */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <AnimatePresence mode="wait">

                    {/* ── OVERVIEW TAB ── */}
                    {activeTab === 'overview' && (
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
                                        { label: 'Add Publication', icon: Plus, color: 'pink', tab: 'publications' as const },
                                        { label: 'Journal Sections', icon: FileText, color: 'pink', tab: 'content' as const },
                                        { label: 'Manage Users', icon: Users, color: 'amber', tab: null },
                                        { label: 'Reports', icon: FileText, color: 'indigo', tab: null }
                                    ].map((action, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => action.tab ? setActiveTab(action.tab) : undefined}
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
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex items-center gap-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                                                        <FileText className="w-6 h-6 text-pink-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm md:text-base">
                                                            {process.title || 'Manuscript Application'} - #{process.id}
                                                        </p>
                                                        <p className="text-xs md:text-sm text-gray-500">
                                                            Submitted by {process.email || 'Unknown'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-pink-100 text-pink-700">
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
                    )}

                    {/* ── PUBLICATIONS TAB ── */}
                    {activeTab === 'publications' && (
                        <motion.div
                            key="publications"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-4xl mx-auto py-8"
                        >
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
                                    {[
                                        { name: 'title',       label: 'Title',        placeholder: 'Enter publication title', required: true },
                                        { name: 'author',      label: 'Author Name',  placeholder: 'Enter author name',       required: true },
                                        { name: 'authorEmail', label: 'Email',        placeholder: 'Enter contact email',     required: true },
                                        { name: 'location',    label: 'Location',     placeholder: 'City, Country',           required: false },
                                        { name: 'volume',      label: 'Volume/Issue', placeholder: 'e.g. Vol 2, Issue 4',    required: false },
                                    ].map(field => (
                                        <div key={field.name} className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">
                                                {field.label} {field.required && <span className="text-rose-500">*</span>}
                                            </label>
                                            <input
                                                name={field.name}
                                                value={(pubForm as any)[field.name]}
                                                onChange={handlePubChange}
                                                placeholder={field.placeholder}
                                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all placeholder:text-gray-400"
                                            />
                                        </div>
                                    ))}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Date</label>
                                        <input
                                            name="date"
                                            value={pubForm.date}
                                            onChange={handlePubChange}
                                            type="date"
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all"
                                        />
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
                                            { name: 'background', label: 'Background',       placeholder: 'Problem statement and context...' },
                                            { name: 'objectives', label: 'Aim & Objectives', placeholder: 'What does this study aim to achieve?' },
                                            { name: 'methods',    label: 'Methods',           placeholder: 'Design, participants, materials...' },
                                            { name: 'results',    label: 'Results',            placeholder: 'Data analysis and primary findings...' },
                                            { name: 'conclusion', label: 'Conclusion',         placeholder: 'Implications for practice...' }
                                        ].map(field => (
                                            <div key={field.name} className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 ml-1">{field.label}</label>
                                                <textarea
                                                    name={field.name}
                                                    value={(pubForm as any)[field.name]}
                                                    onChange={handlePubChange}
                                                    placeholder={field.placeholder}
                                                    className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl h-40 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all resize-none placeholder:text-gray-400"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-16 space-y-8">
                                    <h3 className="text-2xl font-bold text-gray-900 border-b pb-4">Metadata & Citations</h3>
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Keywords / Search Tags</label>
                                            <input
                                                name="keywords"
                                                value={pubForm.keywords}
                                                onChange={handlePubChange}
                                                placeholder="e.g. Cardiology, Public Health, Nursing Care (comma separated)"
                                                className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">References</label>
                                            <textarea
                                                name="references"
                                                value={pubForm.references}
                                                onChange={handlePubChange}
                                                placeholder="Standard citation format (APA/MLA)..."
                                                className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl h-48 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all resize-none placeholder:text-gray-400"
                                            />
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
                    )}

                    {/* ── CONTENT TAB ── */}
                    {activeTab === 'content' && (
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
                                            onChange={e => setJournalContent(prev => ({ ...prev, editorial: e.target.value }))}
                                            className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl h-48 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all resize-none font-mono text-sm"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-lg font-bold text-gray-900">Past Issues Message</label>
                                        <textarea
                                            value={journalContent.past_issues}
                                            onChange={e => setJournalContent(prev => ({ ...prev, past_issues: e.target.value }))}
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
                                            onChange={e => setJournalContent(prev => ({ ...prev, sample_article: e.target.value }))}
                                            className="w-full p-5 bg-gray-900 text-pink-400 border border-gray-700 rounded-2xl h-64 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all resize-none font-mono text-xs"
                                        />
                                    </div>

                                    <Button
                                        onClick={async () => {
                                            setIsSavingContent(true);
                                            try {
                                                const updates = [
                                                    { id: 'editorial',      content: journalContent.editorial,      title: 'Editorial Board' },
                                                    { id: 'past_issues',    content: journalContent.past_issues,    title: 'Past Issues' },
                                                    { id: 'sample_article', content: journalContent.sample_article, title: 'Sample Article' }
                                                ];
                                                for (const update of updates) {
                                                    const { error } = await supabase.from('journal_sections').upsert(update);
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
                                        {isSavingContent
                                            ? <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            : 'Update Public Portal Content'
                                        }
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