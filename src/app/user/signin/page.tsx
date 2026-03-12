"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setCredentials } from "@/lib/redux/authSlice";

const UserSignInPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { router.prefetch("/user/dashboard"); }, [router]);

    const isFormValid = email && password && !isLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.needsVerification) {
                    sessionStorage.setItem("pendingVerification", JSON.stringify({ email }));
                    toast.warning("Please verify your email first.");
                    router.push("/user/otp");
                    return;
                }
                throw new Error(data.message || "Login failed");
            }

            if (data.user?.role !== "user") {
                toast.error("This login is for User accounts only.");
                setIsLoading(false);
                return;
            }

            dispatch(setCredentials({ user: data.user, token: data.accessToken }));
            toast.success("Welcome back!");
            router.push("/user/dashboard");
        } catch (err: any) {
            toast.error(err.message || "An error occurred during sign in");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-teal-950 opacity-80" />

            <div className="relative z-10 w-full max-w-6xl mx-4 lg:mx-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">

                    {/* Left Side */}
                    <div className="hidden lg:block space-y-8 text-white px-8">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                                    <UserCircle className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">CyberShield Guard</h1>
                                    <p className="text-sm text-white/60">User Portal</p>
                                </div>
                            </div>
                            <h2 className="text-4xl font-bold leading-tight">
                                Security<span className="block text-emerald-400">Training Hub</span>
                            </h2>
                            <p className="text-lg text-white/60 mt-4">
                                Access your personalized cybersecurity awareness training and track your progress.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {["Complete training modules", "Take phishing quizzes", "View your security score"].map((t, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                    </div>
                                    <span className="text-white/70">{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="relative">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-emerald-500/20 p-8 lg:p-10">
                            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                                <UserCircle className="w-8 h-8 text-emerald-400" />
                                <span className="text-xl font-bold text-white">User Portal</span>
                            </div>

                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-4">
                                    <UserCircle className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm text-emerald-300 font-medium">User Sign In</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white">Welcome Back</h3>
                                <p className="text-sm text-white/50 mt-1">Sign in to your training account</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors" disabled={isLoading}>
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!isFormValid}
                                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 group ${
                                        isFormValid ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/30" : "bg-white/5 text-white/30 cursor-not-allowed"
                                    }`}
                                >
                                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                                </button>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 text-white/40">New here?</span>
                                </div>
                            </div>

                            <Link href="/user/signup" className="block w-full py-3 text-center rounded-xl border border-emerald-500/30 text-emerald-300 font-medium hover:bg-emerald-600/10 transition-all">
                                Create User Account
                            </Link>

                            <div className="mt-6 flex justify-between text-sm">
                                <Link href="/" className="text-white/40 hover:text-white/70 transition-colors">← Back to Home</Link>
                                <Link href="/admin/signin" className="text-white/40 hover:text-white/70 transition-colors">Admin Login →</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSignInPage;
