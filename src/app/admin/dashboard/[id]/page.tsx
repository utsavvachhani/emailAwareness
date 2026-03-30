"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Users, Mail, Eye, CheckCircle, AlertTriangle, TrendingUp,
    Shield, Activity, ArrowUp, ArrowDown, MoreHorizontal,
    BookOpen, Loader2, Building2
} from "lucide-react";
import { adminGetCompanyStats, adminGetCompanyDetails } from "@/api";

interface CompanyStats {
    totalEmployees: number;
    assignedCourses: number;
    progress: { status: string; count: string }[];
}

interface CompanyDetails {
    name: string;
    company_id: string;
    plan: string;
}

export default function CompanyDashboardPage() {
    const { token } = useAppSelector(s => s.auth);
    const params = useParams();
    const id = params?.id as string;
    
    const [stats, setStats] = useState<CompanyStats | null>(null);
    const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Stats
                const statsRes = await adminGetCompanyStats(id);
                if (statsRes.data.success) {
                    setStats(statsRes.data.stats);
                }

                // Fetch Basic Details
                const detailsRes = await adminGetCompanyDetails(id);
                if (detailsRes.data.success) {
                    setCompanyDetails(detailsRes.data.company);
                }
            } catch (err) {
                console.error("Company dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id && token) fetchData();
    }, [id, token]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    const completedPercent = stats?.progress?.find(p => p.status === 'completed')?.count || "0";
    const inProgressPercent = stats?.progress?.find(p => p.status === 'in-progress')?.count || "0";

    const kpis = [
        { title: "Total Employees", value: stats?.totalEmployees.toString() || "0", sub: "Currently Enrolled", icon: Users, color: "blue" },
        { title: "Training Modules", value: stats?.assignedCourses.toString() || "0", sub: "Active Curriculum", icon: BookOpen, color: "purple" },
        { title: "Avg Progress", value: stats?.totalEmployees ? `${Math.round((parseInt(completedPercent) / stats.totalEmployees) * 100)}%` : "0%", sub: "Module Completion", icon: CheckCircle, color: "green" },
        { title: "High-Risk Users", value: "0", sub: "Based on Simulations", icon: AlertTriangle, color: "red" },
    ];

    const colorMap: Record<string, string> = {
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        green: "bg-green-500/10 text-green-600 border-green-500/20",
        red: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <h1 className="text-3xl font-extrabold tracking-tight">{companyDetails?.name || "Company Overview"}</h1>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-muted border border-border uppercase tracking-widest text-[10px]">{companyDetails?.company_id}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="uppercase tracking-widest text-[10px] font-bold text-blue-600">{companyDetails?.plan} Subscription</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl px-4 py-3 shadow-sm">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-bold text-blue-700 uppercase tracking-tighter">Secure Enterprise View</span>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map(kpi => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.title} className="group rounded-3xl border border-border bg-card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{kpi.title}</p>
                                <div className={`p-3 rounded-2xl border ${colorMap[kpi.color]} group-hover:scale-110 transition-transform shadow-sm`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="text-4xl font-extrabold tracking-tight mb-1">{kpi.value}</p>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <TrendingUp className="h-3 w-3 text-emerald-500" />
                                {kpi.sub}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Training Progress Card */}
                <div className="xl:col-span-2 bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col">
                    <div className="px-8 py-6 border-b border-border bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">Real-time Engagement</h2>
                        </div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Training Completion</div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-center space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm font-bold uppercase tracking-tight">
                                <span>Curriculum Progress</span>
                                <span className="text-blue-600">{stats?.totalEmployees ? Math.round((parseInt(completedPercent) / stats.totalEmployees) * 100) : 0}% Complete</span>
                            </div>
                            <div className="h-4 w-full bg-muted rounded-2xl overflow-hidden shadow-inner border border-border/50">
                                <div 
                                    className="h-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 shadow-lg relative"
                                    style={{ width: `${stats?.totalEmployees ? (parseInt(completedPercent) / stats.totalEmployees) * 100 : 0}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Completed</p>
                                <p className="text-2xl font-bold">{completedPercent}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">In-Progress</p>
                                <p className="text-2xl font-bold">{inProgressPercent}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Untouched</p>
                                <p className="text-2xl font-bold">{(stats?.totalEmployees || 0) - parseInt(completedPercent) - parseInt(inProgressPercent)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Health Card */}
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="px-8 py-6 border-b border-border bg-muted/20">
                        <h2 className="text-xl font-bold tracking-tight">Cloud Security Score</h2>
                    </div>
                    <div className="p-8 text-center space-y-6">
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle
                                    className="text-muted-foreground/10"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="58"
                                    cx="64"
                                    cy="64"
                                />
                                <circle
                                    className="text-blue-500 transition-all duration-1000"
                                    strokeWidth="8"
                                    strokeDasharray={364}
                                    strokeDashoffset={364 - (364 * 82) / 100}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="58"
                                    cx="64"
                                    cy="64"
                                />
                            </svg>
                            <span className="absolute text-3xl font-black">82</span>
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-lg">Overall Organization Health</p>
                            <p className="text-sm text-muted-foreground font-medium">B+ Rating (Competitive)</p>
                        </div>
                        <div className="flex items-center gap-2 justify-center p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-[10px] font-bold uppercase tracking-widest text-blue-600">
                             <TrendingUp className="w-3 h-3" /> Up 4% from last month
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
