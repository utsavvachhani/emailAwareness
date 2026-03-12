"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserCircle, ArrowRight, RefreshCw, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setCredentials } from "@/lib/redux/authSlice";

export default function UserOTPPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(600);
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const d = sessionStorage.getItem("pendingVerification");
        if (d) setUserEmail(JSON.parse(d).email);
        else router.push("/user/signup");
    }, [router]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [timeLeft]);

    const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    const handleChange = (i: number, v: string) => {
        if (!/^\d*$/.test(v)) return;
        const n = [...otp]; n[i] = v.slice(-1); setOtp(n);
        if (v && i < 5) inputRefs.current[i + 1]?.focus();
    };
    const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
    };
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const d = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(d)) return;
        const n = [...otp]; d.split("").forEach((c, i) => { if (i < 6) n[i] = c; }); setOtp(n);
        inputRefs.current[Math.min(d.length, 5)]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const s = otp.join("");
        if (s.length !== 6) { toast.error("Enter all 6 digits"); return; }
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email: userEmail, otp: s }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Verification failed");

            if (data.accessToken) {
                dispatch(setCredentials({ user: data.user, token: data.accessToken }));
                sessionStorage.removeItem("pendingVerification");
                toast.success("Email verified! Welcome aboard!");
                router.push("/user/dashboard");
            }
        } catch (err: any) {
            toast.error(err.message || "Invalid OTP");
            setIsLoading(false);
            inputRefs.current[0]?.focus();
        }
    };

    const handleResend = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/resend-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail }),
            });
            if (!res.ok) throw new Error("Failed to resend");
            setTimeLeft(600); setOtp(["", "", "", "", "", ""]);
            toast.success("New OTP sent!");
        } catch (err: any) {
            toast.error(err.message || "Failed to resend OTP");
        } finally {
            setIsLoading(false);
            inputRefs.current[0]?.focus();
        }
    }, [userEmail]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-teal-950 opacity-80" />
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <UserCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
                        <p className="text-white/50 text-sm mt-2">Enter the 6-digit code sent to<br /><span className="text-emerald-400 font-medium">{userEmail}</span></p>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between mb-2 text-sm">
                            <div className="flex items-center gap-1 text-white/50"><Clock className="w-4 h-4" /><span>Time remaining</span></div>
                            <span className={`font-mono font-bold ${timeLeft < 60 ? "text-red-400" : "text-white"}`}>{fmt(timeLeft)}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ${timeLeft < 60 ? "bg-red-400" : "bg-emerald-500"}`} style={{ width: `${(timeLeft / 600) * 100}%` }} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex gap-2 justify-center">
                            {otp.map((d, i) => (
                                <input key={i} ref={el => { inputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={d}
                                    onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} onPaste={i === 0 ? handlePaste : undefined}
                                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-white/5 border-2 border-white/10 text-white focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
                                    autoFocus={i === 0} disabled={isLoading}
                                />
                            ))}
                        </div>
                        <button type="submit" disabled={otp.join("").length !== 6 || isLoading}
                            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${otp.join("").length === 6 && !isLoading ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-white/5 text-white/30 cursor-not-allowed"}`}>
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Verify & Login <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-3">
                        <button onClick={handleResend} disabled={isLoading} className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm">
                            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />Resend code
                        </button>
                        <div>
                            <Link href="/user/signup" className="text-sm text-white/30 hover:text-white/60 transition-colors underline underline-offset-4">← Back to Sign Up</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
