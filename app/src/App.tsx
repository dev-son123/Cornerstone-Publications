import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
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
import { IntroSplash } from '@/components/IntroSplash';
import AuthCallback from '@/pages/AuthCallback';
import PhDMentorship from '@/pages/PhDMentorship';

const AnimatedLayout = () => {
  const location = useLocation();
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
  // Always show splash animation when user opens or refreshes the web app
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <AuthProvider>
      <AnimatePresence>
        {!splashDone && <IntroSplash onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {splashDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <BrowserRouter>
            <Routes>
              <Route element={<AnimatedLayout />}>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/research-hub" element={<ResearchHub />} />
                <Route path="/physics-resources" element={<PhysicsResources />} />
                <Route path="/contact" element={<ContactSupport />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                {/* Admin route */}
                <Route path="/portal-cRs7x9mK" element={<AdminPortal />} />
              </Route>
              <Route path="/phd-mentorship" element={<PhDMentorship />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </motion.div>
      )}
    </AuthProvider>
  );
}

export default App;
