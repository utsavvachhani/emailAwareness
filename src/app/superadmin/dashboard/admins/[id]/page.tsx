"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState, use } from "react";
import {
    Users, Building2, CreditCard, Shield, 
    TrendingUp, ArrowRight, Loader2, Globe, Award, Plus, ArrowLeft, Mail
} from "lucide-react";
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
                // Fetch Admin Portfolio Stats and Companies
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
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!admin) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center text-muted-foreground">
                <Shield className="w-12 h-12 mb-4 opacity-20" />
                <p>Admin portfolio not found or system error occurred.</p>
                <Link href="/superadmin/dashboard/admins" className="mt-4 text-blue-500 hover:underline">Return to Admin Management</Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
                <div className="space-y-4">
                    <Link 
                        href="/superadmin/dashboard/admins" 
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group px-3 py-1.5 bg-muted/40 rounded-full border border-border/50"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Admin Approvals
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                               <Shield className="w-6 h-6 text-blue-600" />
                           </div>
                           <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                               {admin.firstName} {admin.lastName}'s <span className="text-blue-600">Portfolio</span>
                           </h1>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                            <Mail className="w-4 h-4" />
                            Monitoring metrics for <span className="text-foreground">{admin.email}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card group hover:border-blue-500/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                           Active Account
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Total Companies</h3>
                        <p className="text-4xl font-black">{stats?.totalCompanies || 0}</p>
                    </div>
                </div>

                <div className="stat-card group hover:border-indigo-500/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Total Employees</h3>
                        <p className="text-4xl font-black">{stats?.totalEmployees || 0}</p>
                    </div>
                </div>

                {stats?.plans?.map((p, i) => (
                    <div key={i} className="stat-card group hover:border-border transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-muted rounded-xl">
                                <Award className="w-6 h-6 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{p.plan} Plan</h3>
                            <p className="text-4xl font-black">{p.count}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-8">
                {/* Managed Companies Table */}
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/20">
                        <div>
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Active Portfolio</h2>
                            <p className="text-sm text-muted-foreground font-medium">List of companies assigned to this admin</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Entity Name</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Identifier</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Admin-Level Plan</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Workforce Size</th>
                                    <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Payment Status</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {companies.map((company) => (
                                    <tr key={company.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center font-black group-hover:scale-105 transition-transform">
                                                    {company.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm">{company.name}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(company.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="font-mono text-xs bg-muted px-2 py-1 rounded border border-border">{company.company_id}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                               <div className={`w-2 h-2 rounded-full ${company.plan === 'enterprise' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                                               <span className="text-sm font-bold uppercase tracking-tight">{company.plan}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-black">{company.num_employees} Employees</span>
                                                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, (company.num_employees / 50) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                                                company.is_paid 
                                                ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                                {company.is_paid ? 'Cleared' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Link href={`/superadmin/dashboard/admins/${id}/companies/${company.company_id}`} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-blue-600 transition-colors">
                                                Manage Entity <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

