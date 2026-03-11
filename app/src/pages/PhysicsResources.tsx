import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen, FileText, CheckCircle } from 'lucide-react';
import { AnimatedMenuLink } from '@/components/ui/menu-hover-effects';

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
    },
];

export default function PhysicsResources() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
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
                            <span className="text-lg font-bold text-gray-900 hidden md:block">Physics Class Resources</span>
                            <Button onClick={() => navigate('/contact')} className="bg-gradient-to-r from-[#d63384] to-[#b5165a] text-white hover:opacity-90 border-0">
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
                        <BookOpen className="w-4 h-4 text-[#d63384] mr-2" />
                        <span className="text-sm font-medium text-pink-700">Class Notes – Apollo MLT &amp; CCT</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Physics Notes for{' '}
                        <span className="bg-gradient-to-r from-[#d63384] to-[#b5165a] bg-clip-text text-transparent">
                            Medical Lab and Clinical Courses
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Welcome to the Physics Class Resources section for students of the Medical Laboratory Technology and
                        Critical Care Technology courses. Contact us for access to concise, syllabus-aligned notes prepared to help you review
                        important concepts quickly before exams and practical sessions.
                    </p>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
                    {[
                        { icon: CheckCircle, text: 'Syllabus-aligned, exam-focused content' },
                        { icon: CheckCircle, text: 'Includes key definitions & short-answer questions' },
                        { icon: CheckCircle, text: 'Updated each semester with latest syllabus' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center space-x-3 bg-white rounded-xl p-4 shadow-sm border border-pink-100">
                            <item.icon className="w-5 h-5 text-[#d63384] flex-shrink-0" />
                            <span className="text-sm text-gray-700 font-medium">{item.text}</span>
                        </div>
                    ))}
                </div>

                {/* Resources */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Available Downloads</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {resources.map((res) => (
                            <Card key={res.id} className="border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                {/* Top gradient bar */}
                                <div className={`h-2 bg-gradient-to-r ${res.color}`} />
                                <CardContent className="p-8">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-14 h-14 ${res.light} rounded-2xl flex items-center justify-center`}>
                                            <res.icon className={`w-7 h-7 ${res.textColor}`} />
                                        </div>
                                        <span className={`px-3 py-1 ${res.light} ${res.textColor} text-sm font-bold rounded-full`}>
                                            {res.badge}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{res.title}</h3>
                                    <p className="text-sm text-gray-500 font-medium mb-4">{res.subtitle}</p>
                                    <p className="text-gray-600 leading-relaxed mb-6">{res.description}</p>

                                    <ul className="space-y-2 mb-8">
                                        {['Key definitions', 'Short-answer questions', 'Formula summaries', 'Exam-ready format'].map((pt) => (
                                            <li key={pt} className="flex items-center text-sm text-gray-600">
                                                <CheckCircle className={`w-4 h-4 ${res.textColor} mr-2 flex-shrink-0`} />
                                                {pt}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex flex-col items-end gap-3 border-t border-gray-100 pt-6">
                                        <Button
                                            onClick={() => navigate('/contact')}
                                            className={`bg-gradient-to-r ${res.color} text-white hover:opacity-90 border-0 flex items-center gap-2 px-6`}
                                        >
                                            <Search className="w-4 h-4" />
                                            Get Started
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="bg-gray-900 text-white py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-gray-400 text-sm">© 2024 Cornerstone Research Service and Publications. All rights reserved.</p>
            </div>
        </footer>
        </div >
    );
}
