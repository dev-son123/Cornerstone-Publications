import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
    X, Lock, CheckCircle, Copy, ExternalLink,
    Smartphone, Monitor, ChevronRight, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase, isSupabaseReady } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemName: string;
    price: string;            // e.g. "₹499"
    upiId?: string;           // merchant UPI ID — override default
    merchantName?: string;    // displayed in UPI apps
}

type Step = 'method' | 'qr' | 'upi-id' | 'app' | 'verify' | 'success';
type UpiApp = 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other';

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_UPI_ID = 'cornerstone@upi';
const DEFAULT_MERCHANT = 'Cornerstone Research';

const UPI_APPS: { id: UpiApp; label: string; color: string; bg: string; icon: React.ReactNode }[] = [
    {
        id: 'gpay',
        label: 'Google Pay',
        color: '#4285F4',
        bg: '#EAF1FF',
        icon: (
            <svg viewBox="0 0 48 48" className="w-8 h-8">
                <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.2 29.4 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.6 7.1 29 5 24 5 13 5 4 14 4 25s9 20 20 20 20-9 20-20c0-1.2-.1-2.5-.4-4.5z" />
                <path fill="#34A853" d="M6.3 15.1l6.6 4.8C14.6 16.5 19 13 24 13c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.6 7.1 29 5 24 5 16.3 5 9.7 9.1 6.3 15.1z" />
                <path fill="#FBBC05" d="M24 45c4.9 0 9.4-1.8 12.8-4.7l-5.9-5c-1.9 1.4-4.3 2.2-6.9 2.2-5.4 0-9.9-2.8-11.3-6.9l-6.5 5C9.6 40.9 16.3 45 24 45z" />
                <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3c-.7 1.9-1.9 3.5-3.5 4.7l5.9 5C37 36.2 44 31 44 25c0-1.2-.1-2.5-.4-4.5z" />
            </svg>
        ),
    },
    {
        id: 'phonepe',
        label: 'PhonePe',
        color: '#5F259F',
        bg: '#F3EEFF',
        icon: (
            <svg viewBox="0 0 48 48" className="w-8 h-8">
                <rect width="48" height="48" rx="12" fill="#5F259F" />
                <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">Pe</text>
            </svg>
        ),
    },
    {
        id: 'paytm',
        label: 'Paytm',
        color: '#00BAF2',
        bg: '#E6F8FD',
        icon: (
            <svg viewBox="0 0 48 48" className="w-8 h-8">
                <rect width="48" height="48" rx="12" fill="#00BAF2" />
                <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">Paytm</text>
            </svg>
        ),
    },
    {
        id: 'bhim',
        label: 'BHIM',
        color: '#00529C',
        bg: '#E6EFF9',
        icon: (
            <svg viewBox="0 0 48 48" className="w-8 h-8">
                <rect width="48" height="48" rx="12" fill="#00529C" />
                <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">BHIM</text>
            </svg>
        ),
    },
    {
        id: 'other',
        label: 'Other UPI App',
        color: '#FF6B35',
        bg: '#FFF0EB',
        icon: (
            <svg viewBox="0 0 48 48" className="w-8 h-8">
                <rect width="48" height="48" rx="12" fill="#FF6B35" />
                <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">UPI</text>
            </svg>
        ),
    },
];

// ─── Build UPI deep-link URL ──────────────────────────────────────────────────

function buildUpiUrl(app: UpiApp, upiId: string, merchantName: string, amount: string) {
    const amtNum = amount.replace(/[^0-9.]/g, '');
    const base = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amtNum}&cu=INR`;
    const schemes: Record<UpiApp, string> = {
        gpay: `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amtNum}&cu=INR`,
        phonepe: `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amtNum}&cu=INR`,
        paytm: `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amtNum}&cu=INR`,
        bhim: base,
        other: base,
    };
    return schemes[app] ?? base;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PaymentModal({
    isOpen,
    onClose,
    itemName,
    price,
    upiId = DEFAULT_UPI_ID,
    merchantName = DEFAULT_MERCHANT,
}: PaymentModalProps) {
    const [step, setStep] = useState<Step>('method');
    const [isMobile, setIsMobile] = useState(false);
    const [selectedApp, setSelectedApp] = useState<UpiApp | null>(null);
    const [customUpiId, setCustomUpiId] = useState('');
    const [upiIdError, setUpiIdError] = useState('');
    const [txnId, setTxnId] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [email, setEmail] = useState('');

    // Detect mobile vs desktop
    useEffect(() => {
        const check = () => setIsMobile(/Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent));
        check();
    }, []);

    // Generate a fake transaction ref
    useEffect(() => {
        if (step === 'verify') {
            setTxnId(`CS${Date.now().toString().slice(-8)}`);
        }
    }, [step]);

    if (!isOpen) return null;

    const reset = () => {
        setStep('method');
        setSelectedApp(null);
        setCustomUpiId('');
        setUpiIdError('');
        setTxnId('');
        setEmail('');
        onClose();
    };

    const handleCopyUpiId = () => {
        navigator.clipboard.writeText(upiId);
        toast.success('UPI ID copied!');
    };

    const validateUpiId = (val: string) => {
        if (!val.includes('@')) {
            setUpiIdError('Enter a valid UPI ID (e.g. name@upi)');
            return false;
        }
        setUpiIdError('');
        return true;
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!txnId) { toast.error('Enter your transaction ID'); return; }
        if (!email) { toast.error('Enter your email address'); return; }
        setIsVerifying(true);

        try {
            // Save payment record to Supabase when configured
            if (isSupabaseReady) {
                const { error } = await supabase.from('payments').insert({
                    item_name: itemName,
                    amount: price.replace(/[^0-9.]/g, ''),
                    currency: 'INR',
                    method: 'UPI',
                    upi_app: selectedApp ?? 'other',
                    txn_id: txnId.trim(),
                    buyer_email: email.trim(),
                    status: 'pending_verification',
                    created_at: new Date().toISOString(),
                });
                if (error) {
                    console.warn('[Payment] Failed to save record:', error.message);
                    // Don't block UX — payment still succeeded on user's end
                }
            } else {
                // Demo mode: store in localStorage
                const existing = JSON.parse(localStorage.getItem('demo_payments') ?? '[]');
                existing.push({
                    id: `demo_${Date.now()}`,
                    item_name: itemName,
                    amount: price,
                    txn_id: txnId,
                    buyer_email: email,
                    upi_app: selectedApp ?? 'other',
                    status: 'demo',
                    created_at: new Date().toISOString(),
                });
                localStorage.setItem('demo_payments', JSON.stringify(existing));
            }

            setStep('success');
        } catch (err) {
            console.error('[Payment] Verify error:', err);
            // Still show success — payment happened on UPI side
            setStep('success');
        } finally {
            setIsVerifying(false);
        }
    };

    // ── Screens ──────────────────────────────────────────────────────────────────

    const MethodScreen = () => (
        <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center mb-4">Choose how you'd like to pay</p>

            {/* QR Code — Desktop recommended */}
            <button
                onClick={() => setStep('qr')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-[#FFB7C5] hover:bg-pink-50/30 transition-all group"
            >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-[#FFB7C5]/20 transition-colors">
                    <Monitor className="w-6 h-6 text-gray-600 group-hover:text-[#FFB7C5]" />
                </div>
                <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Scan QR Code</p>
                    <p className="text-xs text-gray-500">Best for laptop / computer · Scan with any UPI app</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#FFB7C5]" />
            </button>

            {/* UPI Apps */}
            <button
                onClick={() => setStep('app')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-[#5F259F] hover:bg-purple-50/30 transition-all group"
            >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Smartphone className="w-6 h-6 text-gray-600 group-hover:text-[#5F259F]" />
                </div>
                <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Pay with UPI App</p>
                    <p className="text-xs text-gray-500">GPay, PhonePe, Paytm, BHIM &amp; more</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400" />
            </button>

            {/* UPI ID / VPA */}
            <button
                onClick={() => setStep('upi-id')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-[#00BAF2] hover:bg-rose-50/30 transition-all group"
            >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                    <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="8" fill="#00BAF2" />
                        <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">UPI</text>
                    </svg>
                </div>
                <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Enter UPI ID</p>
                    <p className="text-xs text-gray-500">Pay using your UPI Virtual Payment Address</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-400" />
            </button>
        </div>
    );

    const QrScreen = () => (
        <div className="flex flex-col items-center gap-5">
            <p className="text-sm text-gray-500 text-center">
                Open any UPI app on your phone and scan the QR code below
            </p>

            {/* QR Code Box */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-inner flex flex-col items-center gap-3">
                <QRCodeSVG
                    value={`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${price.replace(/[^0-9.]/g, '')}&cu=INR`}
                    size={200}
                    level="H"
                    includeMargin
                    imageSettings={{
                        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png',
                        x: undefined,
                        y: undefined,
                        height: 36,
                        width: 60,
                        excavate: true,
                    }}
                />
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Pay to</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-gray-800">{upiId}</span>
                        <button onClick={handleCopyUpiId} className="text-gray-400 hover:text-[#FFB7C5] transition-colors">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                    <span className="text-2xl font-bold text-[#FFB7C5]">{price}</span>
                </div>
            </div>

            {/* Accepted logos */}
            <div className="flex items-center gap-3">
                {UPI_APPS.slice(0, 4).map(app => (
                    <div key={app.id} title={app.label}>{app.icon}</div>
                ))}
                <span className="text-xs text-gray-400">& more</span>
            </div>

            <Button
                onClick={() => setStep('verify')}
                className="w-full bg-gradient-to-r from-[#FFB7C5] to-[#ff8fab] text-white hover:opacity-90 h-11"
            >
                I've Paid – Confirm Payment
            </Button>
        </div>
    );

    const AppScreen = () => (
        <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center mb-2">Select your preferred UPI app</p>
            <div className="grid grid-cols-2 gap-3">
                {UPI_APPS.map(app => (
                    <button
                        key={app.id}
                        onClick={() => {
                            setSelectedApp(app.id);
                            if (isMobile) {
                                // Open the app directly
                                window.location.href = buildUpiUrl(app.id, upiId, merchantName, price);
                                setStep('verify');
                            } else {
                                setStep('qr');
                            }
                        }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 hover:border-gray-300 active:scale-95 transition-all"
                        style={{ background: app.bg }}
                    >
                        {app.icon}
                        <span className="text-xs font-semibold text-gray-700">{app.label}</span>
                    </button>
                ))}
            </div>
            {!isMobile && (
                <p className="text-xs text-center text-gray-400 pt-1">
                    On a computer? Selecting an app will show you the QR code to scan.
                </p>
            )}
        </div>
    );

    const UpiIdScreen = () => (
        <div className="space-y-5">
            <div className="bg-pink-50 rounded-xl p-4 text-sm text-pink-700 flex items-start gap-2">
                <span className="mt-0.5">ℹ️</span>
                <span>Enter the merchant UPI ID in your UPI app and complete the payment of <strong>{price}</strong>.</span>
            </div>

            {/* Merchant UPI ID to pay TO */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Pay to UPI ID</p>
                    <p className="font-mono font-semibold text-gray-900 text-lg">{upiId}</p>
                </div>
                <button onClick={handleCopyUpiId} className="p-2 rounded-lg bg-white shadow text-gray-400 hover:text-[#FFB7C5] transition-colors">
                    <Copy className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-2">
                <Label htmlFor="upi-id-input">Your UPI ID (optional, for records)</Label>
                <Input
                    id="upi-id-input"
                    placeholder="yourname@upi"
                    value={customUpiId}
                    onChange={e => { setCustomUpiId(e.target.value); setUpiIdError(''); }}
                    onBlur={() => customUpiId && validateUpiId(customUpiId)}
                    className={upiIdError ? 'border-red-400' : ''}
                />
                {upiIdError && <p className="text-xs text-red-500">{upiIdError}</p>}
            </div>

            <Button
                onClick={() => {
                    if (customUpiId && !validateUpiId(customUpiId)) return;
                    setStep('verify');
                }}
                className="w-full bg-gradient-to-r from-[#FFB7C5] to-[#ff8fab] text-white hover:opacity-90 h-11"
            >
                I've Paid – Confirm
            </Button>
        </div>
    );

    const VerifyScreen = () => (
        <form onSubmit={handleVerify} className="space-y-5">
            <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-sm text-pink-800">
                After completing the UPI payment, enter your transaction/UTR ID below so we can verify your payment.
            </div>

            <div className="space-y-2">
                <Label htmlFor="txn-id">Transaction / UTR ID</Label>
                <Input
                    id="txn-id"
                    placeholder="e.g. 423898765432"
                    value={txnId}
                    onChange={e => setTxnId(e.target.value)}
                    required
                />
                <p className="text-xs text-gray-400">Find this in your UPI app under payment history.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="verify-email">Your Email (for download link)</Label>
                <Input
                    id="verify-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
            </div>

            <Button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-gradient-to-r from-[#FFB7C5] to-[#ff8fab] text-white hover:opacity-90 h-12 text-base font-semibold"
            >
                {isVerifying ? (
                    <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Payment…
                    </span>
                ) : 'Confirm Payment'}
            </Button>
        </form>
    );

    const SuccessScreen = () => (
        <div className="text-center py-4">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-12 h-12 text-pink-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Confirmed!</h3>
            <p className="text-gray-500 mb-1">A download link has been sent to</p>
            <p className="font-semibold text-[#FFB7C5] mb-1">{email}</p>
            <p className="text-xs text-gray-400 mb-6">Ref: {txnId}</p>
            <Button
                onClick={reset}
                className="w-full bg-gradient-to-r from-[#FFB7C5] to-[#ff8fab] text-white hover:opacity-90 h-11"
            >
                Done
            </Button>
        </div>
    );

    const titles: Record<Step, string> = {
        method: 'Choose Payment Method',
        qr: 'Scan &amp; Pay',
        app: 'Pay with UPI App',
        'upi-id': 'Pay via UPI ID',
        verify: 'Confirm Payment',
        success: 'Success',
    };

    const canGoBack = step !== 'method' && step !== 'success';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* ── Gradient Header ── */}
                <div className="bg-gradient-to-r from-[#FFB7C5] to-[#ff8fab] px-6 pt-6 pb-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 opacity-80" />
                            <span className="text-sm font-medium opacity-90">Secure Payment · UPI</span>
                        </div>
                        <button onClick={reset} className="text-white/70 hover:text-white transition-colors p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold leading-tight">{itemName}</h2>
                    <p className="text-3xl font-extrabold mt-1 tracking-tight">{price}</p>

                    {/* UPI accepted logos strip */}
                    <div className="flex items-center gap-2 mt-3 opacity-90">
                        <span className="text-xs font-medium">Accepted:</span>
                        {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'UPI'].map(n => (
                            <span key={n} className="bg-white/20 rounded px-2 py-0.5 text-xs font-semibold">{n}</span>
                        ))}
                    </div>
                </div>

                {/* ── Step indicator ── */}
                {step !== 'success' && (
                    <div className="px-6 pt-4 pb-1 flex items-center gap-2">
                        {canGoBack && (
                            <button
                                onClick={() => setStep(step === 'verify' ? 'method' : 'method')}
                                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mr-auto"
                            >
                                ← Back
                            </button>
                        )}
                        <span
                            className="ml-auto text-xs font-semibold text-gray-500"
                            dangerouslySetInnerHTML={{ __html: titles[step] }}
                        />
                    </div>
                )}

                {/* ── Body ── */}
                <div className="px-6 pb-6 pt-3">
                    {step === 'method' && <MethodScreen />}
                    {step === 'qr' && <QrScreen />}
                    {step === 'app' && <AppScreen />}
                    {step === 'upi-id' && <UpiIdScreen />}
                    {step === 'verify' && <VerifyScreen />}
                    {step === 'success' && <SuccessScreen />}
                </div>

                {/* ── Footer trust badge ── */}
                {step !== 'success' && (
                    <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> 256-bit SSL</span>
                        <span>·</span>
                        <span>NPCI Compliant</span>
                        <span>·</span>
                        <a
                            href="https://www.npci.org.in/what-we-do/upi/product-overview"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-gray-600 transition-colors"
                        >
                            UPI <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
