"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState, use } from "react";
import {
    Users, Building2, CreditCard, Shield, 
    TrendingUp, ArrowRight, Loader2, Globe, Award, Plus, ArrowLeft, Mail, BookOpen
} from "lucide-react";
import Link from "next/link";
import { superadminGetCompanyStats, superadminGetCompanyDetails } from "@/api";
import { useParams } from "next/navigation";

export default function SuperadminCompanyReviewDashboard() {
    const { id: adminId, companyId } = useParams();
    const { token } = useAppSelector(s => s.auth);
    const [stats, setStats] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, detailRes] = await Promise.all([
                    superadminGetCompanyStats(companyId as string),
                    superadminGetCompanyDetails(companyId as string)
                ]);

                if (statsRes.data.success && detailRes.data.success) {
                    setStats(statsRes.data.stats);
                    setCompany(detailRes.data.company);
                }
            } catch (err) {
                console.error("Superadmin company detail fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token && companyId) fetchData();
    }, [token, companyId]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center text-muted-foreground">
                <Building2 className="w-12 h-12 mb-4 opacity-20" />
                <p>Entity portfolio not found.</p>
                <Link href={`/superadmin/dashboard/admins/${adminId}/companies`} className="mt-4 text-blue-500 hover:underline underline-offset-4 font-bold uppercase tracking-widest text-xs">Return to Portfolio</Link>
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-[1400px] mx-auto pb-12">
            {/* Contextual Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/80">
                <div className="space-y-5">
                    <div className="flex items-center gap-3">
                         <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                             <Building2 className="w-7 h-7 text-white" />
                         </div>
                         <div>
                             <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                                 {company.name} <span className="text-blue-600">Oversight</span>
                             </h1>
                             <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
                                 Internal ID: <span className="text-foreground mono uppercase">{company.company_id}</span>
                             </p>
                         </div>
                    </div>
                </div>
            </div>

            {/* Health Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="stat-card border-blue-600/20 bg-blue-600/[0.02]">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-6 h-6 text-blue-600" />
                        <span className="text-[10px] font-black bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded-full uppercase">Workforce</span>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Employees</p>
                    <p className="text-4xl font-black">{stats?.totalEmployees || 0}</p>
                </div>

                <div className="stat-card border-purple-600/20 bg-purple-600/[0.02]">
                    <div className="flex items-center justify-between mb-4">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                        <span className="text-[10px] font-black bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded-full uppercase">Curriculum</span>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Active Courses</p>
                    <p className="text-4xl font-black">{stats?.assignedCourses || 0}</p>
                </div>

                <div className="stat-card border-amber-600/20 bg-amber-600/[0.02]">
                    <div className="flex items-center justify-between mb-4">
                        <CreditCard className="w-6 h-6 text-amber-600" />
                        <span className="text-[10px] font-black bg-amber-600/10 text-amber-600 px-2 py-0.5 rounded-full uppercase">Billing</span>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Tier</p>
                    <p className="text-2xl font-black uppercase">{company.plan || 'Free'}</p>
                </div>
            </div>

            {/* Progress Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card border border-border rounded-3xl p-8">
                    <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Training Progress Distribution
                    </h3>
                    <div className="space-y-6">
                        {['pending', 'in-progress', 'completed'].map((status) => {
                            const count = stats?.progress?.find((p: any) => p.status === status)?.count || 0;
                            const percentage = stats?.totalEmployees ? (count / stats.totalEmployees) * 100 : 0;
                            return (
                                <div key={status} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                        <span className="text-muted-foreground">{status}</span>
                                        <span className="text-foreground">{count} Users ({Math.round(percentage)}%)</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${
                                                status === 'completed' ? 'bg-green-500' : 
                                                status === 'in-progress' ? 'bg-blue-500' : 'bg-muted-foreground/20'
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-8 flex flex-col justify-center items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Administrative Compliance</h3>
                    <p className="text-xs text-muted-foreground max-w-xs font-medium">This entity is currently managed under the oversight of Admin #[{adminId}]. Click below to view internal workforce identifiers.</p>
                    {/* Use plain a tag or native navigate for internal consistency */}
                    <button 
                         onClick={() => window.location.href = `/superadmin/dashboard/admins/${adminId}/companies/${companyId}/employees`}
                         className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                    >
                        View workforce
                    </button>
                </div>
            </div>
        </div>
    );
}

