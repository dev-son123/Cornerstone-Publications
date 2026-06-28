import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdvancedNav } from '@/components/ui/advanced-nav';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { BookOpen, MapPin, Phone, User, Send, CheckCircle } from 'lucide-react';
import { useMeta } from '@/hooks/useMeta';

export default function OrderHardcopy() {
    useMeta({ title: 'Order Hardcopy | Cornerstone Research', description: 'Order a physical hardcopy of our syllabus-aligned physics class notes.' });

    const [searchParams] = useSearchParams();

    // Check if a course was passed in the URL (e.g., ?course=MLT)
    const initialCourse = searchParams.get('course') || 'MLT';

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        course: initialCourse,
        address: '',
        pincode: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, ''); // Allow digits only
        setFormData(prev => ({ ...prev, pincode: val }));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9+\-\s]/g, ''); // Allow digits, +, -, and spaces
        setFormData(prev => ({ ...prev, phone: val }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Final validations
        if (!/^[0-9]{6}$/.test(formData.pincode)) {
            alert('Please enter a valid 6-digit Pincode.');
            return;
        }
        
        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            alert('Please enter a valid phone number (minimum 10 digits).');
            return;
        }

        setIsSubmitting(true);

        // Format the message for WhatsApp
        const message = `*🌟 New Hardcopy Order 🌟*

*Course:* Physics for ${formData.course}
*Name:* ${formData.name}
*Phone:* ${formData.phone}
*Delivery Address:*
${formData.address}
*Pincode:* ${formData.pincode}

_Please confirm my order and share payment details._`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/919962900969?text=${encodedMessage}`;

        // Add a tiny delay for visual feedback before opening WhatsApp
        setTimeout(() => {
            setIsSubmitting(false);
            window.open(whatsappUrl, '_blank');
        }, 600);
    };

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

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 flex-1 w-full relative z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-full mb-8 shadow-[0_0_25px_rgba(214,51,132,0.12)] border border-white/60">
                            <BookOpen className="w-5 h-5 text-[#d63384] mr-2" />
                            <span className="text-xs font-black tracking-widest text-[#d63384] uppercase">Premium Print Edition</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tighter">
                            Order Your{' '}
                            <span className="relative inline-block">
                                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#d63384] via-[#ff8fab] to-[#d63384]">
                                    Hardcopy Notes
                                </span>
                                <div className="absolute -bottom-2 left-0 w-full h-3 bg-[#d63384]/15 blur-md rounded-full"></div>
                            </span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed font-semibold">
                            Fill out your delivery details below to order a physical copy of our 
                            expert-prepared physics notes.
                        </p>
                    </div>

                    <div className="border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] transition-all duration-500 rounded-[2.2rem] p-8 relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-gradient-to-br from-pink-100 to-rose-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            
                            {/* Course Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Select Course Material</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <BookOpen className="h-5 w-5 text-[#d63384]" />
                                    </div>
                                    <select
                                        name="course"
                                        value={formData.course}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d63384] focus:border-transparent transition-all appearance-none font-bold text-gray-800"
                                    >
                                        <option value="MLT">Physics for MLT (Medical Laboratory Technology)</option>
                                        <option value="CCT">Physics for CCT (Critical Care Technology)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Name & Phone */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d63384] focus:border-transparent transition-all font-semibold"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handlePhoneChange}
                                            placeholder="+91 9876543210"
                                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d63384] focus:border-transparent transition-all font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address details */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Complete Delivery Address</label>
                                <div className="relative">
                                    <div className="absolute top-4 left-4 pointer-events-none">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        name="address"
                                        required
                                        rows={3}
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Flat/House No., Street Name, Landmark, City, State"
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d63384] focus:border-transparent transition-all resize-none font-semibold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Pincode</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    required
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={formData.pincode}
                                    onChange={handlePincodeChange}
                                    placeholder="e.g. 600001"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d63384] focus:border-transparent transition-all font-semibold"
                                />
                            </div>

                            {/* Submit area */}
                            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <div className="text-sm text-gray-500 font-semibold flex items-center justify-center sm:justify-start">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    You'll pay after confirming the order.
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#d63384] to-[#b5165a] hover:opacity-95 text-white font-extrabold rounded-xl shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Place Order on WhatsApp <Send className="w-5 h-5" /></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-8 bg-amber-50 rounded-2xl p-5 border border-amber-100">
                        <p className="text-amber-800 text-sm flex gap-3 leading-relaxed font-semibold">
                            <span className="text-amber-500 text-lg">ℹ️</span>
                            <span>
                                <strong>How it works:</strong> Submitting this form will open WhatsApp on your device with your provided details pre-filled. You can review and send the message. Our team will verify your details, share the final amount (including any delivery charges) and the UPI payment details to complete the order.
                            </span>
                        </p>
                    </div>
                </motion.div>
            </main>
            
            <Footer />
        </div>
    );
}
