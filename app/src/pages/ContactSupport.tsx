import { useEffect } from 'react';
import { Mail, Phone, MessageCircle, Clock } from 'lucide-react';
import { ContactForm } from '../components/ContactForm';
import { AdvancedNav } from '../components/ui/advanced-nav';
import { Footer } from '../components/Footer';

const ContactSupport = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Contact Us | Cornerstone Research';
    const m = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const pd = m?.content ?? '';
    if (m) m.content = 'Get in touch with Cornerstone Research for manuscript editing, journal submission help, or PhD mentorship. We respond within 24 hours.';
    return () => { document.title = prev; if (m) m.content = pd; };
  }, []);
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdvancedNav />


      {/* Hero */}
      <div className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center px-4 py-2 bg-pink-100 rounded-full">
            <span className="text-[#d63384] text-sm font-medium">✨ Support for Researchers</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            We're Here to <span className="text-[#d63384]">Help</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question about our services, manuscript preparation, or your submission?
            Reach out and our expert team will respond within 24 hours.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 pb-16 grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Left — contact info */}
        <div className="flex flex-col gap-10">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Get in Touch</h3>
            <div className="space-y-4">
              <div className="group bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-[#d63384]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Phone</p>
                  <p className="text-gray-500 text-sm">+91 9962900969</p>
                </div>
              </div>

              <div className="group bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-[#d63384]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Email</p>
                  <p className="text-gray-500 text-sm">info.cornerstoneresearch@gmail.com</p>
                </div>
              </div>

              <a 
                href="https://wa.me/919962900969" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all block"
              >
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6 text-green-500" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">WhatsApp</p>
                  <p className="text-gray-500 text-sm">+91 9962900969</p>
                </div>
              </a>

              <div className="group bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-[#d63384]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Response Time</p>
                  <p className="text-gray-500 text-sm">Within 24 hours (Business Days)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl shadow-pink-100/50 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Send Us a Message</h3>
          <ContactForm />
        </div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default ContactSupport;
