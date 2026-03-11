import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo, useCallback, Children } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, Mail, Lock, Eye, EyeOff, ArrowLeft, X, AlertCircle, PartyPopper, Loader } from "lucide-react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import type { Variants, Transition } from "framer-motion";
import { useTiltPrivacy } from "@/hooks/useTiltPrivacy";

import type { GlobalOptions as ConfettiGlobalOptions, CreateTypes as ConfettiInstance, Options as ConfettiOptions } from "canvas-confetti"
import confetti from "canvas-confetti"

type Api = { fire: (options?: ConfettiOptions) => void }
export type ConfettiRef = Api | null

const Confetti = forwardRef<ConfettiRef, React.ComponentPropsWithRef<"canvas"> & { options?: ConfettiOptions; globalOptions?: ConfettiGlobalOptions; manualstart?: boolean }>((props, ref) => {
    const { options, globalOptions = { resize: true, useWorker: true }, manualstart = false, ...rest } = props
    const instanceRef = useRef<ConfettiInstance | null>(null)
    const canvasRef = useCallback((node: HTMLCanvasElement) => {
        if (node !== null) {
            if (instanceRef.current) return
            instanceRef.current = confetti.create(node, { ...globalOptions, resize: true })
        } else {
            if (instanceRef.current) {
                instanceRef.current.reset()
                instanceRef.current = null
            }
        }
    }, [globalOptions])
    const fire = useCallback((opts = {}) => instanceRef.current?.({ ...options, ...opts }), [options])
    const api = useMemo(() => ({ fire }), [fire])
    useImperativeHandle(ref, () => api, [api])
    useEffect(() => { if (!manualstart) fire() }, [manualstart, fire])
    return <canvas ref={canvasRef} {...rest} />
})
Confetti.displayName = "Confetti";

type TextLoopProps = { children: React.ReactNode[]; className?: string; interval?: number; transition?: Transition; variants?: Variants; onIndexChange?: (index: number) => void; stopOnEnd?: boolean; };
export function TextLoop({ children, className, interval = 2, transition = { duration: 0.3 }, variants, onIndexChange, stopOnEnd = false }: TextLoopProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const items = Children.toArray(children);
    useEffect(() => {
        const intervalMs = interval * 1000;
        const timer = setInterval(() => {
            setCurrentIndex((current) => {
                if (stopOnEnd && current === items.length - 1) {
                    clearInterval(timer);
                    return current;
                }
                const next = (current + 1) % items.length;
                onIndexChange?.(next);
                return next;
            });
        }, intervalMs);
        return () => clearInterval(timer);
    }, [items.length, interval, onIndexChange, stopOnEnd]);
    const motionVariants: Variants = {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -20, opacity: 0 },
    };
    return (
        <div className={cn('relative inline-block whitespace-nowrap', className)}>
            <AnimatePresence mode='popLayout' initial={false}>
                <motion.div key={currentIndex} initial='initial' animate='animate' exit='exit' transition={transition} variants={variants || motionVariants}>
                    {items[currentIndex]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

interface BlurFadeProps { children: React.ReactNode; className?: string; variant?: { hidden: { y: number }; visible: { y: number } }; duration?: number; delay?: number; yOffset?: number; inView?: boolean; inViewMargin?: string; blur?: string; }
function BlurFade({ children, className, variant, duration = 0.4, delay = 0, yOffset = 6, inView = false, inViewMargin = "-50px", blur = "6px" }: BlurFadeProps) {
    const ref = useRef(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inViewResult = useInView(ref, { once: true, margin: inViewMargin as any });
    const isInView = !inView || inViewResult;
    const defaultVariants: Variants = {
        hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
        visible: { y: -yOffset, opacity: 1, filter: `blur(0px)` },
    };
    const combinedVariants = variant || defaultVariants;
    return (
        <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} exit="hidden" variants={combinedVariants} transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }} className={className}>
            {children}
        </motion.div>
    );
}

const glassButtonVariants = cva("relative isolate all-unset cursor-pointer rounded-full transition-all", { variants: { size: { default: "text-base font-medium", sm: "text-sm font-medium", lg: "text-lg font-medium", icon: "h-10 w-10" } }, defaultVariants: { size: "default" } });
const glassButtonTextVariants = cva("glass-button-text relative block select-none tracking-tighter", { variants: { size: { default: "px-6 py-3.5", sm: "px-4 py-2", lg: "px-8 py-4", icon: "flex h-10 w-10 items-center justify-center" } }, defaultVariants: { size: "default" } });
export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof glassButtonVariants> { contentClassName?: string; }
const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
    ({ className, children, size, contentClassName, onClick, ...props }, ref) => {
        const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
            const button = e.currentTarget.querySelector('button');
            if (button && e.target !== button) button.click();
        };
        return (
            <div className={cn("glass-button-wrap cursor-pointer rounded-full relative", className)} onClick={handleWrapperClick}>
                <button type={props.type || "button"} className={cn("glass-button relative z-10 w-full h-full", glassButtonVariants({ size }))} ref={ref} onClick={onClick} {...props}>
                    <span className={cn(glassButtonTextVariants({ size }), "w-full h-full", contentClassName)}>{children}</span>
                </button>
                <div className="glass-button-shadow rounded-full pointer-events-none"></div>
            </div>
        );
    }
);
GlassButton.displayName = "GlassButton";

const GradientBackground = () => (
    <>
        <style>
            {` @keyframes float1 { 0% { transform: translate(0, 0); } 50% { transform: translate(-10px, 10px); } 100% { transform: translate(0, 0); } } @keyframes float2 { 0% { transform: translate(0, 0); } 50% { transform: translate(10px, -10px); } 100% { transform: translate(0, 0); } } `}
        </style>
        <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <defs>
                <linearGradient id="rev_grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#d63384" stopOpacity="0.4" /><stop offset="100%" stopColor="#FFB7C5" stopOpacity="0.2" /></linearGradient>
                <linearGradient id="rev_grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#b5165a" stopOpacity="0.3" /><stop offset="50%" stopColor="#ec4899" stopOpacity="0.2" /><stop offset="100%" stopColor="#d63384" stopOpacity="0.1" /></linearGradient>
                <radialGradient id="rev_grad3" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" /><stop offset="100%" stopColor="#ff8fab" stopOpacity="0.1" /></radialGradient>
                <filter id="rev_blur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="35" /></filter>
                <filter id="rev_blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="25" /></filter>
                <filter id="rev_blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="45" /></filter>
            </defs>
            <g style={{ animation: 'float1 20s ease-in-out infinite' }}>
                <ellipse cx="200" cy="500" rx="250" ry="180" fill="url(#rev_grad1)" filter="url(#rev_blur1)" transform="rotate(-30 200 500)" />
                <rect x="500" y="100" width="300" height="250" rx="80" fill="url(#rev_grad2)" filter="url(#rev_blur2)" transform="rotate(15 650 225)" />
            </g>
            <g style={{ animation: 'float2 25s ease-in-out infinite' }}>
                <circle cx="650" cy="450" r="150" fill="url(#rev_grad3)" filter="url(#rev_blur3)" opacity="0.7" />
                <ellipse cx="50" cy="150" rx="180" ry="120" fill="#d63384" filter="url(#rev_blur2)" opacity="0.3" />
            </g>
        </svg>
    </>
);

export const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-6 h-6"> <g fillRule="evenodd" fill="none"> <g fillRule="nonzero" transform="translate(3, 2)"> <path fill="#4285F4" d="M57.8123233,30.1515267 C57.8123233,27.7263183 57.6155321,25.9565533 57.1896408,24.1212666 L29.4960833,24.1212666 L29.4960833,35.0674653 L45.7515771,35.0674653 C45.4239683,37.7877475 43.6542033,41.8844383 39.7213169,44.6372555 L39.6661883,45.0037254 L48.4223791,51.7870338 L49.0290201,51.8475849 C54.6004021,46.7020943 57.8123233,39.1313952 57.8123233,30.1515267"></path> <path fill="#34A853" d="M29.4960833,58.9921667 C37.4599129,58.9921667 44.1456164,56.3701671 49.0290201,51.8475849 L39.7213169,44.6372555 C37.2305867,46.3742596 33.887622,47.5868638 29.4960833,47.5868638 C21.6960582,47.5868638 15.0758763,42.4415991 12.7159637,35.3297782 L12.3700541,35.3591501 L3.26524241,42.4054492 L3.14617358,42.736447 C7.9965904,52.3717589 17.959737,58.9921667 29.4960833,58.9921667"></path> <path fill="#FBBC05" d="M12.7159637,35.3297782 C12.0932812,33.4944915 11.7329116,31.5279353 11.7329116,29.4960833 C11.7329116,27.4640054 12.0932812,25.4976752 12.6832029,23.6623884 L12.6667095,23.2715173 L3.44779955,16.1120237 L3.14617358,16.2554937 C1.14708246,20.2539019 0,24.7439491 0,29.4960833 C0,34.2482175 1.14708246,38.7380388 3.14617358,42.736447 L12.7159637,35.3297782"></path> <path fill="#EB4335" d="M29.4960833,11.4050769 C35.0347044,11.4050769 38.7707997,13.7975244 40.9011602,15.7968415 L49.2255853,7.66898166 C44.1130815,2.91684746 37.4599129,0 29.4960833,0 C17.959737,0 7.9965904,6.62018183 3.14617358,16.2554937 L12.6832029,23.6623884 C15.0758763,16.5505675 21.6960582,11.4050769 29.4960833,11.4050769"></path> </g> </g></svg>);
export const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-6 h-6"> <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" /> </svg>);

const modalSteps = [
    { message: "Authenticating...", icon: <Loader className="w-12 h-12 text-[#d63384] animate-spin" /> },
    { message: "Securing connection...", icon: <Loader className="w-12 h-12 text-[#d63384] animate-spin" /> },
    { message: "Finalizing...", icon: <Loader className="w-12 h-12 text-[#d63384] animate-spin" /> },
    { message: "Welcome Back!", icon: <PartyPopper className="w-12 h-12 text-pink-500" /> }
];
const TEXT_LOOP_INTERVAL = 1.0;

const DefaultLogo = () => (<img src="/logo.jpeg" alt="Cornerstone" className="w-10 h-10 object-contain rounded" />);

export interface AuthComponentProps {
    logo?: React.ReactNode;
    brandName?: string;
    onSuccess?: () => void;
    onGoogle?: () => void;
    onGithub?: () => void;
    onEmailSubmit?: (email: string, pass: string) => Promise<void>;
    isLogin?: boolean;
    onToggleMode?: () => void;
}

export function AuthComponent({
    logo = <DefaultLogo />, brandName = "Cornerstone", onSuccess, onGoogle, onEmailSubmit, isLogin = true, onToggleMode
}: AuthComponentProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [modalStatus, setModalStatus] = useState<'closed' | 'loading' | 'error' | 'success'>('closed');
    const [modalErrorMessage, setModalErrorMessage] = useState('');
    const confettiRef = useRef<ConfettiRef>(null);

    const { isObscured, requestPermission, needsPermission, permissionGranted } = useTiltPrivacy();

    const isEmailValid = /^\S+@\S+\.\S+$/.test(email);
    const isPasswordValid = password.length >= 6;

    const passwordInputRef = useRef<HTMLInputElement>(null);

    const fireSideCanons = () => {
        const fire = confettiRef.current?.fire;
        if (fire) {
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
            const particleCount = 50;
            fire({ ...defaults, particleCount, origin: { x: 0, y: 1 }, angle: 60 });
            fire({ ...defaults, particleCount, origin: { x: 1, y: 1 }, angle: 120 });
        }
    };

    const handleFormSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Prevent submission if currently authenticating
        if (modalStatus !== 'closed') return;

        // Perform basic validations before submission
        if (!isEmailValid) {
            setModalErrorMessage("Please enter a valid email address.");
            setModalStatus('error');
            return;
        }

        if (isForgotPassword) {
            setModalStatus('loading');
            setTimeout(() => {
                setModalStatus('success');
                setTimeout(() => {
                    setModalStatus('closed');
                    setIsForgotPassword(false);
                }, 1500);
            }, 1000);
            return;
        }

        if (!isPasswordValid) {
            setModalErrorMessage("Password must be at least 6 characters!");
            setModalStatus('error');
        } else {
            setModalStatus('loading');

            try {
                if (onEmailSubmit) {
                    await onEmailSubmit(email, password);
                }
                const loadingStepsCount = modalSteps.length - 1;
                const totalDuration = loadingStepsCount * TEXT_LOOP_INTERVAL * 1000;
                setTimeout(() => {
                    setModalStatus('success');
                    setTimeout(() => {
                        if (onSuccess) onSuccess();
                    }, 1500);
                }, totalDuration);
            } catch (error: any) {
                setModalErrorMessage(error.message || "An error occurred");
                setModalStatus('error');
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleFormSubmit();
        }
    };

    const closeModal = () => {
        setModalStatus('closed');
        setModalErrorMessage('');
    };

    useEffect(() => {
        if (modalStatus === 'success') {
            fireSideCanons();
        }
    }, [modalStatus]);

    const Modal = () => (
        <AnimatePresence>
            {modalStatus !== 'closed' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white border border-gray-200 shadow-2xl rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-4 mx-2">
                        {(modalStatus === 'error' || modalStatus === 'success') && <button onClick={closeModal} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-900 transition-colors"><X className="w-5 h-5" /></button>}
                        {modalStatus === 'error' && <>
                            <AlertCircle className="w-12 h-12 text-red-500" />
                            <p className="text-lg font-medium text-gray-900 text-center">{modalErrorMessage}</p>
                            <GlassButton onClick={closeModal} size="sm" className="mt-4">Try Again</GlassButton>
                        </>}
                        {modalStatus === 'loading' &&
                            <TextLoop interval={TEXT_LOOP_INTERVAL} stopOnEnd={true}>
                                {modalSteps.slice(0, -1).map((step, i) => <div key={i} className="flex flex-col items-center gap-4 text-gray-900">
                                    {step.icon}
                                    <p className="text-lg font-medium">{step.message}</p>
                                </div>
                                )}
                            </TextLoop>}
                        {modalStatus === 'success' &&
                            <div className="flex flex-col items-center gap-4 text-gray-900">
                                {modalSteps[modalSteps.length - 1].icon}
                                <p className="text-lg font-medium">{modalSteps[modalSteps.length - 1].message}</p>
                            </div>}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="bg-gray-50 min-h-screen w-screen flex flex-col">
            <style>{`
            input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { display: none !important; } input[type="password"]::-webkit-credentials-auto-fill-button, input[type="password"]::-webkit-strong-password-auto-fill-button { display: none !important; } input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active { -webkit-box-shadow: 0 0 0 30px transparent inset !important; -webkit-text-fill-color: #111827 !important; background-color: transparent !important; background-clip: content-box !important; transition: background-color 5000s ease-in-out 0s !important; color: #111827 !important; caret-color: #111827 !important; } input:autofill { background-color: transparent !important; background-clip: content-box !important; -webkit-text-fill-color: #111827 !important; color: #111827 !important; } input:-internal-autofill-selected { background-color: transparent !important; background-image: none !important; color: #111827 !important; -webkit-text-fill-color: #111827 !important; } input:-webkit-autofill::first-line { color: #111827 !important; -webkit-text-fill-color: #111827 !important; }
            @property --angle-1 { syntax: "<angle>"; inherits: false; initial-value: -75deg; } @property --angle-2 { syntax: "<angle>"; inherits: false; initial-value: -45deg; }
            .glass-button-wrap { --anim-time: 400ms; --anim-ease: cubic-bezier(0.25, 1, 0.5, 1); --border-width: clamp(1px, 0.0625em, 4px); position: relative; z-index: 2; transform-style: preserve-3d; transition: transform var(--anim-time) var(--anim-ease); } .glass-button-wrap:has(.glass-button:active) { transform: rotateX(25deg); } .glass-button-shadow { --shadow-cutoff-fix: 2em; position: absolute; width: calc(100% + var(--shadow-cutoff-fix)); height: calc(100% + var(--shadow-cutoff-fix)); top: calc(0% - var(--shadow-cutoff-fix) / 2); left: calc(0% - var(--shadow-cutoff-fix) / 2); filter: blur(clamp(2px, 0.125em, 12px)); transition: filter var(--anim-time) var(--anim-ease); pointer-events: none; z-index: 0; } .glass-button-shadow::after { content: ""; position: absolute; inset: 0; border-radius: 9999px; background: linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.05)); width: calc(100% - var(--shadow-cutoff-fix) - 0.25em); height: calc(100% - var(--shadow-cutoff-fix) - 0.25em); top: calc(var(--shadow-cutoff-fix) - 0.5em); left: calc(var(--shadow-cutoff-fix) - 0.875em); padding: 0.125em; box-sizing: border-box; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim-time) var(--anim-ease); opacity: 1; }
            .glass-button { -webkit-tap-highlight-color: transparent; backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all var(--anim-time) var(--anim-ease); background: linear-gradient(-75deg, rgba(255,255,255,0.8), rgba(255,255,255,0.9), rgba(255,255,255,0.8)); box-shadow: inset 0 0.125em 0.125em rgba(255,255,255,0.5), inset 0 -0.125em 0.125em rgba(0,0,0,0.05), 0 0.25em 0.125em -0.125em rgba(0,0,0,0.1), 0 0 0.1em 0.25em inset rgba(255,255,255,0.5), 0 0 0 0 rgba(255,255,255,1); border: 1px solid rgba(0,0,0,0.05); } .glass-button:hover { transform: scale(0.975); backdrop-filter: blur(0.01em); border-color: rgba(214, 51, 132, 0.2); } .glass-button-text { color: #111827; transition: all var(--anim-time) var(--anim-ease); } .glass-button-text::after { content: ""; display: block; position: absolute; width: calc(100% - var(--border-width)); height: calc(100% - var(--border-width)); top: calc(0% + var(--border-width) / 2); left: calc(0% + var(--border-width) / 2); box-sizing: border-box; border-radius: 9999px; overflow: clip; background: linear-gradient(var(--angle-2), transparent 0%, rgba(214, 51, 132, 0.3) 40% 50%, transparent 55%); z-index: 3; mix-blend-mode: multiply; pointer-events: none; background-size: 200% 200%; background-position: 0% 50%; transition: background-position calc(var(--anim-time) * 1.25) var(--anim-ease), --angle-2 calc(var(--anim-time) * 1.25) var(--anim-ease); } .glass-button:hover .glass-button-text::after { background-position: 25% 50%; } .glass-button:active .glass-button-text::after { background-position: 50% 15%; --angle-2: -15deg; } .glass-button::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 9999px; width: calc(100% + var(--border-width)); height: calc(100% + var(--border-width)); top: calc(0% - var(--border-width) / 2); left: calc(0% - var(--border-width) / 2); padding: var(--border-width); box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, rgba(214, 51, 132, 0.3) 0%, transparent 5% 40%, rgba(214, 51, 132, 0.3) 50%, transparent 60% 95%, rgba(214, 51, 132, 0.3) 100%), linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.5)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim-time) var(--anim-ease), --angle-1 500ms ease; box-shadow: inset 0 0 0 calc(var(--border-width) / 2) rgba(255,255,255,0.5); pointer-events: none; } .glass-button:hover::after { --angle-1: -125deg; } .glass-button:active::after { --angle-1: -75deg; }
            .glass-input-wrap { position: relative; z-index: 2; transform-style: preserve-3d; border-radius: 9999px; } .glass-input { display: flex; position: relative; width: 100%; align-items: center; gap: 0.5rem; border-radius: 9999px; padding: 0.25rem; -webkit-tap-highlight-color: transparent; backdrop-filter: blur(max(1px, 4px)); transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1); background: linear-gradient(-75deg, rgba(255,255,255,0.8), rgba(255,255,255,0.9), rgba(255,255,255,0.8)); box-shadow: inset 0 0.125em 0.125em rgba(255,255,255,0.5), inset 0 -0.125em 0.125em rgba(0,0,0,0.05), 0 0.25em 0.125em -0.125em rgba(0,0,0,0.1), 0 0 0.1em 0.25em inset rgba(255,255,255,0.5), 0 0 0 0 rgba(255,255,255,1); border: 1px solid rgba(0,0,0,0.1); } .glass-input-wrap:focus-within .glass-input { backdrop-filter: blur(0.01em); border-color: #d63384; box-shadow: 0 0 0 2px rgba(214, 51, 132, 0.2); } .glass-input::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 9999px; width: calc(100% + 2px); height: calc(100% + 2px); top: -1px; left: -1px; padding: 2px; box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, rgba(214, 51, 132, 0.3) 0%, transparent 5% 40%, rgba(214, 51, 132, 0.3) 50%, transparent 60% 95%, rgba(214, 51, 132, 0.3) 100%), linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.5)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1), --angle-1 500ms ease; pointer-events: none; } .glass-input-wrap:focus-within .glass-input::after { --angle-1: -125deg; } .glass-input-text-area { position: absolute; inset: 0; border-radius: 9999px; pointer-events: none; } .glass-input-text-area::after { content: ""; display: block; position: absolute; width: calc(100% - 2px); height: calc(100% - 2px); top: 1px; left: 1px; box-sizing: border-box; border-radius: 9999px; overflow: clip; background: linear-gradient(var(--angle-2), transparent 0%, rgba(214, 51, 132, 0.1) 40% 50%, transparent 55%); z-index: 3; mix-blend-mode: multiply; pointer-events: none; background-size: 200% 200%; background-position: 0% 50%; transition: background-position calc(400ms * 1.25) cubic-bezier(0.25, 1, 0.5, 1), --angle-2 calc(400ms * 1.25) cubic-bezier(0.25, 1, 0.5, 1); } .glass-input-wrap:focus-within .glass-input-text-area::after { background-position: 25% 50%; }
        `}</style>

            <Confetti ref={confettiRef} manualstart className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]" />
            <Modal />

            <div className={cn("flex w-full flex-1 h-full items-center justify-center bg-white", "relative overflow-hidden")}>
                <div className="absolute inset-0 z-0"><GradientBackground /></div>
                <fieldset disabled={modalStatus !== 'closed'} className="relative z-10 flex flex-col items-center gap-8 w-full max-w-[400px] mx-auto p-4">

                    <BlurFade delay={0.1} className="w-full flex flex-col items-center mb-4 gap-2">
                        <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-sm")}>
                            {logo}
                            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">{brandName}</h1>
                        </div>
                        {needsPermission && !permissionGranted && (
                            <button type="button" onClick={requestPermission} className="text-xs text-[#d63384] hover:text-[#b5165a] transition-colors font-medium flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Enable Privacy Shield (Tilt detection)
                            </button>
                        )}
                        {permissionGranted && (
                            <span className="text-xs text-pink-600 font-medium flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Privacy Shield Active
                            </span>
                        )}
                    </BlurFade>

                    <AnimatePresence mode="wait">
                        <motion.div key="intro-content" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full flex flex-col items-center gap-4">
                            <BlurFade delay={0} className="w-full"><div className="text-center"><p className="font-serif font-light text-4xl sm:text-5xl tracking-tight text-gray-900 whitespace-nowrap">{isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}</p></div></BlurFade>
                            <BlurFade delay={0.1}><p className="text-sm font-medium text-gray-500">{isForgotPassword ? "Retrieve your account for" : isLogin ? "Sign in to" : "Join"} {brandName}</p></BlurFade>
                            <BlurFade delay={0.2} className="w-full">
                                <div className="flex flex-col items-center justify-center gap-2 w-full px-4 text-center">
                                    <p className="text-sm font-semibold text-gray-500">{isForgotPassword ? "Confirm your Email Address" : isLogin ? "Sign in" : "Sign up"} {isForgotPassword ? "below" : "with your Email Address"}</p>
                                </div>
                            </BlurFade>
                            <BlurFade delay={0.3} className="w-[300px]"><div className="flex items-center w-full gap-2 py-2"><hr className="w-full border-gray-200" /><span className="text-xs font-semibold text-gray-400">CONTINUE BELOW</span><hr className="w-full border-gray-200" /></div></BlurFade>
                        </motion.div>
                    </AnimatePresence>

                    <form onSubmit={handleFormSubmit} className="w-[300px] space-y-6">
                        <AnimatePresence mode="wait">
                            {!isForgotPassword ? (
                                <motion.div key="email-password-fields" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.3, ease: "easeOut" }} className={cn("w-full space-y-4 transition-all duration-300", isObscured ? "blur-md opacity-30 select-none pointer-events-none" : "blur-none opacity-100")}>
                                    <BlurFade delay={0.4} inView={false} className="w-full relative">
                                        <div className="glass-input-wrap w-full"><div className="glass-input">
                                            <span className="glass-input-text-area"></span>
                                            <div className={cn("relative z-10 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out", "w-10 pl-2")}><Mail className="h-5 w-5 text-gray-400 flex-shrink-0" /></div>
                                            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} className={cn("relative z-10 h-full flex-grow bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none transition-[padding-right] duration-300 ease-in-out font-medium", "pr-2")} />
                                        </div></div>
                                    </BlurFade>
                                    <BlurFade delay={0.5} inView={false} className="w-full mt-4">
                                        <div className="relative w-full">
                                            <div className="glass-input-wrap w-full"><div className="glass-input">
                                                <span className="glass-input-text-area"></span>
                                                <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                                                    <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                                                </div>
                                                <input ref={passwordInputRef} type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} className="relative z-10 h-full w-0 flex-grow bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none font-medium" />
                                                <div className="relative z-10 flex-shrink-0 flex items-center justify-center pr-1 pl-1">
                                                    <GlassButton type="submit" size="icon" aria-label="Submit form" contentClassName="text-white hover:text-white bg-[#d63384] hover:bg-[#b5165a] rounded-full border-0 shadow-lg flex items-center justify-center" className="bg-[#d63384] !border-none">
                                                        <ArrowRight className="w-5 h-5" />
                                                    </GlassButton>
                                                </div>
                                            </div></div>
                                        </div>
                                        <BlurFade inView={false} delay={0.6}>
                                            <div className="flex flex-col items-center justify-center w-full gap-3 mt-4 mb-2">
                                                {isLogin && (
                                                    <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-[#d63384] hover:text-[#b5165a] transition-colors font-medium hover:underline">
                                                        Forgot your password?
                                                    </button>
                                                )}
                                            </div>
                                        </BlurFade>
                                    </BlurFade>
                                </motion.div>
                            ) : (
                                <motion.div key="forgot-fields" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, filter: 'blur(4px)' }} transition={{ duration: 0.3, ease: "easeOut" }} className={cn("w-full space-y-4 transition-all duration-300", isObscured ? "blur-md opacity-30 select-none pointer-events-none" : "blur-none opacity-100")}>
                                    <BlurFade delay={0.4} inView={false} className="w-full relative">
                                        <div className="glass-input-wrap w-full"><div className="glass-input">
                                            <span className="glass-input-text-area"></span>
                                            <div className={cn("relative z-10 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out", "w-10 pl-2")}><Mail className="h-5 w-5 text-gray-400 flex-shrink-0" /></div>
                                            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} className={cn("relative z-10 h-full w-0 flex-grow bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none transition-[padding-right] duration-300 ease-in-out font-medium", "pr-2")} />
                                            <div className="relative z-10 flex-shrink-0 flex items-center justify-center pr-1 pl-1">
                                                <GlassButton type="submit" size="icon" aria-label="Submit reset" contentClassName="text-white hover:text-white bg-[#d63384] hover:bg-[#b5165a] rounded-full border-0 shadow-lg flex items-center justify-center" className="bg-[#d63384] !border-none">
                                                    <ArrowRight className="w-5 h-5" />
                                                </GlassButton>
                                            </div>
                                        </div></div>
                                    </BlurFade>
                                    <BlurFade inView={false} delay={0.5}>
                                        <div className="flex flex-col items-center justify-center w-full gap-3 mt-4 mb-2">
                                            <button type="button" onClick={() => setIsForgotPassword(false)} className="text-xs text-gray-500 hover:text-gray-900 transition-colors font-medium hover:underline flex items-center gap-1">
                                                <ArrowLeft className="w-3 h-3" /> Back to sign in
                                            </button>
                                        </div>
                                    </BlurFade>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!isForgotPassword && onGoogle && (
                            <BlurFade delay={0.4} inView={false} className="w-full mt-2">
                                <GlassButton type="button" onClick={onGoogle} size="sm" className="w-full border-gray-200/50" contentClassName="flex items-center justify-center gap-2 w-full px-2 text-sm font-medium text-gray-700 bg-white/50">
                                    <GoogleIcon className="w-4 h-4 flex-shrink-0" />
                                    Continue with Google
                                </GlassButton>
                            </BlurFade>
                        )}

                        {!isForgotPassword && onToggleMode && (
                            <BlurFade delay={0.1} inView={true} className="w-full text-center mt-4">
                                <button type="button" onClick={onToggleMode} className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium hover:underline">
                                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                                </button>
                            </BlurFade>
                        )}

                    </form>
                </fieldset>
            </div>
        </div>
    );
}
