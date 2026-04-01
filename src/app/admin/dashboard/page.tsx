"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState } from "react";
import {
    Users, Building2, Shield, 
    ArrowRight, Loader2, Award, GraduationCap,
    TrendingUp, ExternalLink
} from "lucide-react";
import Link from "next/link";
import { adminGetGlobalStats, adminGetCompanies } from "@/api";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import { PortfolioTable } from "@/components/admin/dashboard/PortfolioTable";
import { BillingSection } from "@/components/admin/dashboard/BillingSection";

interface GlobalStats {
    totalCompanies: number;
    totalEmployees: number;
    totalCourses: number;
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
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing ecosystem data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Minimalist Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Shield className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Admin Command</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        Welcome, <span className="text-blue-600">{userInfo?.firstName}</span>
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-md">
                        Monitoring {stats?.totalCompanies} companies and {stats?.totalEmployees} personnel across your network.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/dashboard/companies" className="px-5 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-foreground/10">
                        Manage Portfolio <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Clean Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard 
                    title="Managed Portfolio"
                    subtitle="Active Organizations"
                    value={stats?.totalCompanies || 0}
                    icon={Building2}
                    color="blue"
                    footer={
                        <Link href="/admin/dashboard/companies" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:gap-2 transition-all">
                            Full Registry <ExternalLink className="w-3 h-3" />
                        </Link>
                    }
                />
                <StatsCard 
                    title="Network Impact"
                    subtitle="Active Employees"
                    value={stats?.totalEmployees || 0}
                    icon={Users}
                    color="purple"
                    footer={
                        <Link href="/admin/dashboard/employees" className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:gap-2 transition-all">
                            Personnel Directory <ExternalLink className="w-3 h-3" />
                        </Link>
                    }
                />
                <StatsCard 
                    title="Curriculum Reach"
                    subtitle="Deployment Units"
                    value={`${stats?.totalCourses || 0} Courses`}
                    icon={GraduationCap}
                    color="amber"
                    footer={
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
                            <TrendingUp className="w-3 h-3" /> Across {stats?.totalCompanies} companies
                        </div>
                    }
                />
            </div>

            {/* Core Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Table Section - Dominant */}
                <div className="lg:col-span-8">
                    <PortfolioTable companies={stats?.companies?.slice(0, 5) || []} />
                </div>
                
                {/* Billing Section - Supportive */}
                <div className="lg:col-span-4">
                    <BillingSection plans={stats?.plans} totalCompanies={stats?.totalCompanies || 0} />
                </div>
            </div>

            {/* Subtle Footer Insight */}
            <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground font-medium text-xs">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>System status: <span className="text-foreground">Optimal</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Most Popular: <span className="text-foreground font-bold uppercase tracking-widest">{stats?.plans?.sort((a,b) => b.count - a.count)[0]?.plan || 'N/A'} Plan</span></span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/support" className="hover:text-foreground transition-colors">Support</Link>
                    <Link href="/admin/settings" className="hover:text-foreground transition-colors">Settings</Link>
                </div>
            </div>
        </div>
    );
}

