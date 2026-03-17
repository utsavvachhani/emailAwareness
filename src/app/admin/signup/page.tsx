"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Shield, Lock, Eye, EyeOff, User, ArrowRight, Loader2, Phone } from "lucide-react";
import { signupAdmin } from "@/actions/auth";
import { toast } from "sonner";

const AdminSignUpPage = () => {
    const router = useRouter();
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", mobile: "", password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    const isFormValid = form.firstName && form.lastName && form.email && form.password && form.confirmPassword && !isLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (form.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await signupAdmin({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                mobile: form.mobile || undefined,
                password: form.password,
            });

            if (error) {
                throw new Error(error.message || "Signup failed");
            }

            sessionStorage.setItem("pendingVerification", JSON.stringify({ email: form.email, role: "admin" }));
            toast.success("Account created! Check your email for the OTP verification code.");
            router.push("/admin/otp");
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black py-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-black to-indigo-950 opacity-80" />

            <div className="relative z-10 w-full max-w-6xl mx-4 lg:mx-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">

                    {/* Left Side */}
                    <div className="hidden lg:block space-y-8 text-white px-8">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">CyberShield Guard</h1>
                                    <p className="text-sm text-white/60">Admin Registration</p>
                                </div>
                            </div>
                            <h2 className="text-4xl font-bold leading-tight">
                                Join as<span className="block text-blue-400">Admin</span>
                            </h2>
                            <p className="text-lg text-white/60 mt-4">
                                Register your admin account. After email verification, a superadmin will review and approve your access.
                            </p>
                        </div>
                        <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-6">
                            <h3 className="font-semibold text-blue-300 mb-3">Registration Process:</h3>
                            <ol className="space-y-2 text-white/60 text-sm">
                                <li className="flex gap-2"><span className="text-blue-400 font-bold">1.</span> Fill in your details &amp; sign up</li>
                                <li className="flex gap-2"><span className="text-blue-400 font-bold">2.</span> Verify your email with OTP</li>
                                <li className="flex gap-2"><span className="text-blue-400 font-bold">3.</span> Wait for superadmin approval</li>
                                <li className="flex gap-2"><span className="text-blue-400 font-bold">4.</span> Get email notification when approved</li>
                            </ol>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="relative">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-8 lg:p-10">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-1.5 mb-4">
                                    <User className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm text-blue-300 font-medium">Admin Registration</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white">Create Admin Account</h3>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                                            value={form.firstName}
                                            onChange={set("firstName")}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                                        value={form.lastName}
                                        onChange={set("lastName")}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="Work Email Address"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-all"
                                        value={form.email}
                                        onChange={set("email")}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="tel"
                                        placeholder="Mobile Number (Optional)"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-all"
                                        value={form.mobile}
                                        onChange={set("mobile")}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password (min 8 chars)"
                                        className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-all"
                                        value={form.password}
                                        onChange={set("password")}
                                        required
                                        disabled={isLoading}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors" disabled={isLoading}>
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-all"
                                        value={form.confirmPassword}
                                        onChange={set("confirmPassword")}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!isFormValid}
                                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 group mt-2 ${
                                        isFormValid ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-white/5 text-white/30 cursor-not-allowed"
                                    }`}
                                >
                                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-white/40 text-sm">
                                    Already have an account?{" "}
                                    <Link href="/admin/signin" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSignUpPage;
