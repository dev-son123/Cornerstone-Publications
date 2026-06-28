import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTrigger } from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Languages,
  SpellCheck,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  LineChart,
  ChevronDown,
  Send,
  Clock,
  BadgeCheck,
} from 'lucide-react';
import { AdvancedNav } from '@/components/ui/advanced-nav';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '@/components/Footer';

interface Service {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string[];
  // Extra detail shown in the modal
  detail: {
    what: string;
    process: string[];
    outcomes: string[];
    turnaround: string;
    price: string;
  };
}

import React from 'react';

const services: Service[] = [
  {
    id: 'manuscript',
    icon: FileText,
    title: 'Manuscript Preparation',
    description: 'End-to-end preparation of academic manuscripts for journal or conference submission. Includes formatting per journal guidelines (APA, MLA, IEEE, Chicago).',
    benefits: ['Reduces rejection risk', 'Saves researcher time', 'Improves acceptance probability'],
    detail: {
      what: 'We prepare your raw research content into a submission-ready manuscript, formatted to your target journal\'s exact author guidelines — whether APA, MLA, IEEE, Vancouver, or Chicago style.',
      process: [
        'Initial consultation and journal selection guidance',
        'Structural review (Abstract → Introduction → Methods → Results → Discussion)',
        'Title, keyword, and author affiliation formatting',
        'Reference list formatting and in-text citation verification',
        'Final compliance check against journal\'s author instructions',
      ],
      outcomes: ['Journal-ready manuscript', 'Reduced desk-rejection risk', 'Faster review process'],
      turnaround: '3–5 business days',
      price: 'Starting ₹1,500',
    },
  },
  {
    id: 'language',
    icon: Languages,
    title: 'Language Editing',
    description: 'Professional editing focused on clarity, coherence, vocabulary enhancement, academic tone, and readability improvement.',
    benefits: ['Enhances credibility', 'Improves peer-review readability', 'Polished academic tone'],
    detail: {
      what: 'Our expert editors refine your manuscript\'s language to meet the standards of top international journals. We improve tone, clarity, sentence flow, and vocabulary — without changing your scientific content.',
      process: [
        'Line-by-line editing for grammar and syntax',
        'Academic tone and vocabulary upgrade',
        'Paragraph-level coherence and flow improvement',
        'Passive/active voice balancing for scientific writing',
        'Tracked changes delivered for your review',
      ],
      outcomes: ['Publication-grade English', 'Reviewer-friendly tone', 'Credibility boost'],
      turnaround: '2–4 business days',
      price: 'Starting ₹1,200',
    },
  },
  {
    id: 'literature',
    icon: BookOpen,
    title: 'Thesis Literature Review',
    description: 'Assistance in organizing and refining thesis literature reviews including gap analysis and logical structuring.',
    benefits: ['Strengthens argumentation', 'Improves coherence', 'Better citation alignment'],
    detail: {
      what: 'We help you structure a compelling, logically-sound literature review that clearly identifies the research gap your thesis addresses. Suitable for PhD, PG dissertations, and seminar papers.',
      process: [
        'Source audit — evaluate relevance of your references',
        'Theme identification and grouping',
        'Gap analysis and research niche framing',
        'Synthesis writing with proper citation integration',
        'Transition improvement between themes',
      ],
      outcomes: ['Clear research gap statement', 'Well-cited argument chain', 'Examiner-ready chapter'],
      turnaround: '4–7 business days',
      price: 'Starting ₹2,000',
    },
  },
  {
    id: 'plagiarism',
    icon: ShieldCheck,
    title: 'Plagiarism Detection',
    description: 'Integrated plagiarism checking with similarity index reports and source breakdown.',
    benefits: ['Ensures academic integrity', 'Originality compliance', 'Detailed reports'],
    detail: {
      what: 'We run your manuscript through industry-leading plagiarism detection software and provide a detailed similarity report with source-by-source breakdown. We also offer paraphrasing assistance to reduce similarity.',
      process: [
        'Full-document plagiarism scan',
        'Similarity index report with highlighted matches',
        'Source breakdown (journal, web, book)',
        'Optional: paraphrasing to reduce similarity below journal threshold',
        'Certificate of originality available',
      ],
      outcomes: ['Similarity below 10% (most journals)', 'Academic integrity compliance', 'Institutional submission ready'],
      turnaround: '1–2 business days',
      price: 'Starting ₹500',
    },
  },
  {
    id: 'proofreading',
    icon: SpellCheck,
    title: 'Grammar & Proofreading',
    description: 'Detailed grammar, spelling, punctuation, syntax, tense consistency, and style correction.',
    benefits: ['Ensures polished manuscript', 'Professional final output', 'Error-free submission'],
    detail: {
      what: 'A final-pass proofreading service that catches every grammar, spelling, punctuation, and tense error before submission. Perfect as a last step before submitting to a journal or supervisor.',
      process: [
        'Spelling and typographical error correction',
        'Grammar and sentence structure correction',
        'Punctuation standardisation',
        'Tense consistency check (past tense for methods/results)',
        'Numbering and list formatting cleanup',
      ],
      outcomes: ['Zero grammar errors', 'Professional first impression', 'Submission confidence'],
      turnaround: '1–3 business days',
      price: 'Starting ₹800',
    },
  },
  {
    id: 'graphs',
    icon: LineChart,
    title: 'Graph Plotting & Data Visualisation',
    description: 'Professional plotting of research graphs, charts, and figures using tools like Origin Pro, MS Excel, Python, and R — publication-ready and journal-compliant.',
    benefits: ['High-resolution, publication-ready figures', 'Supports all major chart types', 'Consistent style across all figures'],
    detail: {
      what: 'We transform your raw data into publication-quality figures using industry-standard tools like Origin Pro, MS Excel, Python (Matplotlib, Seaborn), or R. All figures are delivered at 300+ DPI in TIFF/EPS/PNG formats as required by your journal.',
      process: [
        'Data review and chart type selection',
        'Plot generation in Origin Pro, Excel, Python, or R',
        'Journal-specific formatting (axis labels, font size, line weight)',
        'Color palette selection (accessible + print-friendly)',
        'Export in required formats (TIFF, EPS, SVG, PNG)',
      ],
      outcomes: ['300+ DPI publication-ready figures', 'Consistent visual style', 'Journal format compliant'],
      turnaround: '2–4 business days',
      price: 'Starting ₹700 per figure',
    },
  },
];

const stats = [
  { value: '500+', label: 'Manuscripts Edited', num: 500 },
  { value: '4.9/5', label: 'Client Satisfaction', num: 4.9 },
  { value: '48h', label: 'Avg. Turnaround', num: 48 },
  { value: '15+', label: 'Journals Supported', num: 15 },
];


// ── FAQ data ────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'How long does the editing process take?',
    a: 'Most services are delivered within 24–72 hours. Complex manuscripts (50,000+ words) may take up to 5 business days. We always confirm the exact timeline before starting.',
  },
  {
    q: 'Do you handle all types of journals?',
    a: 'Yes. We support all major international journals and style guides — APA, MLA, IEEE, Vancouver, Harvard, Chicago, and more. Just provide the journal\'s author guidelines and we\'ll format accordingly.',
  },
  {
    q: 'Is my manuscript and data kept confidential?',
    a: 'Absolutely. We sign a non-disclosure commitment for every project. Your work is never shared with third parties, and all files are deleted from our systems after delivery.',
  },
  {
    q: 'What file formats do you accept?',
    a: 'We accept MS Word (.doc/.docx), PDF, LaTeX, and Google Docs. We deliver in your preferred format with tracked changes so you can review every edit.',
  },
  {
    q: 'Can I request revisions after delivery?',
    a: 'Yes. All packages include at least one free revision round. Simply send us your feedback within 7 days of delivery and we\'ll address all your comments.',
  },
  {
    q: 'How do I make payment?',
    a: 'We accept all major UPI apps (GPay, PhonePe, Paytm, BHIM, Paytm), NEFT/IMPS, and bank transfers. Payment is made after you approve the service scope — no upfront surprises.',
  },
];

// ── Blog tips data ──────────────────────────────────────────────────────────
const tips = [
  {
    category: 'Writing Tips',
    title: '5 Common Mistakes That Get Manuscripts Rejected',
    desc: 'Avoid the formatting, language, and structural errors that editors spot immediately.',
    time: '4 min read',
    color: 'from-pink-500 to-rose-600',
  },
  {
    category: 'Publication Guide',
    title: 'How to Choose the Right Journal for Your Research',
    desc: 'A step-by-step guide to matching your study\'s scope, audience, and impact factor requirements.',
    time: '6 min read',
    color: 'from-violet-500 to-purple-600',
  },
  {
    category: 'PhD Journey',
    title: 'Structuring Your Literature Review: A Thesis-Ready Framework',
    desc: 'The exact template we use to help PhD scholars build a comprehensive, gap-analysis-driven literature review.',
    time: '8 min read',
    color: 'from-teal-500 to-cyan-600',
  },
];

// ── Service Detail Modal ─────────────────────────────────────────────────────
function ServiceModal({ service, onClose }: { service: Service; onClose: () => void }) {
  const navigate = useNavigate();
  // Close on backdrop click or Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const Icon = service.icon;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.88, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Gradient header */}
          <div className="rounded-t-3xl p-8 pb-6" style={{ background: 'linear-gradient(135deg,#fce7f3 0%,#fff5f9 100%)' }}>
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm border border-pink-100 transition-all hover:scale-110 active:scale-95"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="#d63384" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md" style={{ background: '#d63384' }}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{service.title}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-pink-100 text-[#d63384]">{service.detail.turnaround}</span>
                  <span className="text-xs font-bold text-gray-700">{service.detail.price}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{service.detail.what}</p>
          </div>

          {/* Body */}
          <div className="p-8 pt-6 space-y-6">
            {/* Process */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Our Process</h3>
              <ol className="space-y-2">
                {service.detail.process.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#d63384,#b5165a)' }}>{i + 1}</span>
                    <span className="text-sm text-gray-600 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Outcomes */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">What You Get</h3>
              <div className="flex flex-wrap gap-2">
                {service.detail.outcomes.map((o, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                    <CheckCircle className="w-3 h-3 flex-shrink-0" />{o}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { onClose(); window.open('https://wa.me/919962900969?text=' + encodeURIComponent(`Hi, I'm interested in your ${service.title} service.`), '_blank'); }}
                className="flex-1 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#d63384,#b5165a)' }}
              >
                Enquire via WhatsApp
              </button>
              <button
                onClick={() => { onClose(); navigate(`/payments?service=${service.id}&autoopen=true`); }}
                className="py-3.5 px-5 rounded-2xl font-bold text-sm border-2 border-[#d63384] text-[#d63384] hover:bg-pink-50 transition-all active:scale-95 whitespace-nowrap flex items-center gap-1.5"
              >
                Continue to Pay →
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}



// ── FAQ Accordion ─────────────────────────────────────────────────────────────
function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-pink-50/50 transition-colors"
          >
            <span className="font-semibold text-gray-900 pr-4 text-sm sm:text-base">{item.q}</span>
            <ChevronDown className={`w-5 h-5 text-[#d63384] flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-pink-50 pt-4">
                  {item.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ── WhatsApp Quick Quote Form ─────────────────────────────────────────────────
function QuickQuoteForm() {
  const [form, setForm] = useState({ name: '', service: '', details: '' });
  const [sent, setSent] = useState(false);
  const services = ['Manuscript Preparation', 'Language Editing', 'Plagiarism Check', 'Proofreading', 'Literature Review', 'Graph Plotting', 'Other'];

  const handleSend = () => {
    if (!form.name || !form.service) return;
    const msg = `Hi Cornerstone! I'd like a quote.\n\n*Name:* ${form.name}\n*Service:* ${form.service}\n*Details:* ${form.details || 'N/A'}`;
    window.open('https://wa.me/919962900969?text=' + encodeURIComponent(msg), '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="quote-name" className="block text-xs font-bold text-gray-500 mb-1.5">Your Name *</label>
          <input
            id="quote-name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Dr. / Mr. / Ms. Your name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#d63384] focus:ring-2 focus:ring-pink-100 transition-all"
          />
        </div>
        <div>
          <label htmlFor="quote-service" className="block text-xs font-bold text-gray-500 mb-1.5">Service Needed *</label>
          <select
            id="quote-service"
            value={form.service}
            onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#d63384] focus:ring-2 focus:ring-pink-100 transition-all"
          >
            <option value="">Select a service…</option>
            {services.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="quote-details" className="block text-xs font-bold text-gray-500 mb-1.5">Additional Details (optional)</label>
        <textarea
          id="quote-details"
          value={form.details}
          onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
          placeholder="Word count, journal name, deadline, etc."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#d63384] focus:ring-2 focus:ring-pink-100 transition-all resize-none"
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!form.name || !form.service}
        className="w-full py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
        style={{ background: sent ? '#16a34a' : 'linear-gradient(135deg,#25D366,#128C7E)' }}
      >
        {sent ? '✓ WhatsApp opening…' : <><Send className="w-4 h-4" /> Send via WhatsApp — Get Free Quote</>}
      </button>
      <p className="text-center text-xs text-gray-400">We typically reply within 15 minutes during business hours.</p>
    </div>
  );
}



export default function LandingPage() {
  // ✅ Admin trigger: tap logo 5x on mobile, or press C→R→S on desktop
  const { logoTapHandler } = useAdminTrigger();


  const [activeService, setActiveService] = useState<Service | null>(null);

  // ── Page meta ────────────────────────────────────────────────────
  useEffect(() => {
    document.title = 'Cornerstone Research And Publication Services';
    const m = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (m) m.content = 'End-to-end academic publishing services in Chennai — manuscript preparation, language editing, grammar proofreading, plagiarism detection, and journal submission support.';
  }, []);

  useEffect(() => {
    // Check for hash on mount to scroll to section
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }

    const handleClick = (e: Event) => {
      const anchor = e.currentTarget as HTMLAnchorElement;
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        target?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleClick);
    });

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', handleClick);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation — fades in */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <AdvancedNav />
        </motion.div>
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-pink-100 rounded-full">
                <span className="text-[#d63384] text-sm font-medium">🌸 Guiding Scholars from Draft to Discovery</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Simplify Your{' '}
                <span className="bg-gradient-to-r from-[#d63384] to-[#b5165a] bg-clip-text text-transparent">Research Publication</span>{' '}
                Journey
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">
                From manuscript preparation to journal submission, we provide end-to-end
                academic publishing services that save you time and increase your visibility.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-[#d63384] to-[#b5165a] text-white px-8 hover:opacity-90 border-0 shadow-lg" 
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" className="border-[#d63384] text-[#d63384] hover:bg-pink-50 flex items-center gap-2" 
                  onClick={() => window.open('https://wa.me/919962900969', '_blank')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp Support
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-[#d63384] mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-[#d63384] mr-2" />
                  Free consultation
                </div>
              </div>
            </div>

            {/* Hero Logo Visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#d63384]/30 to-[#FFB7C5]/20 blur-3xl scale-110"></div>
                {/* Decorative ring */}
                <div className="absolute -inset-4 rounded-full border-2 border-dashed border-[#d63384]/20 animate-spin" style={{ animationDuration: '20s' }}></div>
                <div className="absolute -inset-8 rounded-full border border-[#FFB7C5]/30"></div>
                {/* Logo image — tap 5x on mobile to open admin */}
                <div className="relative w-72 h-72 rounded-full overflow-hidden shadow-2xl ring-4 ring-[#d63384]/20 ring-offset-4 ring-offset-white">
                  <img
                    src="/logo.jpeg"
                    alt="Cornerstone Research and Publication Services"
                    className="w-full h-full object-cover"
                    onClick={logoTapHandler}
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full px-5 py-2 shadow-lg border border-pink-100 flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-gray-700">Trusted Academic Services</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Cornerstone Research Services
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to prepare, polish, and publish your research with confidence.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                onClick={() => setActiveService(service)}
                className="cursor-pointer"
              >
                <Card className="group hover:shadow-2xl transition-all duration-300 border-[#F2C7C7] h-full relative overflow-hidden">
                  {/* Hover shimmer */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, rgba(214,51,132,0.04) 0%, rgba(255,255,255,0) 60%)' }} />
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300" style={{ background: '#F2C7C7' }}>
                      <service.icon className="w-6 h-6 text-[#d63384]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{service.description}</p>
                    <ul className="space-y-2 mb-4">
                      {service.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-[#d63384] mr-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    {/* Click hint */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#d63384] opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2">
                      <span>View full details</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Modal */}
          <AnimatePresence>
            {activeService && (
              <ServiceModal service={activeService} onClose={() => setActiveService(null)} />
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12" style={{ background: 'linear-gradient(135deg, #F2C7C7 0%, #D5F3D8 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-[#d63384]">{stat.value}</p>
                <p className="text-sm text-gray-700 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#F2C7C7' + '22' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              A streamlined workflow designed to get your research published faster.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Submit Your Manuscript',
                description: 'Upload your document and select the services you need. Our system supports all major formats.',
                icon: FileText,
                accent: '#d63384',
                bg: '#F2C7C7',
              },
              {
                step: '02',
                title: 'Expert Review & Editing',
                description: 'Our team of expert editors reviews your work, providing detailed feedback and improvements.',
                icon: Users,
                accent: '#d63384',
                bg: '#D5F3D8',
              },
              {
                step: '03',
                title: 'Receive Polished Work',
                description: 'Download your professionally edited manuscript, ready for journal submission.',
                icon: Award,
                accent: '#d63384',
                bg: '#F2C7C7',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-pink-100 h-full">
                  <span className="text-5xl font-bold absolute top-4 right-4" style={{ color: '#d63384', opacity: 0.3 }}>
                    {item.step}
                  </span>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: item.bg }}>
                    <item.icon className="w-7 h-7" style={{ color: item.accent }} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>





      {/* ── Why Choose Us ── */}
      <section className="py-20 px-4 sm:px-6" style={{ background: 'linear-gradient(135deg,#fce7f3 0%,#f0fdf4 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Why Researchers Choose Cornerstone</h2>
            <p className="text-gray-500 max-w-xl mx-auto">We're not just editors — we're your publishing partners.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BadgeCheck, title: 'Domain Experts Only', desc: 'Every editor holds a postgraduate degree in their field. No generalists — only subject-matter specialists review your work.', color: '#d63384' },
              { icon: Clock, title: 'Guaranteed Turnaround', desc: 'We commit to deadlines in writing. If we miss the agreed timeline, your next service is free — no questions asked.', color: '#7c3aed' },
              { icon: ShieldCheck, title: '100% Confidential', desc: 'Signed NDA for every project. Your research, ideas, and data are fully protected and never shared.', color: '#0891b2' },
              { icon: LineChart, title: 'Higher Acceptance Rate', desc: 'Manuscripts edited by us have a documented 3× higher acceptance rate than the industry average for first submissions.', color: '#059669' },
              { icon: Users, title: 'India-Based & Affordable', desc: 'Premium international quality at Indian prices. No hidden charges — transparent quotes before we start.', color: '#d97706' },
              { icon: Award, title: 'End-to-End Support', desc: 'From selecting the journal to responding to reviewer comments — we support you through every stage of publication.', color: '#d63384' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: item.color + '18' }}>
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ── FAQ ── */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-500">Everything you need to know before getting started.</p>
          </div>
          <FaqAccordion items={faqs} />
        </div>
      </section>

      {/* ── WhatsApp Quick Quote ── */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-[#d63384]/5 to-white rounded-3xl border border-pink-100 shadow-xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#25D366' }}>
                <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Get a Free Quote in 5 Minutes</h2>
              <p className="text-gray-500 text-sm">Tell us what you need — we'll reply on WhatsApp with a personalised quote and timeline.</p>
            </div>
            <QuickQuoteForm />
          </div>
        </div>
      </section>

      {/* ── Blog / Tips Teaser ── */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Research Tips & Guides</h2>
              <p className="text-gray-500 mt-1">Free resources to help you publish smarter.</p>
            </div>
            <button
              onClick={() => window.open('https://wa.me/919962900969', '_blank')}
              className="flex items-center gap-2 text-sm font-bold text-[#d63384] border border-[#d63384] rounded-xl px-5 py-2.5 hover:bg-pink-50 transition-all"
            >
              Get More Tips via WhatsApp <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                onClick={() => window.open('https://wa.me/919962900969', '_blank')}
              >
                <div className={`h-2 bg-gradient-to-r ${tip.color}`}></div>
                <div className="p-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 block">{tip.category}</span>
                  <h3 className="font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#d63384] transition-colors">{tip.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{tip.desc}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {tip.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cornerstone Quote ── */}
      <section className="py-12 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-10 h-0.5 bg-gradient-to-r from-transparent via-[#d63384] to-transparent mx-auto mb-6"></div>
          <p className="text-base sm:text-lg italic text-gray-500 leading-relaxed font-serif">
            "The stone the builders rejected has become the cornerstone. This is from the Lord, and it is marvelous in our eyes."
          </p>
          <div className="w-10 h-0.5 bg-gradient-to-r from-transparent via-[#d63384] to-transparent mx-auto mt-6"></div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
