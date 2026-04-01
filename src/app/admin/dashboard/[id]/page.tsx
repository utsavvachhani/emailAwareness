"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Users, Shield, TrendingUp, CheckCircle, 
    BookOpen, Loader2, Building2, ArrowRight,
    ExternalLink, GraduationCap, Plus, History,
    LayoutGrid, List
} from "lucide-react";
import Link from "next/link";
import { 
    adminGetCompanyStats, 
    adminGetCompanyDetails, 
    adminGetEmployeesByCompany,
    adminGetCoursesByCompany
} from "@/api";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";

interface CompanyStats {
    totalEmployees: number;
    assignedCourses: number;
    progress: { status: string; count: string }[];
}

interface CompanyDetails {
    id: number;
    name: string;
    company_id: string;
    plan: string;
    is_paid: boolean;
}

export default function CompanyDashboardPage() {
    const { token } = useAppSelector(s => s.auth);
    const params = useParams();
    const id = params?.id as string;
    
    const [stats, setStats] = useState<CompanyStats | null>(null);
    const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id || !token) return;
            try {
                const [statsRes, detailsRes, employeesRes, coursesRes] = await Promise.all([
                    adminGetCompanyStats(id),
                    adminGetCompanyDetails(id),
                    adminGetEmployeesByCompany(id),
                    adminGetCoursesByCompany(id)
                ]);

                if (statsRes.data.success) setStats(statsRes.data.stats);
                if (detailsRes.data.success) setCompanyDetails(detailsRes.data.company);
                if (employeesRes.data.success) setEmployees(employeesRes.data.employees);
                if (coursesRes.data.success) setCourses(coursesRes.data.courses);

            } catch (err) {
                console.error("Company dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, token]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing organization metrics...</p>
                </div>
            </div>
        );
    }

    const completedCount = parseInt(stats?.progress?.find(p => p.status === 'completed')?.count || "0");
    const completionRate = stats?.totalEmployees ? Math.round((completedCount / stats.totalEmployees) * 100) : 0;
    const totalModules = courses?.reduce((acc, c) => acc + (c.moduleCount || 0), 0) || 0;

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Minimalist Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Building2 className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Corporate Command</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        {companyDetails?.name || "Organization Overview"}
                    </h1>
                    <div className="flex items-center gap-3 text-muted-foreground font-medium text-sm">
                        <span className="px-2 py-0.5 rounded-md bg-muted border border-border uppercase tracking-widest text-[9px] font-black">{companyDetails?.company_id}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="uppercase tracking-widest text-[9px] font-black text-blue-600">{companyDetails?.plan} Subscription</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href={`/admin/dashboard/${id}/courses`}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/10"
                    >
                        Project Curriculum <Plus className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Clean Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard 
                    title="Workforce Size"
                    subtitle="Enrolled Employees"
                    value={stats?.totalEmployees || 0}
                    icon={Users}
                    color="blue"
                    footer={
                        <Link href={`/admin/dashboard/${id}/employees`} className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:gap-2 transition-all">
                            Personnel directory <ArrowRight className="w-3 h-3" />
                        </Link>
                    }
                />
                <StatsCard 
                    title="Training Reach"
                    subtitle="Total Modules"
                    value={totalModules}
                    icon={LayoutGrid}
                    color="purple"
                    footer={
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600">
                             Distributed across {courses?.length || 0} courses
                        </div>
                    }
                />
                <StatsCard 
                    title="Curriculum Engagement"
                    subtitle="Module Completions"
                    value={`${completionRate}%`}
                    icon={CheckCircle}
                    color="emerald"
                    footer={
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                            System verified metrics
                        </div>
                    }
                />
            </div>

            {/* Core Management Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Tables Column */}
                <div className="lg:col-span-8 space-y-12">
                    
                    {/* Curriculum Management Table */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md">
                        <div className="px-6 py-5 border-b border-border bg-muted/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-lg font-bold tracking-tight">Enterprise Curriculum</h2>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Company Course Registry</span>
                                </div>
                            </div>
                            <Link 
                                href={`/admin/dashboard/${id}/courses`}
                                className="group inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-purple-600 hover:text-purple-700 transition-colors"
                            >
                                Manage Courses <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border bg-muted/10">
                                    <tr>
                                        <th className="px-6 py-4 font-black">Course Title</th>
                                        <th className="px-5 py-4 font-black">Complexity</th>
                                        <th className="px-5 py-4 text-center font-black">Modules</th>
                                        <th className="px-6 py-4 text-right font-black">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {courses?.slice(0, 5).map(c => (
                                        <tr key={c.id} className="group hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center text-[10px] font-black group-hover:bg-purple-600 group-hover:text-white transition-all scale-95 group-hover:scale-100 uppercase">
                                                        {c.title[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold leading-none">{c.title}</p>
                                                        <p className="text-[9px] text-muted-foreground/60 font-medium uppercase tracking-tighter mt-1">Ref ID: {c.id.toString().padStart(5, '0')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                                    c.difficulty === 'high' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 
                                                    c.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                                                    'bg-blue-300/10 text-blue-600 border-blue-300/30'
                                                }`}>
                                                    {c.difficulty || 'low'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center font-black text-xs text-foreground/80">
                                                {c.moduleCount || 0}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${
                                                    c.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'
                                                }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {courses.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <p className="text-xs font-bold text-muted-foreground">No courses defined in the registry.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Personnel Table */}
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md">
                        <div className="px-6 py-5 border-b border-border bg-muted/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-lg font-bold tracking-tight">Active Personnel</h2>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Directory</span>
                                </div>
                            </div>
                            <Link 
                                href={`/admin/dashboard/${id}/employees`}
                                className="group inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Manage All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border bg-muted/10">
                                    <tr>
                                        <th className="px-6 py-4 font-black">Employee Name</th>
                                        <th className="px-5 py-4 font-black">Designation</th>
                                        <th className="px-5 py-4 text-center font-black">Status</th>
                                        <th className="px-6 py-4 text-right font-black">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {employees?.slice(0, 5).map(e => (
                                        <tr key={e.id} className="group hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-muted text-foreground flex items-center justify-center text-[10px] font-black border border-border group-hover:bg-blue-600 group-hover:text-white transition-all scale-95 group-hover:scale-100 uppercase">
                                                        {e.first_name[0]}{e.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold leading-none">{e.first_name} {e.last_name}</p>
                                                        <p className="text-[9px] text-muted-foreground/60 font-medium lowercase tracking-tighter mt-1">{e.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-[10px] font-bold text-foreground/80 uppercase tracking-tight">
                                                    {e.designation || "Staff"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                    <CheckCircle className="w-2.5 h-2.5" /> Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link 
                                                    href={`/admin/dashboard/employees/${e.id}`} 
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-blue-600 hover:text-white transition-all text-muted-foreground/60 border border-transparent hover:shadow-lg hover:shadow-blue-500/20"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {employees.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center">
                                                <p className="text-xs font-bold text-muted-foreground">No employees registered yet.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Navigation Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-foreground text-background rounded-2xl p-6 shadow-xl shadow-foreground/10 space-y-6 flex flex-col group transition-all">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight">Governance Hub</h3>
                                <p className="text-xs text-background/60 leading-relaxed font-medium">Verify compliance and oversight across all company entities and personnel groups.</p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-white/10">
                            {[
                                { name: "Organization Registry", icon: Building2, href: "/admin/dashboard/companies" },
                                { name: "System Analytics", icon: TrendingUp, href: "/admin/dashboard/analytics" },
                                { name: "Audit Trail", icon: History, href: "/admin/dashboard/audit" }
                            ].map((item, idx) => (
                                <Link key={idx} href={item.href} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group/link">
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4 opacity-70 group-hover/link:opacity-100 transition-opacity" />
                                        <span className="text-xs font-bold tracking-tighter">{item.name}</span>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Quick Actions</h4>
                        <div className="space-y-2">
                             <Link href={`/admin/dashboard/${id}/courses`} className="w-full py-2.5 bg-blue-600/10 text-blue-600 rounded-xl text-center text-xs font-black uppercase tracking-widest border border-blue-600/20 hover:bg-blue-600 hover:text-white transition-all block">
                                Assigned Curriculum
                             </Link>
                             <Link href={`/admin/dashboard/${id}/employees`} className="w-full py-2.5 bg-muted rounded-xl text-center text-xs font-black uppercase tracking-widest border border-border hover:bg-muted-foreground hover:text-white transition-all block text-foreground">
                                Manage Personnel
                             </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subdued Footer */}
            <div className="pt-8 border-t border-border flex items-center justify-between text-muted-foreground font-bold text-[9px] uppercase tracking-widest">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Operational Status: Optimal</span>
                    <span>Last Synced: Just now</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/support" className="hover:text-foreground">Support</Link>
                    <Link href="/settings" className="hover:text-foreground">Settings</Link>
                </div>
            </div>
        </div>
    );
}
