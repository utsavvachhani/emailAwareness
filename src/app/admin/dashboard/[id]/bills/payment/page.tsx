"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import {
    CreditCard, ShieldCheck, Lock, ChevronLeft,
    CheckCircle2, Loader2, Zap, Shield, Sparkles,
    Users, BookOpen, FileCheck, Video, BarChart3,
    Target, Trophy, Bell, Crown, Layers, Mail
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const PLAN_DETAILS: Record<string, {
    name: string; price: string; amount: number;
    icon: any; color: string;
    features: string[];
}> = {
    basic: {
        name: "Basic Plan", price: "₹1,499", amount: 1499, icon: Zap, color: "emerald",
        features: ["Up to 30 Employees", "10 Training Modules", "8 Docs + 2 Videos", "1 Final Quiz per course", "Basic Dashboard", "1 Admin", "Private Company Access"],
    },
    standard: {
        name: "Standard Plan", price: "₹2,499", amount: 2499, icon: Sparkles, color: "blue",
        features: ["Up to 75 Employees", "20 Training Modules", "14 Docs + 6 Videos", "Quiz + Assignments", "Advanced Dashboard", "Employee-wise Progress", "2 Admins", "Email Template Library", "Awareness Score Tracking"],
    },
    premium: {
        name: "Premium Plan", price: "₹3,999", amount: 3999, icon: Crown, color: "purple",
        features: ["Up to 120 Employees", "35 Training Modules", "20 Docs + 15 Videos", "Quiz + Assignments + Scenarios", "Full Analytics Dashboard", "Dept-wise performance & Risk scoring", "Multiple Admins", "Phishing Simulation", "Leaderboard & Gamification", "Awareness Readiness Score"],
    },
};

export default function PaymentPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params?.id as string;
    const router = useRouter();
    const token = useAppSelector(s => s.auth.token);

    const planKey = (searchParams.get("plan") || "standard").toLowerCase();
    const plan = PLAN_DETAILS[planKey] || PLAN_DETAILS.standard;
    const Icon = plan.icon;

    const [company, setCompany] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                });
                const data = await res.json();
                if (data.success) {
                    setCompany(data.company);
                    
                    // Handle 'View Receipt' mode from Bills history
                    const view = searchParams.get("view");
                    if (view === "receipt" && data.company.is_paid) {
                        setSuccessData({
                            transactionId: `TXN-REISSUE-${id.substring(0, 5).toUpperCase()}`,
                            date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
                            companyName: data.company.name || "N/A",
                            plan: PLAN_DETAILS[data.company.plan?.toLowerCase() || "standard"] || PLAN_DETAILS.standard,
                        });
                        setSuccess(true);
                    }
                }
            } catch (err) { console.error(err); }
        };
        if (id && token) fetchCompany();
    }, [id, token, searchParams]);

    const [successData, setSuccessData] = useState<any>(null);

    const handlePayment = async () => {
        setProcessing(true);
        // Simulate gateway processing
        await new Promise(r => setTimeout(r, 2200));
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}/payment`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ is_paid: true }),
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                const txnData = {
                    transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
                    companyName: company?.name || "N/A",
                    plan: plan,
                };
                setSuccessData(txnData);
                setSuccess(true);
                toast.success("Payment Confirmed! Receipt Generated.");
                
                // Automatically share receipt with admin
                autoEmailReceipt(txnData);
            } else {
                toast.error(data.message || "Payment sync failed. Please try again.");
            }
        } catch {
            toast.error("Network error during payment. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const downloadPDF = async () => {
        const html2canvas = (await import("html2canvas")).default;
        const jsPDF = (await import("jspdf")).jsPDF;
        const receipt = document.getElementById("receipt-content");
        if (!receipt) return;

        toast.info("Generating your high-fidelity receipt...");
        const canvas = await html2canvas(receipt, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Receipt-${successData.transactionId}.pdf`);
        toast.success("Receipt downloaded successfully!");
    };

    const emailReceipt = async () => {
        toast.promise(autoEmailReceipt(successData), {
            loading: "Mailing receipt to company email...",
            success: "Professional receipt sent successfully!",
            error: (err) => err.message || "Failed to send receipt email."
        });
    };

    const autoEmailReceipt = async (data: any) => {
        if (!data) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}/send-receipt`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                transactionId: data.transactionId,
                planName: data.plan.name,
                amount: data.plan.price
            }),
            credentials: "include",
        });
        const resData = await res.json();
        if (!resData.success) throw new Error(resData.message);
        return resData;
    };

    // ── Success screen ──────────────────────────────────────────────────────
    if (success && successData) {
        return (
            <div className="min-h-screen py-20 px-4 flex flex-col items-center justify-center bg-zinc-50/50">
                <div className="max-w-2xl w-full space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                    
                    {/* Header Controls */}
                    <div className="flex items-center justify-between w-full">
                        <Link
                            href={`/admin/dashboard/${id}`}
                            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-blue-600 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Go to Dashboard
                        </Link>
                        <div className="flex gap-3">
                            <button 
                                onClick={emailReceipt}
                                className="h-10 px-5 rounded-full bg-white border border-border/60 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-50 transition-all shadow-sm"
                            >
                                <Mail className="w-3.5 h-3.5" /> Email Copy
                            </button>
                            <button 
                                onClick={downloadPDF}
                                className="h-10 px-5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                            >
                                <FileCheck className="w-3.5 h-3.5" /> Download PDF
                            </button>
                        </div>
                    </div>

                    {/* Receipt Body */}
                    <div id="receipt-content" className="bg-white border border-black/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] rounded-[3rem] p-12 relative overflow-hidden text-zinc-900">
                        {/* Decorative Patterns */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                        
                        <div className="relative z-10 space-y-12">
                            {/* Logo & Status */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <img src="/logo.svg" alt="Logo" className="w-12 h-12" />
                                        <span className="text-2xl font-black italic tracking-tighter">CyberShield Guard</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Transaction ID</p>
                                        <p className="text-sm font-mono font-bold tracking-tighter">{successData.transactionId}</p>
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <span className="inline-flex px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                        Payment Successful
                                    </span>
                                    <p className="text-[11px] font-bold text-zinc-400 italic font-mono">{successData.date}</p>
                                </div>
                            </div>

                            <div className="h-px bg-zinc-100 w-full" />

                            {/* Entity Details */}
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Billed To</p>
                                    <h3 className="text-lg font-black tracking-tight">{successData.companyName}</h3>
                                    <p className="text-[11px] font-medium text-zinc-400 max-w-[200px] leading-relaxed uppercase tracking-tight">Enterprise Entity Registration • Verified Member Since {new Date().getFullYear()}</p>
                                </div>
                                <div className="space-y-2 text-right">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Merchant Hub</p>
                                    <h3 className="text-lg font-black tracking-tight">CyberShield Guard Pvt Ltd.</h3>
                                    <p className="text-[11px] font-medium text-zinc-400 leading-relaxed uppercase tracking-tight">Digital Awareness & Compliance Security Ops</p>
                                </div>
                            </div>

                            {/* Plan Description Table */}
                            <div className="space-y-6">
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 border-b-2 border-black pb-2 inline-block">Service Allocation</p>
                                <div className="bg-zinc-50/50 rounded-3xl border border-zinc-100 overflow-hidden">
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center">
                                                    <Icon className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black italic">{successData.plan.name}</p>
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Cyber Resilience & Training Suite</p>
                                                </div>
                                            </div>
                                            <p className="font-black italic text-lg">{successData.plan.price}</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-x-12 gap-y-3 pt-6 border-t border-zinc-100">
                                            {successData.plan.features.slice(0, 4).map((f: string, i: number) => (
                                                <div key={i} className="flex items-center gap-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    {f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grand Total */}
                            <div className="pt-6 border-t-2 border-dashed border-zinc-200 flex justify-between items-end">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Authenticated Transaction</span>
                                    </div>
                                    <p className="text-[9px] font-medium text-zinc-400 max-w-[200px] leading-tight italic">
                                        This document serves as an official proof of purchase for auditing purposes.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-1">Final Amount Paid</p>
                                    <div className="text-5xl font-black italic tracking-tighter text-zinc-900 leading-none">
                                        {successData.plan.price}
                                    </div>
                                </div>
                            </div>

                            {/* Receipt Footer */}
                            <div className="flex flex-col items-center justify-center pt-10 text-center gap-4 border-t border-zinc-100">
                                <div className="flex gap-4 opacity-50 grayscale scale-75">
                                    <Lock className="w-5 h-5" />
                                    <ShieldCheck className="w-5 h-5" />
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300">
                                    www.cybershield.guard.com • Support@cybershield.com
                                </p>
                            </div>
                        </div>

                        {/* Watermark */}
                        <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 scale-150 select-none pointer-events-none">
                            <h1 className="text-9xl font-black italic tracking-tighter">VERIFIED</h1>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main checkout layout ────────────────────────────────────────────────
    return (
        <div className="max-w-5xl mx-auto space-y-10 py-8 pb-20">

            {/* Back nav */}
            <Link
                href={`/admin/dashboard/${id}/bills`}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-blue-600 transition-colors"
            >
                <ChevronLeft className="w-4 h-4" /> Back to Plan Selection
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

                {/* ── Left: Payment Form ─────────────────────────────────── */}
                <div className="lg:col-span-3 space-y-8">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter">Secure Checkout</h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                            Complete your transaction via our encrypted payment gateway.
                        </p>
                    </div>

                    <div className="bg-card border border-border/60 rounded-[3rem] p-10 shadow-xl space-y-8">
                        {/* Payment method header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                Payment Method
                            </h3>
                            <div className="flex gap-2">
                                {["VISA", "MC", "UPI"].map(b => (
                                    <div key={b} className="h-7 px-2.5 bg-muted rounded-lg border border-border/40 flex items-center justify-center text-[9px] font-black text-muted-foreground tracking-wider">
                                        {b}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Card fields (mock) */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">
                                    Card Holder / Company
                                </label>
                                <input
                                    disabled
                                    value={company?.name || "Your Company Name"}
                                    className="w-full bg-muted/30 border border-border/40 rounded-2xl px-6 py-4 text-sm font-bold opacity-60 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">
                                    Card Number
                                </label>
                                <input
                                    disabled
                                    value="4242  4242  4242  4242"
                                    className="w-full bg-muted/40 border border-border/40 rounded-2xl px-6 py-4 text-sm font-mono opacity-50 cursor-not-allowed tracking-widest"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Expiry</label>
                                    <input disabled value="12 / 28" className="w-full bg-muted/40 border border-border/40 rounded-2xl px-6 py-4 text-sm font-mono opacity-50 cursor-not-allowed" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">CVV</label>
                                    <input disabled value="•••" className="w-full bg-muted/40 border border-border/40 rounded-2xl px-6 py-4 text-sm font-mono opacity-50 cursor-not-allowed" />
                                </div>
                            </div>
                        </div>

                        {/* Security notice */}
                        <div className="p-5 bg-blue-500/5 rounded-3xl border border-blue-500/10 flex items-start gap-4">
                            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-blue-700 leading-relaxed uppercase tracking-tight">
                                Your payment is protected by 256-bit SSL encryption. This is a secure transaction node. No card data is stored.
                            </p>
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-8 opacity-30 grayscale">
                        <Lock className="w-5 h-5" />
                        <Shield className="w-5 h-5" />
                        <ShieldCheck className="w-5 h-5" />
                        <CreditCard className="w-5 h-5" />
                    </div>
                </div>

                {/* ── Right: Order Summary ───────────────────────────────── */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Plan summary card */}
                    <div className="bg-neutral-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex-1">
                        <div className="relative z-10 space-y-8">
                            {/* Plan header */}
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    <Icon className="w-7 h-7 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Selected Tier</p>
                                    <h2 className="text-2xl font-black italic tracking-tighter">{plan.name}</h2>
                                </div>
                            </div>

                            {/* Feature list */}
                            <ul className="space-y-2.5">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2.5 text-[11px] font-semibold text-white/70">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {/* Price breakdown */}
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                                    <span className="font-black italic">{plan.price}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">GST / Fees</span>
                                    <span className="font-black italic text-blue-400">₹0.00</span>
                                </div>
                                <div className="h-px bg-white/10 w-full" />
                                <div className="flex justify-between items-end">
                                    <span className="text-white/40 font-black uppercase tracking-[0.2em] text-[11px]">Total Due</span>
                                    <span className="text-4xl font-black italic tracking-tighter text-blue-400">{plan.price}</span>
                                </div>
                                <p className="text-[9px] text-white/20 uppercase tracking-widest text-right">Billed Monthly</p>
                            </div>

                            {/* Pay button */}
                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-blue-50 transition-all shadow-xl shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing Gateway...
                                    </>
                                ) : (
                                    <>
                                        Authorize & Pay {plan.price}
                                        <Zap className="w-3.5 h-3.5 fill-black" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Background glow */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[80px]" />
                    </div>

                    <p className="text-center text-[10px] text-muted-foreground opacity-40 uppercase tracking-widest">
                        Cancel anytime · Secure via SSL · No hidden fees
                    </p>
                </div>
            </div>
        </div>
    );
}
