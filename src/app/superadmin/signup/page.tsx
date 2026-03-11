"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Shield, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Phone } from "lucide-react";
import { toast } from "sonner";

const SignUpPage = () => {
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [secondName, setSecondName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        router.prefetch("/superadmin/otp");
    }, [router]);

    const passwordsMatch = password.length > 0 && password === confirmPassword;
    const isFormValid = firstName && secondName && email && password && passwordsMatch && !isLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName: secondName,
                    email,
                    mobile,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            // Store user data in sessionStorage for OTP verification
            sessionStorage.setItem('pendingUser', JSON.stringify({
                email: data.user.email,
                firstName: data.user.firstName,
                lastName: data.user.lastName,
            }));

            toast.success(data.message || "Signup successful!");

            // Navigate to OTP page after a brief delay
            setTimeout(() => {
                router.push("/superadmin/otp");
            }, 500);

        } catch (err: any) {
            toast.error(err.message || 'An error occurred during signup');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black py-8">

            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCIpLz48L3N2Zz4=')] opacity-50"></div>

            {/* Main Card Container */}
            <div className="relative z-10 w-full max-w-5xl mx-4 lg:mx-8">
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
                                Join the Future of
                                <span className="block text-white/80">
                                    Cybersecurity
                                </span>
                            </h2>

                            <p className="text-lg text-white/60 leading-relaxed">
                                Create your super admin account and take control of your organization's security infrastructure.
                            </p>
                        </div>

                        {/* Feature List */}
                        <div className="space-y-4">
                            {[
                                "Advanced threat protection",
                                "End-to-end encryption",
                                "AI-powered analytics",
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

                    {/* Right Side - Sign Up Form */}
                    <div className="relative">
                        {/* Form Card */}
                        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/20 p-6 lg:p-8">

                            {/* Mobile Logo */}
                            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/20">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold text-white">CyberShield</span>
                            </div>

                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-white mb-1">Create Account</h3>
                                <p className="text-sm text-white/60">Super Admin Registration</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Name Fields Row */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                            value={secondName}
                                            onChange={(e) => setSecondName(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Mobile Field */}
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="tel"
                                        placeholder="Mobile Number"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
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
                                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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

                                {/* Confirm Password Field */}
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white transition-colors" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Password Match Indicator */}
                                {confirmPassword && (
                                    <div className={`text-sm text-center transition-all duration-300 ${passwordsMatch ? 'text-white' : 'text-white/50'
                                        }`}>
                                        {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!isFormValid || isLoading}
                                    className={`w-full py-3 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 group ${isFormValid && !isLoading
                                        ? 'bg-white text-black hover:bg-white/90'
                                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                                        }`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className={`w-5 h-5 transition-transform ${isFormValid ? 'group-hover:translate-x-1' : ''}`} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-black text-white/40">Already registered?</span>
                                </div>
                            </div>

                            {/* Sign In Link */}
                            <Link
                                href="/superadmin/signin"
                                className="block w-full py-2.5 text-center rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-all duration-300"
                            >
                                Sign In Instead
                            </Link>

                            {/* Back to Home */}
                            <div className="mt-4 text-center">
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

export default SignUpPage;
