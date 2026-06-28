import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_KEY = 'contact_form_submissions';
const MAX_SUBMISSIONS = 3;
const RATE_LIMIT_WINDOW = 3600000; // 1 hour

export function ContactForm() {
    const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || '919962900969';
    const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'info.cornerstoneresearch@gmail.com';
    const empty = { name: "", email: "", phone: "", subject: "", message: "" };
    const [form, setForm] = useState(empty);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isRateLimited, setIsRateLimited] = useState(false);

    // Check rate limiting on mount
    useEffect(() => {
        checkRateLimit();
    }, []);

    const checkRateLimit = () => {
        const stored = localStorage.getItem(RATE_LIMIT_KEY);
        if (!stored) return;
        
        const submissions = JSON.parse(stored);
        const now = Date.now();
        const recentSubmissions = submissions.filter((timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW);
        
        if (recentSubmissions.length >= MAX_SUBMISSIONS) {
            setIsRateLimited(true);
            setError('Too many submissions. Please try again later.');
        }
    };

    const recordSubmission = () => {
        const stored = localStorage.getItem(RATE_LIMIT_KEY);
        const submissions = stored ? JSON.parse(stored) : [];
        const now = Date.now();
        const recentSubmissions = submissions.filter((timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW);
        recentSubmissions.push(now);
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentSubmissions));
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!form.name.trim()) errors.name = 'Name is required';
        if (!form.email.trim()) errors.email = 'Email is required';
        else if (!EMAIL_REGEX.test(form.email)) errors.email = 'Invalid email format';
        
        if (form.phone && !PHONE_REGEX.test(form.phone)) {
            errors.phone = 'Invalid phone number format';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const set = (f: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm(p => ({ ...p, [f]: e.target.value }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        if (isRateLimited) {
            setError('Too many submissions. Please try again later.');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const { error: err } = await supabase.from("contacts").insert([{
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim() || null,
                subject: form.subject.trim() || null,
                message: form.message.trim() || null,
                status: "new",
            }]);
            
            setLoading(false);
            
            if (err) {
                setError(`Submission failed. Please email us at ${ADMIN_EMAIL}`);
                return;
            }

            recordSubmission();
            setSuccess(true);
            setForm(empty);
            setValidationErrors({});

            // ── Silent Admin WhatsApp notification ────────────────────────────────
            try {
                const msg = encodeURIComponent(
                    `🔔 *New Contact Enquiry*\n\n` +
                    `*Name:* ${form.name.trim()}\n` +
                    `*Email:* ${form.email.trim()}\n` +
                    (form.phone ? `*Phone:* ${form.phone.trim()}\n` : '') +
                    (form.subject ? `*Subject:* ${form.subject.trim()}\n` : '') +
                    (form.message ? `*Message:* ${form.message.trim()}` : '')
                );
                window.open(`https://wa.me/${ADMIN_PHONE}?text=${msg}`, '_blank');
            } catch { /* silent */ }
        } catch (err) {
            setLoading(false);
            setError('An unexpected error occurred. Please try again.');
        }
    };

    if (success) return (
        <div className="text-center py-12 flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-2 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Message Sent!</h3>
            <p className="text-gray-500 max-w-sm">
                Thank you for reaching out. Our team will review your query and get back to you within 24 hours.
            </p>
            <button
                onClick={() => setSuccess(false)}
                className="mt-6 text-[#d63384] font-semibold hover:underline"
            >
                Send another message
            </button>
        </div>
    );

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Your Name <span className="text-[#d63384]">*</span></label>
                    <input
                        required
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={set("name")}
                        maxLength={100}
                        className={`w-full p-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-pink-500/10 outline-none transition-all placeholder:text-slate-400 ${
                            validationErrors.name
                                ? 'border-red-300 focus:border-red-400'
                                : 'border-slate-200 focus:border-[#d63384]'
                        }`}
                    />
                    {validationErrors.name && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {validationErrors.name}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address <span className="text-[#d63384]">*</span></label>
                    <input
                        required
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={set("email")}
                        maxLength={255}
                        className={`w-full p-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-pink-500/10 outline-none transition-all placeholder:text-slate-400 ${
                            validationErrors.email
                                ? 'border-red-300 focus:border-red-400'
                                : 'border-slate-200 focus:border-[#d63384]'
                        }`}
                    />
                    {validationErrors.email && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {validationErrors.email}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                    <input
                        type="tel"
                        placeholder="+91 99629 00969"
                        value={form.phone}
                        onChange={set("phone")}
                        maxLength={20}
                        className={`w-full p-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-pink-500/10 outline-none transition-all placeholder:text-slate-400 ${
                            validationErrors.phone
                                ? 'border-red-300 focus:border-red-400'
                                : 'border-slate-200 focus:border-[#d63384]'
                        }`}
                    />
                    {validationErrors.phone && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {validationErrors.phone}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                    <input
                        type="text"
                        placeholder="How can we help?"
                        value={form.subject}
                        onChange={set("subject")}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-[#d63384] outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                <textarea
                    rows={4}
                    placeholder="Tell us about your research or query..."
                    value={form.message}
                    onChange={set("message")}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-[#d63384] outline-none transition-all placeholder:text-slate-400 resize-none"
                />
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !form.name || !form.email}
                className="w-full py-5 bg-gradient-to-r from-[#d33384] to-[#ff4d94] hover:shadow-xl hover:shadow-pink-200 text-white font-bold rounded-2xl transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                    </>
                ) : (
                    <>
                        <span>Send Message</span>
                        <ArrowRight className="w-5 h-5" />
                    </>
                )}
            </button>
        </form>
    );
}
