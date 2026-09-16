import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, HelpCircle } from 'lucide-react';
import { AdvancedNav } from '@/components/ui/advanced-nav';
import { useNavigate } from 'react-router-dom';
import { SERVICE_PLANS } from '@/pages/Payments';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface PricingProps {
  onNavigate?: (page: 'landing' | 'login' | 'register' | 'dashboard' | 'submit' | 'pricing' | 'journal') => void;
}

// Real per-service pricing, sourced from the same SERVICE_PLANS used on the
// actual payments page — kept in sync by importing rather than duplicating.
const plans = SERVICE_PLANS.filter(s => s.id !== 'custom').map(s => ({
  id: s.id,
  name: s.title,
  description: s.desc,
  price: `₹${s.price.toLocaleString('en-IN')}`,
  period: s.turnaround,
  features: s.features,
  cta: 'Pay & Get Started',
  popular: s.id === 'language',
}));

const faqs = [
  {
    question: 'What is the typical turnaround time?',
    answer: 'Turnaround depends on the service — from 1–2 business days for a plagiarism report up to 4–7 business days for a full thesis literature review. Each service card above shows its own turnaround time.',
  },
  {
    question: 'How do you ensure quality?',
    answer: 'All manuscripts go through a rigorous quality control process. Each document is reviewed by expert editors and senior editors perform final quality checks before delivery.',
  },
  {
    question: 'Can I request revisions?',
    answer: 'Yes — revision scope is agreed with your editor before work begins. For larger or ongoing revision needs, choose the "Custom Payment" option and our team will quote accordingly.',
  },
  {
    question: 'Is my research secure and confidential?',
    answer: 'Absolutely. We use enterprise-grade encryption and strict confidentiality agreements. Your research is never shared with third parties, and all editors sign NDAs.',
  },
  {
    question: 'Do you support LaTeX documents?',
    answer: 'Yes, we support all major formats including DOC, DOCX, PDF, and LaTeX (TEX) files. Our editors are experienced with academic formatting in all these formats.',
  },
  {
    question: 'Can you help with journal submission?',
    answer: 'Yes! We provide journal-specific formatting and submission support for the Journal of Clinical Nursing and Allied Health Practice (JCN-AHP) and other major journals.',
  },
];

export default function Pricing({ onNavigate: _unused }: PricingProps) {
  const navigate = useNavigate();
  const onNavigate = (page: string) => {
    if (page === 'landing') navigate('/');
    else if (page === 'journal') navigate('/journal');
    else if (page === 'login') navigate('/portal-cRs7x9mK');
    else navigate('/contact');
  };
  const goToPayment = (serviceId: string) => navigate(`/payments?service=${serviceId}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col relative overflow-hidden">
      {/* Floating background blur elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/35 rounded-full blur-3xl opacity-50 pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl opacity-50 pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      <AdvancedNav />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pay per service, in INR, by UPI — no subscriptions. Pick a service below to pay and get started.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative border-2 ${plan.popular
                  ? 'border-[#d63384] shadow-xl scale-105'
                  : 'border-gray-100 hover:border-gray-200'
                  } transition-all`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#d63384] text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="pb-4">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-2">{plan.period}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-[#d63384] mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.popular
                      ? 'bg-[#d63384] hover:bg-[#b5165a] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    onClick={() => goToPayment(plan.id)}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => goToPayment('custom')}
              className="text-sm font-semibold text-[#d63384] hover:underline"
            >
              Need something else? Pay a custom quoted amount →
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Got questions? We've got answers.</p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg border border-gray-200 px-6">
                <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#d63384] to-[#b5165a] rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Still Have Questions?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Not sure which service fits? Send us your manuscript details and we'll recommend the right one — free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-[#d63384] hover:bg-gray-100" onClick={() => navigate('/contact')}>
                Talk to Our Team
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => onNavigate('journal')}>
                <HelpCircle className="mr-2 w-5 h-5" />
                Submit a Manuscript Inquiry
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.jpeg" alt="Cornerstone" className="w-10 h-10 object-contain rounded flex-shrink-0" />
                <span className="text-sm font-bold leading-tight">
                  Cornerstone Research<br />
                  <span className="text-xs font-semibold text-[#FFB7C5]">Service and Publications</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional academic publishing services for researchers worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => goToPayment('manuscript')} className="hover:text-[#d63384]">Manuscript Preparation</button></li>
                <li><button onClick={() => goToPayment('language')} className="hover:text-[#d63384]">Language Editing</button></li>
                <li><button onClick={() => goToPayment('proofreading')} className="hover:text-[#d63384]">Grammar & Proofreading</button></li>
                <li><button onClick={() => goToPayment('plagiarism')} className="hover:text-[#d63384]">Plagiarism Check</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => onNavigate('journal')} className="hover:text-[#d63384]">Journal</button></li>
                <li><button onClick={() => navigate('/contact')} className="hover:text-[#d63384]">About Us</button></li>
                <li><button onClick={() => navigate('/contact')} className="hover:text-[#d63384]">Careers</button></li>
                <li><button onClick={() => navigate('/contact')} className="hover:text-[#d63384]">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => navigate('/contact')} className="hover:text-[#d63384]">Help Center</button></li>
                <li><button onClick={() => window.open('/privacy-policy', '_blank')} className="hover:text-[#d63384]">Privacy Policy</button></li>
                <li><button onClick={() => window.open('/terms-of-service', '_blank')} className="hover:text-[#d63384]">Terms of Service</button></li>
                <li><a href="#faq" className="hover:text-[#d63384]">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2026 Cornerstone Research and Publication Services. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
