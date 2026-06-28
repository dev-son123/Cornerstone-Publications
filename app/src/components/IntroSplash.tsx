import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function IntroSplash() {
    const [phase, setPhase] = useState<'logo' | 'text' | 'exit'>('logo');
    const [isVisible, setIsVisible] = useState(true);

    const onComplete = () => setIsVisible(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        // Phase 1: Show just a circle logo
        const t1 = setTimeout(() => setPhase('text'), 1000);
        // Phase 2: Show text below
        const t2 = setTimeout(() => setPhase('exit'), 2800);
        // Phase 3: Begin exit
        const t3 = setTimeout(() => {
            document.body.style.overflow = 'unset';
            onComplete();
        }, 3700);

        // Also exit on first scroll
        const handleScroll = () => {
            if (window.scrollY > 5) {
                setPhase('exit');
                setTimeout(() => {
                    document.body.style.overflow = 'unset';
                    onComplete();
                }, 700);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            window.removeEventListener('scroll', handleScroll);
            document.body.style.overflow = 'unset';
        };
    }, []);

    const isExiting = phase === 'exit';

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {!isExiting && (
                <motion.div
                    key="splash"
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                    {/* Background radial gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#fff5f9_0%,_#ffffff_70%)] pointer-events-none" />

                    {/* Pulsing ring */}
                    <motion.div
                        className="absolute w-80 h-80 rounded-full border-2 border-[#d63384]/10"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute w-64 h-64 rounded-full border border-[#d63384]/20"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.15, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    />

                    {/* Logo circle */}
                    <motion.div
                        className="relative z-10"
                        layoutId="nav-logo"
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                        <div className="w-44 h-44 rounded-full overflow-hidden ring-4 ring-[#d63384]/25 ring-offset-4 shadow-2xl bg-white flex items-center justify-center">
                            <img src="/logo.jpeg" alt="Cornerstone" className="w-[110%] h-[110%] object-cover object-center" />
                        </div>
                    </motion.div>

                    {/* Brand text */}
                    <AnimatePresence>
                        {phase === 'text' && (
                            <motion.div
                                key="text"
                                className="mt-8 text-center z-10"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            >
                                <p className="text-2xl font-bold text-gray-900 tracking-tight">
                                    Cornerstone Research
                                </p>
                                <p className="text-base font-semibold text-[#d63384] mt-1">
                                    and Publication Services
                                </p>
                                <motion.p
                                    className="text-sm text-gray-400 mt-4 font-medium tracking-wider uppercase"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                >
                                    Guiding Scholars from Draft to Discovery
                                </motion.p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Scroll hint */}
                    <AnimatePresence>
                        {phase === 'text' && (
                            <motion.div
                                className="absolute bottom-12 flex flex-col items-center gap-2 text-gray-400"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                            >
                                <span className="text-xs tracking-widest uppercase font-medium">Please wait...</span>
                                <motion.div
                                    className="w-5 h-8 rounded-full border-2 border-pink-200 flex items-start justify-center pt-1.5"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <motion.div
                                        className="w-1 h-1.5 rounded-full bg-[#d63384]"
                                        animate={{ y: [0, 10, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
