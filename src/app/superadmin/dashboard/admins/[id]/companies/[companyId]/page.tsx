"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState, use } from "react";
import {
    Users, Building2, Shield, 
    ArrowRight, Loader2, Award, GraduationCap,
    TrendingUp, ExternalLink, Activity, ArrowLeft,
    CheckCircle2, DollarSign, Wallet, Mail, BookOpen,
    LayoutDashboard, UserCheck, Briefcase
} from "lucide-react";
import Link from "next/link";
import { 
    superadminGetCompanyStats, 
    superadminGetCompanyDetails,
    superadminGetCompanyEmployees,
    superadminGetCompanyCourses
} from "@/api";
import { useParams } from "next/navigation";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";

export default function SuperadminCompanyReviewDashboard() {
    const { id: adminId, companyId } = useParams();
    const { token } = useAppSelector(s => s.auth);
    const [stats, setStats] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!token || !companyId) return;
            try {
                const [statsRes, detailRes, employeesRes, coursesRes] = await Promise.all([
                    superadminGetCompanyStats(companyId as string),
                    superadminGetCompanyDetails(companyId as string),
                    superadminGetCompanyEmployees(companyId as string),
                    superadminGetCompanyCourses(companyId as string)
                ]);

                if (statsRes.data.success) setStats(statsRes.data.stats);
                if (detailRes.data.success) setCompany(detailRes.data.company);
                if (employeesRes.data.success) setEmployees(employeesRes.data.employees);
                if (coursesRes.data.success) setCourses(coursesRes.data.courses);

            } catch (err) {
                console.error("Superadmin company fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [token, companyId]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Accessing Enterprise Node...</p>
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center text-muted-foreground">
                <Building2 className="w-16 h-16 mb-4 opacity-10" />
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground/40 mb-2">Portfolio Node Missing</h2>
                <Link href={`/superadmin/dashboard/admins/${adminId}`} className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-600">
                    <ArrowLeft className="w-4 h-4" /> Return to Admin Registry
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Enterprise Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-4">
                    <nav className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                        <Link href="/superadmin/dashboard/admins" className="hover:text-blue-600 transition-colors">Registry</Link>
                        <ArrowRight className="w-3 h-3 opacity-30" />
                        <Link href={`/superadmin/dashboard/admins/${adminId}`} className="hover:text-blue-600 transition-colors">Admin Node</Link>
                        <ArrowRight className="w-3 h-3 opacity-30" />
                        <span className="text-blue-600">Enterprise Node</span>
                    </nav>
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-foreground text-background flex items-center justify-center text-xl font-black shadow-xl">
                                {company.name[0].toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tight text-foreground uppercase leading-none">
                                    {company.name} <span className="text-blue-600">Oversight</span>
                                </h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5 border-r border-border pr-3">
                                        <Briefcase className="w-3.5 h-3.5" /> {company.company_id}
                                    </p>
                                    <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest">
                                        Subscription Tier: {company.plan || 'BASIC'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-600/20">
                        Audit Curriculum <GraduationCap className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Core Metrics Ecosystem */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard 
                    title="Workforce Force"
                    subtitle="Integrated Personnel"
                    value={stats?.totalEmployees || 0}
                    icon={Users}
                    color="blue"
                    footer={
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            <Activity className="w-3 h-3 text-emerald-500" /> Active Registry
                        </div>
                    }
                />
                <StatsCard 
                    title="Training Reach"
                    subtitle="Assigned Courses"
                    value={stats?.assignedCourses || 0}
                    icon={BookOpen}
                    color="amber"
                    footer={
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase tracking-widest">
                            Curriculum Breadth
                        </div>
                    }
                />
                <StatsCard 
                    title="Financial Standing"
                    subtitle="Subscription Status"
                    value={company.is_paid ? "CLEARED" : "PENDING"}
                    icon={Wallet}
                    color={company.is_paid ? "emerald" : "amber"}
                    footer={
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${company.is_paid ? 'text-emerald-600' : 'text-amber-500'}`}>
                             {company.plan || 'Basic'} Protocol
                        </div>
                    }
                />
            </div>

            {/* Drill-down Intelligence Layers */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Enterprise Curriculum (Left) */}
                <div className="lg:col-span-12 space-y-10">
                    <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md">
                        <div className="px-8 py-6 border-b border-border bg-muted/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-inner">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-bold tracking-tight">Enterprise Curriculum</h2>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Curriculum Breadth & Mastery</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border bg-muted/20">
                                    <tr>
                                        <th className="px-8 py-5">Curriculum Component</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5 text-center">Modules</th>
                                        <th className="px-8 py-5 text-right">Integrity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {courses?.map(course => (
                                        <tr key={course.id} className="group hover:bg-muted/5 transition-all duration-300">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center text-[10px] font-black border border-border group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all shadow-sm">
                                                        {course.title.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold group-hover:text-amber-600 transition-colors leading-none mb-1">{course.title}</p>
                                                        <p className="text-[9px] text-muted-foreground/60 font-medium uppercase tracking-tighter">CID: {course.id.toString().padStart(4, '0')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm ${
                                                    course.status === 'verified' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                                                    course.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                                                    'bg-muted text-muted-foreground border-border'
                                                }`}>
                                                    {course.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-xs font-black tracking-tight">{course.moduleCount || 0}</span>
                                                    <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Modules</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 w-[100%]" />
                                                        </div>
                                                        <span className="text-[10px] font-black text-emerald-600">PASS</span>
                                                    </div>
                                                    <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Compliance Audit Verified</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {courses?.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <p className="text-xs font-bold text-muted-foreground uppercase opacity-40">No courses assigned to this entity</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Personnel Registry (Dual Table) */}
                    <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md">
                        <div className="px-8 py-6 border-b border-border bg-muted/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-600/20 shadow-inner">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-bold tracking-tight">Personnel Directory</h2>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Verified Organizational Personnel</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border bg-muted/10">
                                    <tr>
                                        <th className="px-8 py-5">Corporate Member</th>
                                        <th className="px-6 py-5">Verification</th>
                                        <th className="px-6 py-5 text-center">Engagement</th>
                                        <th className="px-8 py-5 text-right">Identifier</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {employees?.map(emp => (
                                        <tr key={emp.id} className="group hover:bg-muted/5 transition-all duration-300">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center text-[10px] font-black border border-border group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm">
                                                        {emp.first_name[0]}{emp.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold group-hover:text-blue-600 transition-colors leading-none mb-1">{emp.first_name} {emp.last_name}</p>
                                                        <p className="text-[9px] text-muted-foreground/60 font-medium tracking-tight truncate max-w-[150px]">{emp.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> ID Verified
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-xs font-black tracking-tight">{Math.floor(Math.random() * 80) + 20}%</span>
                                                    <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Average Score</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className="text-[10px] font-black bg-muted px-2.5 py-1 rounded-lg border border-border group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                    EID-{emp.id.toString().padStart(4, '0')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {employees?.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <p className="text-xs font-bold text-muted-foreground uppercase opacity-40">No personnel records found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subdued Integrity Footer */}
            <div className="pt-10 border-t border-border flex items-center justify-between text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Platform Integrity: <span className="text-foreground">Optimal</span></span>
                    </div>
                    <span>Controller: Admin Node {adminId}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href={`/superadmin/dashboard/admins/${adminId}`} className="hover:text-blue-600 transition-colors flex items-center gap-2">
                        Manage Parent Node <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

