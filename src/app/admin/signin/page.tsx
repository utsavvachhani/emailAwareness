"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Shield, Lock, Eye, EyeOff, ArrowRight, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setCredentials } from "@/lib/redux/authSlice";
import { signinAdmin } from "@/actions/auth";

const AdminSignInPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        router.prefetch("/admin/dashboard");
    }, [router]);

    const isFormValid = email && password && !isLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        setIsLoading(true);

        try {
            const { data, error } = await signinAdmin({ email, password });

            if (error) {
                if (error.pendingApproval) {
                    toast.info("Your account is pending superadmin approval. You'll be notified by email.");
                    setIsLoading(false);
                    return;
                }
                if (error.needsVerification) {
                    sessionStorage.setItem("pendingVerification", JSON.stringify({ email }));
                    toast.warning("Please verify your email first.");
                    router.push("/admin/otp");
                    return;
                }
                throw new Error(error.message || "Login failed");
            }

            if (data.user?.role !== "admin") {
                toast.error("This login is for Admin accounts only.");
                setIsLoading(false);
                return;
            }

            dispatch(setCredentials({ user: data.user, token: data.accessToken }));
            toast.success("Welcome back!");
            router.push("/admin/dashboard");
        } catch (err: any) {
            toast.error(err.message || "An error occurred during sign in");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-black to-indigo-950 opacity-80" />

            <div className="relative z-10 w-full max-w-6xl mx-4 lg:mx-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">

                    {/* Left Side */}
                    <div className="hidden lg:block space-y-8 text-white px-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 overflow-hidden p-2.5">
                                    <img src="/logo.svg" alt="CyberShield Logo" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">CyberShield Guard</h1>
                                    <p className="text-sm text-white/60">Admin Portal</p>
                                </div>
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                                Admin<span className="block text-blue-400">Access</span>
                            </h2>
                            <p className="text-lg text-white/60">
                                Manage your organization's email awareness training and employee security posture.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {["Manage employee training", "View phishing reports", "Create awareness campaigns"].map((t, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                                    </div>
                                    <span className="text-white/70">{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side — Form */}
                    <div className="relative">
                        <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-500/20 p-8 lg:p-10">

                            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center overflow-hidden p-2">
                                    <img src="/logo.svg" alt="CyberShield Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-2xl font-bold text-white">Admin Portal</span>
                            </div>

                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-1.5 mb-4">
                                    <User className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm text-blue-300 font-medium">Admin Sign In</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white">Welcome Back</h3>
                                <p className="text-sm text-white/50 mt-1">Sign in to your admin account</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="Admin Email Address"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!isFormValid}
                                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 group ${
                                        isFormValid
                                            ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/30"
                                            : "bg-white/5 text-white/30 cursor-not-allowed"
                                    }`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </button>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-transparent text-white/40">Don't have an account?</span>
                                </div>
                            </div>

                            <Link
                                href="/admin/signup"
                                className="block w-full py-3 text-center rounded-xl border border-blue-500/30 text-blue-300 font-medium hover:bg-blue-600/10 transition-all"
                            >
                                Register as Admin
                            </Link>

                            <div className="mt-6 flex justify-between text-sm">
                                <Link href="/" className="text-white/40 hover:text-white/70 transition-colors">
                                    ← Back to Home
                                </Link>
                                <Link href="/superadmin/signin" className="text-white/40 hover:text-white/70 transition-colors">
                                    Superadmin →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSignInPage;
