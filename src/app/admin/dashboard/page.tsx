"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import {
    Users, Mail, Eye, CheckCircle, AlertTriangle, TrendingUp,
    Shield, Activity, ArrowUp, ArrowDown, MoreHorizontal
} from "lucide-react";

const kpis = [
    { title: "Total Employees", value: "248", change: "+12", period: "this month", trend: "up", icon: Users, color: "blue" },
    { title: "Emails Sent", value: "1,842", change: "+124", period: "this week", trend: "up", icon: Mail, color: "purple" },
    { title: "Open Rate", value: "71.4%", change: "+3.2%", period: "vs last week", trend: "up", icon: Eye, color: "green" },
    { title: "Quiz Completion", value: "86.2%", change: "-0.8%", period: "vs last week", trend: "down", icon: CheckCircle, color: "yellow" },
    { title: "High-Risk Users", value: "7", change: "-2", period: "vs last week", trend: "up", icon: AlertTriangle, color: "red" },
    { title: "Avg Training Score", value: "82/100", change: "+5", period: "this month", trend: "up", icon: TrendingUp, color: "blue" },
];

const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
};

const employees = [
    { name: "Riya Patel", email: "riya@example.com", dept: "Engineering", score: 94, modules: "4/4", lastActive: "Today", risk: "low" },
    { name: "Arjun Shah", email: "arjun@example.com", dept: "Sales", score: 72, modules: "3/4", lastActive: "Yesterday", risk: "medium" },
    { name: "Meera Joshi", email: "meera@example.com", dept: "HR", score: 88, modules: "4/4", lastActive: "Today", risk: "low" },
    { name: "Rahul Desai", email: "rahul@example.com", dept: "Finance", score: 41, modules: "1/4", lastActive: "5 days ago", risk: "high" },
    { name: "Priya Modi", email: "priya@example.com", dept: "Marketing", score: 67, modules: "2/4", lastActive: "2 days ago", risk: "medium" },
    { name: "Vivek Kumar", email: "vivek@example.com", dept: "IT", score: 98, modules: "4/4", lastActive: "Today", risk: "low" },
];

const simulations = [
    { name: "Q1 Phishing Test", sent: 248, opened: 187, clicked: 43, date: "Mar 8, 2026", failRate: "17.3%" },
    { name: "CEO Fraud Simulation", sent: 248, opened: 201, clicked: 28, date: "Feb 22, 2026", failRate: "11.3%" },
    { name: "Invoice Scam Test", sent: 248, opened: 165, clicked: 61, date: "Feb 5, 2026", failRate: "24.6%" },
    { name: "IT Support Pretexting", sent: 248, opened: 142, clicked: 19, date: "Jan 18, 2026", failRate: "7.7%" },
];

const riskBadge = (risk: string) => {
    const map: Record<string, string> = {
        low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        high: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${map[risk]}`}>{risk.charAt(0).toUpperCase() + risk.slice(1)}</span>;
};

export default function AdminDashboardPage() {
    const { userInfo } = useAppSelector(s => s.auth);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Welcome back, {userInfo?.firstName}. Here's your organisation's training overview.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">Admin Access</span>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map(kpi => {
                    const Icon = kpi.icon;
                    const isUp = kpi.trend === "up";
                    return (
                        <div key={kpi.title} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                                <div className={`p-2 rounded-lg border ${colorMap[kpi.color]}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold mb-2">{kpi.value}</p>
                            <div className={`flex items-center gap-1 text-xs font-medium ${
                                kpi.color === "red" ? (isUp ? "text-emerald-600" : "text-red-500") :
                                isUp ? "text-emerald-600" : "text-red-500"
                            }`}>
                                {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                <span>{kpi.change}</span>
                                <span className="text-muted-foreground font-normal">{kpi.period}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Employee Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        <h2 className="font-semibold text-lg">Employee Training Status</h2>
                    </div>
                    <span className="text-xs text-muted-foreground">{employees.length} employees</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                {["Employee", "Department", "Score", "Modules", "Last Active", "Risk Level", ""].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {employees.map(emp => (
                                <tr key={emp.email} className="hover:bg-muted/20 transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                                                {emp.name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{emp.name}</p>
                                                <p className="text-xs text-muted-foreground">{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">{emp.dept}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${emp.score >= 80 ? "bg-emerald-500" : emp.score >= 60 ? "bg-yellow-500" : "bg-red-400"}`}
                                                    style={{ width: `${emp.score}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold">{emp.score}%</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-muted-foreground">{emp.modules}</td>
                                    <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">{emp.lastActive}</td>
                                    <td className="px-5 py-4">{riskBadge(emp.risk)}</td>
                                    <td className="px-5 py-4">
                                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all">
                                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Phishing Simulations Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-orange-500" />
                        <h2 className="font-semibold text-lg">Phishing Simulations</h2>
                    </div>
                    <button className="text-xs text-blue-500 hover:text-blue-600 transition-colors">View All →</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                {["Campaign", "Sent", "Opened", "Clicked", "Fail Rate", "Date"].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {simulations.map(sim => {
                                const failNum = parseInt(sim.failRate);
                                const isHigh = failNum > 20;
                                return (
                                    <tr key={sim.name} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-5 py-4 font-medium text-sm">{sim.name}</td>
                                        <td className="px-5 py-4 text-sm text-muted-foreground">{sim.sent}</td>
                                        <td className="px-5 py-4 text-sm">{sim.opened} <span className="text-muted-foreground text-xs">({Math.round(sim.opened / sim.sent * 100)}%)</span></td>
                                        <td className={`px-5 py-4 text-sm font-medium ${isHigh ? "text-red-500" : "text-foreground"}`}>{sim.clicked}</td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isHigh ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-600"}`}>
                                                {sim.failRate}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">{sim.date}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
