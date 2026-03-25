"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import {
    CreditCard, Download, FileText, CheckCircle2,
    Users, BookOpen, FileCheck, Video, BarChart3,
    ShieldCheck, Sparkles, Zap, Shield, ChevronRight,
    Crown, Bell, Target, Trophy, Mail, Layers,
    Loader2, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const PLANS = [
    {
        key: "basic",
        name: "Basic Plan",
        price: 1499,
        priceLabel: "₹1,499",
        tagline: "Best for small teams",
        color: "emerald",
        icon: Zap,
        features: [
            { icon: Users,      text: "Up to 30 Employees" },
            { icon: BookOpen,   text: "10 Training Modules" },
            { icon: FileText,   text: "8 Docs" },
            { icon: Video,      text: "2 Videos" },
            { icon: FileCheck,  text: "1 Final Quiz per course" },
            { icon: BarChart3,  text: "Basic Dashboard (completion %)" },
            { icon: ShieldCheck,text: "1 Admin" },
            { icon: Shield,     text: "Private Company Access" },
        ],
    },
    {
        key: "standard",
        name: "Standard Plan",
        price: 2499,
        priceLabel: "₹2,499",
        tagline: "Best for growing companies",
        color: "blue",
        popular: true,
        icon: Sparkles,
        features: [
            { icon: Users,      text: "Up to 75 Employees" },
            { icon: BookOpen,   text: "20 Training Modules" },
            { icon: FileText,   text: "14 Docs" },
            { icon: Video,      text: "6 Videos" },
            { icon: FileCheck,  text: "Quiz + Assignments" },
            { icon: BarChart3,  text: "Advanced Dashboard" },
            { icon: Layers,     text: "Employee-wise progress" },
            { icon: ShieldCheck,text: "2 Admins" },
            { icon: Mail,       text: "Email Template Training Library" },
            { icon: Target,     text: "Awareness Score Tracking" },
        ],
    },
    {
        key: "premium",
        name: "Premium Plan",
        price: 3999,
        priceLabel: "₹3,999",
        tagline: "Best for serious cybersecurity training",
        color: "purple",
        icon: Crown,
        features: [
            { icon: Users,      text: "Up to 120 Employees" },
            { icon: BookOpen,   text: "35 Training Modules" },
            { icon: FileText,   text: "20 Docs" },
            { icon: Video,      text: "15 Videos" },
            { icon: FileCheck,  text: "Quiz + Assignments + Scenario Tests" },
            { icon: BarChart3,  text: "Full Analytics Dashboard" },
            { icon: Target,     text: "Department-wise performance & Risk scoring" },
            { icon: ShieldCheck,text: "Multiple Admins" },
            { icon: Zap,        text: "Phishing Simulation" },
            { icon: Trophy,     text: "Leaderboard & Gamification" },
            { icon: Bell,       text: "Awareness Readiness Score" },
        ],
    },
];

const PLAN_PRICE: Record<string, string> = { basic: "₹1,499", standard: "₹2,499", premium: "₹3,999" };
const PLAN_LABEL: Record<string, string> = { basic: "Basic", standard: "Standard", premium: "Premium" };

type Company = {
    id: number;
    company_id: string;
    name: string;
    plan?: string;
    is_paid?: boolean;
};

export default function AdminBillsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const token = useAppSelector(s => s.auth.token);

    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState<string | null>(null);

    const invoices = [
        { id: "INV-1024", date: "March 2025",   amount: "₹2,499", status: "Paid" },
        { id: "INV-1023", date: "February 2025", amount: "₹2,499", status: "Paid" },
        { id: "INV-1022", date: "January 2025",  amount: "₹2,499", status: "Paid" },
        { id: "INV-1021", date: "December 2024", amount: "₹2,499", status: "Unpaid" },
    ];

    const fetchCompany = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            const data = await res.json();
            if (data.success && data.company) setCompany(data.company);
        } catch (err) { console.error("fetch company:", err); }
        finally { setLoading(false); }
    }, [id, token]);

    useEffect(() => { if (id && token) fetchCompany(); }, [id, token, fetchCompany]);

    const handleSelectPlan = async (planKey: string) => {
        setSelecting(planKey);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}/plan`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ plan: planKey }),
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`${PLAN_LABEL[planKey]} plan selected! Proceed to payment.`);
                setCompany(data.company);
                // Redirect to payment page with plan info in URL
                setTimeout(() => router.push(`/admin/dashboard/${id}/bills/payment?plan=${planKey}`), 600);
            } else {
                toast.error(data.message || "Failed to select plan");
            }
        } catch {
            toast.error("Server error. Please try again.");
        } finally {
            setSelecting(null);
        }
    };

    const currentPlan = company?.plan?.toLowerCase();
    const isPaid = company?.is_paid;

    const pendingPayment = currentPlan && currentPlan !== "none" && !isPaid;
    const isActive = currentPlan && currentPlan !== "none" && isPaid;

    return (
        <div className="space-y-16 pb-24">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight italic">Subscription & Billing</h1>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium ml-1">
                        Choose your protection tier. Activate your dashboard. Start training your team.
                    </p>
                </div>

                {/* Status badge */}
                {loading ? (
                    <div className="h-8 w-36 rounded-full bg-muted animate-pulse" />
                ) : (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black uppercase tracking-wider ${
                        isActive
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
                            : pendingPayment
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-700"
                            : "bg-muted border-border text-muted-foreground"
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : pendingPayment ? "bg-amber-500" : "bg-slate-400"}`} />
                        {isActive ? "Service Active" : pendingPayment ? "Payment Pending" : "No Plan Selected"}
                    </div>
                )}
            </div>

            {/* ── Payment pending banner ─────────────────────────────── */}
            {pendingPayment && !loading && (
                <div className="flex items-center gap-5 p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-amber-800">
                            You selected the <span className="uppercase">{currentPlan}</span> plan (
                            {PLAN_PRICE[currentPlan!]}/mo). Complete payment to unlock your dashboard.
                        </p>
                        <p className="text-xs text-amber-600/80 mt-0.5 font-medium">All admin features are locked until payment is confirmed.</p>
                    </div>
                    <Link
                        href={`/admin/dashboard/${id}/bills/payment?plan=${currentPlan}`}
                        className="shrink-0 flex items-center gap-2 px-6 py-3 bg-amber-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                    >
                        Pay Now <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            {/* ── Plans heading ──────────────────────────────────────── */}
            <div className="flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
                    Enterprise Training Ecosystem
                </span>
                <h2 className="text-4xl font-black italic tracking-tighter">Choose Your Protection Tier</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Select the plan that fits your workforce and cybersecurity standards.
                </p>
                {isActive && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/5 border border-emerald-500/10 px-4 py-2 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active: <span className="uppercase">{currentPlan}</span> plan
                    </div>
                )}
            </div>

            {/* ── Plan Cards ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-1">
                {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    const isPremium = plan.key === "premium";
                    const isStandard = plan.key === "standard";
                    const isCurrentPlan = currentPlan === plan.key;
                    const isLoadingThis = selecting === plan.key;
                    const alreadyActive = isCurrentPlan && isPaid;

                    return (
                        <div
                            key={plan.key}
                            className={`relative flex flex-col rounded-[2.5rem] border transition-all duration-500 group overflow-hidden ${
                                isPremium
                                    ? "bg-neutral-900 border-purple-500/30 text-white shadow-2xl shadow-purple-500/10"
                                    : isStandard
                                    ? "bg-white border-blue-500/30 shadow-2xl shadow-blue-500/10 scale-[1.03] z-10"
                                    : "bg-white border-border shadow-xl"
                            } ${isCurrentPlan && !isPaid ? "ring-2 ring-amber-400" : ""} ${alreadyActive ? "ring-2 ring-emerald-400" : ""}`}
                        >
                            {/* Popular badge */}
                            {plan.popular && (
                                <div className="absolute top-6 right-6 z-10">
                                    <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30 tracking-widest">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            {/* Current plan badge */}
                            {alreadyActive && (
                                <div className="absolute top-6 left-6 z-10">
                                    <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3 h-3" /> Active
                                    </span>
                                </div>
                            )}
                            {isCurrentPlan && !isPaid && (
                                <div className="absolute top-6 left-6 z-10">
                                    <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                        <AlertCircle className="w-3 h-3" /> Payment Pending
                                    </span>
                                </div>
                            )}

                            {/* Plan info */}
                            <div className="p-8 pb-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-transform duration-500 group-hover:rotate-12 ${
                                    isPremium ? "bg-purple-500/20 border-purple-500/30" : "bg-blue-500/5 border-blue-500/10"
                                }`}>
                                    <Icon className={`w-7 h-7 ${isPremium ? "text-purple-400" : "text-blue-600"}`} />
                                </div>

                                <h3 className="text-2xl font-black italic tracking-tighter mb-1">{plan.name}</h3>
                                <p className={`text-xs font-medium ${isPremium ? "text-white/50" : "text-muted-foreground"}`}>{plan.tagline}</p>

                                <div className="mt-6 flex items-baseline gap-1">
                                    <span className="text-sm font-bold opacity-60">₹</span>
                                    <span className="text-5xl font-black tracking-tighter italic">{plan.price.toLocaleString()}</span>
                                    <span className="text-xs font-bold opacity-40 uppercase tracking-widest ml-1">/ Month</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="p-8 pt-4 flex-1">
                                <div className={`h-px w-full mb-6 ${isPremium ? "bg-white/10" : "bg-border/60"}`} />
                                <ul className="space-y-3.5">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                                                isPremium ? "bg-purple-500/20" : "bg-blue-500/10"
                                            }`}>
                                                <f.icon className={`w-3 h-3 ${isPremium ? "text-purple-400" : "text-blue-600"}`} />
                                            </div>
                                            <span className={`text-xs font-semibold ${isPremium ? "text-white/80" : "text-foreground/80"}`}>
                                                {f.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA Button */}
                            <div className="p-8 pt-2">
                                {alreadyActive ? (
                                    <div className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 ${
                                        isPremium ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                                    }`}>
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Current Active Plan
                                    </div>
                                ) : isCurrentPlan && !isPaid ? (
                                    <Link
                                        href={`/admin/dashboard/${id}/bills/payment?plan=${plan.key}`}
                                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-xl ${
                                            isPremium
                                                ? "bg-amber-500 text-white hover:bg-amber-400 shadow-amber-500/20"
                                                : "bg-amber-500 text-white hover:bg-amber-400 shadow-amber-500/20"
                                        }`}
                                    >
                                        Complete Payment <ChevronRight className="w-3 h-3" />
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => handleSelectPlan(plan.key)}
                                        disabled={!!selecting}
                                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                                            isPremium
                                                ? "bg-purple-600 text-white hover:bg-purple-500 shadow-purple-500/20"
                                                : isStandard
                                                ? "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20"
                                                : "bg-black text-white hover:bg-neutral-800 shadow-black/10"
                                        }`}
                                    >
                                        {isLoadingThis ? (
                                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Selecting...</>
                                        ) : (
                                            <>Select {plan.name.split(" ")[0]} <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" /></>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Glow accents */}
                            {isPremium && (
                                <>
                                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
                                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── Workflow Steps ─────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10 rounded-[3rem] p-12">
                <h3 className="text-center text-2xl font-black italic tracking-tighter mb-10">How It Works</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
                    {[
                        { num: "01", label: "Create Company", desc: "Register your organisation in the admin hub" },
                        { num: "02", label: "Select a Plan", desc: "Choose Basic, Standard or Premium tier" },
                        { num: "03", label: "Complete Payment", desc: "Authorise the secure transaction" },
                        { num: "04", label: "Start Training", desc: "Add employees & assign cybersecurity courses" },
                    ].map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 relative">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg font-black shadow-xl shadow-blue-500/20">
                                {step.num}
                            </div>
                            <p className="text-sm font-black tracking-tight">{step.label}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                            {i < 3 && (
                                <ChevronRight className="absolute -right-3 top-4 w-5 h-5 text-blue-500/30 hidden sm:block" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Active plan summary ────────────────────────────────── */}
            {isActive && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-card border border-border/60 rounded-[3rem] p-10 shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-black italic tracking-tight">Active Subscription Node</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Plan</p>
                                    <p className="text-lg font-black italic uppercase">{currentPlan} Enterprise</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Monthly Cost</p>
                                    <p className="text-lg font-black italic text-blue-600">{PLAN_PRICE[currentPlan!]}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 mb-1">Status</p>
                                    <p className="text-lg font-black italic text-emerald-600">✓ Active</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.03] blur-[80px] rounded-full pointer-events-none" />
                    </div>

                    <div className="bg-neutral-900 border border-border/20 rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl text-white relative overflow-hidden">
                        <div className="space-y-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-blue-400" />
                            </div>
                            <h4 className="text-lg font-black italic tracking-tight">Need More Capacity?</h4>
                            <p className="text-xs text-white/50 leading-relaxed">Upgrade your plan to onboard more employees and unlock advanced analytics.</p>
                        </div>
                        <button
                            onClick={() => document.getElementById("plan-cards")?.scrollIntoView({ behavior: "smooth" })}
                            className="relative z-10 mt-8 w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-xl"
                        >
                            Upgrade Tier <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />
                    </div>
                </div>
            )}

            {/* ── Invoice History ────────────────────────────────────── */}
            <div className="bg-card border border-border/60 rounded-[3rem] shadow-xl overflow-hidden">
                <div className="p-10 border-b border-border/40 bg-blue-500/[0.01] flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black italic tracking-tight">Transaction Ledger</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 mt-1.5">
                            Immutable record of financial operations
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 hover:bg-muted text-xs font-bold uppercase tracking-tighter transition-all">
                        <Download className="w-3.5 h-3.5" /> Export
                    </button>
                </div>

                <div className="divide-y divide-border/20">
                    {invoices.map((inv) => (
                        <div key={inv.id} className="p-8 flex items-center justify-between hover:bg-blue-500/[0.02] transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                                    <FileText className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-sm font-black italic group-hover:text-blue-600 transition-colors">{inv.id}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-wider mt-0.5">{inv.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-10">
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground/40 mb-0.5 tracking-tighter">Amount</p>
                                    <p className="text-sm font-black tracking-tighter">{inv.amount}</p>
                                </div>
                                <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-full border ${
                                    inv.status === "Paid"
                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                }`}>
                                    {inv.status === "Paid" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                    {inv.status}
                                </span>
                                <button className="w-10 h-10 rounded-2xl bg-muted/30 flex items-center justify-center opacity-30 hover:opacity-100 hover:bg-blue-600 hover:text-white border border-transparent transition-all">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
