// src/components/WhatsAppButton.tsx
// Floating WhatsApp button — shows on every page
// Add <WhatsAppButton /> in App.tsx outside <Routes>

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const WHATSAPP_NUMBER = "919962900969";
const WHATSAPP_MESSAGE = "Hello! I'm interested in publishing my research with Cornerstone Publications. Could you please help me?";

export function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  if (
    searchParams.get('standalonevkjrrjonwrorn') === 'true' || 
    location.pathname === '/phd-mentorship' || 
    location.pathname === '/research'
  ) {
    return null;
  }

  const openWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Tooltip label */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            style={{
              position: 'absolute', bottom: 70, right: 0,
              background: '#1a1a2e', color: '#fff',
              padding: '10px 16px', borderRadius: 12,
              fontSize: 13, fontFamily: 'inherit',
              whiteSpace: 'nowrap', boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }}></span>
            Support Online
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Button */}
      <motion.button
        onClick={openWhatsApp}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        title="Chat with us on WhatsApp"
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 24px rgba(37, 211, 102, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
        aria-label="Chat on WhatsApp"
      >
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(rgba(255,255,255,0.2), transparent)',
          pointerEvents: 'none'
        }} />
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </motion.button>

      {/* Pulse animation */}
      <div style={{
        position: 'absolute', top: 0, left: 0, zIndex: -1,
        width: 64, height: 64, borderRadius: 20,
        background: 'rgba(37, 211, 102, 0.4)',
        animation: 'whatsapp-pulse 2s infinite',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes whatsapp-pulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          50%  { transform: scale(1.6); opacity: 0;   }
          100% { transform: scale(1);   opacity: 0;   }
        }
      `}</style>
    </div>
  );
}
