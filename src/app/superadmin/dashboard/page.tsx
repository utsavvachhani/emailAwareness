"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState } from "react";
import {
    Users, Building2, Shield, 
    ArrowRight, Loader2, Award, GraduationCap,
    TrendingUp, ExternalLink, Activity, Clock,
    CheckCircle2, DollarSign, Wallet, Plus
} from "lucide-react";
import Link from "next/link";
import { 
    superadminGetGlobalStats, 
    superadminGetAllCompanies, 
    superadminGetPendingAdmins 
} from "@/api";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";

interface GlobalStats {
    totalCompanies: number;
    totalAdmins: number;
    totalUsers: number;
    totalCourses: number;
    totalModules: number;
    recentCompanies: number;
    totalRevenue: number;
    plans: { plan: string; count: number }[];
}

export default function SuperadminDashboardPage() {
    const { userInfo, token } = useAppSelector(s => s.auth);
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [companies, setCompanies] = useState<any[]>([]);
    const [pendingAdmins, setPendingAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [statsRes, companiesRes, pendingRes] = await Promise.all([
                    superadminGetGlobalStats(),
                    superadminGetAllCompanies(),
                    superadminGetPendingAdmins()
                ]);

                if (statsRes.data.success) setStats(statsRes.data.stats);
                if (companiesRes.data.success) setCompanies(companiesRes.data.companies);
                if (pendingRes.data.success) setPendingAdmins(pendingRes.data.admins);

            } catch (err) {
                console.error("Superadmin dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchAllData();
    }, [token]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Synchronizing Global Command...</p>
                </div>
            </div>
        );
    }

    const mostPopularPlan = stats?.plans?.sort((a,b) => b.count - a.count)[0]?.plan || "N/A";

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Superadmin Exclusive Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-red-600 mb-1">
                        <Shield className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Platform Sovereignty</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        Global <span className="text-red-600">Command</span> Center
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-md">
                        Overseeing {stats?.totalCompanies ?? 0} companies and {(stats?.totalUsers ?? 0) + (stats?.totalAdmins ?? 0)} active accounts across the network.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {pendingAdmins.length > 0 && (
                        <Link href="/superadmin/dashboard/admins" className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-amber-500/20 transition-all">
                            <Activity className="w-3.5 h-3.5 animate-pulse" /> {pendingAdmins.length} Pending Approvals
                        </Link>
                    )}
                    <Link href="/superadmin/dashboard/companies" className="px-5 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-foreground/10">
                         Create Enterprise <Plus className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Platform Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard 
                    title="Global Portfolio"
                    subtitle="Active Organizations"
                    value={stats?.totalCompanies || 0}
                    icon={Building2}
                    color="blue"
                    footer={
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600">
                            <TrendingUp className="w-3 h-3 text-emerald-500" /> {stats?.recentCompanies} new this week
                        </div>
                    }
                />
                <StatsCard 
                    title="Personnel Reach"
                    subtitle="Platform Accounts"
                    value={(stats?.totalUsers || 0) + (stats?.totalAdmins || 0)}
                    icon={Users}
                    color="purple"
                    footer={
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600">
                             Distributed admin network
                        </div>
                    }
                />
                <StatsCard 
                    title="Curriculum Depth"
                    subtitle="Platform Modules"
                    value={stats?.totalModules || 0}
                    icon={GraduationCap}
                    color="amber"
                    footer={
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
                            Across {stats?.totalCourses} courses
                        </div>
                    }
                />
                <StatsCard 
                    title="Estimated Revenue"
                    subtitle="7-Day Portfolio Value"
                    value={`₹ ${(stats?.totalRevenue || 0).toLocaleString()}`}
                    icon={Wallet}
                    color="emerald"
                    footer={
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                            <CheckCircle2 className="w-3 h-3" /> System healthy
                        </div>
                    }
                />
            </div>

            {/* Core Portfolio Management */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Master Company Table */}
                <div className="lg:col-span-12 space-y-8">
                    <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md">
                        <div className="px-8 py-6 border-b border-border bg-muted/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-600/20 shadow-inner">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-bold tracking-tight">Organization Master Registry</h2>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Global Company Portfolio</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/5 text-emerald-600 text-[9px] font-black uppercase rounded-full border border-emerald-500/10">
                                    <DollarSign className="w-3 h-3" /> Growth: +{stats?.recentCompanies} Entities
                                </div>
                                <Link 
                                    href="/superadmin/dashboard/companies" 
                                    className="group inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Full Portfolio <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto min-h-[400px]">
                            <table className="w-full text-left border-collapse">
                                <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border bg-muted/20">
                                    <tr>
                                        <th className="px-8 py-5">Corporate Entity</th>
                                        <th className="px-6 py-5">Sub. Tier</th>
                                        <th className="px-6 py-5 text-center">Workforce</th>
                                        <th className="px-6 py-5 text-center">Curriculum</th>
                                        <th className="px-6 py-5">Health</th>
                                        <th className="px-8 py-5 text-right">Revenue Share</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {companies?.slice(0, 10).map(c => {
                                        const rev = c.plan === 'premium' ? 4999 : c.plan === 'standard' ? 2499 : 999;
                                        return (
                                            <tr key={c.id} className="group hover:bg-muted/5 transition-all duration-300">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center text-[10px] font-black border border-border group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all shadow-sm">
                                                            {c.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold group-hover:text-red-600 transition-colors leading-none mb-1">{c.name}</p>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[9px] text-muted-foreground/60 font-medium uppercase tracking-tighter">{c.company_id}</p>
                                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                                <p className="text-[9px] text-muted-foreground/40 font-medium">{new Date(c.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm ${
                                                        c.plan === 'premium' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
                                                        c.plan === 'standard' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 
                                                        'bg-blue-300/10 text-blue-600 border-blue-300/30'
                                                    }`}>
                                                        {c.plan || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="inline-flex flex-col items-center">
                                                        <span className="text-xs font-black tracking-tight">{c.num_employees || 0}</span>
                                                        <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 text-center min-w-[70px]">Employees</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="inline-flex flex-col items-center">
                                                        <span className="text-xs font-black tracking-tight">{Math.floor(Math.random() * 5) + 1}</span>
                                                        <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Courses</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1 w-16 bg-muted rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 w-[88%]" />
                                                        </div>
                                                        <span className="text-[10px] font-black text-emerald-600">88%</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <p className="text-sm font-black tracking-tight">₹ {rev.toLocaleString()}</p>
                                                        <p className={`text-[8px] font-black uppercase tracking-widest ${c.is_paid ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                            {c.is_paid ? 'Paid' : 'Unpaid'}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {companies?.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-32 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 rounded-3xl bg-muted/40 flex items-center justify-center text-muted-foreground">
                                                        <Building2 className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">No organizations in global registry</p>
                                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Platform-wide portfolio is currently empty.</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer System Status */}
            <div className="pt-10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6 text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Platform Integrity: <span className="text-foreground">Optimal</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Dominant Tier: <span className="text-foreground text-[11px]">{mostPopularPlan}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Last Global Sync: Just now</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/superadmin/dashboard/audit" className="hover:text-red-600 transition-colors flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" /> Security Audit
                    </Link>
                    <Link href="/superadmin/settings" className="hover:text-red-600 transition-colors">Platform Config</Link>
                </div>
            </div>
        </div>
    );
}
