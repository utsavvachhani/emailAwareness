"use client";
import { CreditCard, Download, FileText, CheckCircle2 } from "lucide-react";

export default function AdminBillsPage() {
    const invoices = [
        { id: "INV-1024", date: "2024-03-01", amount: "₹2,499", status: "Paid", download: true },
        { id: "INV-1023", date: "2024-02-01", amount: "₹2,499", status: "Paid", download: true },
        { id: "INV-1022", date: "2024-01-01", amount: "₹2,499", status: "Paid", download: true },
        { id: "INV-1021", date: "2023-12-01", amount: "₹2,499", status: "Unpaid", download: false },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="module-header border-b border-border/40 pb-6 mb-8">
                <div>
                    <h1 className="module-title flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-blue-500" />
                        Billing & Invoices
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1 italic font-medium opacity-70">Manage your subscription and view past transactions</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active Plan Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-neutral-900 to-black rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Current Active Subscription</p>
                                <h2 className="text-4xl font-black italic tracking-tighter">Professional Plan</h2>
                            </div>
                            <span className="bg-blue-500 text-[10px] font-black uppercase px-4 py-1.5 rounded-full border border-blue-400/30 shadow-lg shadow-blue-500/20">Active Now</span>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1.5">Monthly Billing</p>
                                <p className="text-2xl font-black tracking-tighter italic">₹2,499<span className="text-sm font-medium text-white/50 lowercase ml-1">/ month</span></p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1.5">Next Renewal</p>
                                <p className="text-2xl font-black tracking-tighter italic">01 April 2024</p>
                            </div>
                        </div>
                    </div>
                    {/* Background decorations */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-[80px]" />
                </div>

                {/* Quick Payment Info */}
                <div className="bg-card border border-border/60 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-xl">
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center border border-border/50">
                            <CreditCard className="w-6 h-6 text-muted-foreground opacity-40" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Operations Unit</p>
                        <p className="text-sm font-bold leading-relaxed italic opacity-80">Connected to auto-billing network via secure gateway.</p>
                    </div>
                    <button className="w-full mt-6 py-3.5 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-black/10">
                        Update Payment Node
                    </button>
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-card border border-border/60 rounded-[3rem] shadow-xl overflow-hidden mt-10">
                <div className="p-8 border-b border-border/40 bg-blue-500/[0.02] flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black italic tracking-tight">Transaction History</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 mt-1">Immutable ledger of billing operations</p>
                    </div>
                    <FileText className="w-5 h-5 opacity-20" />
                </div>
                <div className="divide-y divide-border/20">
                    {invoices.map((inv) => (
                        <div key={inv.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                                    <FileText className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-sm font-black italic group-hover:text-blue-600 transition-colors">{inv.id}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-tighter mt-0.5">{inv.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-12">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground/40 mb-0.5 tracking-tighter">Amount Invoiced</p>
                                    <p className="text-xs font-black tracking-tighter">{inv.amount}</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 text-[10px] font-black uppercase tracking-tighter min-w-[80px] justify-center">
                                    {inv.status === "Paid" ? (
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    )}
                                    <span className={inv.status === "Paid" ? "text-emerald-600" : "text-amber-600"}>{inv.status}</span>
                                </div>
                                <button
                                    disabled={!inv.download}
                                    className="w-10 h-10 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground opacity-20 hover:opacity-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 border border-transparent disabled:opacity-0 transition-all shadow-xl shadow-black/5"
                                >
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
