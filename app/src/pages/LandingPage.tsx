import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminTrigger } from '@/pages/AdminDashboard';
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
  Phone,
  Mail
} from 'lucide-react';
import { SocialIcons } from '@/components/ui/social-icons';
import { AdvancedNav } from '@/components/ui/advanced-nav';
import { motion, AnimatePresence } from 'framer-motion';

const services = [
  {
    icon: FileText,
    title: 'Manuscript Preparation',
    description: 'End-to-end preparation of academic manuscripts for journal or conference submission. Includes formatting per journal guidelines (APA, MLA, IEEE, Chicago).',
    benefits: ['Reduces rejection risk', 'Saves researcher time', 'Improves acceptance probability'],
  },
  {
    icon: Languages,
    title: 'Language Editing',
    description: 'Professional editing focused on clarity, coherence, vocabulary enhancement, academic tone, and readability improvement.',
    benefits: ['Enhances credibility', 'Improves peer-review readability', 'Polished academic tone'],
  },
  {
    icon: SpellCheck,
    title: 'Grammar & Proofreading',
    description: 'Detailed grammar, spelling, punctuation, syntax, tense consistency, and style correction.',
    benefits: ['Ensures polished manuscript', 'Professional final output', 'Error-free submission'],
  },
  {
    icon: BookOpen,
    title: 'Thesis Literature Review',
    description: 'Assistance in organizing and refining thesis literature reviews including gap analysis and logical structuring.',
    benefits: ['Strengthens argumentation', 'Improves coherence', 'Better citation alignment'],
  },
  {
    icon: ShieldCheck,
    title: 'Plagiarism Detection',
    description: 'Integrated plagiarism checking with similarity index reports and source breakdown.',
    benefits: ['Ensures academic integrity', 'Originality compliance', 'Detailed reports'],
  },
];

const stats = [
  { value: '< 72h', label: 'Turnaround Time' },
  { value: '4.5/5', label: 'Client Satisfaction' },
  { value: '< 20%', label: 'Revision Rate' },
  { value: '99.9%', label: 'Platform Uptime' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  // ✅ Admin trigger: tap logo 5x on mobile, or press C→R→S on desktop
  const { logoTapHandler } = useAdminTrigger();

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
                <Button size="lg" className="bg-gradient-to-r from-[#d63384] to-[#b5165a] text-white px-8 hover:opacity-90 border-0 shadow-lg" onClick={() => navigate('/contact')}>
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" className="border-[#d63384] text-[#d63384] hover:bg-pink-50" onClick={() => navigate('/contact')}>
                  Contact
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
              <Card key={index} className="group hover:shadow-xl transition-shadow duration-300 border-[#F2C7C7]">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:opacity-90 transition-colors" style={{ background: '#F2C7C7' }}>
                    <service.icon className="w-6 h-6 text-[#d63384] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-[#d63384] mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {/* ✅ Footer logo — tap 5x on mobile to open admin */}
                <img
                  src="/logo.jpeg"
                  alt="Cornerstone"
                  className="w-10 h-10 object-contain rounded flex-shrink-0"
                  onClick={logoTapHandler}
                />
                <span className="text-base font-bold leading-tight">
                  Cornerstone Research<br />
                  <span className="text-sm font-semibold text-[#d63384]">and Publication Services</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional academic publishing services for researchers worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-[#d63384]">Manuscript Preparation</a></li>
                <li><a href="#" className="hover:text-[#d63384]">Language Editing</a></li>
                <li><a href="#" className="hover:text-[#d63384]">Grammar & Proofreading</a></li>
                <li><a href="#" className="hover:text-[#d63384]">Plagiarism Check</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => window.open('/journal', '_blank')} className="hover:text-[#d63384]">Journals</button></li>
                <li><button onClick={() => navigate('/research-hub')} className="hover:text-[#d63384]">Research Training Hub</button></li>
                <li><button onClick={() => navigate('/physics-resources')} className="hover:text-[#d63384]">Physics Class Resources</button></li>
                <li><button onClick={() => navigate('/contact')} className="hover:text-[#d63384]">Contact &amp; Support</button></li>
                <li><button onClick={() => window.open('/terms-of-service', '_blank')} className="hover:text-[#d63384]">Terms of Service</button></li>
                <li><button onClick={() => window.open('/privacy-policy', '_blank')} className="hover:text-[#d63384]">Privacy Policy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-[#d63384]" />
                  <a href="tel:+919962900969" className="hover:text-[#d63384]">+91 9962900969</a>
                </li>
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-[#d63384]" />
                  <a href="mailto:info.cornerstone@gmail.com" className="hover:text-[#d63384]">info.cornerstone@gmail.com</a>
                </li>
              </ul>
              <p className="text-sm text-gray-500 mt-4 mb-3">Follow Us</p>
              <div className="mt-2">
                <SocialIcons />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <span>© 2024 Cornerstone Research and Publication Services. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}