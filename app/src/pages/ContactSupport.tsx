// src/pages/ContactSupport.tsx
// Clean version — uses ContactForm component wired to Supabase

import { Phone, Mail, MessageCircle } from 'lucide-react';
import { ContactForm } from '../components/ContactForm';

const ContactSupport = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Home</a>
        <h1 className="text-lg font-semibold">Contact &amp; Support</h1>
        <a href="/journal">
          <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Get Started
          </button>
        </a>
      </div>

      {/* Hero */}
      <div className="text-center py-16 px-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          We're Here to <span className="text-pink-500">Help</span>
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Have a question about our services, modules, or your submission?
          Reach out and we'll respond within 24 hours.
        </p>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 pb-16 grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Left — contact info */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Get in Touch</h3>

          <div className="space-y-4">
            <div className="bg-white border rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Phone</p>
                <p className="text-gray-500 text-sm">+91 9962900969</p>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-gray-500 text-sm">info.corneerstone@gmail.com</p>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Response Time</p>
                <p className="text-gray-500 text-sm">Within 24 hours on business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — form (wired to Supabase) */}
        <div>
          <ContactForm />
        </div>

      </div>
    </div>
  );
};

export default ContactSupport;
