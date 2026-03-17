import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploadDemo } from '@/components/ui/demo';
import { AnimatedMenuLink } from '@/components/ui/menu-hover-effects';
import { EditorialBoardSection, PastIssuesSection, ManuscriptForm } from '../components/journal/JournalSections';
import { SampleArticleSection } from '../components/journal/SampleArticleSection';
import {
    FileText,
    Users,
    Award,
    Calendar,
    Globe,
    ArrowLeft,
    BookOpen,
    MapPin,
    Copy,
    IndianRupee,
    Database,
} from 'lucide-react';

const ArticlePage = () => (
    <div className="max-w-4xl mx-auto my-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Sample Article Title</h2>
        <div className="space-y-2 mb-8 text-gray-700">
            <p><span className="font-semibold text-gray-900">Author:</span> Example Author</p>
            <p><span className="font-semibold text-gray-900">Email:</span> example@mail.com</p>
            <p><span className="font-semibold text-gray-900">Date:</span> 2026</p>
            <p><span className="font-semibold text-gray-900">Address:</span> Chennai</p>
        </div>
        <Button className="mb-8 bg-[#d63384] hover:bg-pink-700 text-white border-none cursor-pointer px-5 py-3">Download PDF</Button>

        <h3 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">Abstract</h3>
        <div className="space-y-4 text-gray-700 mb-8">
            <p><span className="font-semibold text-gray-900">Background:</span> ...</p>
            <p><span className="font-semibold text-gray-900">Aim:</span> ...</p>
            <p><span className="font-semibold text-gray-900">Methods:</span> ...</p>
            <p><span className="font-semibold text-gray-900">Results:</span> ...</p>
            <p><span className="font-semibold text-gray-900">Conclusion:</span> ...</p>
        </div>

        <h3 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">References</h3>
        <p className="text-gray-700 mb-8">Reference content...</p>

        <h3 className="text-xl font-bold mb-2 text-gray-900">Tags</h3>
        <div className="flex gap-2">
            <span className="inline-block bg-pink-100 text-pink-800 text-sm px-3 py-1 rounded-full border border-pink-200">health</span>
            <span className="inline-block bg-pink-100 text-pink-800 text-sm px-3 py-1 rounded-full border border-pink-200">nursing</span>
        </div>
    </div>
);

const AddPublication = () => (
    <div className="max-w-4xl mx-auto my-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Add Publication</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input placeholder="Title" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#d63384] outline-none" />
            <input placeholder="Author" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#d63384] outline-none" />
            <input placeholder="Email" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#d63384] outline-none" />
            <input type="date" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#d63384] outline-none" />
            <input placeholder="Address" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#d63384] outline-none" />
            <input placeholder="Publication Scene" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#d63384] outline-none" />
        </div>

        <div className="mb-8 w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Upload PDF</h3>
            <ImageUploadDemo />
        </div>

        <h3 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">Abstract</h3>
        <div className="space-y-4 mb-8">
            <textarea placeholder="Background" className="w-full p-3 border border-gray-300 rounded h-24 focus:ring-2 focus:ring-[#d63384] outline-none"></textarea>
            <textarea placeholder="Aim" className="w-full p-3 border border-gray-300 rounded h-24 focus:ring-2 focus:ring-[#d63384] outline-none"></textarea>
            <textarea placeholder="Methods" className="w-full p-3 border border-gray-300 rounded h-24 focus:ring-2 focus:ring-[#d63384] outline-none"></textarea>
            <textarea placeholder="Results" className="w-full p-3 border border-gray-300 rounded h-24 focus:ring-2 focus:ring-[#d63384] outline-none"></textarea>
            <textarea placeholder="Conclusion" className="w-full p-3 border border-gray-300 rounded h-24 focus:ring-2 focus:ring-[#d63384] outline-none"></textarea>
        </div>

        <h3 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">Extra</h3>
        <div className="space-y-4 mb-8">
            <textarea placeholder="Site" className="w-full p-3 border border-gray-300 rounded h-24 focus:ring-2 focus:ring-[#d63384] outline-none"></textarea>
            <textarea placeholder="Electronic" className="w-full p-3 border border-gray-300 rounded h-24 focus:ring-2 focus:ring-[#d63384] outline-none"></textarea>
            <textarea placeholder="References" className="w-full p-3 border border-gray-300 rounded h-24 focus:ring-2 focus:ring-[#d63384] outline-none"></textarea>
        </div>

        <input placeholder="Tags" className="w-full p-3 border border-gray-300 rounded mb-8 focus:ring-2 focus:ring-[#d63384] outline-none" />

        <Button size="lg" className="w-full bg-[#d63384] hover:bg-pink-700 text-white border-none cursor-pointer px-5 py-3">Submit</Button>
    </div>
);

export default function Journal() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [view, setView] = useState<'home' | 'editorial' | 'issues' | 'article' | 'submit' | 'add' | 'authors' | 'charges' | 'copyright'>('home');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ── Download Paper Template as Word (.doc) ─────────────────────────
    const downloadPaperTemplate = () => {
        const html = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Paper Template – JCNAP</title>
<style>
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; margin: 2.5cm; line-height: 1.5; color: #000; }
  h1   { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 4pt; }
  h2   { font-size: 13pt; font-weight: bold; margin-top: 18pt; margin-bottom: 4pt; }
  h3   { font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; }
  p    { margin: 4pt 0; }
  .field { border-bottom: 1px solid #000; display: inline-block; min-width: 300px; } 
  .label { font-weight: bold; }
  .abstract-box { border: 1px solid #999; padding: 8pt 10pt; margin: 10pt 0; }
  .affil { font-size: 10pt; }
  .note  { font-size: 10pt; font-style: italic; }
</style>
</head>
<body>

<h1>Title of the Manuscript</h1>
<p style="text-align:center; font-size:11pt;">Author1, Author2, Author3</p>
<p class="affil" style="text-align:center;"><sup>1</sup>Authors' affiliation (Department, Institution, Place)</p>
<p class="affil" style="text-align:center;"><strong>Corresponding author</strong> – corresponding author name and email</p>

<hr style="margin: 16pt 0;" />

<div class="abstract-box">
<h2 style="margin-top:0;">Abstract</h2>
<p><strong>Background:</strong>&nbsp;</p>
<p><strong>Methods:</strong>&nbsp;</p>
<p><strong>Results:</strong>&nbsp;</p>
<p><strong>Conclusion:</strong>&nbsp;</p>
<p style="margin-top:10pt;"><strong>Keywords:</strong> keyword1, keyword2, keyword3, keyword4, keyword5</p>
</div>

<h2>1. INTRODUCTION</h2>
<p>&nbsp;</p>

<h2>2. NEED FOR THE STUDY</h2>
<p>&nbsp;</p>

<h2>3. AIM OF THE STUDY</h2>
<p>&nbsp;</p>

<h2>4. METHODOLOGY</h2>
<h3>Study Design and Setting</h3>
<p>&nbsp;</p>
<h3>Study Population and Eligibility Criteria</h3>
<p>&nbsp;</p>
<h3>Data Collection and Pre-test Assessment</h3>
<p>&nbsp;</p>
<h3>Sample Size and Sampling Method</h3>
<p>&nbsp;</p>
<h3>Ethical Considerations</h3>
<p>&nbsp;</p>

<h2>5. RESULTS</h2>
<h3>Side heading 1</h3>
<p>&nbsp;</p>
<p class="note">Fig. 1 XXXXXX</p>
<p class="note">Table 1. XXXXX</p>

<h3>Side heading 2</h3>
<p>&nbsp;</p>
<p class="note">Fig. 2 XXXX</p>
<p class="note">Table 2. XXXXX</p>

<h3>Side heading 3</h3>
<p>&nbsp;</p>

<h2>DISCUSSION</h2>
<p>&nbsp;</p>

<h2>CONCLUSION</h2>
<p>&nbsp;</p>

<hr style="margin: 16pt 0;" />

<p><strong>Funding:</strong> This research did not receive any funding from any government or private institutions.</p>
<p><strong>Data Availability:</strong> Data will be made available upon request made to the corresponding author.</p>
<p><strong>Patient Consent for Publication:</strong> Not applicable.</p>
<p><strong>Competing Interests:</strong> All authors confirm that they do not have any conflicts of interest to disclose.</p>

<h2>References</h2>
<p>1.</p>
<p>2.</p>
<p>3.</p>

</body></html>`;
        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'JCNAP_Paper_Template.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // ── Download Copyright Transfer Agreement as PDF ────────────────────
    // @ts-ignore
    const downloadCopyrightPDF = () => {
        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Transfer of Copyright Agreement</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 13.5pt;
    color: #000;
    padding: 3cm 3.5cm;
    line-height: 1.8;
  }
  h1 {
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 24pt;
  }
  p { margin-bottom: 16pt; text-align: justify; }
  .sig-section { margin-top: 40pt; }
  .sig-row {
    margin-bottom: 20pt;
  }
  @media print {
    body { padding: 2cm 2.5cm; }
    @page { size: A4; margin: 2cm; }
  }
</style>
</head>
<body>

<h1>Transfer of copyright agreement</h1>

<p>
  The article entitled ____________________________ is submitted for publication in the Journal of Clinical Nursing and Allied Health Practice (JCNAP). It has not been published before and is not under review in any other journal. It does not contain anything scandalous, obscene, defamatory, or against the law. I/We agree that any copies made will keep the original copyright notice. I/We confirm that I/We have written permission to use any text, tables, or figures taken from other copyrighted sources, and I/We will provide these permissions to JCNAP if asked.
</p>

<p>
  If the article is accepted, I/We, the author(s), agree to transfer and assign all copyright ownership, with all related rights, only to the Journal. After publication, the Journal will own the work, including: 1) copyright; 2) the right to give permission to republish the article in full or in part, with or without fee; 3) the right to make and distribute preprints or reprints and to translate the article into other languages for sale or free distribution; and 4) the right to republish the work in collections or in any other mechanical or electronic form.[1]
</p>

<p>
  The article will be published under the latest Creative Commons Attribution-NonCommercial-ShareAlike License, unless the Journal informs the author(s) otherwise in writing.[1]
</p>

<div class="sig-section">
  <div class="sig-row">Signature of author(s): ____________________________</div>
  <div class="sig-row">Name(s) and designation: __________________________</div>
  <div class="sig-row">Name of Institution/Organization: _________________</div>
</div>

<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) win.focus();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    };

    // ── Download Conflict of Interest as PDF ────────────────────
    // @ts-ignore
    const downloadConflictOfInterestPDF = () => {
        const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Certificate of Conflict of Interest</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 14pt;
    color: #000;
    padding: 3cm 3.5cm;
    line-height: 1.8;
  }
  h1 {
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 24pt;
    text-decoration: underline;
  }
  p { margin-bottom: 16pt; text-align: justify; }
  .sig-section { margin-top: 40pt; }
  .sig-row {
    margin-bottom: 15pt;
  }
  @media print {
    body { padding: 2cm 2.5cm; }
    @page { size: A4; margin: 2cm; }
  }
</style>
</head>
<body>

<h1>Certificate of Conflict of Interest</h1>

<p>
  The article entitled _________________________________________________________________<br/>
  ________________________________________________________ is herewith submitted for<br/>
  publication in _________________________________________________ (Name of Journal).<br/>
  It has not been published before, and it is not under consideration for publication in any other<br/>
  journal (s).
</p>

<p>
  I/We certify that I/We have obtained written permission for the use of text, tables, and/or
  illustrations from any copyrighted source(s), and I/We declare no conflict of interest.
</p>

<div class="sig-section">
  <div class="sig-row">Signature of author(s): _____________________________________________</div>
  <div class="sig-row">Name(s) and designation: ___________________________________________</div>
  <div class="sig-row">Name(s) of Institution/Organization: _________________________________</div>
</div>

<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) win.focus();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
            <style>{`
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-30px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmerBar {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
                .slide-in-left { animation: slideInLeft 0.5s ease-out both; }
                .fade-in-up    { animation: fadeInUp   0.6s ease-out both; }
                .stagger-1 { animation-delay: 0.05s; }
                .stagger-2 { animation-delay: 0.10s; }
                .stagger-3 { animation-delay: 0.15s; }
                .stagger-4 { animation-delay: 0.20s; }
                .stagger-5 { animation-delay: 0.25s; }
                .stagger-6 { animation-delay: 0.30s; }
                .stagger-7 { animation-delay: 0.35s; }
                .stagger-8 { animation-delay: 0.40s; }
                .hero-fade  { animation: fadeInUp 0.8s ease-out 0.1s both; }
                .section-fade { animation: fadeInUp 0.6s ease-out 0.2s both; }
                .sidebar-item:hover { transform: translateX(4px); }
                .sidebar-item { transition: transform 0.25s ease, box-shadow 0.25s ease; }
                .sidebar-item:hover { box-shadow: 4px 0 16px rgba(14,165,233,0.18); }
            `}</style>
            {/* Header */}
            <header className={`sticky top-0 z-50 border-b border-gray-200 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-0' : 'bg-white/80 backdrop-blur-md py-0'}`}>
                <div className="w-full px-4 sm:px-6">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <button onClick={() => navigate('/')} className="flex items-center gap-2">
                            <img
                                src="/journal-logo.jpeg"
                                alt="Journal of Clinical Nursing and Allied Health Practice"
                                className="h-12 w-auto object-contain flex-shrink-0 transition-transform duration-300 hover:scale-105"
                            />
                        </button>
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center gap-1 transition-all duration-200 hover:text-[#d63384]">
                                <ArrowLeft className="w-4 h-4" /> Home
                            </Button>
                            <Button onClick={() => setView('submit')} className="bg-[#d63384] hover:bg-[#b5165a] transition-all duration-200 hover:shadow-lg hover:shadow-[#d63384]/30">
                                Submit Manuscript
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sub Navigation — Matching User Image Styling */}
            <div className="bg-[#0b1120] py-4 flex justify-center items-center gap-6 relative z-40 border-b border-gray-800">
                <button
                    onClick={() => setView('home')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'home' ? 'bg-white text-black border border-white' : 'text-[#d63384] hover:text-white'}`}
                >
                    Home
                </button>
                <button
                    onClick={() => setView('editorial')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'editorial' ? 'bg-white text-black border border-white' : 'text-[#d63384] hover:text-white'}`}
                >
                    Editorial
                </button>
                <button
                    onClick={() => setView('issues')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'issues' ? 'bg-white text-black border border-white' : 'text-[#d63384] hover:text-white'}`}
                >
                    Past Issues
                </button>
                <button
                    onClick={() => setView('article')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'article' ? 'bg-white text-black border border-white' : 'text-[#d63384] hover:text-white'}`}
                >
                    Sample Article
                </button>
            </div>

            {/* Main Content — flush to left edge */}
            <main className="w-full px-0 py-0 flex flex-col lg:flex-row gap-0">
                {/* Left Sidebar — no gap from left edge */}
                <aside className="w-full lg:w-[290px] flex-shrink-0 border-r border-gray-200 bg-white shadow-md">
                    <div className="flex flex-col pt-4 pb-8 pr-0">
                        {[
                            { title: "SUBMIT ARTICLE", icon: MapPin, route: null, view: 'submit' },
                            { title: "AUTHOR'S GUIDELINES", icon: Users, route: null, view: 'authors' },
                            { title: "PAPER TEMPLATE", icon: FileText, route: null, view: null, action: 'download' },
                            { title: "COPYRIGHT FORM", icon: Copy, route: null, view: null, action: 'copyright-pdf' },
                            { title: "CERT. OF CONFLICT OF INTREST", icon: FileText, route: null, view: null, action: 'conflict-pdf' },
                            { title: "PROCESSING CHARGES", icon: IndianRupee, route: null, view: 'charges' },
                            { title: "INDEXING INFORMATION", icon: Database, route: '#', view: null },
                        ].map((item, index) => (
                            <AnimatedMenuLink
                                key={index}
                                onClick={() => {
                                    if (item.action === 'download') { downloadPaperTemplate(); return; }
                                    if (item.action === 'copyright-pdf') { downloadCopyrightPDF(); return; }
                                    if (item.action === 'conflict-pdf') { downloadConflictOfInterestPDF(); return; }
                                    if (item.view) setView(item.view as typeof view);
                                    else if (item.route && item.route !== '#') navigate(item.route);
                                }}
                                groupClassName={`w-full !m-0 sidebar-item slide-in-left stagger-${index + 1}`}
                                textClassName="flex items-center gap-4 w-full px-5 py-4 bg-[#f8fbf5] border-b border-[#b2cf97] text-gray-900 text-left"
                            >
                                <item.icon className="w-7 h-7 text-gray-600 transition-colors duration-300 group-hover:text-white flex-shrink-0 relative z-10" strokeWidth={1.5} />
                                <span className="text-[13px] leading-tight font-[600] uppercase tracking-wide relative z-10">{item.title}</span>
                            </AnimatedMenuLink>
                        ))}
                    </div>
                </aside>

                {/* Right Content */}
                <div className="flex-1 min-w-0 px-6 py-8 fade-in-up">
                    {view === 'editorial' && (
                        <div className="max-w-5xl mx-auto py-12">
                            <h2 className="text-4xl font-extrabold text-[#0b1120] mb-8 border-b-4 border-[#d63384] inline-block pb-2">Editorial Board</h2>
                            <EditorialBoardSection />
                        </div>
                    )}

                    {view === 'issues' && (
                        <div className="max-w-5xl mx-auto py-12">
                            <h2 className="text-4xl font-extrabold text-[#0b1120] mb-8 border-b-4 border-[#d63384] inline-block pb-2">Past Issues</h2>
                            <PastIssuesSection />
                        </div>
                    )}

                    {view === 'article' && (
                        <div className="max-w-4xl mx-auto py-12">
                            <h2 className="text-4xl font-extrabold text-[#0b1120] mb-8 border-b-4 border-pink-400 inline-block pb-2">Featured Sample Article</h2>
                            <SampleArticleSection />
                        </div>
                    )}

                    {view === 'home' && (
                        <>
                            {/* Hero Section */}
                            <div className="mb-16 relative overflow-hidden">
                                {/* Subtle animated background */}
                                <div className="absolute inset-0 -z-10">
                                    <div className="absolute top-0 left-0 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
                                </div>

                                {/* Logo + Title side-by-side */}
                                <div className="flex flex-col md:flex-row items-center gap-8 py-10">
                                    {/* Big logo on the LEFT */}
                                    <div
                                        className="flex-shrink-0 transition-all duration-700 ease-out"
                                        style={{ transform: scrolled ? 'scale(0.85) translateY(-8px)' : 'scale(1)', opacity: scrolled ? 0.9 : 1 }}
                                    >
                                        <img
                                            src="/journal-logo.jpeg"
                                            alt="Journal of Clinical Nursing and Allied Health Practice"
                                            className="w-56 h-56 md:w-72 md:h-72 object-contain drop-shadow-2xl"
                                        />
                                    </div>

                                    {/* Name + tagline on the RIGHT */}
                                    <div className="flex-1 text-left">
                                        <h1
                                            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 transition-all duration-500"
                                            style={{
                                                background: 'linear-gradient(135deg, #0c4a6e, #d63384, #9d174d)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                            }}
                                        >
                                            Journal of Clinical Nursing and Allied Health Practice
                                        </h1>
                                        <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-6">
                                            A peer-reviewed, open-access journal dedicated to advancing clinical nursing and allied health sciences
                                        </p>
                                        <div className="h-1 w-24 bg-gradient-to-r from-[#d63384] to-teal-400 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Article Instruction */}
                            <section className="mb-16">
                                <Card className="border-2 border-pink-200 bg-pink-50 shadow-sm">
                                    <CardHeader>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="p-3 bg-pink-500 rounded-lg shadow-lg">
                                                <MapPin className="w-8 h-8 text-white" />
                                            </div>
                                            <CardTitle className="text-3xl text-gray-900">Submit Article:</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-gray-800">
                                        <p className="leading-relaxed text-base">
                                            All manuscripts must be submitted on-line through the online submission portal <button onClick={() => setView('submit')} className="text-pink-600 underline font-semibold cursor-pointer">(Submit Here)</button>.
                                            If you experience any problems, please contact the editorial office by e-mail at <a href="mailto:cornerstoneresearch2022@gmail.com" className="text-pink-600 underline">cornerstoneresearch2022@gmail.com</a>.
                                        </p>
                                        <p className="leading-relaxed text-base text-red-600 font-medium">
                                            The submitted manuscripts that are not as per the “Instructions to Authors” would be returned to the authors for technical correction, before they undergo editorial/ peer-review.
                                        </p>
                                        <p className="leading-relaxed text-base font-semibold">
                                            NOTE:- Before submitting your manuscript, please read the Author's Guidelines <button onClick={() => navigate('#')} className="text-pink-600 underline">(Click to read &gt;&gt;&gt;)</button>.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                            <Button size="lg" onClick={() => setView('submit')} className="bg-[#d63384] hover:bg-[#b5165a] text-white">Submit Article Now</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>

                            {/* About the Journal */}
                            <section className="mb-16">
                                <Card className="border-2 border-[#d63384]/20 hover:border-[#d63384]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#d63384]/10 transform hover:-translate-y-1">
                                    <CardHeader>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="p-3 bg-gradient-to-br from-[#d63384] to-[#b5165a] rounded-lg shadow-lg">
                                                <BookOpen className="w-8 h-8 text-white" />
                                            </div>
                                            <CardTitle className="text-3xl bg-gradient-to-r from-gray-900 to-[#d63384] bg-clip-text text-transparent">About the Journal</CardTitle>
                                        </div>
                                        <CardDescription className="text-lg">
                                            Advancing healthcare through evidence-based research and practice
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-gray-700">
                                        <p className="leading-relaxed">
                                            The Journal of Clinical Nursing and Allied Health Practice (JCN-AHP) is a premier platform for disseminating
                                            high-quality research in clinical nursing, allied health sciences, and interdisciplinary healthcare. We are
                                            committed to publishing innovative studies that contribute to improving patient care, advancing clinical practice,
                                            and shaping healthcare policy.
                                        </p>
                                        <p className="leading-relaxed">
                                            Our journal welcomes original research articles, systematic reviews, case studies, and clinical practice guidelines
                                            from researchers, clinicians, and healthcare professionals worldwide.
                                        </p>
                                    </CardContent>
                                </Card>
                            </section>

                            {/* Scope and Topics */}
                            <section className="mb-16">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <Globe className="w-8 h-8 text-[#d63384]" />
                                            <CardTitle className="text-3xl">Scope and Topics</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Clinical Nursing</h3>
                                                <ul className="space-y-2 text-gray-700">
                                                    <li>• Evidence-based nursing practice</li>
                                                    <li>• Patient safety and quality improvement</li>
                                                    <li>• Nursing education and professional development</li>
                                                    <li>• Critical care and emergency nursing</li>
                                                    <li>• Community and public health nursing</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Allied Health Sciences</h3>
                                                <ul className="space-y-2 text-gray-700">
                                                    <li>• Physiotherapy and rehabilitation</li>
                                                    <li>• Medical laboratory sciences</li>
                                                    <li>• Radiography and medical imaging</li>
                                                    <li>• Occupational therapy</li>
                                                    <li>• Nutrition and dietetics</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>

                            {/* Types of Articles */}
                            <section className="mb-16">
                                <Card className="hover:shadow-xl transition-shadow duration-300">
                                    <CardHeader>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="p-3 bg-gradient-to-br from-[#d63384] to-[#b5165a] rounded-lg shadow-lg">
                                                <FileText className="w-8 h-8 text-white" />
                                            </div>
                                            <CardTitle className="text-3xl bg-gradient-to-r from-gray-900 to-[#d63384] bg-clip-text text-transparent">Types of Articles</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[
                                                {
                                                    title: 'Original Research',
                                                    description: 'Empirical studies with novel findings in clinical nursing and allied health',
                                                },
                                                {
                                                    title: 'Systematic Reviews',
                                                    description: 'Comprehensive reviews synthesizing evidence on specific topics',
                                                },
                                                {
                                                    title: 'Case Studies',
                                                    description: 'Detailed analysis of unique clinical cases or interventions',
                                                },
                                                {
                                                    title: 'Clinical Guidelines',
                                                    description: 'Evidence-based recommendations for clinical practice',
                                                },
                                                {
                                                    title: 'Short Communications',
                                                    description: 'Brief reports of preliminary findings or innovations',
                                                },
                                                {
                                                    title: 'Perspectives',
                                                    description: 'Expert opinions on current issues in healthcare',
                                                },
                                            ].map((type, index) => (
                                                <div key={index} className="p-6 bg-gradient-to-br from-pink-50 to-white rounded-xl border border-pink-100 hover:border-[#d63384] hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                                                    <h4 className="font-semibold text-gray-900 mb-2 text-lg">{type.title}</h4>
                                                    <p className="text-sm text-gray-600 leading-relaxed">{type.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>

                            {/* Call for Papers */}
                            <section className="mb-16">
                                <Card className="border-2 border-[#d63384] bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                    {/* Animated background gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#d63384]/5 via-purple-500/5 to-[#d63384]/5 animate-gradient-x"></div>

                                    <CardHeader className="relative">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-[#d63384] rounded-lg blur-md opacity-50 animate-pulse"></div>
                                                <div className="relative p-3 bg-gradient-to-br from-[#d63384] to-[#b5165a] rounded-lg shadow-lg">
                                                    <Award className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                            <CardTitle className="text-3xl bg-gradient-to-r from-[#d63384] to-[#7c3aed] bg-clip-text text-transparent font-bold">Call for Papers</CardTitle>
                                        </div>
                                        <CardDescription className="text-lg">
                                            We invite submissions for our upcoming issues
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6 relative">
                                        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Publish with Us?</h3>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-pink-50 transition-colors duration-200">
                                                    <div className="w-2 h-2 bg-[#d63384] rounded-full mt-2 animate-pulse"></div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Open Access</p>
                                                        <p className="text-sm text-gray-600">Free access to all published articles</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-pink-50 transition-colors duration-200">
                                                    <div className="w-2 h-2 bg-[#d63384] rounded-full mt-2 animate-pulse animation-delay-200"></div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Rigorous Peer Review</p>
                                                        <p className="text-sm text-gray-600">Double-blind review process</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-pink-50 transition-colors duration-200">
                                                    <div className="w-2 h-2 bg-[#d63384] rounded-full mt-2 animate-pulse animation-delay-400"></div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Fast Publication</p>
                                                        <p className="text-sm text-gray-600">Average 8-12 weeks to publication</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-pink-50 transition-colors duration-200">
                                                    <div className="w-2 h-2 bg-[#d63384] rounded-full mt-2 animate-pulse animation-delay-600"></div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Global Reach</p>
                                                        <p className="text-sm text-gray-600">International editorial board</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <Button
                                                onClick={() => setView('submit')}
                                                size="lg"
                                                className="bg-gradient-to-r from-[#d63384] to-[#b5165a] hover:from-[#b5165a] hover:to-[#d63384] text-lg px-8 py-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                            >
                                                Submit Your Manuscript
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>


                            {/* Publication Details */}
                            <section className="mb-16">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <Calendar className="w-8 h-8 text-[#d63384]" />
                                            <CardTitle className="text-3xl">Publication Details</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Journal Information</h4>
                                                <dl className="space-y-2 text-gray-700">
                                                    <div className="flex justify-between">
                                                        <dt className="font-medium">ISSN:</dt>
                                                        <dd>2XXX-XXXX (Online)</dd>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <dt className="font-medium">Frequency:</dt>
                                                        <dd>Quarterly</dd>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <dt className="font-medium">Language:</dt>
                                                        <dd>English</dd>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <dt className="font-medium">Publisher:</dt>
                                                        <dd>Cornerstone Publications</dd>
                                                    </div>
                                                </dl>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Article Processing</h4>
                                                <dl className="space-y-2 text-gray-700">
                                                    <div className="flex justify-between">
                                                        <dt className="font-medium">Submission Fee:</dt>
                                                        <dd>Free</dd>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <dt className="font-medium">Review Time:</dt>
                                                        <dd>4-6 weeks</dd>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <dt className="font-medium">Publication Fee:</dt>
                                                        <dd>Contact for details</dd>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <dt className="font-medium">Copyright:</dt>
                                                        <dd>Authors retain rights</dd>
                                                    </div>
                                                </dl>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>

                            {/* Editorial Board */}
                            <section className="mb-16">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <Users className="w-8 h-8 text-[#d63384]" />
                                            <CardTitle className="text-3xl">Editorial Board</CardTitle>
                                        </div>
                                        <CardDescription className="text-lg">
                                            Led by distinguished experts in nursing and allied health sciences
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700">
                                            Our editorial board comprises internationally recognized scholars, clinicians, and researchers
                                            committed to maintaining the highest standards of scientific integrity and academic excellence.
                                        </p>
                                    </CardContent>
                                </Card>
                            </section>

                            {/* Indexing Section */}
                            <section className="mb-16 section-fade">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center space-x-3 mb-2">
                                            <Database className="w-8 h-8 text-[#d63384]" />
                                            <CardTitle className="text-3xl">Indexing</CardTitle>
                                        </div>
                                        <CardDescription className="text-lg">
                                            Currently indexed in the following prominent databases
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {[
                                                {
                                                    name: 'Google Scholar',
                                                    bg: 'bg-white',
                                                    logo: 'G',
                                                    logoBg: '#4285f4'
                                                },
                                                {
                                                    name: 'Crossref',
                                                    bg: 'bg-white',
                                                    logo: 'C',
                                                    logoBg: '#e11d48'
                                                },
                                            ].map((db, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex items-center gap-4 px-6 py-5 border-b border-r border-gray-200 last:border-b-0 hover:bg-pink-50 transition-colors duration-200 cursor-default ${db.bg}`}
                                                >
                                                    {db.logo ? (
                                                        <div
                                                            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0"
                                                            style={{ background: db.logoBg }}
                                                        >
                                                            {db.logo}
                                                        </div>
                                                    ) : (
                                                        <div className="w-11 h-11 rounded-full border-2 border-gray-200 flex items-center justify-center flex-shrink-0 bg-gray-50">
                                                            <Database className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <span className="text-[15px] font-bold text-gray-800 uppercase tracking-wide">
                                                        {db.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>
                        </>
                    )}

                    {view === 'editorial' && (
                        <div className="max-w-4xl mx-auto my-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
                            <h2 className="text-3xl font-bold mb-6 text-gray-900">Editorial</h2>
                            <p className="text-gray-700">Content for editorial section goes here...</p>
                        </div>
                    )}

                    {view === 'issues' && (
                        <div className="max-w-4xl mx-auto my-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
                            <h2 className="text-3xl font-bold mb-6 text-gray-900">Past Issues</h2>
                            <p className="text-gray-700">List of past issues will be displayed here...</p>
                        </div>
                    )}

                    {view === 'article' && <ArticlePage />}
                    {view === 'submit' && <ManuscriptForm />}
                    {view === 'add' && <AddPublication />}

                    {view === 'authors' && (
                        <div className="max-w-4xl mx-auto">
                            {/* Header */}
                            <div className="mb-8 p-6 bg-pink-50 border-2 border-pink-300 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-3 bg-pink-400 rounded-lg shadow">
                                        <Users className="w-7 h-7 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-pink-900">For Authors</h2>
                                </div>
                                <p className="text-pink-700 text-sm">Author guidelines, peer review process, and responsibilities for submission.</p>
                            </div>

                            {/* Before You Start */}
                            <section className="mb-6 p-6 bg-pink-50 border border-pink-200 rounded-xl">
                                <h3 className="text-xl font-bold text-pink-900 mb-3 pb-2 border-b border-pink-200">Before You Start</h3>
                                <p className="text-gray-700 leading-relaxed mb-2">Before submitting your manuscript, please verify that the format meets the requirements of your target journal.</p>
                                <p className="text-gray-700 leading-relaxed">When the format requirements of the target journal have been met, then check the manuscript according to the checklist. When you are ready to submit, please send your papers.</p>
                            </section>

                            {/* Peer Review Process */}
                            <section className="mb-6 p-6 bg-pink-50 border border-pink-200 rounded-xl">
                                <h3 className="text-xl font-bold text-pink-900 mb-3 pb-2 border-b border-pink-200">Peer Review Process</h3>
                                <div className="space-y-3 text-gray-700 leading-relaxed">
                                    <p>When the editorial office receives a new submission, the manuscript is given an identification number. The editorial staff then performs an initial assessment of the manuscript to determine its topical relevance, adherence to the formatting guidelines, and absence of plagiarism in both textual and scientific content.</p>
                                    <p>If the manuscript passes this initial assessment, it is forwarded to an Associate Editor with appropriate expertise in the subject area or study design. The Associate Editor is responsible for identifying at least 2 external peer reviewers with expertise in the topic or specialty of the paper. The peer review process may require 2 to 4 weeks before the decision is reached. The authors then revise the paper, as needed, based on the reviewers' comments and suggestions.</p>
                                    <p>After the authors submit their revision, the manuscript undergoes another peer-review, or it will be sent to the Editor-in-Chief for a final decision, if appropriate. If the paper is accepted, the preparation stage for publication then begins.</p>
                                </div>
                            </section>

                            {/* After Acceptance */}
                            <section className="mb-6 p-6 bg-pink-50 border border-pink-200 rounded-xl">
                                <h3 className="text-xl font-bold text-pink-900 mb-3 pb-2 border-b border-pink-200">After Acceptance</h3>
                                <p className="text-gray-700 leading-relaxed">When a manuscript is accepted, the author must sign a license to publish that will allow the journal to publish the article. The article is then sent for copyediting, after which the author is asked to confirm the copyedited paper. The confirmed paper is entered online for publishing in advance, and at the same time, the paper is typeset. The author is asked to confirm the typeset PDF to ensure that there are no errors. The final PDF is then entered online.</p>
                            </section>

                            {/* English Language Editing */}
                            <section className="mb-6 p-6 bg-pink-50 border border-pink-200 rounded-xl">
                                <h3 className="text-xl font-bold text-pink-900 mb-3 pb-2 border-b border-pink-200">English Language Editing</h3>
                                <ul className="space-y-2 mb-4 text-gray-700">
                                    <li className="flex items-start gap-2"><span className="text-pink-500 font-bold mt-1">·</span><span>Editors with research expertise in your subject area</span></li>
                                    <li className="flex items-start gap-2"><span className="text-pink-500 font-bold mt-1">·</span><span>Standard service and additionally corrects logic and structure gaps</span></li>
                                    <li className="flex items-start gap-2"><span className="text-pink-500 font-bold mt-1">·</span><span>Free re-editing or a money-back guarantee if rejected for language-quality</span></li>
                                </ul>
                                <p className="text-gray-700">For this service, please send emails to: <a href="mailto:cornerstoneresearch2022@gmail.com" className="text-pink-600 underline font-semibold">cornerstoneresearch2022@gmail.com</a></p>
                            </section>

                            {/* After Publication */}
                            <section className="mb-6 p-6 bg-pink-50 border border-pink-200 rounded-xl">
                                <h3 className="text-xl font-bold text-pink-900 mb-3 pb-2 border-b border-pink-200">After Publication</h3>
                                <p className="text-gray-700 leading-relaxed">The articles will be published in PDF and HTML format. The PDF that is available online is exactly the same as the printed hardcopy. All accepted papers will be published online and in printed forms. All the accepted papers of the journals will be processed for indexing into different citation databases that track citation frequency/data for each paper.</p>
                            </section>

                            {/* Author Responsibilities */}
                            <section className="mb-6 p-6 bg-pink-50 border border-pink-200 rounded-xl">
                                <h3 className="text-xl font-bold text-pink-900 mb-4 pb-2 border-b border-pink-200">Author Responsibilities</h3>
                                <div className="space-y-5">
                                    {[
                                        {
                                            title: 'Reporting Standards',
                                            body: 'Authors reporting results of original research should present an accurate account of the work performed as well as an objective discussion of its significance. Underlying data should be represented accurately in the manuscript. A paper should contain sufficient detail and references to permit others to replicate the work. Fraudulent or knowingly inaccurate statements constitute unethical behavior and are unacceptable.'
                                        },
                                        {
                                            title: 'Originality and Plagiarism',
                                            body: 'The authors should ensure that they have written entirely original works, and if the authors have used the work and/or words of others that this has been appropriately cited or quoted. Plagiarism constitutes unethical scientific behavior and is never acceptable. Proper acknowledgement of the work of others used in a research project must always be given. Further, it is the obligation of each author to provide prompt retractions or corrections of errors in published works.'
                                        },
                                        {
                                            title: 'Multiple, Redundant, or Concurrent Publication',
                                            body: 'An author should not in general publish manuscripts describing essentially the same research in more than one journal or primary publication. Parallel submission of the same manuscript to more than one journal constitutes unethical publishing behavior and is unacceptable.'
                                        },
                                        {
                                            title: 'Acknowledgement of Sources',
                                            body: 'Proper acknowledgment of the work of others must always be given. Authors should also cite publications that have been influential in determining the nature of the reported work.'
                                        },
                                        {
                                            title: 'Publication and Authorship Practices',
                                            body: 'Authorship should be limited to those who have made a significant contribution to the conception, design, execution, or interpretation of the reported study. All those who have made significant contributions should be listed as coauthors. The corresponding author should ensure that all appropriate coauthors are included in the author list, and that all co-authors have seen and approved the final version of the paper. All co-authors must be clearly indicated at the time of manuscript submission. Requests to add co-authors after a manuscript has been accepted will require approval of the editor.'
                                        },
                                        {
                                            title: 'Hazards and Human or Animal Subjects',
                                            body: 'If the work involves chemicals, procedures, or equipment that has any unusual hazards inherent in their use, the author(s) must clearly identify these in the manuscript. Additionally, manuscripts should adhere to the principles of the World Medical Association (WMA) Declaration of Helsinki regarding research study involving human or animal subjects.'
                                        },
                                        {
                                            title: 'Disclosure and Conflicts of Interest',
                                            body: 'All authors should disclose in their manuscript any financial or other substantive conflict of interest that might be construed to influence the results or their interpretation in the manuscript. All sources of financial support for the project should be disclosed. It should be recognized that honest error is an integral part of the scientific enterprise. It is not unethical to be wrong, provided that errors are promptly acknowledged and corrected when they are detected.'
                                        },
                                        {
                                            title: 'Fundamental Errors in Published Works',
                                            body: "When an author discovers a significant error or inaccuracy in his/her own published work, it is the author's obligation to promptly notify the journal's editor or publisher and cooperate with them to either retract the paper or to publish an appropriate correction statement or erratum."
                                        },
                                    ].map((item, i) => (
                                        <div key={i} className="border-l-4 border-pink-400 pl-4">
                                            <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                                            <p className="text-gray-700 text-sm leading-relaxed">{item.body}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Back button */}
                            <div className="mt-6 mb-10">
                                <Button variant="outline" onClick={() => setView('home')} className="flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back to Journal Home
                                </Button>
                            </div>
                        </div>
                    )}

                    {view === 'charges' && (
                        <div className="max-w-2xl mx-auto">
                            {/* Header */}
                            <div className="mb-8 p-6 bg-pink-50 border-2 border-pink-300 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-3 bg-pink-400 rounded-lg shadow">
                                        <IndianRupee className="w-7 h-7 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-pink-900">Processing Charges</h2>
                                </div>
                                <p className="text-pink-700 text-sm">Article Processing Charges (APC) for publication in this journal.</p>
                            </div>

                            {/* Fee Card */}
                            <section className="mb-6 bg-white border border-pink-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-pink-400 px-6 py-3">
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">Fee Schedule</h3>
                                </div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-pink-50 border-b border-pink-100">
                                            <th className="text-left px-6 py-3 font-semibold text-gray-700">Article Type</th>
                                            <th className="text-left px-6 py-3 font-semibold text-gray-700">Processing Fee</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-100 hover:bg-pink-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-800 font-medium">All Article Types</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 text-lg font-bold text-pink-700">
                                                    <IndianRupee className="w-4 h-4" />1,200 per article
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </section>

                            {/* Notes */}
                            <section className="mb-6 p-5 bg-pink-50 border border-pink-200 rounded-xl">
                                <h4 className="font-semibold text-pink-900 mb-3">Notes</h4>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    {[
                                        'The Article Processing Charge (APC) covers peer review, copyediting, typesetting, and online hosting.',
                                        'Payment is required only after acceptance of the manuscript.',
                                        'Submission is free — charges apply only upon acceptance.',
                                        'For fee waivers or discounts, contact the editorial office.',
                                    ].map((note, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-pink-500 font-bold mt-0.5">·</span>
                                            <span>{note}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* Contact */}
                            <section className="mb-6 p-5 bg-pink-50 border border-pink-200 rounded-xl">
                                <p className="text-sm text-gray-700">
                                    For payment assistance or queries, email:{' '}
                                    <a href="mailto:cornerstoneresearch2022@gmail.com" className="text-pink-600 underline font-semibold">
                                        cornerstoneresearch2022@gmail.com
                                    </a>
                                </p>
                            </section>

                            {/* Back Button */}
                            <div className="mt-4 mb-10">
                                <Button variant="outline" onClick={() => setView('home')} className="flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back to Journal Home
                                </Button>
                            </div>
                        </div>
                    )}

                    {view === 'copyright' && (
                        <div className="max-w-3xl mx-auto">
                            {/* Header */}
                            <div className="mb-8 p-6 bg-pink-50 border-2 border-pink-300 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-3 bg-pink-500 rounded-lg shadow">
                                        <Copy className="w-7 h-7 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-pink-900">Transfer of Copyright Agreement</h2>
                                </div>
                                <p className="text-pink-700 text-sm">Please read this agreement carefully before submitting your manuscript.</p>
                            </div>

                            {/* Agreement Document */}
                            <section className="mb-6 bg-white border border-pink-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-pink-500 px-6 py-3 text-center">
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                                        Journal of Clinical Nursing and Allied Health Practice (JCNAP)
                                    </h3>
                                </div>

                                <div className="p-8 space-y-6 text-gray-700 leading-relaxed text-[15px]">
                                    {/* Article line */}
                                    <p>
                                        The article entitled{' '}
                                        <span className="inline-block border-b-2 border-gray-400 min-w-[260px] text-gray-400 italic">
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        </span>{' '}
                                        is submitted for publication in the <strong>Journal of Clinical Nursing and Allied Health Practice (JCNAP)</strong>.
                                    </p>

                                    {/* Para 1 */}
                                    <p>
                                        It has not been published before and is not under review in any other journal. It does not contain anything scandalous, obscene, defamatory, or against the law. I/We agree that any copies made will keep the original copyright notice. I/We confirm that I/We have written permission to use any text, tables, or figures taken from other copyrighted sources, and I/We will provide these permissions to JCNAP if asked.
                                    </p>

                                    {/* Para 2 */}
                                    <p>
                                        If the article is accepted, I/We, the author(s), agree to transfer and assign all copyright ownership, with all related rights, only to the Journal. After publication, the Journal will own the work, including:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-2 pl-4 text-gray-700">
                                        <li>copyright;</li>
                                        <li>the right to give permission to republish the article in full or in part, with or without fee;</li>
                                        <li>the right to make and distribute preprints or reprints and to translate the article into other languages for sale or free distribution; and</li>
                                        <li>the right to republish the work in collections or in any other mechanical or electronic form.</li>
                                    </ol>

                                    {/* Para 3 — CC License */}
                                    <p className="p-4 bg-pink-50 border border-pink-200 rounded-lg text-sm">
                                        The article will be published under the latest <strong>Creative Commons Attribution-NonCommercial-ShareAlike License</strong>, unless the Journal informs the author(s) otherwise in writing.
                                    </p>

                                    {/* Divider */}
                                    <hr className="border-gray-200 my-6" />

                                    {/* Signature Fields */}
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600 mb-1">Signature of author(s):</p>
                                            <div className="border-b-2 border-gray-400 w-full h-8" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600 mb-1">Name(s) and designation:</p>
                                            <div className="border-b-2 border-gray-400 w-full h-8" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-600 mb-1">Name of Institution / Organization:</p>
                                            <div className="border-b-2 border-gray-400 w-full h-8" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Print note */}
                            <p className="text-xs text-gray-500 text-center mb-4">
                                💡 To submit this form: print, sign, scan, and email to{' '}
                                <a href="mailto:cornerstoneresearch2022@gmail.com" className="text-pink-600 underline">cornerstoneresearch2022@gmail.com</a>
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3 mb-10">
                                <Button variant="outline" onClick={() => setView('home')} className="flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back to Journal Home
                                </Button>
                                <Button onClick={() => window.print()} className="bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-2">
                                    🖨️ Print Form
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Floating Add Button */}
                    <button
                        onClick={() => setView('add')}
                        className="fixed bottom-6 right-6 w-[60px] h-[60px] rounded-full bg-[#00bfff] text-white text-3xl shadow-xl flex items-center justify-center hover:bg-[#0099cc] transition-colors z-50 border-none cursor-pointer"
                    >
                        +
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="text-gray-400">
                            © 2024 Journal of Clinical Nursing and Allied Health Practice. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
