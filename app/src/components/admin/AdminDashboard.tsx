import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft, LayoutDashboard, FileText, Bell,
    BarChart2, Mail, Users, Settings, LogOut, Plus, Lock, Inbox, BookOpen
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, friendlyAuthError } from '@/context/AuthContext';
import { AuthComponent } from '@/components/ui/sign-up';

// ── UI Components ─────────────────────────────────────────────────────────────
const MeshBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-pink-400/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#d63384]/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-amber-200/10 blur-[100px]" />
    </div>
);

// ── Tab components ────────────────────────────────────────────────────────────
import { OverviewTab }       from '@/components/admin/tabs/OverviewTab';
import { PublicationsTab }   from '@/components/admin/tabs/PublicationsTab';
import { NotificationsTab }  from '@/components/admin/tabs/NotificationsTab';
import { AnalyticsTab }      from '@/components/admin/tabs/AnalyticsTab';
import { SubmissionsTab }    from '@/components/admin/tabs/SubmissionsTab';
import { EmailBroadcastTab } from '@/components/admin/tabs/EmailBroadcastTab';
import { AuthorsTab }        from '@/components/admin/tabs/AuthorsTab';
import { ContactsTab }       from '@/components/admin/tabs/ContactsTab';
import { IssuesTab }         from '@/components/admin/tabs/IssuesTab';
import { AuthorView }         from '@/components/admin/AuthorView';

// ─────────────────────────────────────────────────────────────────────────────
// SECRET TRIGGER CONFIG
// Desktop  → press C then R then S (within 2 seconds each)
// Mobile   → tap logo 5 times within 3 seconds
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_ROUTE = '/portal-cRs7x9mK';
const KEY_SEQUENCE = ['c', 'r', 's'];
const LOGO_TAP_COUNT = 5;

export function useAdminTrigger() {
    const navigate = useNavigate();
    const [_tapCount, setTapCount] = useState(0);
    const tapTimer = useRef<number | undefined>(undefined);

    const goAdmin = () => {
        window.open(ADMIN_ROUTE, '_blank');
    };

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
                    goAdmin();
                }
            } else {
                progress = 0;
                clearTimeout(sequenceTimer);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => { window.removeEventListener('keydown', handleKey); clearTimeout(sequenceTimer); };
    }, [navigate]);

    const logoTapHandler = () => {
        const next = _tapCount + 1;
        setTapCount(next);
        
        clearTimeout(tapTimer.current);
        tapTimer.current = window.setTimeout(() => setTapCount(0), 3000);
        
        if (next >= LOGO_TAP_COUNT) {
            clearTimeout(tapTimer.current);
            setTapCount(0);
            goAdmin();
        }
    };

    return { logoTapHandler };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab definitions
// ─────────────────────────────────────────────────────────────────────────────
type TabId = 'overview' | 'publications' | 'submissions' | 'contacts' | 'notifications' | 'analytics' | 'emails' | 'authors' | 'issues';

const TABS: { id: TabId; label: string; icon: any; badge?: string }[] = [
    { id: 'overview',       label: 'Overview',       icon: LayoutDashboard },
    { id: 'publications',   label: 'Publish Article',  icon: Plus },
    { id: 'submissions',    label: 'Submissions',     icon: FileText },
    { id: 'contacts',       label: 'Enquiries',       icon: Inbox },
    { id: 'notifications',  label: 'Notifications',   icon: Bell },
    { id: 'analytics',      label: 'Analytics',       icon: BarChart2 },
    { id: 'emails',         label: 'Broadcasts',      icon: Mail },
    { id: 'authors',        label: 'Authors',         icon: Users },
    { id: 'issues',         label: 'Manage Archive',   icon: BookOpen },
];

// ─────────────────────────────────────────────────────────────────────────────
// AdminDashboard
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const navigate = useNavigate();

    // ── Auth check: wait for Supabase to resolve user ─────────────────────────
    const { user, login, register, logout, resetPassword, isLoading: authLoading } = useAuth();

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [authChecked, setAuthChecked]   = useState(!authLoading);
    const [isLoginMode, setIsLoginMode]   = useState(true);
    const [activeTab, setActiveTab]       = useState<TabId>('overview');

    // Publications form state
    const [pubForm, setPubForm] = useState({
        title: '', author: '', authorEmail: '', date: '', location: '',
        volume: '', background: '', objectives: '', methods: '', results: '',
        conclusion: '', keywords: '', references: '', pdf_url: '',
    });
    const [isPublishing, setIsPublishing] = useState(false);

    // Overview state
    const [submissionsCount, setSubmissionsCount]         = useState(0);
    const [registeredUsersCount, setRegisteredUsersCount] = useState(0);
    const [processedTodayCount, setProcessedTodayCount]   = useState(0);
    const [recentProcesses, setRecentProcesses]           = useState<any[]>([]);
    const [isLoading, setIsLoading]                       = useState(true);

    useEffect(() => {
        if (!authLoading) {
            setIsAuthorized(user?.email === 'info.cornerstoneresearch@gmail.com' || user?.role === 'admin');
            setAuthChecked(true);
        }
    }, [authLoading, user]);

    // Always start requiring login on fresh admin page visit
    const [portalSessionGranted, setPortalSessionGranted] = useState(() => {
        // If AuthCallback already set this flag, we arrived from OAuth — grant immediately
        return sessionStorage.getItem('adminPortalSession') === 'true';
    });

    useEffect(() => {
        if (window.location.pathname === ADMIN_ROUTE) {
            // If we already have a granted session (from OAuth callback), don't wipe it
            if (sessionStorage.getItem('adminPortalSession') === 'true') {
                setPortalSessionGranted(true);
                return;
            }
        }
    }, []);

    // On every admin page visit: wipe any existing Supabase session
    // so the user MUST manually log in via the portal form
    // EXCEPT when arriving from OAuth callback (sessionStorage flag is set)
    useEffect(() => {
        if (window.location.pathname === ADMIN_ROUTE) {
            if (sessionStorage.getItem('adminPortalSession') === 'true') return;
            
            import('@/lib/supabase').then(({ supabase }) => {
                supabase.auth.signOut();
            });
        }
    }, [ADMIN_ROUTE]);

    // ── Data fetch ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isAuthorized) return;
        (async () => {
            setIsLoading(true);
            try {
                const [{ count: subCount }, { data: recent }] = await Promise.all([
                    supabase.from('submissions').select('*', { count: 'exact', head: true }),
                    supabase.from('submissions').select('*').order('created_at', { ascending: false }).limit(5),
                ]);
                setSubmissionsCount(subCount ?? 0);
                setRecentProcesses(recent ?? []);
                setRegisteredUsersCount(0); // fetched live in AuthorsTab
                setProcessedTodayCount(0);
            } catch { /* silent */ } finally { setIsLoading(false); }
        })();
    }, [isAuthorized]);

    // ── Pub form handlers ─────────────────────────────────────────────────────
    const handlePubChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPubForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePublish = async () => {
        if (!pubForm.title || !pubForm.author || !pubForm.authorEmail) {
            toast.error('Please fill in Title, Author Name, and Email');
            return;
        }
        setIsPublishing(true);
        try {
            // Smart extraction from volume_issue or prompt
            const yearMatch = pubForm.volume.match(/\d{4}/);
            const discoveredYear = yearMatch ? parseInt(yearMatch[0]) : (pubForm.date ? new Date(pubForm.date).getFullYear() : new Date().getFullYear());
            
            const volMatch = pubForm.volume.match(/Vol\s*(\d+)/i);
            const discoveredVol = volMatch ? parseInt(volMatch[1]) : null;

            const { error } = await supabase.from('articles').insert([{
                title: pubForm.title, author_name: pubForm.author,
                author_email: pubForm.authorEmail, publication_date: pubForm.date || null,
                location: pubForm.location, volume_issue: pubForm.volume,
                abstract_background: pubForm.background, abstract_objectives: pubForm.objectives,
                abstract_methods: pubForm.methods, abstract_results: pubForm.results,
                abstract_conclusion: pubForm.conclusion, keywords: pubForm.keywords,
                references: pubForm.references, pdf_url: pubForm.pdf_url || null,
                status: 'published', published: true, 
                year: discoveredYear, volume: discoveredVol, // explicit numeric fields for better filtering
                created_at: new Date().toISOString(),
            }]);
            if (error) throw error;
            toast.success('Article published to the journal!');
            setPubForm({ title:'', author:'', authorEmail:'', date:'', location:'', volume:'', background:'', objectives:'', methods:'', results:'', conclusion:'', keywords:'', references:'', pdf_url:'' });
            setActiveTab('overview');
        } catch (err: any) {
            toast.error(err.message || 'Failed to publish');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleConvertSubmission = (sub: any) => {
        setPubForm({
            ...pubForm,
            title: sub.manuscript_title || '',
            author: sub.author_name || '',
            authorEmail: sub.author_email || '',
            date: new Date().toISOString().split('T')[0],
            location: sub.country || '',
            pdf_url: sub.manuscript_url || '',
        });
        setActiveTab('publications');
        toast.info('Submission data imported. Fill the details and click publish!');
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <MeshBackground />
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 border-4 border-pink-200 border-t-[#d63384] rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-gray-400">Loading admin portal…</p>
                </div>
            </div>
        );
    }

    // ── Login or Unauthorized view ──────────────────────────────────────────
    if (!user || !portalSessionGranted) {
        return (
            <div className="relative min-h-screen bg-white font-sans overflow-hidden">
                <MeshBackground />
                <Button variant="ghost" className="absolute top-4 left-4 z-50 text-gray-500 hover:bg-white/50 rounded-xl"
                    onClick={() => navigate('/')}>
                    <ArrowLeft className="w-4 h-4 mr-1" /> Return to Website
                </Button>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen w-full flex flex-col">
                    <AuthComponent
                        brandName="Cornerstone Portal"
                        isLogin={isLoginMode}
                        onToggleMode={() => setIsLoginMode(m => !m)}
                        onEmailSubmit={async (email, password) => {
                            try {
                                if (isLoginMode) {
                                    await login(email, password);
                                } else {
                                    const { needsConfirmation } = await register('User', email, password);
                                    if (needsConfirmation) toast.success('Check your email to verify!');
                                }
                            } catch (err: any) {
                                throw new Error(friendlyAuthError(err) || err.message);
                            }
                        }}
                        onForgotPassword={async (email) => {
                            try {
                                await resetPassword(email);
                                toast.success('Password reset email sent! Please check your inbox.');
                            } catch (err: any) {
                                throw new Error(friendlyAuthError(err) || err.message);
                            }
                        }}
                        onSuccess={() => {
                            sessionStorage.setItem('adminPortalSession', 'true');
                            setPortalSessionGranted(true);
                        }}
                    />
                </motion.div>
            </div>
        );
    }

    const PRIMARY_ADMIN = 'info.cornerstoneresearch@gmail.com';
    const isAdmin = (user.email === PRIMARY_ADMIN) || (user.role === 'admin');

    // ── Banned View ──────────────────────────────────────────────────────────
    if (user.role === 'banned') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Access Restricted</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Your account has been restricted by the administrator. Please contact support if you believe this is an error.
                    </p>
                    <div className="space-y-3">
                        <Button onClick={() => navigate('/')} variant="outline" className="w-full py-6 rounded-2xl font-bold">
                            Return to Homepage
                        </Button>
                        <button onClick={async () => { await logout(); navigate('/'); }} 
                            className="text-sm text-red-500 font-bold hover:underline">
                            Log out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Author / Client View ─────────────────────────────────────────────────
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-white/80">
                <MeshBackground />
                <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 h-16 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#d63384]">
                             <FileText className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-black text-gray-900">Cornerstone portal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-400 hidden sm:block">{user.name}</span>
                        <button
                            onClick={async () => { await logout(); navigate('/'); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-500 font-bold hover:bg-red-50 transition-colors">
                            <LogOut className="w-4 h-4" /> Log Out
                        </button>
                    </div>
                </header>
                <main className="p-4 md:p-8">
                    <AuthorView userId={user.id} />
                </main>
            </div>
        );
    }

    // ── Full Admin Dashboard ──────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-white/60 flex">
            <MeshBackground />

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="hidden md:flex flex-col w-56 bg-white/80 backdrop-blur-xl border-r border-gray-100/80 fixed top-0 left-0 h-full z-40">
                {/* Brand */}
                <div className="px-5 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#d63384,#b5165a)' }}>
                            <Settings className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900 leading-none">Cornerstone</p>
                            <p className="text-[10px] text-[#d63384] font-semibold">Admin Portal</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {TABS.map(tab => {
                        const active = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                    active
                                        ? 'bg-[#d63384] text-white shadow-md shadow-pink-200'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}>
                                <tab.icon className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1 text-left">{tab.label}</span>
                                {tab.badge && (
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-pink-100 text-[#d63384]'}`}>
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100 space-y-1">
                    <div className="px-3 py-2">
                        <p className="text-xs font-semibold text-gray-700 truncate">{user?.email}</p>
                        <p className="text-[10px] text-[#d63384] font-bold">Super Admin</p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to site
                    </button>
                    <button
                        onClick={async () => { await logout(); setIsAuthorized(false); setAuthChecked(false); navigate('/'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors font-semibold">
                        <LogOut className="w-4 h-4" /> Log Out
                    </button>
                </div>
            </aside>

            {/* ── Mobile top bar ────────────────────────────────────────────── */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
                <p className="font-black text-gray-900 text-sm">Cornerstone Admin</p>
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`p-2 rounded-lg flex-shrink-0 transition-colors ${activeTab === tab.id ? 'bg-pink-50 text-[#d63384]' : 'text-gray-400'}`}>
                            <tab.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Main content ──────────────────────────────────────────────── */}
            <main className="flex-1 md:ml-56 pt-14 md:pt-0 p-4 md:p-8 overflow-auto">
                {/* Mobile tab label */}
                <div className="md:hidden mb-4 flex items-center gap-2">
                    {(() => { const t = TABS.find(x => x.id === activeTab); return t ? <><t.icon className="w-4 h-4 text-[#d63384]" /><h1 className="font-black text-gray-900">{t.label}</h1></> : null; })()}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <OverviewTab
                            submissionsCount={submissionsCount}
                            registeredUsersCount={registeredUsersCount}
                            processedTodayCount={processedTodayCount}
                            recentProcesses={recentProcesses}
                            isLoading={isLoading}
                            onNavigate={(tab) => setActiveTab(tab as TabId)}
                        />
                    )}
                    {activeTab === 'publications' && (
                        <PublicationsTab
                            pubForm={pubForm}
                            onChange={handlePubChange}
                            onPublish={handlePublish}
                            isPublishing={isPublishing}
                        />
                    )}
                    {activeTab === 'submissions'   && <SubmissionsTab onPublishClick={handleConvertSubmission} />}
                    {activeTab === 'contacts'      && <ContactsTab />}
                    {activeTab === 'notifications' && <NotificationsTab />}
                    {activeTab === 'analytics'     && <AnalyticsTab />}
                    {activeTab === 'emails'        && <EmailBroadcastTab />}
                    {activeTab === 'authors'       && <AuthorsTab />}
                    {activeTab === 'issues'        && <IssuesTab />}
                </AnimatePresence>
            </main>
        </div>
    );
}
