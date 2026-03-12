"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2, Phone } from "lucide-react";
import { toast } from "sonner";

export default function UserSignUpPage() {
    const router = useRouter();
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", mobile: "", password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [f]: e.target.value }));
    const isFormValid = form.firstName && form.lastName && form.email && form.password && form.confirmPassword && !isLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
        if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }

        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, mobile: form.mobile || undefined, password: form.password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Signup failed");

            sessionStorage.setItem("pendingVerification", JSON.stringify({ email: form.email, role: "user" }));
            toast.success("Account created! Check your email for the OTP.");
            router.push("/user/otp");
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden py-8">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-teal-950 opacity-80" />

            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4">
                            <User className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-emerald-300 font-medium">Create User Account</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Join the Training Platform</h2>
                        <p className="text-sm text-white/50 mt-1">Get access to cybersecurity awareness training</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                                <input type="text" placeholder="First Name" className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" value={form.firstName} onChange={set("firstName")} required disabled={isLoading} />
                            </div>
                            <input type="text" placeholder="Last Name" className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" value={form.lastName} onChange={set("lastName")} required disabled={isLoading} />
                        </div>

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                            <input type="email" placeholder="Email Address" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all" value={form.email} onChange={set("email")} required disabled={isLoading} />
                        </div>

                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                            <input type="tel" placeholder="Mobile (Optional)" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all" value={form.mobile} onChange={set("mobile")} disabled={isLoading} />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                            <input type={showPassword ? "text" : "password"} placeholder="Password (min 8 chars)" className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all" value={form.password} onChange={set("password")} required disabled={isLoading} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors" disabled={isLoading}>
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                            <input type="password" placeholder="Confirm Password" className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all" value={form.confirmPassword} onChange={set("confirmPassword")} required disabled={isLoading} />
                        </div>

                        <button type="submit" disabled={!isFormValid} className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 group mt-2 ${isFormValid ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-white/5 text-white/30 cursor-not-allowed"}`}>
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-white/40 text-sm">Already have an account?{" "}
                            <Link href="/user/signin" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
