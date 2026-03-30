"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState } from "react";
import {
    Users, Building2, CreditCard, Shield, 
    TrendingUp, ArrowRight, Loader2, Globe, Award, Plus
} from "lucide-react";
import Link from "next/link";
import { adminGetGlobalStats, adminGetCompanies } from "@/api";

interface GlobalStats {
    totalCompanies: number;
    totalEmployees: number;
    plans: { plan: string; count: number }[];
    companies: any[];
}

export default function AdminGlobalDashboard() {
    const { userInfo, token } = useAppSelector(s => s.auth);
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch Global Stats and Companies in parallel
                const [statsRes, companiesRes] = await Promise.all([
                    adminGetGlobalStats(),
                    adminGetCompanies()
                ]);

                if (statsRes.data.success && companiesRes.data.success) {
                    setStats({
                        ...statsRes.data.stats,
                        companies: companiesRes.data.companies
                    });
                }
            } catch (err) {
                console.error("Dashboard stats fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchStats();
    }, [token]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-500/20">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Global Administrator Overview</h1>
                        <p className="mt-2 text-blue-100 max-w-xl">
                            Welcome back, {userInfo?.firstName}. Manage your entire ecosystem of {stats?.totalCompanies} companies and {stats?.totalEmployees} employees from this central hub.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
                        <Shield className="h-6 w-6 text-blue-200" />
                        <span className="font-bold text-lg">CyberShield Admin</span>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-48 w-48 rounded-full bg-blue-400/10 blur-2xl" />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Active Portfolio</span>
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground">Managed Companies</h3>
                    <p className="text-3xl font-bold mt-1">{stats?.totalCompanies || 0}</p>
                    <Link href="/admin/dashboard/companies" className="flex items-center gap-2 mt-4 text-xs font-semibold text-blue-600 hover:gap-3 transition-all">
                        View all companies <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                <div className="group bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Total Reach</span>
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Employees</h3>
                    <p className="text-3xl font-bold mt-1">{stats?.totalEmployees || 0}</p>
                    <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-purple-600">
                        <TrendingUp className="w-3 h-3" /> Across all regions
                    </div>
                </div>

                <div className="group bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            <Award className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Plan Distribution</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {stats?.plans && stats.plans.length > 0 ? stats.plans.map(p => (
                            <div key={p.plan} className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-muted text-[10px] font-bold uppercase tracking-tighter border border-border">
                                <span className="text-muted-foreground">{p.plan}:</span>
                                <span>{p.count}</span>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground italic">No active plans</p>
                        )}
                    </div>
                    <div className="mt-6 pt-4 border-t border-border/50">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">Most Popular</p>
                        <p className="text-xs font-bold mt-0.5">
                            {stats?.plans?.sort((a,b) => b.count - a.count)[0]?.plan || "N/A"} Plan
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Areas Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Companies Section */}
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col">
                    <div className="px-8 py-6 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">Portfolio Overview</h2>
                        </div>
                        <Link href="/admin/dashboard/companies" className="text-xs font-bold text-blue-600 hover:text-blue-700">View All →</Link>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-8 py-4">Company Name</th>
                                    <th className="px-5 py-4">Plan</th>
                                    <th className="px-5 py-4 text-center">Headcount</th>
                                    <th className="px-8 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {stats?.companies?.slice(0, 5).map(c => (
                                    <tr key={c.id} className="group hover:bg-muted/30 transition-colors">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                                    {c.name.split(" ").map((n: string) => n[0]).join("")}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold group-hover:text-blue-600 transition-colors">{c.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{c.company_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                                c.plan === 'premium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                                                c.plan === 'standard' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 
                                                'bg-slate-300/10 text-slate-500 border-slate-300/30'
                                            }`}>
                                                {c.plan}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center font-bold text-sm">
                                            {c.num_employees || 0}
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <Link 
                                                href={`/admin/dashboard/${c.id}`} 
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white hover:shadow-md transition-all text-muted-foreground hover:text-blue-600 border border-transparent hover:border-border"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!stats?.companies?.length && (
                            <div className="p-20 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Globe className="w-8 h-8" />
                                </div>
                                <div className="max-w-sm mx-auto">
                                    <p className="text-sm text-muted-foreground">
                                        No companies managed yet. Onboard new organizations to see them here.
                                    </p>
                                </div>
                                <Link 
                                    href="/admin/dashboard/companies" 
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Create First Company <Plus className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Subscriptions & Billing */}
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col">
                    <div className="px-8 py-6 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">License Overview</h2>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="space-y-4">
                            {stats?.plans?.map(p => {
                                const percentage = stats.totalCompanies ? (p.count / stats.totalCompanies) * 100 : 0;
                                return (
                                    <div key={p.plan} className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                                            <span>{p.plan} Tier</span>
                                            <span className="text-muted-foreground">{p.count} Entities</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${
                                                    p.plan === 'premium' ? 'bg-amber-500' : 
                                                    p.plan === 'standard' ? 'bg-blue-500' : 'bg-slate-400'
                                                }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            {!stats?.plans?.length && (
                                <div className="text-center py-8 text-muted-foreground italic text-sm">
                                    No subscription data available
                                </div>
                            )}
                        </div>
                        <div className="mt-8">
                            <p className="text-xs text-muted-foreground text-center">
                                Detailed billing per company is available in the Company Portal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
