"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState, use } from "react";
import {
    Users, Building2, CreditCard, Shield, 
    TrendingUp, ArrowRight, Loader2, Globe, Award, Plus, ArrowLeft, Mail,
    Zap, PieChart, Activity, BarChart3, CheckCircle, Smartphone
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { superadminGetAdminPortfolioStats, superadminGetAdminCompanies } from "@/api";

interface AdminPortfolioStats {
    totalCompanies: number;
    totalEmployees: number;
    plans: { plan: string; count: number }[];
}

interface AdminDetails {
    firstName: string;
    lastName: string;
    email: string;
}

export default function SuperadminAdminDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { token } = useAppSelector(s => s.auth);
    const [stats, setStats] = useState<AdminPortfolioStats | null>(null);
    const [admin, setAdmin] = useState<AdminDetails | null>(null);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, companiesRes] = await Promise.all([
                    superadminGetAdminPortfolioStats(id),
                    superadminGetAdminCompanies(id)
                ]);

                if (statsRes.data.success && companiesRes.data.success) {
                    setStats(statsRes.data.stats);
                    setAdmin(statsRes.data.admin);
                    setCompanies(companiesRes.data.companies);
                }
            } catch (err) {
                console.error("Dashboard portfolio fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token && id) fetchStats();
    }, [token, id]);

    if (loading) {
        return (
            <div className="flex flex-col h-[70vh] items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin opacity-40" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Accessing Admin Registry Cluster</p>
            </div>
        );
    }

    if (!admin) {
        return (
            <div className="flex h-[70vh] flex-col items-center justify-center text-muted-foreground">
                <Shield className="w-16 h-16 mb-4 opacity-10" />
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground/40 mb-2">Registry Connection Failure</h2>
                <p className="text-[11px] font-medium opacity-60">Admin portfolio node not found or identity decommissioned.</p>
                <Link href="/superadmin/dashboard/admins" className="mt-6 h-10 px-6 rounded-xl border border-border flex items-center gap-2 text-[11px] font-black uppercase tracking-widest hover:bg-muted transition-all">
                    <ArrowLeft className="w-4 h-4" /> Return to Management Hub
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 relative pb-20">
            
            {/* ── Dynamic Header ────────────────────────────────────────── */}
            <div className="module-header !items-end justify-between border-b border-border/60 pb-8">
                <div className="space-y-6">
                    <Link 
                        href="/superadmin/dashboard/admins" 
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-blue-600 transition-colors group px-4 py-1.5 bg-muted/60 rounded-xl border border-border/40"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        HUB ACCESS / ADMIN REGISTRY
                    </Link>
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                           <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 font-black text-xl">
                               {admin.firstName[0]}{admin.lastName[0]}
                           </div>
                           <div>
                               <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase leading-none mb-2">
                                   {admin.firstName} {admin.lastName}
                               </h1>
                               <div className="flex items-center gap-4">
                                   <p className="text-[11px] text-muted-foreground flex items-center gap-2 font-bold uppercase tracking-widest">
                                       <Mail className="w-3.5 h-3.5 text-blue-500/50" />
                                       {admin.email}
                                   </p>
                                   <div className="h-1 w-1 rounded-full bg-border" />
                                   <p className="text-[10px] text-blue-600 font-extrabold flex items-center gap-1.5 uppercase tracking-widest">
                                       <Shield className="w-3 h-3 opacity-50" /> Controller Node 0x01
                                   </p>
                               </div>
                           </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="h-10 px-5 rounded-xl border border-border bg-card flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest hover:bg-muted transition-all">
                        <CreditCard className="w-4 h-4 text-muted-foreground" /> Bills & Finances
                    </button>
                    <button className="h-10 px-6 rounded-xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all group">
                        Update Protocol <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1" />
                    </button>
                </div>
            </div>

            {/* ── Stat Visualization Layer ──────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Assigned Units", value: stats?.totalCompanies || 0, icon: Building2, color: "text-blue-600", bg: "bg-blue-600/5" },
                    { label: "Workforce Reach", value: stats?.totalEmployees.toLocaleString() || 0, icon: Users, color: "text-indigo-600", bg: "bg-indigo-600/5" },
                    { label: "Active Revenue", value: "84.2K", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-600/5" },
                    { label: "Deployment Health", value: "98.4%", icon: Activity, color: "text-amber-500", bg: "bg-amber-500/5" },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-3xl border border-border/80 bg-card/50 shadow-sm relative group overflow-hidden">
                        <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                            <stat.icon className={`w-24 h-24 ${stat.color}`} />
                        </div>
                        <div className="relative z-10">
                            <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                <stat.icon className="w-5 h-5 pointer-events-none" />
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1">{stat.label}</p>
                            <div className="flex items-end gap-2">
                                <p className="text-3xl font-black tracking-tighter text-foreground leading-none">{stat.value}</p>
                                {i === 2 && <span className="text-[10px] font-black text-emerald-600 mb-1 tracking-tighter">+12%</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* ── Representative Analytics Graph ──────────────────────── */}
                <div className="lg:col-span-2 p-8 rounded-3xl border border-border bg-card shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-[14px] font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-blue-600/60" /> Node Utilization Wavefront
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Operational density across managed hubs</p>
                        </div>
                        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl border border-border/40">
                            {['7D', '30D', '90D'].map(t => (
                                <button key={t} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${t === '30D' ? "bg-background text-foreground shadow-sm shadow-black/5 border border-border/40" : "text-muted-foreground hover:text-foreground"}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Faux Graph Structure */}
                    <div className="h-56 w-full flex items-end justify-between gap-1 mt-4 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/[0.03] to-transparent pointer-events-none" />
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 50, 85, 40, 60].map((h, i) => (
                            <motion.div 
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                                className={`flex-1 rounded-t-lg bg-blue-600/10 border-t-2 border-blue-600/40 hover:bg-blue-600/40 transition-all cursor-pointer relative group/bar`}
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-[9px] font-black rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    NODE {i+1}: {h}%
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ── Plan & License Distribution ─────────────────────────── */}
                <div className="p-8 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-[14px] font-black text-foreground uppercase tracking-tight flex items-center gap-2 mb-1">
                            <PieChart className="w-4 h-4 text-blue-600/60" /> License Matrix
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mb-10">Subscription tier spread across registry</p>
                        
                        <div className="space-y-4">
                            {stats?.plans?.map((p, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${p.plan === 'enterprise' ? 'bg-purple-600/10 border-purple-600/20 text-purple-600' : 'bg-blue-600/10 border-blue-600/20 text-blue-600'}`}>
                                                <Zap className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-foreground leading-none mb-0.5">{p.plan.toUpperCase()}</p>
                                                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">{p.count} Active Keys</p>
                                            </div>
                                        </div>
                                        <p className="text-[11px] font-black text-foreground leading-none">{Math.round((p.count / (stats.totalCompanies || 1)) * 100)}%</p>
                                    </div>
                                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(p.count / (stats.totalCompanies || 1)) * 100}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full rounded-full ${p.plan === 'enterprise' ? 'bg-purple-600' : 'bg-blue-600 shadow-[0_0_8px_#2563eb50]'}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Interactive Managed Portfolio Table ───────────────────── */}
            <div className="bg-card border border-border shadow-2xl shadow-black/5 rounded-[2.5rem] overflow-hidden flex flex-col">
                <div className="px-10 py-8 border-b border-border/60 flex items-center justify-between bg-muted/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Zap className="w-32 h-32 text-blue-600" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tight mb-1">Assigned Registry Portfolio</h2>
                        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.2em] flex items-center gap-2">
                             <Activity className="w-3.5 h-3.5 text-blue-600/40" /> Monitor active hubs under this controller
                        </p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/10 border-b border-border/60">
                            <tr>
                                {["Organization Point", "Registry Pointer", "Subscription", "Operational Force", "Financials", ""].map(h => (
                                    <th key={h} className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {companies.map((company) => (
                                <tr key={company.id} className="hover:bg-blue-600/[0.02] transition-all group/row">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-muted border border-border flex items-center justify-center font-black group-hover/row:scale-110 group-hover/row:bg-blue-600 group-hover/row:text-white group-hover/row:border-blue-600 transition-all duration-300">
                                                {company.name.slice(0,2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-[13px] tracking-tight text-foreground group-hover/row:text-blue-600 transition-colors uppercase">{company.name}</p>
                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{company.industry || "General HUB"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className="font-mono text-[10px] font-bold bg-muted/60 text-muted-foreground px-2.5 py-1.5 rounded-xl border border-border group-hover/row:border-blue-500/20 group-hover/row:bg-blue-500/5 transition-all">#{company.company_id}</span>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col gap-1.5">
                                           <div className="flex items-center gap-2">
                                              <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ${company.plan === 'enterprise' ? 'text-purple-500 bg-current' : 'text-blue-500 bg-current'}`} />
                                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">{company.plan} Protocol</span>
                                           </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                            <div className="flex items-center justify-between mb-0.5">
                                               <span className="text-[11px] font-black uppercase tracking-tighter">{company.num_employees.toLocaleString()} Nodes</span>
                                               <Users className="w-3.5 h-3.5 text-blue-600/40" />
                                            </div>
                                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, (company.num_employees / 50) * 100)}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_#2563eb80]" 
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl border uppercase tracking-[0.2em] transition-all ${
                                            company.is_paid 
                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                            : 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse shadow-[0_0_10px_#ef444420]'
                                        }`}>
                                            {company.is_paid ? 'Cleared' : 'Critical Debt'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <Link href={`/superadmin/dashboard/admins/${id}/companies/${company.company_id}`} className="inline-flex items-center gap-2.5 px-4 py-2 bg-muted/60 border border-border/60 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all hover:scale-105 active:scale-95 shadow-sm group/btn">
                                            Manage Node <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1.5 transition-transform" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
