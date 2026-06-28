import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Instagram, Linkedin, MessageCircle } from 'lucide-react';

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#0b1120] text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-gray-800 pb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpeg"
                alt="Cornerstone"
                className="w-10 h-10 object-contain rounded flex-shrink-0 grayscale opacity-80"
              />
              <span className="text-white text-base font-bold leading-tight">
                Cornerstone Research<br />
                <span className="text-[#d63384] text-sm font-semibold">and Publication Services</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Providing premium academic publishing, professional editing, and 
              specialized research training for scholars worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={() => navigate('/journal')} className="hover:text-white transition-colors">Journals</button></li>
              <li><button onClick={() => navigate('/research-hub')} className="hover:text-white transition-colors">Research Training Hub</button></li>
              <li><button onClick={() => navigate('/physics-resources')} className="hover:text-white transition-colors">Physics Resources</button></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Legal & Privacy</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => navigate('/terms-of-service')} className="hover:text-white transition-colors">Terms of Service</button></li>
              <li><button onClick={() => navigate('/privacy-policy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">Contact Support</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Get In Touch</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-[#d63384]" />
                </div>
                <span>+91 9962900969</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#d63384]" />
                </div>
                <span className="truncate">info.cornerstoneresearch@gmail.com</span>
              </li>
              <li className="flex gap-4 pt-2">
                <a 
                  href="https://www.instagram.com/cornerstone_research_services" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#d63384] transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/cornerstone-research-and-publication-services" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#d63384] transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://wa.me/919962900969" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#d63384] transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center text-xs tracking-widest uppercase text-gray-500 font-medium">
          © 2026 Cornerstone Research and Publication Services. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
