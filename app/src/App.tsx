import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/pages/LandingPage';
import { AdminPortal } from './components/admin/AdminPortal';
import Journal from '@/pages/Journal';
import ResearchHub from '@/pages/ResearchHub';
import PhysicsResources from '@/pages/PhysicsResources';
import ContactSupport from '@/pages/ContactSupport';
import TermsOfService from '@/pages/TermsOfService';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import { AuthProvider } from '@/context/AuthContext';

import AuthCallback from '@/pages/AuthCallback';
import PhDMentorship from '@/pages/PhDMentorship';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import NotFound from '@/pages/NotFound';
import Payments from '@/pages/Payments';
import OrderHardcopy from '@/pages/OrderHardcopy';
import Pricing from '@/pages/Pricing';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

/**
 * Catches OAuth tokens that Supabase puts in the URL hash fragment
 * (e.g. /#access_token=...) and processes them before rendering the app.
 */
const HashRedirectHandler = ({ children }: { children: React.ReactNode }) => {
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    // Detect Supabase OAuth hash tokens
    if (hash && (hash.includes('access_token') || hash.includes('refresh_token') || hash.includes('error_description'))) {
      setProcessing(true);

      // Supabase client automatically picks up the hash tokens
      // We just need to wait for the session to be established
      const handleHashSession = async () => {
        // Give Supabase a moment to process the hash
        await new Promise(r => setTimeout(r, 500));
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Clear the hash from the URL
          window.history.replaceState(null, '', window.location.pathname);
          sessionStorage.setItem('adminPortalSession', 'true');
          navigate('/portal-cRs7x9mK', { replace: true, state: { fromAuth: true } });
        } else {
          // No session established, clear hash and show the normal page
          window.history.replaceState(null, '', window.location.pathname);
          setProcessing(false);
        }
      };

      handleHashSession();
      return;
    }
  }, [navigate]);

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 text-gray-600">
          <Loader2 className="w-10 h-10 animate-spin text-[#FFB7C5]" />
          <p className="text-lg font-medium">Finishing sign-in…</p>
          <p className="text-sm text-gray-400">Please wait, you'll be redirected shortly.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AnimatedLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // PhD shortcut logic

  useEffect(() => {
    let keySequence = '';
    const targetSequence = 'phd';

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      keySequence += e.key.toLowerCase();
      if (keySequence.length > targetSequence.length) {
        keySequence = keySequence.slice(-targetSequence.length);
      }

      if (keySequence === targetSequence) {
        window.open('/phd-mentorship', '_blank');
        keySequence = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (

    <AuthProvider>
      <BrowserRouter>
        <HashRedirectHandler>
        <div className="min-h-screen">


          <Routes>
            <Route element={<AnimatedLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/research-hub" element={<ResearchHub />} />
              <Route path="/physics-resources" element={<PhysicsResources />} />
              <Route path="/contact" element={<ContactSupport />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/portal-cRs7x9mK" element={<AdminPortal />} />
              <Route path="/phd-mentorship" element={<PhDMentorship />} />
              <Route path="/research" element={<PhDMentorship />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/order-hardcopy" element={<OrderHardcopy />} />
              <Route path="/pricing" element={<Pricing onNavigate={() => {}} />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          
          <Toaster />
          <WhatsAppButton />
        </div>
        </HashRedirectHandler>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
