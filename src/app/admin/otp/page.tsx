"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, RefreshCw, Clock, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { verifyAdminOtp, resendAdminOtp } from "@/actions/auth";

const AdminOTPPage = () => {
    const router = useRouter();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(600);
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [verified, setVerified] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const data = sessionStorage.getItem("pendingVerification");
        if (data) {
            const parsed = JSON.parse(data);
            setUserEmail(parsed.email);
        } else {
            router.push("/admin/signup");
        }
    }, [router]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [timeLeft]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    };

    const handleChange = (i: number, v: string) => {
        if (!/^\d*$/.test(v)) return;
        const n = [...otp];
        n[i] = v.slice(-1);
        setOtp(n);
        if (v && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const d = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(d)) return;
        const n = [...otp];
        d.split("").forEach((c, i) => { if (i < 6) n[i] = c; });
        setOtp(n);
        inputRefs.current[Math.min(d.length, 5)]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpStr = otp.join("");
        if (otpStr.length !== 6) { toast.error("Enter all 6 digits"); return; }
        setIsLoading(true);

        try {
            const { data, error } = await verifyAdminOtp({ email: userEmail, otp: otpStr });

            if (error) throw new Error(error.message || "Verification failed");

            setVerified(true);
            sessionStorage.removeItem("pendingVerification");
            toast.success("Email verified! Your account is pending superadmin approval.");
        } catch (err: any) {
            toast.error(err.message || "Invalid OTP");
            setIsLoading(false);
            inputRefs.current[0]?.focus();
        }
    };

    const handleResend = useCallback(async () => {
        setIsLoading(true);
        try {
            const { error } = await resendAdminOtp({ email: userEmail });
            if (error) throw new Error("Failed to resend");
            setTimeLeft(600);
            setOtp(["", "", "", "", "", ""]);
            toast.success("New OTP sent!");
        } catch (err: any) {
            toast.error(err.message || "Failed to resend OTP");
        } finally {
            setIsLoading(false);
            inputRefs.current[0]?.focus();
        }
    }, [userEmail]);

    if (verified) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="bg-white/5 border border-blue-500/20 rounded-3xl p-12 max-w-md w-full mx-4 text-center">
                    <div className="w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Email Verified!</h2>
                    <p className="text-white/60 mb-8">
                        Your admin account is now <strong className="text-yellow-400">pending superadmin approval</strong>. You'll receive an email once your account is approved.
                    </p>
                    <Link
                        href="/admin/signin"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-500 transition-all"
                    >
                        Go to Sign In <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-black to-indigo-950 opacity-80" />

            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
                        <p className="text-white/50 text-sm mt-2">
                            Enter the 6-digit code sent to<br />
                            <span className="text-blue-400 font-medium">{userEmail}</span>
                        </p>
                    </div>

                    {/* Timer */}
                    <div className="mb-6">
                        <div className="flex justify-between mb-2 text-sm">
                            <div className="flex items-center gap-1 text-white/50"><Clock className="w-4 h-4" /><span>Time remaining</span></div>
                            <span className={`font-mono font-bold ${timeLeft < 60 ? "text-red-400" : "text-white"}`}>{formatTime(timeLeft)}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${timeLeft < 60 ? "bg-red-400" : "bg-blue-500"}`}
                                style={{ width: `${(timeLeft / 600) * 100}%` }}
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex gap-2 justify-center">
                            {otp.map((d, i) => (
                                <input
                                    key={i}
                                    ref={el => { inputRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={d}
                                    onChange={e => handleChange(i, e.target.value)}
                                    onKeyDown={e => handleKeyDown(i, e)}
                                    onPaste={i === 0 ? handlePaste : undefined}
                                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white/5 border-2 border-white/10 text-white focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                                    autoFocus={i === 0}
                                    disabled={isLoading}
                                />
                            ))}
                        </div>
                        <button
                            type="submit"
                            disabled={otp.join("").length !== 6 || isLoading}
                            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                                otp.join("").length === 6 && !isLoading ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-white/5 text-white/30 cursor-not-allowed"
                            }`}
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Verify Email <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleResend}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                            Resend verification code
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <Link href="/admin/signup" className="text-sm text-white/30 hover:text-white/60 transition-colors underline underline-offset-4">
                            ← Back to Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOTPPage;
