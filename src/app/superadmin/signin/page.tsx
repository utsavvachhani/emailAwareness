"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Shield, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setCredentials } from "@/lib/redux/authSlice";
import { signinSuperadmin } from "@/actions/auth";

const SignInPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        router.prefetch("/superadmin/dashboard");
    }, [router]);

    const isFormValid = email && password && !isLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);

        try {
            // Fetch Location and IP Details
            let location = "Unknown Location";
            let ip = "Unknown IP";
            try {
                const res = await fetch("https://ipapi.co/json/");
                if (res.ok) {
                    const data = await res.json();
                    location = `${data.city || ""}, ${data.region || ""}, ${data.country_name || ""}`.replace(/^, | ,|, $/g, "");
                    ip = data.ip || ip;
                }
            } catch (err) {
                console.warn("Could not fetch location data", err);
            }

            const currentUrl = typeof window !== 'undefined' ? window.location.href : "Unknown URL";

            const { data, error } = await signinSuperadmin({ 
                email, 
                password, 
                location, 
                ip, 
                url: currentUrl 
            });

            if (error) {
                throw new Error(error.message || 'Signin failed');
            }

            // Save credentials to Redux and localStorage
            dispatch(setCredentials({
                user: data.user,
                token: data.token || data.accessToken
            }));

            toast.success(data.message || "Login successful!");

            // Navigate direct to dashboard
            router.push("/superadmin/dashboard");

        } catch (err: any) {
            toast.error(err.message || 'An error occurred during signin');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">

            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVybkVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>

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
                                Welcome Back to
                                <span className="block text-white/80">
                                    Secure Control
                                </span>
                            </h2>

                            <p className="text-lg text-white/60 leading-relaxed">
                                Sign in to your super admin account and manage your organization's cybersecurity infrastructure.
                            </p>
                        </div>

                        {/* Feature List */}
                        <div className="space-y-4">
                            {[
                                "Real-time threat monitoring",
                                "Instant security alerts",
                                "Advanced admin controls",
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

                    {/* Right Side - Sign In Form */}
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

                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-white mb-1">Welcome Back</h3>
                                <p className="text-sm text-white/60">Super Admin Authentication</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Email Field */}
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                        }}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Password Field */}
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                        }}
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!isFormValid || isLoading}
                                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 group ${isFormValid && !isLoading
                                        ? 'bg-white text-black hover:bg-white/90'
                                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                                        }`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className={`w-5 h-5 transition-transform ${isFormValid ? 'group-hover:translate-x-1' : ''}`} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-black text-white/40">New to CyberShield?</span>
                                </div>
                            </div>

                            {/* Info: no self-signup for superadmin */}
                            <div className="block w-full py-3 text-center rounded-xl border border-white/10 text-white/30 text-sm cursor-default select-none">
                                🔒 Superadmin access is pre-configured only
                            </div>

                            {/* Back to Home */}
                            <div className="mt-6 text-center">
                                <Link
                                    href="/"
                                    className="text-sm text-white/50 hover:text-white/80 transition-colors underline underline-offset-4"
                                >
                                    ← Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
