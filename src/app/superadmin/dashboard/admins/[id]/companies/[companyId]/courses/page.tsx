"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState } from "react";
import {
    BookOpen, Shield, Loader2, ListFilter, RefreshCcw, LayoutGrid, Trash2, Clock, CheckCircle2, ChevronRight, PlayCircle
} from "lucide-react";
import { superadminGetCompanyCourses, superadminGetCompanyDetails } from "@/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function SuperadminCompanyCoursesReview() {
    const { id: adminId, companyId } = useParams();
    const router = useRouter();
    const { token } = useAppSelector(s => s.auth);
    const [courses, setCourses] = useState<any[]>([]);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [coursesRes, detailRes] = await Promise.all([
                superadminGetCompanyCourses(companyId as string),
                superadminGetCompanyDetails(companyId as string)
            ]);

            if (coursesRes.data.success && detailRes.data.success) {
                setCourses(coursesRes.data.courses);
                setCompany(detailRes.data.company);
            }
        } catch (err) {
            console.error("Superadmin company courses fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && companyId) fetchData();
    }, [token, companyId]);

    const filteredCourses = courses.filter(c => {
        if (activeFilter === "All") return true;
        return c.status.toLowerCase() === activeFilter.toLowerCase();
    });

    const stats = {
        total: courses.length,
        approved: courses.filter(c => c.status === 'approved').length,
        pending: courses.filter(c => c.status === 'pending').length
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-2xl shadow-sm border border-blue-200">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter italic">Training Courses</h1>
                        <p className="text-sm text-muted-foreground font-medium">Verify and manage curriculum for {company?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-xs font-bold hover:bg-secondary transition-all">
                        <RefreshCcw className="w-3.5 h-3.5" /> Refresh
                    </button>
                    <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-background border border-border shadow-sm">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                            {company?.plan} Plan <span className="text-foreground ml-1">{courses.length}/10</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total", value: stats.total, color: "blue" },
                    { label: "Approved", value: stats.approved, color: "emerald" },
                    { label: "Pending", value: stats.pending, color: "amber" }
                ].map((stat) => (
                    <div key={stat.label} className="bg-card border border-border rounded-[2.5rem] p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-4xl font-black mb-1">{stat.value}</p>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter Toolbar */}
            <div className="flex items-center gap-2 p-1.5 bg-secondary/50 rounded-2xl w-fit border border-border">
                {["All", "Pending", "Approved", "Rejected"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                            activeFilter === f ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <div key={course.id} className="bg-card border border-border rounded-[2rem] p-8 flex flex-col group hover:border-blue-500/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-blue-600/5">
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-4 bg-blue-600/5 rounded-3xl border border-blue-600/10 group-hover:scale-110 transition-transform duration-500">
                                    <BookOpen className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                                    course.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                }`}>
                                    <CheckCircle2 className="w-3 h-3" />
                                    {course.status}
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                <h3 className="text-xl font-black tracking-tight leading-tight uppercase italic">{course.title}</h3>
                                <p className="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed opacity-70 italic">
                                    {course.description || "Comprehensive platform training protocol for technical implementation."}
                                </p>
                            </div>

                            <div className="mt-8 pt-8 border-t border-border/50">
                                <Link 
                                    href={`/superadmin/dashboard/admins/${adminId}/companies/${companyId}/courses/${course.id}`}
                                    className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl border border-border bg-secondary/30 text-xs font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300 shadow-sm"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    Manage Modules
                                </Link>
                                
                                <div className="flex items-center justify-between mt-6 px-1">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-[10px] font-black text-muted-foreground uppercase">{course.total_duration || '45'} mins</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{course.difficulty || 'Low'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 bg-card/50 border-2 border-dashed border-border rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center">
                            <Shield className="w-10 h-10 text-muted-foreground/20" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Curriculum Void</h3>
                            <p className="text-sm text-muted-foreground/60 max-w-xs font-medium italic">No training assets matching your current selection found in this entity.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
