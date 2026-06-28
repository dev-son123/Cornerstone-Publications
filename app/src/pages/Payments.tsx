// src/pages/Payments.tsx
// UPI Payments page — picks service → shows price → opens GPay/PhonePe/Paytm on mobile
// On desktop: shows a QR code to scan

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdvancedNav } from '@/components/ui/advanced-nav';
import { Footer } from '@/components/Footer';
import { CheckCircle, ArrowRight, Smartphone, Monitor, X, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

// ── Your UPI details (from environment variables) ─────────────────────────────
const UPI_ID   = import.meta.env.VITE_UPI_ID || 'overcomertc123-1@okhdfcbank';
const PAYEE_NAME = import.meta.env.VITE_UPI_PAYEE_NAME || 'Cornerstone Research';

// ── Service catalogue with prices ────────────────────────────────────────────
export const SERVICE_PLANS = [
  {
    id: 'manuscript',
    title: 'Manuscript Preparation',
    desc: 'End-to-end manuscript formatting & submission prep',
    price: 1500,
    turnaround: '3–5 business days',
    features: ['Full structural review', 'Reference formatting', 'Journal compliance check'],
  },
  {
    id: 'language',
    title: 'Language Editing',
    desc: 'Academic language polish, tone & clarity improvement',
    price: 1200,
    turnaround: '2–4 business days',
    features: ['Line-by-line editing', 'Academic tone upgrade', 'Tracked changes'],
  },
  {
    id: 'literature',
    title: 'Thesis Literature Review',
    desc: 'Literature review structuring, gap analysis & synthesis',
    price: 2000,
    turnaround: '4–7 business days',
    features: ['Gap analysis', 'Theme synthesis', 'Citation integration'],
  },
  {
    id: 'plagiarism',
    title: 'Plagiarism Detection',
    desc: 'Similarity report + source breakdown',
    price: 500,
    turnaround: '1–2 business days',
    features: ['Full-document scan', 'Source breakdown', 'Certificate of originality'],
  },
  {
    id: 'proofreading',
    title: 'Grammar & Proofreading',
    desc: 'Final-pass grammar, spelling & punctuation correction',
    price: 800,
    turnaround: '1–3 business days',
    features: ['Grammar & spelling', 'Tense consistency', 'Punctuation cleanup'],
  },
  {
    id: 'graphs',
    title: 'Graph Plotting & Data Visualisation',
    desc: 'Publication-ready figures in Python, R, or Excel',
    price: 700,
    turnaround: '2–4 business days',
    features: ['300+ DPI output', 'TIFF / PNG / SVG', 'Per figure pricing'],
  },
  {
    id: 'custom',
    title: 'Custom Payment',
    desc: 'Pay a custom amount quoted by our team',
    price: 0,
    turnaround: 'Based on quotation',
    features: ['Custom quoted amount', 'Any research support service'],
  },
];

// ── Build UPI payment string ─────────────────────────────────────────────────
function buildUpiUrl(amount: number, note: string) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: PAYEE_NAME,
    am: String(amount),
    cu: 'INR',
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

function buildGPayUrl(amount: number, note: string) {
  return `gpay://upi/pay?${new URLSearchParams({ pa: UPI_ID, pn: PAYEE_NAME, am: String(amount), cu: 'INR', tn: note })}`;
}

function buildPhonePeUrl(amount: number, note: string) {
  return `phonepe://pay?${new URLSearchParams({ pa: UPI_ID, pn: PAYEE_NAME, am: String(amount), cu: 'INR', tn: note })}`;
}

function buildPatymUrl(amount: number, note: string) {
  return `paytmmp://pay?${new URLSearchParams({ pa: UPI_ID, pn: PAYEE_NAME, am: String(amount), cu: 'INR', tn: note })}`;
}

// ── UPI QR on canvas ─────────────────────────────────────────────────────────
function UpiQR({ upiUrl }: { upiUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, upiUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#1a1a2e', light: '#ffffff' },
      });
    }
  }, [upiUrl]);
  return <canvas ref={canvasRef} className="rounded-2xl shadow-md" />;
}

// ── Detect mobile ─────────────────────────────────────────────────────────────
function isMobile() {
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

// ══════════════════════════════════════════════════════════════════
export default function Payments() {
  const [searchParams] = useSearchParams();


  // Pre-select service from URL param
  const preselect  = searchParams.get('service') ?? '';
  const autoOpen   = searchParams.get('autoopen') === 'true';
  const initial    = SERVICE_PLANS.find(s => s.id === preselect) ?? null;

  const [selected, setSelected] = useState<typeof SERVICE_PLANS[0] | null>(initial);
  const [qty, setQty]           = useState(1);
  const [customPrice, setCustomPrice] = useState<number | ''>(1000);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  // If autoopen: jump straight to pay screen
  const [step, setStep]         = useState<'select' | 'confirm' | 'pay'>(
    initial && autoOpen ? 'pay' : initial ? 'confirm' : 'select'
  );
  const [copied, setCopied]     = useState(false);
  const [mobile]                = useState(isMobile);
  const autoFired               = useRef(false);

  useMeta('Pay for Services', 'Choose a Cornerstone service and complete payment instantly via GPay, PhonePe, Paytm, or any UPI app.');

  const amount  = selected ? (selected.id === 'custom' ? (customPrice || 0) : selected.price * qty) : 0;
  const note    = selected ? `Cornerstone: ${selected.title}` : '';
  const upiUrl  = buildUpiUrl(amount, note);
  const gpayUrl = buildGPayUrl(amount, note);
  const ppUrl   = buildPhonePeUrl(amount, note);
  const ptUrl   = buildPatymUrl(amount, note);

  // ── Auto-open GPay on mobile when arriving with autoopen=true ──────
  useEffect(() => {
    if (autoOpen && mobile && selected && step === 'pay' && !autoFired.current) {
      autoFired.current = true;
      // Small delay so the page renders first
      setTimeout(() => {
        window.location.href = gpayUrl;
      }, 600);
    }
  }, [autoOpen, mobile, selected, step, gpayUrl]);



  const handleCopy = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col">
      <AdvancedNav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-32">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-pink-100 rounded-full mb-4">
            <span className="text-[#d63384] text-sm font-semibold">🔒 Secure UPI Payment</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Pay for Your Service</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Choose a service, confirm your details, then pay instantly via GPay, PhonePe, Paytm, or any UPI app.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {(['select', 'confirm', 'pay'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                step === s ? 'bg-[#d63384] text-white scale-110 shadow-lg shadow-pink-200' :
                ['select','confirm','pay'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>{['select','confirm','pay'].indexOf(step) > i ? '✓' : i + 1}</div>
              <span className={`text-xs font-semibold capitalize hidden sm:block ${step === s ? 'text-[#d63384]' : 'text-gray-400'}`}>{s}</span>
              {i < 2 && <div className={`w-8 h-0.5 rounded ${['select','confirm','pay'].indexOf(step) > i ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Service Selection ── */}
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity:0,x:-20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:20 }} transition={{ duration:0.3 }}>
              <div className="grid sm:grid-cols-2 gap-4">
                {SERVICE_PLANS.map(plan => (
                  <motion.button
                    key={plan.id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelected(plan); setQty(1); setStep('confirm'); }}
                    className={`text-left p-6 rounded-2xl border-2 transition-all bg-white shadow-sm hover:shadow-xl ${
                      selected?.id === plan.id ? 'border-[#d63384] bg-pink-50' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 text-base">{plan.title}</h3>
                      <span className="text-lg font-extrabold text-[#d63384] ml-2">
                        {plan.id === 'custom' ? 'Custom Quote' : `₹${plan.price.toLocaleString('en-IN')}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{plan.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.features.map((f,i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-pink-50 text-[#d63384] font-medium border border-pink-100">
                          <CheckCircle className="w-2.5 h-2.5" />{f}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-400">⏱ {plan.turnaround}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Confirm Details ── */}
          {step === 'confirm' && selected && (
            <motion.div key="confirm" initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }} transition={{ duration:0.3 }}>
              <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Confirm Order</h2>
                  <button onClick={() => setStep('select')} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Selected service summary */}
                <div className="p-4 rounded-2xl bg-pink-50 border border-pink-100 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900">{selected.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{selected.turnaround}</p>
                    </div>
                    <span className="text-2xl font-extrabold text-[#d63384]">₹{(selected.id === 'custom' ? customPrice : selected.price).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Quantity (for graph plotting) */}
                {selected.id === 'graphs' && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Number of figures</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setQty(q => Math.max(1, q-1))} className="w-9 h-9 rounded-full border-2 border-pink-200 text-[#d63384] font-bold hover:bg-pink-50">−</button>
                      <span className="text-xl font-bold w-8 text-center text-gray-900">{qty}</span>
                      <button onClick={() => setQty(q => q+1)} className="w-9 h-9 rounded-full border-2 border-pink-200 text-[#d63384] font-bold hover:bg-pink-50">+</button>
                      <span className="text-sm text-gray-500">× ₹{selected.price} = <strong className="text-gray-900">₹{amount.toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>
                )}

                {/* Custom Amount input */}
                {selected.id === 'custom' && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enter Quoted Amount (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={customPrice}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomPrice(val === '' ? '' : Math.max(1, parseInt(val) || 1));
                      }}
                      placeholder="e.g. 5000"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#d63384] focus:ring-2 focus:ring-pink-100 transition-all font-bold text-gray-800"
                    />
                  </div>
                )}
                <div className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#d63384] focus:ring-2 focus:ring-pink-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#d63384] focus:ring-2 focus:ring-pink-100 transition-all" />
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-4 border-t border-dashed border-pink-100 mb-6">
                  <span className="font-bold text-gray-700">Total Payable</span>
                  <span className="text-3xl font-black text-[#d63384]">₹{amount.toLocaleString('en-IN')}</span>
                </div>

                <button
                  onClick={() => {
                    if (selected.id === 'custom' && (!customPrice || customPrice <= 0)) {
                      alert('Please enter a valid payment amount');
                      return;
                    }
                    if (!name.trim()) { alert('Please enter your name'); return; }
                    if (!email.trim()) { alert('Please enter your email'); return; }
                    setStep('pay');
                  }}
                  className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#d63384,#b5165a)' }}
                >
                  Proceed to Pay <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Pay via UPI ── */}
          {step === 'pay' && selected && (
            <motion.div key="pay" initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-20 }} transition={{ duration:0.3 }}>
              <div className="max-w-lg mx-auto">
                {/* Amount banner */}
                <div className="bg-gradient-to-r from-[#d63384] to-[#b5165a] rounded-3xl p-6 text-white text-center mb-6 shadow-xl shadow-pink-200">
                  <p className="text-sm opacity-80 mb-1">{selected.title}</p>
                  <p className="text-5xl font-black mb-1">₹{amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs opacity-70">Pay to {PAYEE_NAME} · UPI ID: {UPI_ID}</p>
                </div>

                {mobile ? (
                  /* ─── MOBILE: UPI App buttons ─── */
                  <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <Smartphone className="w-5 h-5 text-[#d63384]" />
                      <h3 className="font-bold text-gray-900">Open your UPI app to pay</h3>
                    </div>

                    <div className="space-y-3 mb-6">
                      {/* GPay */}
                      <a href={gpayUrl}
                        className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95 cursor-pointer group">
                        <div className="w-11 h-11 rounded-xl bg-white shadow-md flex items-center justify-center border border-gray-100">
                          <svg viewBox="0 0 48 48" className="w-7 h-7"><path fill="#4285F4" d="M24 9.5c3.9 0 6.6 1.7 8.2 3.2l6-6C34.6 3.3 30 1 24 1 14.9 1 7.2 6.7 4 14.5l7 5.4C12.7 14.1 17.9 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.6-.1-2.8-.4-4H24v8h12.5c-.5 2.8-2.2 5.2-4.7 6.8l7.3 5.7C43.4 37 46.1 31.3 46.1 24.5z"/><path fill="#FBBC05" d="M11 28.9c-.5-1.5-.8-3.1-.8-4.9 0-1.8.3-3.4.8-4.9L4 13.7C2.4 16.9 1.5 20.3 1.5 24s.9 7.1 2.5 10.3L11 28.9z"/><path fill="#EA4335" d="M24 46.5c6 0 11-2 14.7-5.4l-7.3-5.7c-2 1.3-4.5 2.1-7.4 2.1-6.1 0-11.3-4.1-13.1-9.6L4 33.4C7.2 41.2 14.9 46.5 24 46.5z"/></svg>
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-blue-700">Pay with Google Pay</span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 ml-auto" />
                      </a>

                      {/* PhonePe */}
                      <a href={ppUrl}
                        className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all active:scale-95 cursor-pointer group">
                        <div className="w-11 h-11 rounded-xl bg-purple-600 shadow-md flex items-center justify-center">
                          <span className="text-white font-black text-lg">Pe</span>
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-purple-700">Pay with PhonePe</span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 ml-auto" />
                      </a>

                      {/* Paytm */}
                      <a href={ptUrl}
                        className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-sky-200 hover:bg-sky-50 transition-all active:scale-95 cursor-pointer group">
                        <div className="w-11 h-11 rounded-xl bg-sky-500 shadow-md flex items-center justify-center">
                          <span className="text-white font-black text-xs leading-none text-center">Pay<br/>tm</span>
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-sky-700">Pay with Paytm</span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-sky-500 ml-auto" />
                      </a>

                      {/* Any UPI */}
                      <a href={upiUrl}
                        className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-pink-200 hover:bg-pink-50 transition-all active:scale-95 cursor-pointer group">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#d63384] to-[#b5165a] shadow-md flex items-center justify-center">
                          <span className="text-white font-black text-xs">UPI</span>
                        </div>
                        <span className="font-bold text-gray-800 group-hover:text-[#d63384]">Any other UPI App</span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#d63384] ml-auto" />
                      </a>
                    </div>

                    {/* Manual UPI ID copy */}
                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3 text-sm">
                      <span className="text-gray-500 font-medium flex-1">Or pay manually to UPI ID:<br /><strong className="text-gray-900">{UPI_ID}</strong></span>
                      <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-pink-50 hover:border-pink-200 text-xs font-bold text-gray-600 transition-all">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ─── DESKTOP: QR Code ─── */
                  <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 text-center">
                    <div className="flex items-center gap-2 justify-center mb-6">
                      <Monitor className="w-5 h-5 text-[#d63384]" />
                      <h3 className="font-bold text-gray-900">Scan QR code to pay</h3>
                    </div>

                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-white rounded-2xl shadow-md border border-pink-100">
                        <UpiQR upiUrl={upiUrl} />
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mb-6">Open any UPI app on your phone → Scan QR → Pay ₹{amount.toLocaleString('en-IN')}</p>

                    {/* Supported apps badges */}
                    <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay'].map(app => (
                        <span key={app} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 font-semibold">{app}</span>
                      ))}
                    </div>

                    {/* Manual UPI ID */}
                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3 text-sm">
                      <span className="text-gray-500 font-medium flex-1 text-left">UPI ID: <strong className="text-gray-900">{UPI_ID}</strong></span>
                      <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-pink-50 hover:border-pink-200 text-xs font-bold text-gray-600 transition-all">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy ID'}
                      </button>
                    </div>
                  </div>
                )}

                {/* After payment instructions */}
                <div className="mt-6 p-5 bg-amber-50 border border-amber-100 rounded-2xl text-sm text-amber-800">
                  <p className="font-bold mb-1">📌 After paying:</p>
                  <p>WhatsApp your payment screenshot to <strong>+91 9962 900 969</strong> along with your name and service. Our team will confirm and begin work within 2 hours on business days.</p>
                </div>

                <button onClick={() => setStep('confirm')} className="mt-4 w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-semibold hover:border-pink-200 hover:text-[#d63384] transition-all text-sm">
                  ← Change Details
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

// Inline meta helper
function useMeta(title: string, desc: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} | Cornerstone Research`;
    const m = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const pd = m?.content ?? '';
    if (m) m.content = desc;
    return () => { document.title = prev; if (m) m.content = pd; };
  }, [title, desc]);
}
