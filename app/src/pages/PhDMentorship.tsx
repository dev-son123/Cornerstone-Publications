// import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, BookOpen, Award, FileText, MapPin, Mail, Phone, ExternalLink, GraduationCap } from 'lucide-react';
import { SocialIcons } from '@/components/ui/social-icons';

import { motion } from 'framer-motion';

export default function PhDMentorship() {
    const fadeInUp: any = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer: any = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            {/* @ts-ignore */}
            <motion.section
                initial="hidden" animate="visible" variants={staggerContainer}
                className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 via-white to-pink-50 relative overflow-hidden"
            >
                {/* Decorative floating blobs */}
                <div className="absolute top-20 left-10 w-64 h-64 bg-pink-200/40 rounded-full blur-3xl opacity-60 mix-blend-multiply pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl opacity-60 mix-blend-multiply pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    {/* Add Logo Transition Here */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, rotateX: 90 }}
                        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 14,
                            duration: 1.2
                        }}
                        className="flex justify-center mb-8"
                    >
                        <div className="relative group perspective-1000">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#d63384] to-[#d63384] rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                            <img src="/logo.jpeg" alt="Cornerstone Logo" className="relative w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-2xl rounded-2xl border-2 border-white/60 bg-white/80 backdrop-blur-sm transition-transform duration-500 group-hover:rotate-y-12" />
                        </div>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="inline-flex items-center px-5 py-2.5 bg-white/40 backdrop-blur-md rounded-full mb-8 shadow-[0_0_20px_rgba(214,51,132,0.15)] border border-white/60">
                        <span className="bg-gradient-to-r from-[#d63384] to-[#d63384] bg-clip-text text-transparent text-sm font-black tracking-widest flex items-center gap-2">
                            <Award className="w-5 h-5 text-[#d63384]" />
                            CORNERSTONE PREMIUM MENTORSHIP
                        </span>
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-8xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tighter drop-shadow-sm">
                        PhD <span className="relative inline-block"><span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#d63384] via-[#ff8fab] to-[#d63384]">Mentoring</span><div className="absolute -bottom-2 left-0 w-full h-4 bg-[#d63384]/20 blur-lg rounded-full"></div></span> Program
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-xl sm:text-2xl text-gray-800 max-w-3xl mx-auto mb-8 font-semibold">
                        Advanced Research in Nanoscience & Energy Materials
                    </motion.p>

                    <motion.div variants={fadeInUp} className="relative group inline-block text-left mb-10 w-full max-w-3xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#d63384] to-[#d63384] rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                        <div className="relative bg-white/70 backdrop-blur-2xl border border-white p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 transform hover:-translate-y-2">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200 to-pink-200 opacity-30 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>

                            <p className="font-extrabold text-3xl mb-6 flex items-center justify-center sm:justify-start gap-4 text-gray-900">
                                <span className="bg-gradient-to-br from-[#d63384] to-[#ff8fab] p-3 rounded-2xl shadow-lg shadow-pink-500/30 text-white transform group-hover:rotate-12 transition-transform duration-500"><GraduationCap className="w-8 h-8" /></span>
                                Dr. Christina Rhoda J, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d63384] to-[#b5165a]">PhD</span>
                            </p>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-gray-700 font-bold tracking-wider">
                                <span className="bg-white/90 shadow-md shadow-black/5 px-5 py-2.5 rounded-full border border-pink-100 hover:border-[#d63384] hover:bg-pink-50 transition-colors">Nanoscience & Nanotechnology</span>
                                <span className="bg-white/90 shadow-md shadow-black/5 px-5 py-2.5 rounded-full border border-pink-100 hover:border-[#d63384] hover:bg-pink-50 transition-colors">Materials Chemistry</span>
                                <span className="bg-white/90 shadow-md shadow-black/5 px-5 py-2.5 rounded-full border border-pink-100 hover:border-[#d63384] hover:bg-pink-50 transition-colors">Energy Storage Systems</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Program Overview */}
            {/* @ts-ignore */}
            <motion.section
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                className="py-16 px-4 sm:px-6 lg:px-8 bg-white"
            >
                <div className="max-w-4xl mx-auto">
                    <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 rounded-[2.5rem]">
                        <div className="h-3 w-full bg-gradient-to-r from-[#d63384] via-[#ff8fab] to-[#d63384]"></div>
                        <CardContent className="p-8 sm:p-14 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-100/50 to-pink-50/50 rounded-full opacity-60 blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>

                            <h2 className="text-3xl sm:text-5xl font-black mb-6 flex items-center gap-5 text-gray-900 tracking-tighter relative z-10">
                                <div className="p-4 bg-gradient-to-br from-pink-50 to-white rounded-2xl shadow-[inset_0_2px_10px_rgba(214,51,132,0.1)] border border-pink-100">
                                    <BookOpen className="w-10 h-10 text-[#d63384]" />
                                </div>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">3–4 Years Structured Mentoring</span>
                            </h2>
                            <p className="text-gray-600 text-xl sm:text-2xl mb-12 leading-relaxed font-medium max-w-3xl relative z-10">
                                A milestone-driven, research-intensive guidance program designed to support doctoral candidates through every stage of their journey to success.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-10 relative z-10">
                                <div className="bg-gray-50/80 backdrop-blur-md p-8 rounded-[2rem] border border-gray-100/80 shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)]">
                                    <h3 className="font-extrabold text-gray-900 mb-8 text-2xl flex items-center gap-3">
                                        <div className="p-2 bg-pink-100/50 rounded-xl"><MapPin className="w-6 h-6 text-[#d63384]" /></div>
                                        Program Phases
                                    </h3>
                                    <ul className="space-y-5">
                                        <li className="group flex items-start bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-pink-200">
                                            <div className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-full p-1 mr-4 mt-1 shadow-sm shrink-0 group-hover:scale-110 transition-transform"><CheckCircle className="w-4 h-4 text-white" /></div>
                                            <span className="text-gray-600 text-lg"><strong className="text-gray-900 font-extrabold block mb-1 text-xl">Year 1</strong> Foundation & Proposal</span>
                                        </li>
                                        <li className="group flex items-start bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-pink-200">
                                            <div className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-full p-1 mr-4 mt-1 shadow-sm shrink-0 group-hover:scale-110 transition-transform"><CheckCircle className="w-4 h-4 text-white" /></div>
                                            <span className="text-gray-600 text-lg"><strong className="text-gray-900 font-extrabold block mb-1 text-xl">Years 2–3</strong> Research & Publications</span>
                                        </li>
                                        <li className="group flex items-start bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-pink-200">
                                            <div className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-full p-1 mr-4 mt-1 shadow-sm shrink-0 group-hover:scale-110 transition-transform"><CheckCircle className="w-4 h-4 text-white" /></div>
                                            <span className="text-gray-600 text-lg"><strong className="text-gray-900 font-extrabold block mb-1 text-xl">Year 4</strong> Thesis & Defense</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-gradient-to-br from-pink-50/80 to-pink-100/40 backdrop-blur-md p-8 rounded-[2rem] border border-pink-200/50 shadow-[inset_0_2px_20px_rgba(214,51,132,0.05)]">
                                    <h3 className="font-extrabold text-gray-900 mb-8 text-2xl flex items-center gap-3">
                                        <div className="p-2 bg-pink-200/50 rounded-xl"><Award className="w-6 h-6 text-[#d63384]" /></div>
                                        Core Inclusions
                                    </h3>
                                    <ul className="space-y-4">
                                        {[
                                            'Bi-weekly exclusive mentoring meetings',
                                            'Comprehensive annual progress reviews',
                                            'Co-authorship on 2–3 premium Scopus-indexed publications',
                                            'Hands-on elite research supervision'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center text-gray-800 bg-white/90 px-5 py-4 rounded-2xl border border-pink-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-semibold text-lg hover:-translate-y-1 transition-transform duration-300">
                                                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#d63384] to-[#b5165a] mr-4 shrink-0 shadow-[0_0_8px_rgba(214,51,132,0.6)]"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.section>

            {/* Roadmap */}
            {/* @ts-ignore */}
            <motion.section
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
                className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50 border-y border-gray-100 relative overflow-hidden"
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#d63384 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">🗂 Executive Roadmap</h2>
                        <div className="w-32 h-1.5 bg-gradient-to-r from-[#d63384] to-[#d63384] mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Year 1 */}
                        <motion.div variants={fadeInUp}>
                            <Card className="border-t-4 border-t-[#d63384] hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-xl bg-white h-full">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-pink-100 p-3 rounded-xl text-[#d63384]">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600">Year 1 – Foundation</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-2 border-l-2 border-[#d63384] pl-2">Step 1: Identify Research Gap (M1-3)</h4>
                                            <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-5">
                                                <li>Systematic review (Scopus, Web of Science, PubMed)</li>
                                                <li>Gap analysis report (5–10 pages)</li>
                                                <li><strong className="text-gray-800">Focus:</strong> Novelty and applications</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-2 border-l-2 border-[#d63384] pl-2">Step 2: Proposal Development (M4-6)</h4>
                                            <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-5">
                                                <li>Research objectives & hypotheses</li>
                                                <li>Methodology design</li>
                                                <li>40–45 min mock defense presentation</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-2 border-l-2 border-[#d63384] pl-2">Step 3: Coursework & Qualifiers</h4>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Years 2-3 */}
                        <motion.div variants={fadeInUp}>
                            <Card className="border-t-4 border-t-[#b5165a] hover:-translate-y-2 transition-transform duration-300 shadow-xl hover:shadow-2xl bg-white md:scale-105 z-10 relative overflow-hidden h-full">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full opacity-50 blur-2xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
                                <CardContent className="p-8 relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-pink-100 p-3 rounded-xl text-[#b5165a]">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-[#b5165a] to-gray-800">Years 2–3 – Research</h3>
                                    </div>
                                    <ul className="text-sm text-gray-700 space-y-5">
                                        <li className="flex items-start gap-2 bg-pink-50/50 p-2 rounded-lg">
                                            <span className="text-[#d63384] font-bold mt-0.5 shrink-0">•</span>
                                            <span className="font-semibold">Nanocomposite synthesis</span>
                                        </li>
                                        <li className="flex items-start gap-2 bg-pink-50/50 p-3 rounded-lg border border-pink-100/50">
                                            <span className="text-[#d63384] font-bold mt-0.5 shrink-0">•</span>
                                            <div>
                                                <strong className="block mb-2 text-gray-900">Characterization:</strong>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {['XRD', 'SEM', 'EDAX', 'FTIR', 'RAMAN', 'UV', 'PL', 'DLS', 'XPS', 'CV', 'GCD', 'EIS', 'ANTIBACTERIAL STUDIES'].map(tech => (
                                                        <span key={tech} className="text-[10px] bg-white border border-pink-200 px-2 py-1 rounded shadow-sm text-[#b5165a] font-bold tracking-wider">{tech}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-2 bg-pink-50/50 p-2 rounded-lg">
                                            <span className="text-[#d63384] font-bold mt-0.5 shrink-0">•</span>
                                            <span>Data analysis (<strong className="text-gray-900">Origin Pro</strong>)</span>
                                        </li>
                                        <li className="flex items-start gap-2 bg-pink-50/50 p-2 rounded-lg font-bold text-gray-900 border-l-4 border-[#b5165a]">
                                            <span className="text-[#d63384] mt-0.5 shrink-0 ml-1">•</span>
                                            1+ journal publication by Year 3
                                        </li>
                                        <li className="flex items-start gap-2 bg-pink-50/50 p-2 rounded-lg">
                                            <span className="text-[#d63384] font-bold mt-0.5 shrink-0">•</span>
                                            Conference presentations
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Year 4 */}
                        {/* @ts-ignore */}
                        <motion.div variants={fadeInUp}>
                            <Card className="border-t-4 border-t-gray-800 hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-xl bg-white h-full">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-gray-100 p-3 rounded-xl text-gray-800">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600">Year 4 – Defense</h3>
                                    </div>
                                    <ul className="text-sm text-gray-700 space-y-4">
                                        <li className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                                            <div className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></div> <span className="font-medium">Thesis structuring</span>
                                        </li>
                                        <li className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                                            <div className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></div> <span className="font-medium">Manuscript-style chapters (2–3)</span>
                                        </li>
                                        <li className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                                            <div className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></div> <span className="font-medium">Plagiarism & formatting compliance</span>
                                        </li>
                                        <li className="flex flex-col gap-1 p-2.5 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></div> <span className="font-medium">45-minute defense preparation</span>
                                            </div>
                                        </li>
                                        <li className="flex items-center gap-3 p-2.5 bg-gray-900 text-white rounded-lg transition-colors shadow-md mt-2">
                                            <Award className="w-4 h-4 shrink-0 text-yellow-400" /> <span className="font-bold">Final submission & viva guidance</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Benefits & Mentor Info */}
            {/* @ts-ignore */}
            <motion.section
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
                className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100"
            >
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16">

                    {/* Benefits List */}
                    <motion.div variants={fadeInUp}>
                        <h2 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">🌟 Key Benefits</h2>
                        <div className="space-y-4">
                            {[
                                { title: 'Personalized schedule', desc: '(Chennai-based scholars)' },
                                { title: 'Lab reagent & instrumentation', desc: 'guidance and support' },
                                { title: 'Structured publication support', desc: 'from drafting to submission' },
                                { title: 'Grant writing assistance', desc: 'for research funding' },
                                { title: 'Career mentoring', desc: '(Academia & Industry pathways)' }
                            ].map((benefit, idx) => (
                                <div key={idx} className="flex items-center p-4 bg-gradient-to-r from-pink-50/80 to-transparent rounded-xl border border-pink-100/60 hover:border-pink-300 transition-colors">
                                    <CheckCircle className="w-6 h-6 text-[#d63384] mr-4 shrink-0" />
                                    <span className="text-gray-900 font-bold">{benefit.title} <span className="text-gray-500 font-normal ml-1">{benefit.desc}</span></span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 bg-gray-50 rounded-2xl p-8 border border-gray-200 shadow-inner">
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                                <Mail className="w-6 h-6 text-[#d63384]" /> Enrollment Details
                            </h3>
                            <div className="space-y-5 text-gray-700">
                                <a href="https://maps.google.com/?q=Chennai,+India" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 hover:border-[#d63384] transition-all hover:shadow-md cursor-pointer">
                                    <div className="bg-pink-50 p-2 rounded-lg group-hover:bg-[#d63384] transition-colors"><MapPin className="w-5 h-5 text-[#d63384] group-hover:text-white transition-colors" /></div>
                                    <div><strong className="block text-gray-900">Location</strong> <span className="text-sm">Chennai, India</span></div>
                                </a>
                                <a href="mailto:Info.cornerstoneresearch@gmail.com" className="group flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 hover:border-[#d63384] transition-all hover:shadow-md cursor-pointer">
                                    <div className="bg-pink-50 p-2 rounded-lg group-hover:bg-[#d63384] transition-colors"><Mail className="w-5 h-5 text-[#d63384] group-hover:text-white transition-colors" /></div>
                                    <div><strong className="block text-gray-900">Email Address</strong> <span className="text-sm break-all">Info.cornerstoneresearch@gmail.com</span></div>
                                </a>
                                <div className="grid grid-cols-2 gap-3">
                                    <a href="tel:+919962900969" className="group flex flex-col items-center justify-center gap-2 bg-white p-4 rounded-xl border border-gray-200 hover:border-[#d63384] hover:bg-pink-50/30 transition-all hover:shadow-md cursor-pointer text-center">
                                        <div className="bg-pink-50 p-3 rounded-full group-hover:bg-[#d63384] transition-colors"><Phone className="w-5 h-5 text-[#d63384] group-hover:text-white transition-colors" /></div>
                                        <div><strong className="block text-gray-900 text-sm">Call Now</strong></div>
                                    </a>
                                    <a href="https://wa.me/919962900969" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center justify-center gap-2 bg-white p-4 rounded-xl border border-gray-200 hover:border-pink-500 hover:bg-pink-50/30 transition-all hover:shadow-md cursor-pointer text-center">
                                        <div className="bg-pink-50 p-3 rounded-full group-hover:bg-pink-500 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600 group-hover:text-white transition-colors"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                                        </div>
                                        <div><strong className="block text-gray-900 text-sm">WhatsApp</strong></div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* About Mentor */}
                    <motion.div variants={fadeInUp} className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#d63384] to-[#b5165a] rounded-3xl transform rotate-3 opacity-10"></div>
                        <Card className="border-0 shadow-2xl relative bg-white/90 backdrop-blur-xl h-full border border-pink-100 max-w-lg ml-auto hover:shadow-pink-900/10 transition-shadow duration-500">
                            <CardContent className="p-8 sm:p-10">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-50 rounded-2xl mb-6 shadow-inner">
                                    <FileText className="w-8 h-8 text-[#d63384]" />
                                </div>
                                <h2 className="text-3xl font-extrabold mb-6 text-gray-900 tracking-tight">🔬 About the Mentor</h2>
                                <p className="text-gray-700 text-lg leading-relaxed mb-8">
                                    With <strong className="text-gray-900 text-xl">8+ years</strong> of research experience and
                                    <strong className="text-[#d63384] text-xl"> 17 peer-reviewed publications</strong> (h-index: 8),
                                    Dr. Christina specializes in:
                                </p>

                                <ul className="space-y-3 mb-10">
                                    {[
                                        'Metal oxide nanocomposites',
                                        'Supercapacitor applications',
                                        'Electrochemical energy storage',
                                        'Optical sensing materials'
                                    ].map(spec => (
                                        <li key={spec} className="flex items-center text-gray-800 bg-gray-50 px-5 py-4 rounded-xl border border-gray-100 font-medium shadow-sm hover:translate-x-1 transition-transform">
                                            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#d63384] to-[#b5165a] mr-4 shadow-sm"></span>
                                            {spec}
                                        </li>
                                    ))}
                                </ul>

                                <div className="pt-8 border-t border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Click below links for Mentor's Publications</p>
                                    <div className="flex flex-col gap-3">
                                        <a href="https://www.researchgate.net/profile/Christina-Rhoda-J" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-3 rounded-xl border border-gray-200 hover:border-[#d63384] hover:text-[#d63384] hover:bg-pink-50/50 transition-all font-semibold text-gray-700 group">
                                            ResearchGate Profile <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#d63384] transition-colors" />
                                        </a>
                                        <a href="https://orcid.org/0000-0002-9394-2704" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-3 rounded-xl border border-gray-200 hover:border-[#d63384] hover:text-[#d63384] hover:bg-pink-50/50 transition-all font-semibold text-gray-700 group">
                                            ORCID Profile <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#d63384] transition-colors" />
                                        </a>
                                        <a href="https://www.scopus.com/authid/detail.uri?authorId=57210173384" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-3 rounded-xl border border-gray-200 hover:border-[#d63384] hover:text-[#d63384] hover:bg-pink-50/50 transition-all font-semibold text-gray-700 group">
                                            SCOPUS ID <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#d63384] transition-colors" />
                                        </a>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <img src="/logo.jpeg" alt="Cornerstone" className="w-12 h-12 object-contain rounded-lg shadow-md" />
                        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            Cornerstone Research
                        </span>
                    </div>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Guiding scholars from draft to discovery with professional academic publishing and mentorship services.
                    </p>
                    <div className="flex justify-center mb-8">
                        <SocialIcons />
                    </div>
                    <div className="text-sm text-gray-500 border-t border-gray-800 pt-8">
                        © {new Date().getFullYear()} Cornerstone Research and Publication Services. All rights reserved.
                    </div>
                </div>
            </footer>
            {/* Floating Contact CTA */}
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8, type: "spring" }}
                className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
            >
                <a
                    href="https://wa.me/919962900969"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-4 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-full shadow-[0_10px_25px_rgba(34,197,94,0.4)] hover:shadow-[0_15px_35px_rgba(34,197,94,0.6)] hover:-translate-y-1 transition-all duration-300 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
                </a>
                <a
                    href="tel:+919962900969"
                    className="flex items-center justify-center p-4 bg-gradient-to-r from-[#d63384] to-[#ff8fab] text-white rounded-full shadow-[0_10px_25px_rgba(214,51,132,0.4)] hover:shadow-[0_15px_35px_rgba(214,51,132,0.6)] hover:-translate-y-1 transition-all duration-300 group"
                >
                    <Phone className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </a>
            </motion.div>

        </div>
    );
}
