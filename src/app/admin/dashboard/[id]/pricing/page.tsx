"use client";
import { CreditCard, Shield } from "lucide-react";

export default function AdminPricingPage() {
    const plans = [
        { name: "Starter", price: "₹999", period: "/ month", employees: "Up to 50", companies: "1 Company", highlight: false },
        { name: "Professional", price: "₹2,499", period: "/ month", employees: "Up to 250", companies: "5 Companies", highlight: true },
        { name: "Enterprise", price: "Custom", period: "", employees: "Unlimited", companies: "Unlimited", highlight: false },
    ];
    return (
        <div className="space-y-10 animate-fade-in mb-20">
            <div className="module-header flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40">
                <div>
                    <h1 className="module-title flex items-center gap-3 italic tracking-tighter uppercase">
                        <CreditCard className="w-8 h-8 text-blue-600" />
                        Subscription & Licensing Hub
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2 font-medium italic opacity-60">Managing enterprise-scale security features for your active nodes</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map(p => (
                    <div key={p.name} className={`group relative rounded-[2.5rem] border p-10 flex flex-col gap-8 transition-all hover:scale-[1.02] duration-500 ${p.highlight ? "border-blue-500/50 bg-neutral-900 text-white shadow-2xl shadow-blue-500/20" : "border-border/60 bg-card/40 backdrop-blur-3xl shadow-xl"}`}>
                        {p.highlight && <div className="absolute top-0 right-10 -translate-y-1/2 bg-blue-600 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">Gold Standard Plan</div>}
                        
                        <div>
                            <h3 className={`text-xl font-black italic tracking-tighter ${p.highlight ? 'text-blue-400' : 'text-foreground'}`}>{p.name}</h3>
                            <div className="flex items-baseline gap-1 mt-4">
                                <span className="text-4xl font-black tracking-tighter italic">{p.price}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1 ${p.highlight ? 'text-white' : 'text-foreground'}`}>{p.period}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { t: p.employees, d: "Maximum Node Population" },
                                { t: p.companies, d: "Entity Cluster Support" },
                                { t: "Active Awareness", d: "Email & Phish Mitigation" },
                            ].map((feat, i) => (
                                <div key={i} className="flex flex-col gap-1 border-b border-border/20 pb-3 last:border-0">
                                    <span className={`text-[11px] font-black italic ${p.highlight ? 'text-white' : 'text-foreground'}`}>✓ {feat.t}</span>
                                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">{feat.d}</span>
                                </div>
                            ))}
                        </div>

                        <button className={`mt-auto py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${p.highlight ? "bg-white text-blue-600 hover:bg-neutral-100" : "bg-black text-white hover:bg-neutral-800"}`}>
                            UPDATE SUBSCRIPTION
                        </button>
                    </div>
                ))}
            </div>

            {/* Licensing Note */}
            <div className="bg-blue-600/5 border border-blue-500/20 rounded-[2rem] p-8 flex items-center justify-between group">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-700">Enterprise Administration</h4>
                        <p className="text-xs font-medium italic text-muted-foreground mt-1 max-w-lg">Subscription changes must be authorized by the system Superadmin. Contact the hub for configuration adjustments.</p>
                    </div>
                </div>
                <button className="px-8 py-3 bg-white border border-blue-500/20 rounded-xl text-[10px] font-black uppercase text-blue-600 shadow-sm hover:shadow-md transition-all">
                    CONTACT HUB
                </button>
            </div>
        </div>
    );
}
