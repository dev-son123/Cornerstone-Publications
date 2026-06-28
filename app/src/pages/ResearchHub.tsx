import { useNavigate } from 'react-router-dom';
import { useMeta } from '@/hooks/useMeta';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen, FileText, Monitor, Database, Video, CheckCircle, Download } from 'lucide-react';
import { AdvancedNav } from '../components/ui/advanced-nav';
import { Footer } from '../components/Footer';
import { motion } from 'framer-motion';

const modules = [
    {
        id: 1,
        icon: FileText,
        title: 'Effective Manuscript Writing',
        subtitle: '(Order and Tenses)',
        description: 'Master the structure, language order, and correct tense usage required in academic manuscripts to improve clarity and acceptance rates.',
    },
    {
        id: 2,
        icon: FileText,
        title: 'Sample Cover Letter',
        subtitle: '',
        description: 'A ready-to-use, professionally structured cover letter template tailored for journal submissions with guidance notes.',
    },
    {
        id: 3,
        icon: Monitor,
        title: 'Setting Up MS Word for Effective Writing',
        subtitle: '',
        description: 'Step-by-step guide to configure Microsoft Word with the right styles, templates, and settings for academic manuscript preparation.',
    },
    {
        id: 4,
        icon: Database,
        title: 'Using Mendeley',
        subtitle: '',
        description: 'A comprehensive guide to using Mendeley reference manager — from importing references to generating in-text citations and bibliographies.',
    },
    {
        id: 5,
        icon: Video,
        title: '1-on-1 Training via Google Meet',
        subtitle: '',
        description: 'Personalised one-to-one training session with an expert covering your specific research writing needs. 60-minute session, scheduled at your convenience.',
    },
];

export default function ResearchHub() {
    const navigate = useNavigate();
    useMeta({ title: 'Research Hub – Training & Writing Resources', description: 'Download academic writing modules, manuscript templates, and get 1-on-1 training via Google Meet with our expert researchers.' });

    const fadeInUp = {
        hidden: { opacity: 0, y: 25 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col relative overflow-hidden">
            {/* Floating background blur elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/35 rounded-full blur-3xl opacity-50 pointer-events-none animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl opacity-50 pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

            <AdvancedNav />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 flex-1 relative z-10">
                {/* Hero */}
                <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center mb-16">
                    <div className="inline-flex items-center px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-full mb-8 shadow-[0_0_25px_rgba(214,51,132,0.12)] border border-white/60">
                        <BookOpen className="w-5 h-5 text-[#d63384] mr-2" />
                        <span className="text-xs font-black tracking-widest text-[#d63384] uppercase">Structured Learning Resources</span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tighter">
                        Empowering Research Through{' '}
                        <span className="relative inline-block">
                            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#d63384] via-[#ff8fab] to-[#d63384]">
                                Structured Learning
                            </span>
                            <div className="absolute -bottom-2 left-0 w-full h-3 bg-[#d63384]/15 blur-md rounded-full"></div>
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-semibold mb-8">
                        Our Research Training Hub offers downloadable modules designed to build essential skills in academic writing,
                        research methodology, and scientific publishing. Each module combines step-by-step guidance, practice
                        materials, and templates to help researchers and students gain confidence in executing high-quality projects.
                    </p>
                    <div className="relative group inline-block text-left max-w-lg">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#d63384] to-[#ff8fab] rounded-2xl blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                        <div className="relative bg-white/70 backdrop-blur-md border border-white p-5 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.06)] transition-all duration-300 text-left">
                            <p className="font-extrabold text-gray-900 mb-1.5 flex items-center gap-2">
                                <span className="bg-pink-100 p-1.5 rounded-lg text-[#d63384]"><Download className="w-4 h-4" /></span>
                                📥 How to Access
                            </p>
                            <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                Click <strong>Get Started</strong> next to any module below to connect with our team.
                                Materials are updated regularly to include new examples and tools used in current academic publishing.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Benefits bar */}
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {[
                        { icon: CheckCircle, text: 'Instant access upon request' },
                        { icon: CheckCircle, text: 'Updated each academic year' },
                        { icon: CheckCircle, text: 'Beginner to advanced levels' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center space-x-3 bg-white/70 backdrop-blur-md rounded-2xl p-5 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] border border-white/80 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300">
                            <item.icon className="w-5 h-5 text-[#d63384] flex-shrink-0" />
                            <span className="text-sm text-gray-700 font-bold">{item.text}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Modules */}
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Available Modules</h2>
                    <div className="space-y-6">
                        {modules.map((mod, index) => (
                            <motion.div 
                                key={mod.id} 
                                whileHover={{ y: -5, scale: 1.01 }} 
                                whileTap={{ scale: 0.995 }} 
                                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                            >
                                <Card className="border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] transition-all duration-500 rounded-[2.2rem] overflow-hidden">
                                    <CardContent className="p-8">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                                                <div className="flex items-center gap-4 flex-shrink-0">
                                                    {/* Number */}
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d63384] to-[#b5165a] flex items-center justify-center text-white font-black text-lg shadow-md shadow-pink-500/20">
                                                        {index + 1}
                                                    </div>
                                                    {/* Icon */}
                                                    <div className="w-11 h-11 bg-pink-50 border border-pink-100 rounded-xl flex items-center justify-center">
                                                        <mod.icon className="w-5 h-5 text-[#d63384]" />
                                                    </div>
                                                </div>
                                                {/* Content */}
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight flex flex-wrap items-center gap-2">
                                                        {mod.title}
                                                        {mod.subtitle && (
                                                            <span className="text-gray-500 font-bold text-sm bg-gray-100 px-2.5 py-0.5 rounded-md">
                                                                {mod.subtitle}
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mt-2 leading-relaxed font-semibold">{mod.description}</p>
                                                </div>
                                            </div>
                                            {/* CTA */}
                                            <div className="flex-shrink-0 w-full lg:w-auto">
                                                <Button
                                                    onClick={() => navigate('/contact')}
                                                    className="w-full lg:w-auto bg-gradient-to-r from-[#d63384] to-[#b5165a] text-white hover:opacity-95 border-0 flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl shadow-lg shadow-pink-200 font-extrabold"
                                                >
                                                    <Search className="w-4 h-4" />
                                                    Get Started
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

            </main>

            <Footer />
        </div>
    );
}
