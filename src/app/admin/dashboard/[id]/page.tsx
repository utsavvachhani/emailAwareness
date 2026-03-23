"use client";

import { useState, useEffect, use } from "react";
import {
    Building2, Users, BookOpen, BarChart3,
    Mail, Phone, Globe, Calendar, CheckCircle2,
    ArrowRight, ArrowUpRight, Shield, Activity,
    ExternalLink, MapPin, Search, ChevronRight, Loader2,
    Briefcase, Award, GraduationCap, Plus, MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface Company {
    id: number;
    company_id: string;
    name: string;
    email: string;
    phone?: string;
    num_employees: number;
    industry?: string;
    website?: string;
    address?: string;
    notes?: string;
    created_at: string;
    status: 'approved' | 'rejected' | 'pending';
}

export default function GenericCompanyDashboard({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const token = useAppSelector(s => s.auth.token);
    const [company, setCompany] = useState<Company | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token && id) {
            fetchCompanyData();
        }
    }, [token, id]);

    const fetchCompanyData = async () => {
        setIsLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [compRes, statsRes, empRes, courseRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}/stats`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}/employees`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${id}/courses`, { headers })
            ]);

            const compData = await compRes.json();
            const statsData = await statsRes.json();
            const empData = await empRes.json();
            const courseData = await courseRes.json();

            if (compData.success) setCompany(compData.company);
            if (statsData.success) setStats(statsData.stats);
            if (empData.success) setEmployees(empData.employees.slice(0, 5));
            if (courseData.success) setCourses(courseData.courses);
        } catch {
            toast.error("Failed to load entity details");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !company) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
                <Shield className="w-20 h-20 opacity-10" />
                <h2 className="text-xl font-black italic tracking-tight">Active Entity Not Found</h2>
                <Link href="/admin">
                    <Button variant="outline" className="rounded-2xl h-12 px-8 font-black uppercase text-xs">Return to Fleet</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/40 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                        <Building2 className="w-4 h-4 text-primary" />
                        Entity Operations Interface
                        <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                        {company.company_id}
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent italic leading-[1.1]">
                        {company.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2 text-xs font-bold bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Connected & Verified
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                            <MapPin className="w-4 h-4 text-primary opacity-50" />
                            {company.address || "Global HQ Operations"}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link href={`/admin/dashboard/${id}/employees`}>
                        <Button className="rounded-2xl h-14 bg-black text-white hover:bg-neutral-800 font-black px-8 text-xs shadow-2xl">
                            MANAGE WORKFORCE
                            <ArrowRight className="w-4 h-4 ml-3" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Metric Clusters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2.5rem] border-none bg-neutral-900 text-white shadow-2xl relative overflow-hidden group">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <Users className="w-8 h-8 text-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]" />
                            <div className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-tighter">Live Dataset</div>
                        </div>
                        <p className="text-sm font-bold text-white/50 uppercase tracking-widest leading-none mb-2 underline decoration-primary/30">Workforce Census</p>
                        <h3 className="text-5xl font-black tracking-tighter">{stats?.totalEmployees || 0}</h3>
                        <p className="text-[10px] font-bold text-emerald-400 mt-4 flex items-center gap-1.5">
                            <Activity className="w-3 h-3" />
                            Full spectrum awareness surveillance active
                        </p>
                    </CardContent>
                    {/* Gradient Blur Overlay */}
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
                </Card>

                <Card className="rounded-[2.5rem] border-border/60 bg-white/50 backdrop-blur-xl shadow-xl flex flex-col justify-between">
                    <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-60">Curriculum Load</CardTitle>
                            <h3 className="text-4xl font-black tracking-tighter mt-1">{stats?.assignedCourses || 0} <span className="text-lg opacity-40 font-bold">Programs</span></h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                            <BookOpen className="w-6 h-6" />
                        </div>
                    </CardHeader>
                    <CardFooter className="p-8 pt-0 mt-8">
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[65%]" />
                        </div>
                    </CardFooter>
                </Card>

                <Card className="rounded-[2.5rem] border-border/60 bg-white shadow-xl flex flex-col justify-between">
                    <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-60">Security Posture</CardTitle>
                            <h3 className="text-4xl font-black tracking-tighter mt-1 text-emerald-600 italic">Robust</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <Shield className="w-6 h-6" />
                        </div>
                    </CardHeader>
                    <CardFooter className="p-8 pt-0 mt-8">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed font-black opacity-50 tracking-tighter">
                            Last update synchronized across all local nodes 2 minutes ago.
                        </p>
                    </CardFooter>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Internal Workforce */}
                <Card className="lg:col-span-2 rounded-[3rem] border-border/60 shadow-xl overflow-hidden bg-card/40 border-t-[8px] border-t-indigo-500/20">
                    <CardHeader className="p-10 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black italic">Workforce Segment</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-50 italic">Live personnel tracking for training metrics</CardDescription>
                        </div>
                        <Link href={`/admin/dashboard/${id}/employees`}>
                            <Button variant="ghost" className="h-10 text-[10px] font-black uppercase text-primary hover:bg-primary/5 rounded-2xl">Full Segment Overview</Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/20">
                            {employees.length === 0 ? (
                                <div className="h-40 flex items-center justify-center text-muted-foreground opacity-20">
                                    <Users className="w-10 h-10" />
                                </div>
                            ) : employees.map(e => (
                                <div key={e.id} className="p-8 flex items-center justify-between hover:bg-muted/30 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition-transform">
                                            <span className="text-xs font-black text-indigo-600 opacity-80">{e.first_name[0]}{e.last_name[0]}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black group-hover:text-primary transition-colors">{e.first_name} {e.last_name}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground tracking-tight underline-offset-4 decoration-primary/20 group-hover:underline">{e.designation || 'Specialist'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="hidden md:block text-right">
                                            <p className="text-[9px] font-black uppercase text-muted-foreground mb-0.5 tracking-tighter">Connection</p>
                                            <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1.5 uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Secure
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-black/5">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Infrastructure Reports */}
                <div className="space-y-6">
                    <Card className="rounded-[3rem] border-none bg-indigo-600 text-white p-10 flex flex-col justify-between shadow-2xl shadow-indigo-600/30 relative overflow-hidden">
                        <div className="z-10">
                            <Activity className="w-12 h-12 mb-8 text-indigo-300" />
                            <h4 className="text-2xl font-black italic mb-2 tracking-tighter leading-none">Intelligence Feed</h4>
                            <p className="text-xs text-indigo-100/70 font-medium leading-relaxed italic border-l border-indigo-400 pl-4 py-1">
                                Real-time behavioral analysis and phishing defense analytics for {company.name} assets.
                            </p>
                        </div>
                        <Button className="z-10 w-full mt-10 bg-white text-indigo-700 hover:bg-neutral-100 rounded-2xl font-black text-xs h-12 shadow-xl shadow-black/20">
                            GENERATE SIMULATION REPORT
                        </Button>
                        <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl opacity-40" />
                    </Card>

                    <Card className="rounded-[3rem] border-border/60 bg-white shadow-xl p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Internal Awareness</h4>
                            <Award className="w-5 h-5 text-amber-500" />
                        </div>
                        {[
                            { label: "Completion Average", val: "82%", col: "bg-emerald-500" },
                            { label: "Defense Rating", val: "91%", col: "bg-primary" },
                            { label: "Active Threats", val: "00", col: "bg-red-500" },
                        ].map((item, i) => (
                            <div key={i} className="space-y-3 pb-2 border-b border-border/30 last:border-0 last:pb-0">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{item.label}</span>
                                    <span className="text-xs font-black tabular-nums">{item.val}</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.col} rounded-full opacity-80`} style={{ width: item.val !== '00' ? item.val : '0%' }} />
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </div>
    );
}
