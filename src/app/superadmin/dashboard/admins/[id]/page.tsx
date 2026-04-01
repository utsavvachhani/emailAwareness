"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState, use } from "react";
import {
    Users, Building2, Shield, 
    ArrowRight, Loader2, Award, GraduationCap,
    TrendingUp, ExternalLink, Activity, ArrowLeft,
    Mail, CheckCircle2, DollarSign, Wallet
} from "lucide-react";
import Link from "next/link";
import { superadminGetAdminPortfolioStats, superadminGetAdminCompanies } from "@/api";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";

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
            if (!token || !id) return;
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
                console.error("Admin drill-down fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token, id]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Synchronizing Admin Portfolio...</p>
                </div>
            </div>
        );
    }

    if (!admin) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center text-muted-foreground animate-in fade-in">
                <Shield className="w-16 h-16 mb-4 opacity-10" />
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground/40 mb-2">Record Not Found</h2>
                <Link href="/superadmin/dashboard/admins" className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                    <ArrowLeft className="w-4 h-4" /> Back to Admin Registry
                </Link>
            </div>
        );
    }

    const mostPopularPlan = stats?.plans?.sort((a,b) => b.count - a.count)[0]?.plan || "N/A";

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Minimalist Corporate Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-4">
                    <Link 
                        href="/superadmin/dashboard/admins" 
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Registry / Controllers
                    </Link>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black shadow-xl shadow-blue-600/20">
                                {admin.firstName[0]}{admin.lastName[0]}
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">
                                    {admin.firstName} <span className="text-blue-600">{admin.lastName}</span>
                                </h1>
                                <p className="text-muted-foreground font-medium flex items-center gap-2 text-sm mt-1">
                                    <Mail className="w-3.5 h-3.5" /> {admin.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-foreground/10">
                        Protocol Override <Shield className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Admin Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard 
                    title="Domain Reach"
                    subtitle="Managed Organizations"
                    value={stats?.totalCompanies || 0}
                    icon={Building2}
                    color="blue"
                    footer={
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            <TrendingUp className="w-3 h-3 text-emerald-500" /> Active Portfolio
                        </div>
                    }
                />
                <StatsCard 
                    title="Workforce Force"
                    subtitle="Platform Personnel"
                    value={stats?.totalEmployees || 0}
                    icon={Users}
                    color="purple"
                    footer={
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-purple-600 uppercase tracking-widest">
                             Personnel density unit
                        </div>
                    }
                />
                <StatsCard 
                    title="Deployment Health"
                    subtitle="System Integrity"
                    value="98.2%"
                    icon={CheckCircle2}
                    color="emerald"
                    footer={
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                             Verified stability 
                        </div>
                    }
                />
            </div>

            {/* Managed Portfolio Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-full transition-all hover:shadow-md">
                        <div className="px-6 py-5 border-b border-border bg-muted/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-600/20">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-lg font-bold tracking-tight">Assigned Entity Portfolio</h2>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Controller Registry</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full text-left">
                                <thead className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border bg-muted/10">
                                    <tr>
                                        <th className="px-6 py-4">Corporate Entity</th>
                                        <th className="px-5 py-4">Plan Tier</th>
                                        <th className="px-5 py-4 text-center">Workforce</th>
                                        <th className="px-6 py-4 text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {companies?.map(c => (
                                        <tr key={c.id} className="group hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-muted text-foreground flex items-center justify-center text-[10px] font-black border border-border group-hover:bg-blue-600 group-hover:text-white transition-all scale-95 uppercase">
                                                        {c.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold group-hover:text-blue-600 transition-colors leading-none">{c.name}</p>
                                                        <p className="text-[9px] text-muted-foreground/60 font-medium uppercase tracking-tighter mt-1">#{c.company_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm ${
                                                    c.plan === 'enterprise' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' : 
                                                    c.plan === 'premium' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
                                                    'bg-blue-300/10 text-blue-600 border-blue-300/30'
                                                }`}>
                                                    {c.plan || 'NONE'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center font-black text-xs text-foreground/80">
                                                {c.num_employees || 0}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <p className="text-xs font-black tracking-tighter">₹ {c.plan === 'premium' ? '4,999' : '2,499'}</p>
                                                    <span className={`text-[8px] font-black uppercase ${c.is_paid ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {c.is_paid ? 'Cleared' : 'Pending'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {companies?.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <p className="text-xs font-bold text-muted-foreground uppercase opacity-40">No entities under this controller</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                {/* Sidebar Analytics Column */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-foreground text-background rounded-2xl p-6 shadow-xl shadow-foreground/10 space-y-6">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <h4 className="text-xl font-bold leading-tight">Billing & Revenue</h4>
                            <p className="text-xs text-background/60 leading-relaxed font-medium">Platform-wide financial footprint for this administrative node.</p>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-white/10">
                            {[
                                { label: "Current Recurring", value: "₹ 12,400" },
                                { label: "Projected 30D", value: "₹ 18,200" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{item.label}</span>
                                    <span className="text-sm font-black">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-tight">License Matrix</h4>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Distribution</p>
                            </div>
                        </div>
                        <div className="space-y-4 relative z-10">
                             {stats?.plans?.map(p => (
                                 <div key={p.plan} className="space-y-2">
                                     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                         <span>{p.plan} TIER</span>
                                         <span>{p.count} Entities</span>
                                     </div>
                                     <div className="h-1 w-full bg-muted rounded-full">
                                         <div 
                                            className="h-full bg-blue-600 rounded-full" 
                                            style={{ width: `${Math.round((p.count / (stats.totalCompanies || 1)) * 100)}%` }}
                                         />
                                     </div>
                                 </div>
                             ))}
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                            <GraduationCap className="w-24 h-24 rotate-12" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Subdued Footer */}
            <div className="pt-8 border-t border-border flex items-center justify-between text-muted-foreground font-bold text-[9px] uppercase tracking-widest opacity-60">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Operational Integrity Valid</span>
                    <span>Admin NodeID: {id.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href={`/superadmin/dashboard/admins/${id}/logs`} className="hover:text-foreground">Activity Logs</Link>
                </div>
            </div>
        </div>
    );
}

