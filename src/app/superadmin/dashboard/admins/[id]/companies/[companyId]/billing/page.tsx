"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { PLANS, PLAN_LABEL } from "@/constant/biils/planes";
import {
    CreditCard, CheckCircle2, ChevronRight, AlertCircle, Loader2, ArrowLeft, ShieldCheck, Wallet, History, Info
} from "lucide-react";
import { toast } from "sonner";
import { superadminGetCompanyDetails, superadminUpdateCompanyBilling } from "@/api";

export default function SuperadminCompanyBillingOversight() {
    const { id: adminId, companyId } = useParams();
    const token = useAppSelector((s) => s.auth.token);

    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchCompany = async () => {
        setLoading(true);
        try {
            const res = await superadminGetCompanyDetails(companyId as string);
            if (res.data.success) {
                setCompany(res.data.company);
            }
        } catch (err) {
            console.error("fetch company billing details:", err);
            toast.error("Failed to load entity records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (companyId && token) fetchCompany();
    }, [companyId, token]);

    const handleOverrideBilling = async (planKey: string, isPaid: boolean) => {
        setUpdating(true);
        try {
            const res = await superadminUpdateCompanyBilling(companyId as string, { 
                plan: planKey, 
                is_paid: isPaid 
            });
            if (res.data.success) {
                toast.success(`Billing state updated for ${company.name}`);
                setCompany(res.data.company);
            }
        } catch (err) {
            console.error("Override billing err:", err);
            toast.error("Privileged update failure");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    const currentPlan = company?.plan?.toLowerCase();
    const isPaid = company?.is_paid;

    return (
        <div className="space-y-12 max-w-[1400px] mx-auto pb-12">
            {/* Contextual Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/80">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                         <span className="text-blue-600">Finance</span> Oversight
                    </h1>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                        Privileged subscription management for <span className="text-foreground uppercase">{company?.name}</span>
                    </p>
                </div>

                <div className={`flex items-center gap-2 px-6 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${
                    isPaid ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 shadow-lg shadow-emerald-500/5" : "bg-amber-500/10 border-amber-500/20 text-amber-700"
                }`}>
                    <div className={`w-2 h-2 rounded-full ${isPaid ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                    {isPaid ? "Service Authenticated" : "Payment Awaited"}
                </div>
            </div>

            {/* High-Level Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Subscription Selection Matrix */}
                    <div className="bg-card border border-border rounded-[2.5rem] p-8">
                        <div className="flex items-center gap-3 mb-8">
                             <div className="p-3 bg-blue-600/10 rounded-2xl">
                                 <Wallet className="w-5 h-5 text-blue-600" />
                             </div>
                             <div>
                                 <h3 className="text-lg font-black uppercase tracking-tight">Tier Selection Matrix</h3>
                                 <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Override administrative subscription records</p>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {PLANS.map((plan) => {
                                const isActive = currentPlan === plan.key;
                                return (
                                    <button 
                                        key={plan.key}
                                        onClick={() => handleOverrideBilling(plan.key, !!isPaid)}
                                        disabled={updating || isActive}
                                        className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden group ${
                                            isActive 
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20' 
                                            : 'bg-muted/30 border-border hover:border-blue-600/30'
                                        }`}
                                    >
                                        <plan.icon className={`w-8 h-8 mb-4 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                                        <h4 className="font-black text-sm uppercase tracking-tight">{plan.name}</h4>
                                        <p className={`text-[10px] font-bold mt-1 ${isActive ? 'text-white/70' : 'text-muted-foreground uppercase'}`}>Monthly Check: {plan.priceLabel}</p>
                                        {isActive && <div className="absolute top-2 right-2 p-1 bg-white/20 rounded-full"><CheckCircle2 className="w-4 h-4" /></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Privileged Payment Override */}
                    <div className="bg-card border border-border rounded-[3.5rem] p-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                         <div className="flex items-center gap-6">
                            <div className={`p-5 rounded-3xl ${isPaid ? 'bg-emerald-600/10' : 'bg-red-600/10'}`}>
                                <ShieldCheck className={`w-10 h-10 ${isPaid ? 'text-emerald-600' : 'text-red-600'}`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter">Entitlement Status</h3>
                                <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${isPaid ? 'text-emerald-600' : 'text-red-600 font-black'}`}>
                                    {isPaid ? 'The entity has verified payment credentials' : 'Service is currently locked for this entity'}
                                </p>
                            </div>
                         </div>
                         <button 
                            onClick={() => handleOverrideBilling(currentPlan || 'none', !isPaid)}
                            disabled={updating || !currentPlan}
                            className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl hover:scale-105 active:scale-95 ${
                                isPaid 
                                ? 'bg-red-600 text-white shadow-red-600/20 hover:bg-black' 
                                : 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-black'
                            }`}
                         >
                            {isPaid ? 'Revoke Access' : 'Authorize Portal'}
                         </button>
                    </div>
                </div>

                {/* Audit & Context */}
                <div className="space-y-6">
                    <div className="bg-black text-white rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center gap-3">
                             <History className="w-5 h-5 text-blue-500" />
                             <h3 className="text-sm font-black uppercase tracking-widest italic">Compliance Context</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Company Root ID</p>
                                <p className="text-xs font-mono font-bold">{company.company_id}</p>
                            </div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Entity Headcount</p>
                                <p className="text-xl font-black italic">{company.num_employees || 0} Staff Members</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-white/30 font-medium italic leading-relaxed">
                            Superadmin oversight allows for immediate plan overrides and payment bypasses for troubleshooting and partner support.
                        </p>
                    </div>

                    <div className="bg-muted/40 border-2 border-dashed border-border rounded-[2.5rem] p-8 flex flex-col items-center text-center space-y-4">
                         <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center opacity-40">
                             <Info className="w-6 h-6" />
                         </div>
                         <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Administrative Policy</p>
                         <p className="text-[10px] font-medium text-muted-foreground/60 leading-tight">These changes update the entity record directly in the production node. Transactional logs will record this privileged modification.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

