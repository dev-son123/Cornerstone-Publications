// src/components/MobileLogo.tsx
// Shows logo on mobile only — tapping 5 times opens admin panel
// Add this inside your LandingPage.tsx hero section
//
// USAGE in LandingPage.tsx:
//   import { MobileLogo } from '@/components/MobileLogo';
//   const { logoTapHandler } = useAdminTrigger();
//   <MobileLogo logoTapHandler={logoTapHandler} />
//
// Place it at the TOP of your hero section — visible only on mobile

interface MobileLogoProps {
  logoTapHandler: () => void;
}

export function MobileLogo({ logoTapHandler }: MobileLogoProps) {
  return (
    // lg:hidden = hidden on desktop, shown on mobile/tablet
    <div className="flex lg:hidden justify-center mb-6 mt-4">
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-300/30 to-pink-100/20 blur-xl scale-110" />
        {/* Logo */}
        <img
          src="/logo.jpeg"
          alt="Cornerstone Research and Publication Services"
          onClick={logoTapHandler}
          className="relative w-24 h-24 rounded-full object-cover shadow-lg ring-4 ring-pink-200/50 ring-offset-2 ring-offset-white"
        />
        {/* Pulse dot */}
        <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-pink-400 animate-pulse border-2 border-white" />
      </div>
    </div>
  );
}
