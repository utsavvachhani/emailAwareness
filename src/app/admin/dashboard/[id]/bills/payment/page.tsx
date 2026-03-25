"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { 
    CreditCard, ShieldCheck, Lock, ChevronLeft, 
    CheckCircle2, Loader2, Zap, Shield, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function PaymentPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const token = useAppSelector(s => s.auth.token);
    
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
                if (data.success) setCompany(data.company);
            } catch (err) { console.error(err); }
        };
        if (id && token) fetchCompany();
    }, [id, token]);

    const handlePayment = async () => {
        setProcessing(true);
        // Simulate payment gateway delay
        await new Promise(r => setTimeout(r, 2000));
        
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
                setSuccess(true);
                toast.success("Payment Received! Activating your dashboard...");
                setTimeout(() => router.push(`/admin/dashboard/${id}`), 2500);
            } else {
                toast.error("Payment sync failed");
            }
        } catch (err) {
            toast.error("Network error during payment");
        } finally {
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter">Transaction Verified</h1>
                    <p className="text-muted-foreground font-medium">Your enterprise nodes are now active. Redirecting to hub...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-10">
            <Link href={`/admin/dashboard/${id}/bills`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-blue-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Back to Subscription Selection
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* Checkout Section */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black italic tracking-tighter">Secure Checkout</h1>
                        <p className="text-sm text-muted-foreground font-medium italic">Complete your transaction via our encrypted payment gateway.</p>
                    </div>

                    <div className="bg-card border border-border/60 rounded-[3rem] p-10 shadow-xl space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                Payment Method
                            </h3>
                            <div className="flex gap-2">
                                <div className="h-6 w-10 bg-muted rounded border border-border/40" />
                                <div className="h-6 w-10 bg-muted rounded border border-border/40" />
                                <div className="h-6 w-10 bg-muted rounded border border-border/40" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Card Holder</label>
                                <input disabled value={company?.name || "CyberShield Enterprise"} className="w-full bg-muted/30 border border-border/40 rounded-2xl px-6 py-4 text-sm font-bold opacity-50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-1">Mock Card Details</label>
                                <div className="grid grid-cols-4 gap-4">
                                    <input value="4242" disabled className="col-span-2 bg-muted/40 border border-border/40 rounded-2xl px-6 py-4 text-sm font-mono opacity-50" />
                                    <input value="12/26" disabled className="bg-muted/40 border border-border/40 rounded-2xl px-6 py-4 text-sm font-mono opacity-50" />
                                    <input value="999" disabled className="bg-muted/40 border border-border/40 rounded-2xl px-6 py-4 text-sm font-mono opacity-50" />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 flex items-start gap-4">
                            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-blue-700 leading-relaxed uppercase tracking-tight">
                                Your payment information is protected by 256-bit SSL encryption. This is a secure transaction node.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-neutral-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between h-full min-h-[400px]">
                        <div className="relative z-10 space-y-8">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Order Summary</p>
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase">{company?.plan || "Standard"} Tier</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                                    <span className="font-black italic">₹{company?.plan === 'premium' ? '3,999' : company?.plan === 'standard' ? '2,499' : '1,499'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Gateway Fee</span>
                                    <span className="font-black italic text-blue-400">₹0.00</span>
                                </div>
                                <div className="h-px bg-white/10 w-full" />
                                <div className="flex justify-between items-end">
                                    <span className="text-white/40 font-black uppercase tracking-[0.2em] text-[12px]">Total</span>
                                    <span className="text-5xl font-black italic tracking-tighter text-blue-400">
                                        ₹{company?.plan === 'premium' ? '3,999' : company?.plan === 'standard' ? '2,499' : '1,499'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handlePayment}
                            disabled={processing}
                            className="relative z-10 w-full py-5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-blue-50 transition-all shadow-xl shadow-black/20 mt-10 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing Gateway...
                                </>
                            ) : (
                                <>
                                    Authorize Payment
                                    <Zap className="w-3.5 h-3.5 fill-black" />
                                </>
                            )}
                        </button>

                        {/* Background Decoration */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
                    </div>

                    <div className="flex items-center justify-center gap-6 opacity-40 grayscale py-4">
                        <Lock className="w-4 h-4" />
                        <Sparkles className="w-4 h-4" />
                        <Shield className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
