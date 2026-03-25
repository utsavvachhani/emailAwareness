"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { PLANS, PLAN_PRICE, PLAN_LABEL } from "@/constant/biils/planes";
import {
    CreditCard,
    CheckCircle2,
    ChevronRight,
    AlertCircle,
    Loader2,
} from "lucide-react";

import { toast } from "sonner";
import Link from "next/link";

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
    const token = useAppSelector((s) => s.auth.token);

    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState<string | null>(null);

    const invoices = [
        { id: "INV-1024", date: "March 2025", amount: "₹2,499", status: "Paid" },
        { id: "INV-1023", date: "February 2025", amount: "₹2,499", status: "Paid" },
        { id: "INV-1022", date: "January 2025", amount: "₹2,499", status: "Paid" },
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
        } catch (err) {
            console.error("fetch company:", err);
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        if (id && token) fetchCompany();
    }, [id, token, fetchCompany]);

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

            {/* Header */}
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

                {loading ? (
                    <div className="h-8 w-36 rounded-full bg-muted animate-pulse" />
                ) : (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black uppercase tracking-wider ${isActive
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

            {/* Payment Pending Banner */}
            {pendingPayment && !loading && (
                <div className="flex items-center gap-5 p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-amber-800">
                            You selected the <span className="uppercase">{currentPlan}</span> plan ({PLAN_PRICE[currentPlan!]}/mo). Complete payment to unlock your dashboard.
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

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-1">
                {PLANS.map((plan) => {
                    const Icon = plan.icon;
                    const isCurrentPlan = currentPlan === plan.key;
                    const alreadyActive = isCurrentPlan && isPaid;
                    const isLoadingThis = selecting === plan.key;

                    return (
                        <div key={plan.key} className={`relative flex flex-col rounded-[2.5rem] border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group overflow-hidden ${plan.key === "premium" ? "bg-neutral-900 border-purple-500/30 text-white shadow-2xl shadow-purple-500/10" :
                            plan.key === "standard" ? "bg-white border-blue-500/30 shadow-2xl shadow-blue-500/10 scale-[1.03] z-10" :
                                "bg-white border-border shadow-xl"
                            } ${alreadyActive ? "ring-2 ring-emerald-400" : ""}`}>
                            {/* Popular badge */}
                            {plan.popular && (
                                <div className="absolute top-6 right-6 z-10">
                                    <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30 tracking-widest">Most Popular</span>
                                </div>
                            )}

                            {/* Plan Info */}
                            <div className="p-8 pb-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-transform duration-500 group-hover:rotate-12 ${plan.key === "premium" ? "bg-purple-500/20 border-purple-500/30" : "bg-blue-500/5 border-blue-500/10"
                                    }`}>
                                    <Icon className={`w-7 h-7 ${plan.key === "premium" ? "text-purple-400" : "text-blue-600"}`} />
                                </div>

                                <h3 className="text-2xl font-black italic tracking-tighter mb-1">{plan.name}</h3>
                                <p className={`text-xs font-medium ${plan.key === "premium" ? "text-white/50" : "text-muted-foreground"}`}>{plan.tagline}</p>

                                <div className="mt-6 flex items-baseline gap-1">
                                    <span className="text-sm font-bold opacity-60">₹</span>
                                    <span className="text-5xl font-black tracking-tighter italic">{plan.price.toLocaleString()}</span>
                                    <span className="text-xs font-bold opacity-40 uppercase tracking-widest ml-1">/ Month</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="p-8 pt-4 flex-1">
                                <div className={`h-px w-full mb-6 ${plan.key === "premium" ? "bg-white/10" : "bg-border/60"}`} />
                                <ul className="space-y-3.5">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${plan.key === "premium" ? "bg-purple-500/20" : "bg-blue-500/10"}`}>
                                                <f.icon className={`w-3 h-3 ${plan.key === "premium" ? "text-purple-400" : "text-blue-600"}`} />
                                            </div>
                                            <span className={`text-xs font-semibold ${plan.key === "premium" ? "text-white/80" : "text-foreground/80"}`}>
                                                {f.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA Button */}
                            <div className="p-8 pt-2">
                                {alreadyActive ? (
                                    <div className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 ${plan.key === "premium" ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                                        }`}>
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Current Active Plan
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleSelectPlan(plan.key)}
                                        disabled={!!selecting}
                                        className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                      bg-blue-600 text-white hover:bg-blue-500 shadow-xl"
                                    >
                                        {isLoadingThis ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Selecting...</> : <>Select {plan.name.split(" ")[0]} <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" /></>}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}