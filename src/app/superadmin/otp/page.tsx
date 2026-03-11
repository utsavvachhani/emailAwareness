"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, RefreshCw, Clock, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setCredentials } from "@/lib/redux/authSlice";
import { toast } from "sonner";

const OtpVerifyPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        router.prefetch("/superadmin/dashboard");

        // Get user email from session storage
        const pendingUserData = sessionStorage.getItem('pendingUser');
        if (pendingUserData) {
            const userData = JSON.parse(pendingUserData);
            setUserEmail(userData.email);
        } else {
            // If no pending user, redirect to signin
            router.push("/superadmin/signin");
        }
    }, [router]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    // Format timer as mm:ss
    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    // Calculate timer progress percentage
    const timerProgress = (timeLeft / 300) * 100;

    // Handle OTP input change
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take last digit
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split("").forEach((char, idx) => {
            if (idx < 6) newOtp[idx] = char;
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    // Handle OTP verification
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join("");

        if (otpString.length !== 6) {
            toast.error("Please enter all 6 digits");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userEmail,
                    otp: otpString,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'OTP verification failed');
            }

            // Dispatch to Redux (this also handles localStorage persistence)
            dispatch(setCredentials({
                user: data.user,
                token: data.accessToken || data.token
            }));

            // Clear pending user data
            sessionStorage.removeItem('pendingUser');

            toast.success("Identity verified successfully!");

            // Navigate to dashboard
            setTimeout(() => {
                router.push("/superadmin/dashboard");
            }, 800);

        } catch (err: any) {
            toast.error(err.message || 'Invalid or expired code, please try again.');
            setIsLoading(false);
            inputRefs.current[0]?.focus();
        }
    };

    // Resend OTP
    const handleResend = useCallback(async () => {
        if (timeLeft > 240) {
            toast.error("Please wait a minute before requesting another code.");
            return;
        }

        setIsLoading(true);

        try {
            const pendingUserData = sessionStorage.getItem('pendingUser');
            if (!pendingUserData) {
                throw new Error('Session expired. Please sign in again.');
            }

            const userData = JSON.parse(pendingUserData);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userData.email,
                }),
            });

            if (!response.ok) throw new Error("Failed to resend code");

            setTimeLeft(300);
            setOtp(["", "", "", "", "", ""]);
            toast.success("A new verification code has been sent!");

        } catch (err: any) {
            toast.error(err.message || "Failed to resend code");
        } finally {
            setIsLoading(false);
            inputRefs.current[0]?.focus();
        }
    }, [timeLeft]);

    const isOtpComplete = otp.every((digit) => digit !== "") && !isLoading;

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">

            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>

            {/* Main Card Container */}
            <div className="relative z-10 w-full max-w-6xl mx-4 lg:mx-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">

                    {/* Left Side - Branding & Info */}
                    <div className="hidden lg:block space-y-8 text-white px-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20">
                                    <Shield className="w-8 h-8 text-white" strokeWidth={2} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">
                                        CyberShield Guard
                                    </h1>
                                    <p className="text-sm text-white/60">Enterprise Security Platform</p>
                                </div>
                            </div>

                            <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-white">
                                Verify Your
                                <span className="block text-white/80">
                                    Identity
                                </span>
                            </h2>

                            <p className="text-lg text-white/60 leading-relaxed">
                                We've sent a 6-digit verification code to your email. Enter it below to complete your authentication.
                            </p>
                        </div>

                        {/* Feature List */}
                        <div className="space-y-4">
                            {[
                                "Two-factor authentication",
                                "Email verification",
                                "Secure access control",
                            ].map((text, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 border border-white/20">
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    </div>
                                    <span className="text-white/70">
                                        {text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - OTP Form */}
                    <div className="relative">
                        {/* Form Card */}
                        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/20 p-8 lg:p-10">

                            {/* Mobile Logo */}
                            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/20">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold text-white">CyberShield</span>
                            </div>

                            <div className="text-center mb-8">
                                <h3 className="text-3xl font-bold text-white mb-2">Verify OTP</h3>
                                <p className="text-white/60">Enter the 6-digit code sent to your email</p>
                            </div>

                            {/* Timer Progress Bar */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm">Time remaining</span>
                                    </div>
                                    <span className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${timeLeft < 60 ? 'bg-red-400' : 'bg-white'}`}
                                        style={{ width: `${timerProgress}%` }}
                                    />
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">

                                {/* OTP Input Boxes */}
                                <div className="flex gap-2 sm:gap-3 justify-center">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { inputRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={index === 0 ? handlePaste : undefined}
                                            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl bg-white/5 border-2 border-white/10 text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                            autoFocus={index === 0}
                                            disabled={isLoading}
                                        />
                                    ))}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!isOtpComplete || isLoading}
                                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 group ${isOtpComplete && !isLoading
                                        ? 'bg-white text-black hover:bg-white/90 shadow-lg shadow-white/5'
                                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                                        }`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            Verify & Continue
                                            <ArrowRight className={`w-5 h-5 transition-transform ${isOtpComplete ? 'group-hover:translate-x-1' : ''}`} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Resend OTP */}
                            <div className="mt-8 text-center">
                                <button
                                    onClick={handleResend}
                                    disabled={isLoading}
                                    className={`inline-flex items-center gap-2 transition-all ${isLoading ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white'}`}
                                >
                                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    <span className="text-sm font-medium border-b border-transparent hover:border-white transition-all">Resend verification code</span>
                                </button>
                            </div>

                            {/* Back to Sign In */}
                            <div className="mt-6 text-center">
                                <Link
                                    href="/superadmin/signin"
                                    className="text-sm text-white/40 hover:text-white/80 transition-colors underline underline-offset-4"
                                >
                                    ← Back to Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtpVerifyPage;
