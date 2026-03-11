"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Loader2 } from "lucide-react"

export interface OTPVerificationProps {
    contactInfo: string;
    onVerify: (otp: string) => void;
    onResend: () => void;
    isLoading: boolean;
    length?: number;
    onBack?: () => void;
}

export function OTPVerification({ contactInfo, onVerify, onResend, isLoading, length = 6, onBack }: OTPVerificationProps) {
    const [otp, setOtp] = useState<string[]>(Array(length).fill(""))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        } else if (e.key === "Enter") {
            const otpCode = otp.join("")
            if (otpCode.length === length) {
                onVerify(otpCode)
            }
        }
    }

    const handleVerifyClick = () => {
        const otpCode = otp.join("")
        if (otpCode.length === length) {
            onVerify(otpCode)
        }
    }

    // Auto verify when filled
    useEffect(() => {
        const otpCode = otp.join("")
        if (otpCode.length === length && !isLoading) {
            onVerify(otpCode)
        }
    }, [otp, length, isLoading, onVerify])

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900 p-4">
            <div className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                        alt="Abstract tunnel animation"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-pink-600/80 via-pink-800/90 to-black/95" />
                </div>

                <div className="relative z-10 p-8 py-14">
                    {onBack && (
                        <button onClick={onBack} className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        </button>
                    )}

                    <div className="text-center mb-8 mt-4">
                        <div className="w-12 h-12 mx-auto mb-6 text-white bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M13 0L4 14h6l-2 10 9-14h-6l2-10z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-semibold text-white mb-3">Enter verification code</h1>
                        <p className="text-white/70 text-sm leading-relaxed">
                            We sent a verification code to
                            <br />
                            <span className="text-white font-medium">{contactInfo}</span>
                        </p>
                    </div>

                    <div className="flex justify-center gap-2 mb-8">
                        {otp.map((digit, index) => (
                            <div key={index} className="relative">
                                <input
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    disabled={isLoading}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-11 h-12 text-center text-xl font-medium bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/20 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 outline-none shadow-lg opacity-100 rounded-xl"
                                    placeholder=""
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mb-6">
                        <button
                            onClick={handleVerifyClick}
                            disabled={isLoading || otp.join("").length !== length}
                            className="w-full py-3 bg-white text-pink-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                            ) : (
                                "Verify Account"
                            )}
                        </button>
                    </div>

                    <div className="text-center mb-8">
                        <span className="text-white/60 text-sm">Didn't get the code? </span>
                        <button
                            onClick={onResend}
                            disabled={isLoading}
                            className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                        >
                            Resend
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-white/50 text-xs leading-relaxed">
                            By continuing, you agree to our{" "}
                            <button className="text-white/70 hover:text-white underline transition-colors">Terms of Service</button> &{" "}
                            <button className="text-white/70 hover:text-white underline transition-colors">Privacy Policy</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
