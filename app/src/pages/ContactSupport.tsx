import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
    Mail, Phone, Instagram, Linkedin,
    MessageCircle, Users, Star, Heart
} from 'lucide-react';
import { toast } from 'sonner';
import { AnimatedMenuLink } from '@/components/ui/menu-hover-effects';

export default function ContactSupport() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        // Supabase/API integration goes here
        setSending(false);
        toast.success('Message sent! We\'ll get back to you within 24 hours.');
        setName(''); setEmail(''); setSubject(''); setMessage('');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <AnimatedMenuLink onClick={() => navigate('/')} text="← Back to Home" />
                        <span className="text-lg font-bold text-gray-900">Contact &amp; Support</span>
                        <Button onClick={() => window.open('mailto:cornerstoneresearch2022@gmail.com')} className="bg-[#d63384] hover:bg-[#b5165a] text-white">
                            Get Started
                        </Button>
                    </div>
                </div>
            </header>

            <main>
                {/* Contact Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-14">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                We're Here to <span className="text-[#d63384]">Help</span>
                            </h1>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Have a question about our services, modules, or your submission? Reach out and we'll respond within 24 hours.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* Contact Info */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                                    <div className="space-y-5">
                                        <a href="tel:+919962900969" className="flex items-center space-x-4 p-5 bg-gray-50 rounded-xl hover:bg-[#d63384]/5 transition-colors group">
                                            <div className="w-12 h-12 bg-[#d63384]/10 rounded-xl flex items-center justify-center group-hover:bg-[#d63384] transition-colors">
                                                <Phone className="w-6 h-6 text-[#d63384] group-hover:text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Phone</p>
                                                <p className="text-gray-600">+91 9962900969</p>
                                            </div>
                                        </a>
                                        <a href="mailto:info@cornerstonepublications.in" className="flex items-center space-x-4 p-5 bg-gray-50 rounded-xl hover:bg-[#d63384]/5 transition-colors group">
                                            <div className="w-12 h-12 bg-[#d63384]/10 rounded-xl flex items-center justify-center group-hover:bg-[#d63384] transition-colors">
                                                <Mail className="w-6 h-6 text-[#d63384] group-hover:text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Email</p>
                                                <p className="text-gray-600">info@cornerstonepublications.in</p>
                                            </div>
                                        </a>
                                        <div className="flex items-center space-x-4 p-5 bg-gray-50 rounded-xl">
                                            <div className="w-12 h-12 bg-[#d63384]/10 rounded-xl flex items-center justify-center">
                                                <MessageCircle className="w-6 h-6 text-[#d63384]" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Response Time</p>
                                                <p className="text-gray-600">Within 24 hours on business days</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Social media  */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
                                    <div className="flex gap-3">
                                        <a href="https://www.instagram.com/cornerstone_research_services" target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium">
                                            <Instagram className="w-4 h-4" /> Instagram
                                        </a>
                                        <a href="https://www.linkedin.com/company/cornerstone-research-and-publication-services/?viewAsMember=true" target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-3 bg-[#0077b5] text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium">
                                            <Linkedin className="w-4 h-4" /> LinkedIn
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <Card className="border border-gray-100 shadow-lg">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="c-name">Your Name</Label>
                                                <Input id="c-name" placeholder="Dr. Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="c-email">Email</Label>
                                                <Input id="c-email" type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="c-subject">Subject</Label>
                                            <Input id="c-subject" placeholder="What can we help with?" value={subject} onChange={e => setSubject(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="c-message">Message</Label>
                                            <Textarea id="c-message" rows={5} placeholder="Tell us more about your query…" value={message} onChange={e => setMessage(e.target.value)} required />
                                        </div>
                                        <Button type="submit" disabled={sending} className="w-full bg-[#d63384] hover:bg-[#b5165a] text-white h-12">
                                            {sending ? 'Sending…' : 'Send Message'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* ──── Community Section ──── */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FFB7C5]/20 via-pink-50 to-rose-100">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-14">
                            <div className="inline-flex items-center px-4 py-2 bg-pink-200 rounded-full mb-5">
                                <Heart className="w-4 h-4 text-pink-600 mr-2" />
                                <span className="text-sm font-medium text-pink-700">Our Community</span>
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Join the{' '}
                                <span className="bg-gradient-to-r from-[#FFB7C5] to-[#ff8fab] bg-clip-text text-transparent">
                                    Cornerstone Community
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Connect with researchers, clinicians, and academics who share your passion for advancing knowledge and improving academic publishing.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            {[
                                {
                                    icon: Users,
                                    title: '10,000+ Members',
                                    desc: 'A growing network of researchers, students, and healthcare professionals from across the globe.',
                                    color: 'from-pink-400 to-rose-500',
                                },
                                {
                                    icon: MessageCircle,
                                    title: 'Peer Discussions',
                                    desc: 'Share research insights, ask questions, and collaborate on manuscript challenges in a supportive environment.',
                                    color: 'from-[#FFB7C5] to-[#ff8fab]',
                                },
                                {
                                    icon: Star,
                                    title: 'Exclusive Resources',
                                    desc: 'Community members get early access to new modules, webinars, and special offers on training sessions.',
                                    color: 'from-rose-400 to-pink-600',
                                },
                            ].map((item, i) => (
                                <Card key={i} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                    <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                                    <CardContent className="p-8 text-center">
                                        <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                            <item.icon className="w-8 h-8 text-[#FFB7C5]" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="text-center">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-[#FFB7C5] to-[#ff8fab] text-white hover:opacity-90 border-0 px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            >
                                Join Our Community — It's Free
                            </Button>
                            <p className="text-sm text-gray-500 mt-4">No spam, ever. Unsubscribe anytime.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400 text-sm">© 2024 Cornerstone Research Service and Publications. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
