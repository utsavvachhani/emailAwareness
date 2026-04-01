import React from 'react';
import { ShieldCheck, ArrowUpRight, CheckCircle2, Zap } from 'lucide-react';
import { PLANS } from '@/constant/biils/planes';

interface BillingSectionProps {
    plans?: { plan: string; count: number }[];
    totalCompanies: number;
}

export const BillingSection: React.FC<BillingSectionProps> = ({ plans, totalCompanies }) => {
    const activePlanKeys = plans?.map(p => p.plan.toLowerCase()) || [];
    const activePlanDetails = PLANS.filter(p => activePlanKeys.includes(p.key.toLowerCase()));
    const displayPlans = activePlanDetails.length > 0 ? activePlanDetails : PLANS.slice(0, 1);

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-full transition-all hover:shadow-md">
            <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-bold tracking-tight">Ecosystem Plans</h2>
                </div>
                <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Stable
                </div>
            </div>
            
            <div className="p-6 space-y-5 flex-1 max-h-[500px] overflow-y-auto custom-scrollbar">
                {displayPlans.map((plan) => {
                    const statsForPlan = plans?.find(p => p.plan.toLowerCase() === plan.key.toLowerCase());
                    const Icon = plan.icon;
                    return (
                        <div key={plan.key} className="group p-4 rounded-xl bg-muted/40 border border-transparent hover:border-blue-500/20 transition-all hover:bg-muted/60">
                            <div className="flex items-start justify-between mb-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-md font-bold tracking-tight">{plan.name}</h3>
                                        <Icon className="w-3.5 h-3.5 text-blue-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">{plan.tagline}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black tracking-tighter text-blue-600">{plan.priceLabel}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5 pt-2">
                                {plan.features.slice(0, 3).map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[10px] font-medium text-foreground/70">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                                        {f.text}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{statsForPlan?.count || 0} Entities Active</span>
                                <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Manage <ArrowUpRight className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-5 border-t border-border bg-muted/20 mt-auto">
                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-600 text-white shadow-xl shadow-blue-600/10 transition-transform active:scale-95 cursor-pointer">
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-blue-100/70 opacity-80">Portfolio Revenue</p>
                        <p className="text-xl font-black tracking-tighter">₹ {(plans?.reduce((acc, p) => acc + (p.count * (PLANS.find(pl => pl.key === p.plan)?.price || 0)), 0) || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2 mt-1 bg-white/10 rounded-lg border border-white/20">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        </div>
    );
};
