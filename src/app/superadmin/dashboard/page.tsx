"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import Link from "next/link";
import {
    Building2, Users, Mail, Eye, CheckCircle, AlertTriangle,
    TrendingUp, ArrowUp, ArrowDown, Shield, Activity, Clock, ExternalLink,
} from "lucide-react";

const kpis = [
    { title: "Total Companies", value: "56", change: "+8", period: "this month", trend: "up", icon: Building2, color: "blue" },
    { title: "Active Employees", value: "4,128", change: "+312", period: "this week", trend: "up", icon: Users, color: "purple" },
    { title: "Emails Sent", value: "12.4K", change: "+1.2K", period: "this week", trend: "up", icon: Mail, color: "green" },
    { title: "Avg Open Rate", value: "68.3%", change: "+2.1%", period: "vs last week", trend: "up", icon: Eye, color: "yellow" },
    { title: "Completion Rate", value: "81.7%", change: "-1.4%", period: "vs last week", trend: "down", icon: CheckCircle, color: "blue" },
    { title: "At-Risk Users", value: "34", change: "-6", period: "this week", trend: "up", icon: AlertTriangle, color: "red" },
];

const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
};

const companies = [
    { name: "TechNova Pvt Ltd", industry: "Technology", employees: 420, completion: 91, risk: "low", plan: "Enterprise", lastActive: "Today" },
    { name: "FinSecure Bank", industry: "Finance", employees: 1200, completion: 77, risk: "medium", plan: "Enterprise", lastActive: "Today" },
    { name: "HealthFirst Clinic", industry: "Healthcare", employees: 85, completion: 64, risk: "medium", plan: "Business", lastActive: "Yesterday" },
    { name: "LogiFreight Co", industry: "Logistics", employees: 310, completion: 43, risk: "high", plan: "Business", lastActive: "3 days ago" },
    { name: "EduPro Institute", industry: "Education", employees: 55, completion: 97, risk: "low", plan: "Starter", lastActive: "Today" },
    { name: "RetailMax Chain", industry: "Retail", employees: 780, completion: 58, risk: "high", plan: "Enterprise", lastActive: "2 days ago" },
];

const admins = [
    { name: "Kavya Mehta", email: "kavya@technova.com", company: "TechNova Pvt Ltd", status: "active", joined: "Jan 12, 2026" },
    { name: "Rajesh Gupta", email: "rajesh@finsecure.com", company: "FinSecure Bank", status: "active", joined: "Feb 5, 2026" },
    { name: "Sneha Patel", email: "sneha@healthfirst.com", company: "HealthFirst Clinic", status: "pending", joined: "Mar 9, 2026" },
    { name: "Amit Sharma", email: "amit@logifreight.com", company: "LogiFreight Co", status: "pending", joined: "Mar 10, 2026" },
    { name: "Priya Nair", email: "priya@edupro.com", company: "EduPro Institute", status: "active", joined: "Feb 28, 2026" },
];

const riskBadge = (risk: string) => {
    const map: Record<string, string> = {
        low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        high: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${map[risk]}`}>{risk.charAt(0).toUpperCase() + risk.slice(1)}</span>;
};

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    };
    return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${map[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

export default function SuperadminDashboardPage() {
    const { userInfo } = useAppSelector(s => s.auth);
    const pendingAdmins = admins.filter(a => a.status === "pending").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Platform Overview
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Welcome back, {userInfo?.firstName ?? "Superadmin"}. Here's what's happening across all organisations.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {pendingAdmins > 0 && (
                        <Link
                            href="/superadmin/dashboard/admins"
                            className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 hover:bg-yellow-500/20 transition-colors"
                        >
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm font-medium text-yellow-400">{pendingAdmins} pending approvals</span>
                            <ExternalLink className="h-3 w-3 text-yellow-400" />
                        </Link>
                    )}
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        <Shield className="h-4 w-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400">Superadmin</span>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map(kpi => {
                    const Icon = kpi.icon;
                    const isUp = kpi.trend === "up";
                    const isRed = kpi.color === "red";
                    return (
                        <div key={kpi.title} className="rounded-xl border border-border bg-card p-5 hover:border-white/20 transition-all">
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                                <div className={`p-2 rounded-lg border ${colorMap[kpi.color]}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold mb-2">{kpi.value}</p>
                            <div className={`flex items-center gap-1 text-xs font-medium ${
                                isRed ? (isUp ? "text-emerald-400" : "text-red-400") :
                                isUp ? "text-emerald-400" : "text-red-400"
                            }`}>
                                {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                <span>{kpi.change}</span>
                                <span className="text-muted-foreground font-normal">{kpi.period}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Companies Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-400" />
                        <h2 className="font-semibold text-lg">Companies</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{companies.length} organisations</span>
                        <Link href="/superadmin/dashboard/companies" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View All →</Link>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/20 border-b border-border">
                            <tr>
                                {["Company", "Industry", "Employees", "Completion", "Risk", "Plan", "Last Active"].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {companies.map(co => (
                                <tr key={co.name} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/70 shrink-0">
                                                {co.name[0]}
                                            </div>
                                            <span className="text-sm font-medium">{co.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">{co.industry}</span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-muted-foreground">{co.employees.toLocaleString()}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${co.completion >= 80 ? "bg-emerald-500" : co.completion >= 60 ? "bg-yellow-500" : "bg-red-400"}`}
                                                    style={{ width: `${co.completion}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{co.completion}%</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">{riskBadge(co.risk)}</td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs border border-border px-2 py-0.5 rounded-md text-muted-foreground">{co.plan}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {co.lastActive}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Admin Requests Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-400" />
                        <h2 className="font-semibold text-lg">Admin Accounts</h2>
                    </div>
                    <Link href="/superadmin/dashboard/admins" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        Manage Approvals →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/20 border-b border-border">
                            <tr>
                                {["Admin", "Company", "Status", "Joined", "Action"].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {admins.map(admin => (
                                <tr key={admin.email} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0">
                                                {admin.name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{admin.name}</p>
                                                <p className="text-xs text-muted-foreground">{admin.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-muted-foreground">{admin.company}</td>
                                    <td className="px-5 py-4">{statusBadge(admin.status)}</td>
                                    <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">{admin.joined}</td>
                                    <td className="px-5 py-4">
                                        {admin.status === "pending" ? (
                                            <Link
                                                href="/superadmin/dashboard/admins"
                                                className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-lg hover:bg-yellow-500/20 transition-colors"
                                            >
                                                Review
                                            </Link>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
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
