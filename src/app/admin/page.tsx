"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import Link from "next/link";
import { 
  Shield, Rocket, ArrowRight, UserPlus, LogIn, 
  CheckCircle2, Building2, BookOpen, Users, 
  BarChart3, Globe, Command, Sparkles
} from "lucide-react";

export default function AdminLandingPage() {
    const { token } = useAppSelector(s => s.auth);

    const steps = [
        {
            icon: Shield,
            title: "Security Identity",
            description: "Register your administrative account and verify your organization's security credentials."
        },
        {
            icon: Building2,
            title: "Add Companies",
            description: "Scale your reach by creating distinct entities for each partner or internal department you manage."
        },
        {
            icon: BookOpen,
            title: "Curriculum Builder",
            description: "Draft high-impact training courses with videos and documents tailored to specific security needs."
        },
        {
            icon: Users,
            title: "Workforce Invite",
            description: "Seamlessly onboard employees to companies and track their training progression in real-time."
        }
    ];

    return (
        <div className="min-h-screen bg-background selection:bg-blue-600/10 selection:text-blue-600">
            {/* Header / Navbar */}
            <div className="border-b bg-card/10 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tight italic">CYBER<span className="text-blue-600 italic">SHIELD</span></span>
                    </div>

                    <div className="flex items-center gap-4">
                        {token ? (
                            <Link 
                                href="/admin/dashboard" 
                                className="h-10 px-6 rounded-xl bg-foreground text-background text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-foreground/10 flex items-center gap-2"
                            >
                                <Command className="w-3.5 h-3.5" />
                                Open Console
                            </Link>
                        ) : (
                            <>
                                <Link 
                                    href="/admin/signin" 
                                    className="h-10 px-6 rounded-xl border border-border bg-card text-xs font-black uppercase tracking-widest hover:bg-secondary transition-all flex items-center gap-2"
                                >
                                    <LogIn className="w-3.5 h-3.5" />
                                    Access Identity
                                </Link>
                                <Link 
                                    href="/admin/signup" 
                                    className="h-10 px-6 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    Deploy SHIELD
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative pt-24 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-600/[0.03] to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="max-w-3xl space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Administrative Node v2.0 Activated</span>
                        </div>
                        
                        <h1 className="text-7xl font-black tracking-tighter leading-[0.9] italic uppercase">
                            Orchestrate High <span className="text-blue-600">Impact</span> Training Curriculum.
                        </h1>
                        
                        <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                            Empower your organization with a centralized platform for employee security awareness, 
                            curriculum management, and real-time workforce analytics.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <Link 
                                href={token ? "/admin/dashboard/companies" : "/admin/signup"}
                                className="h-14 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-sm hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-3 group"
                            >
                                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </Link>
                            <Link 
                                href={token ? "/admin/dashboard/settings" : "/admin/signin"}
                                className="h-14 px-10 rounded-2xl border border-border bg-card font-black uppercase tracking-widest text-sm hover:bg-secondary transition-all flex items-center gap-3"
                            >
                                {token ? "Manage Cluster" : "Administrator Login"}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Workflow Section */}
            <div className="bg-secondary/30 py-32 border-y border-border/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-600/10 px-4 h-8 flex items-center rounded-full">Core Protocol</span>
                            <div className="h-px flex-1 bg-border" />
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic">Administrative Workflow</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {steps.map((step, idx) => (
                            <div key={step.title} className="space-y-6 group">
                                <div className="space-y-4">
                                    <div className="relative inline-block w-16 h-16">
                                        <div className="absolute inset-0 bg-blue-600 rounded-3xl opacity-10 blur-xl group-hover:opacity-20 transition-opacity" />
                                        <div className="relative w-full h-full rounded-2xl border border-border bg-card flex items-center justify-center group-hover:border-blue-500/50 transition-colors shadow-sm">
                                            <step.icon className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight uppercase line-clamp-1">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground font-medium leading-relaxed opacity-80">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Spotlight */}
            <div className="py-32 bg-background relative">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black tracking-tighter italic uppercase leading-tight">
                                Unified <span className="text-blue-600">Company</span> & <span className="text-blue-600">Course</span> Hub
                            </h2>
                            <p className="text-lg text-muted-foreground font-medium italic opacity-80 leading-relaxed">
                                Our platform enables you to oversee complex organisational hierarchies through a single administrative lens.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { icon: Building2, label: "Multi-Entity Support", text: "Create and manage multiple distinct company structures." },
                                { icon: BarChart3, label: "Advanced Analytics", text: "Drill down into employee completion rates and security scores." },
                                { icon: Globe, label: "Compliance Ready", text: "Standardize your security curriculum across global departments." },
                                { icon: Rocket, label: "Instant Deployment", text: "Update courses and modules that reflect across your workforce immediately." }
                            ].map((f) => (
                                <div key={f.label} className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-blue-500/20 transition-colors group">
                                    <f.icon className="w-6 h-6 text-blue-600 mb-4 group-hover:animate-bounce" />
                                    <h4 className="text-sm font-black uppercase tracking-widest mb-2">{f.label}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                        {f.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/10 to-transparent rounded-[3rem] blur-2xl opacity-50" />
                        <div className="relative aspect-square md:aspect-video lg:aspect-square bg-card border border-border rounded-[3rem] p-12 overflow-hidden shadow-2xl shadow-blue-600/5">
                            <div className="h-full border border-dashed border-border rounded-[2rem] flex flex-col items-center justify-center text-center p-8 space-y-6">
                                <div className="w-20 h-20 rounded-full bg-blue-600/5 flex items-center justify-center">
                                    <Sparkles className="w-10 h-10 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-black italic tracking-tighter uppercase line-clamp-2 leading-tight">Experience Premium Security Administration</h3>
                                <div className="grid grid-cols-3 gap-2 w-full">
                                    <div className="h-2 bg-blue-600 rounded-full" />
                                    <div className="h-2 bg-blue-100 rounded-full" />
                                    <div className="h-2 bg-blue-600/20 rounded-full" />
                                </div>
                                <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">v2.0 Interface Node</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 py-12 bg-secondary/10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-black tracking-tight italic">CYBER<span className="text-blue-600 italic">SHIELD</span> Management Portal</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">© 2026 CYBERSHIELD PROTOCOL — ENCRYPTED TRANSMISSION</p>
                </div>
            </div>
        </div>
    );
}
