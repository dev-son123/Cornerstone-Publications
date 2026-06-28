
import { useMeta } from '@/hooks/useMeta';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen, FileText, CheckCircle, Download } from 'lucide-react';
import { AdvancedNav } from '../components/ui/advanced-nav';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// ── Resources data ────────────────────────────────────────────────────────────
const resources = [
    {
        id: 1,
        icon: FileText,
        title: 'Physics for Medical Laboratory Technology',
        subtitle: 'MLT – Semester I',
        description:
            'Concise, syllabus-aligned notes for Medical Laboratory Technology students covering key definitions, formulas, and short-answer questions prepared for easy revision before exams and practical sessions.',
        badge: 'MLT',
        color: 'from-[#d63384] to-[#b5165a]',
        light: 'bg-pink-50',
        textColor: 'text-[#d63384]',
        syllabusUrl: '/mlt-syllabus.pdf',
    },
    {
        id: 2,
        icon: FileText,
        title: 'Physics for Critical Care Technology',
        subtitle: 'CCT – Semester I',
        description:
            'Concise, syllabus-aligned notes for Critical Care Technology students covering key definitions, formulas, and short-answer questions prepared for easy revision before exams and practical sessions.',
        badge: 'CCT',
        color: 'from-[#d63384] to-[#b5165a]',
        light: 'bg-pink-50',
        textColor: 'text-[#d63384]',
        syllabusUrl: '/cct-syllabus.pdf',
    },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PhysicsResources() {
    useMeta({ title: 'Physics Notes for MLT & CCT Students', description: 'Syllabus-aligned physics class notes for Medical Laboratory Technology and Critical Care Technology students at Apollo College.' });

    const navigate = useNavigate();

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
                        <span className="text-xs font-black tracking-widest text-[#d63384] uppercase">Class Notes · Apollo MLT &amp; CCT</span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tighter">
                        Physics Notes for{' '}
                        <span className="relative inline-block">
                            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#d63384] via-[#ff8fab] to-[#d63384]">
                                Medical Lab &amp; Clinical Courses
                            </span>
                            <div className="absolute -bottom-2 left-0 w-full h-3 bg-[#d63384]/15 blur-md rounded-full"></div>
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-semibold">
                        Buy the full hardcopy printed notes directly from us. 
                        We will ship the highest quality print materials directly to your doorstep.
                    </p>
                </motion.div>

                {/* Benefits */}
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {[
                        { icon: CheckCircle, text: 'Syllabus-aligned, exam-focused content' },
                        { icon: CheckCircle, text: 'Physical bound copy shipped directly to you' },
                        { icon: CheckCircle, text: 'Includes key definitions & short-answer questions' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center space-x-3 bg-white/70 backdrop-blur-md rounded-2xl p-5 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] border border-white/80 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300">
                            <item.icon className="w-5 h-5 text-[#d63384] flex-shrink-0" />
                            <span className="text-sm text-gray-700 font-bold">{item.text}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Resource cards */}
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                    <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Choose Your Course</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {resources.map((res) => (
                            <motion.div key={res.id} whileHover={{ y: -8, scale: 1.015 }} whileTap={{ scale: 0.99 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                                <Card className="border border-white/60 bg-white/85 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] overflow-hidden h-full hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 rounded-[2.2rem] flex flex-col justify-between">
                                    <div>
                                        <div className={`h-2.5 bg-gradient-to-r ${res.color}`} />
                                        <CardContent className="p-8">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className={`w-14 h-14 ${res.light} rounded-2xl flex items-center justify-center shadow-inner`}>
                                                    <res.icon className={`w-7 h-7 ${res.textColor}`} />
                                                </div>
                                                <span className={`px-4 py-1.5 ${res.light} ${res.textColor} text-xs font-black tracking-wider uppercase rounded-full shadow-sm`}>
                                                    {res.badge}
                                                </span>
                                            </div>

                                            <h3 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">{res.title}</h3>
                                            <p className="text-sm text-pink-600 font-bold mb-4">{res.subtitle}</p>
                                            <p className="text-gray-600 leading-relaxed mb-6 text-sm font-medium">{res.description}</p>

                                            <ul className="space-y-3 mb-6">
                                                {['Key definitions & concepts', 'Short-answer & essay questions', 'Formula cheat sheets', 'Exam-ready study format'].map((pt) => (
                                                    <li key={pt} className="flex items-center text-sm text-gray-700 font-semibold">
                                                        <CheckCircle className={`w-4 h-4 ${res.textColor} mr-2.5 flex-shrink-0`} />
                                                        {pt}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </div>
                                    <div className="p-8 pt-0 mt-auto">
                                        <div className="flex flex-col sm:flex-row gap-3 border-t border-gray-100 pt-6">
                                            {res.syllabusUrl && (
                                                <a 
                                                    href={res.syllabusUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-5 py-3 border-2 border-pink-100 text-[#d63384] hover:bg-pink-50 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all flex-1 shadow-sm"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Syllabus PDF
                                                </a>
                                            )}
                                            <Button
                                                onClick={() => navigate('/order-hardcopy?course=' + encodeURIComponent(res.badge))}
                                                className={`bg-gradient-to-r ${res.color} text-white hover:opacity-95 border-0 flex items-center justify-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-pink-200 flex-1 font-bold`}
                                            >
                                                <Search className="w-4 h-4" />
                                                Order Hardcopy
                                            </Button>
                                        </div>
                                    </div>
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
