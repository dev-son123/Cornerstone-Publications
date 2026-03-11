import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen, FileText, Monitor, Database, Video, CheckCircle } from 'lucide-react';
import { AnimatedMenuLink } from '@/components/ui/menu-hover-effects';

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo — extreme left */}
                        <button onClick={() => navigate('/')} className="flex items-center gap-3">
                            <img src="/logo.jpeg" alt="Cornerstone" className="w-10 h-10 object-contain rounded flex-shrink-0" />
                            <span className="text-sm font-bold text-gray-900 leading-tight text-left hidden sm:block">
                                Cornerstone Research<br />
                                <span className="text-xs font-semibold text-[#FFB7C5]">Service and Publications</span>
                            </span>
                        </button>
                        <div className="flex items-center space-x-3">
                            <AnimatedMenuLink onClick={() => navigate(-1 as never)} text="← Back" />
                            <span className="text-lg font-bold text-gray-900 hidden md:block">Research Training Hub</span>
                            <Button onClick={() => navigate('/contact')} className="bg-gradient-to-r from-[#FFB7C5] to-[#ff8fab] text-white hover:opacity-90 border-0">
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center px-4 py-2 bg-pink-100 rounded-full mb-6">
                        <BookOpen className="w-4 h-4 text-[#FFB7C5] mr-2" />
                        <span className="text-sm font-medium text-pink-700">Structured Learning Resources</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Empowering Research Through{' '}
                        <span className="bg-gradient-to-r from-[#FFB7C5] to-[#ff8fab] bg-clip-text text-transparent">
                            Structured Learning
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Our Research Training Hub offers downloadable modules designed to build essential skills in academic writing,
                        research methodology, and scientific publishing. Each module combines step-by-step guidance, practice
                        materials, and templates to help researchers and students gain confidence in executing high-quality projects.
                    </p>
                    <div className="mt-8 p-5 bg-pink-50 border border-pink-200 rounded-xl inline-block text-left max-w-lg">
                        <p className="font-semibold text-gray-900 mb-2">📥 How to Access</p>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Click <strong>Get Started</strong> next to any module below to connect with our team.
                            Materials are updated regularly to include new examples and tools used in current academic publishing.
                        </p>
                    </div>
                </div>

                {/* Benefits bar */}
                <div className="grid grid-cols-3 gap-6 mb-16">
                    {[
                        { icon: CheckCircle, text: 'Instant access upon request' },
                        { icon: CheckCircle, text: 'Updated each academic year' },
                        { icon: CheckCircle, text: 'Beginner to advanced levels' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center space-x-3 bg-white rounded-xl p-4 shadow-sm border border-pink-100">
                            <item.icon className="w-5 h-5 text-[#FFB7C5] flex-shrink-0" />
                            <span className="text-sm text-gray-700 font-medium">{item.text}</span>
                        </div>
                    ))}
                </div>

                {/* Modules */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Available Modules</h2>
                    <div className="space-y-5">
                        {modules.map((mod, index) => (
                            <Card key={mod.id} className="border border-pink-100 hover:border-[#FFB7C5] hover:shadow-lg transition-all duration-300 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex items-center p-6 gap-6">
                                        {/* Number */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFB7C5] to-[#ff8fab] flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                                            {index + 1}
                                        </div>
                                        {/* Icon */}
                                        <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <mod.icon className="w-5 h-5 text-[#FFB7C5]" />
                                        </div>
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {mod.title}
                                                {mod.subtitle && <span className="text-gray-500 font-normal text-base"> {mod.subtitle}</span>}
                                            </h3>
                                            <p className="text-gray-600 text-sm mt-1 leading-relaxed">{mod.description}</p>
                                            {/* CTA */}
                                            <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                                <Button
                                                    onClick={() => navigate('/contact')}
                                                    className="bg-gradient-to-r from-[#d63384] to-[#b5165a] text-white hover:opacity-90 border-0 flex items-center gap-2 px-6"
                                                >
                                                    <Search className="w-4 h-4" />
                                                    Get Started
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400 text-sm">© 2024 Cornerstone Research Service and Publications. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
