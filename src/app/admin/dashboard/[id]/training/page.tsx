"use client";
import { BookOpen, Search, Filter, Play, CheckCircle2, MoreHorizontal, GraduationCap, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminTrainingPage() {
    const courses = [
        { title: "Phishing Awareness 2024", duration: "15 min", level: "Beginner", progress: "82%", status: "In Progress", enrollments: 124 },
        { title: "Data Protection & GDPR", duration: "25 min", level: "Intermediate", progress: "45%", status: "Active", enrollments: 89 },
        { title: "Social Engineering 101", duration: "12 min", level: "Beginner", progress: "100%", status: "Completed", enrollments: 142 },
        { title: "Incident Response Basics", duration: "30 min", level: "Advanced", progress: "12%", status: "Mandatory", enrollments: 56 },
    ];

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div className="module-header border-b border-border/40 pb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                            Curriculum Intelligence Node
                            <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                            Active Analytics Verified
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter bg-gradient-to-br from-foreground to-foreground/40 bg-clip-text text-transparent leading-[1.1]">
                            Training Programs
                        </h1>
                        <p className="text-sm font-bold text-muted-foreground italic opacity-70 border-l-2 border-primary/20 pl-4 py-1 leading-relaxed max-w-2xl">
                            Deploy and track cybersecurity awareness modules across your entire workforce to strengthen the human firewall.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button className="rounded-[1.5rem] h-14 bg-black text-white hover:bg-neutral-800 font-black px-10 text-xs shadow-2xl">
                            PROPOSE NEW MODULE
                            <CheckCircle2 className="w-4 h-4 ml-3" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Completion Rate", value: "78%", icon: CheckCircle2, color: "emerald" },
                    { label: "Enrollments Active", value: "248", icon: GraduationCap, color: "blue" },
                    { label: "Certifications Issued", value: "152", icon: Award, color: "purple" }
                ].map((s, i) => (
                    <Card key={i} className="rounded-[2.5rem] border-border/60 bg-card/40 backdrop-blur-xl shadow-xl flex flex-col justify-between group hover:scale-[1.02] transition-all duration-500 overflow-hidden relative border-t-4 border-t-primary/10">
                        <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 m-0 mb-1">{s.label}</CardTitle>
                                <h3 className="text-4xl font-black tracking-tighter italic">{s.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl bg-${s.color}-500/10 text-${s.color}-600 flex items-center justify-center border border-${s.color}-500/20 group-hover:scale-110 transition-transform`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 mt-6 h-1 w-full bg-muted/60 absolute bottom-0">
                            <div className={`h-full bg-${s.color}-500/50 w-[70%] rounded-full`} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border/60 p-6 rounded-[2.5rem] shadow-sm backdrop-blur-3xl">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-30 group-focus-within:text-primary transition-colors" />
                    <input 
                        placeholder="Search for internal modules or topics..." 
                        className="w-full bg-muted/30 border-none rounded-2xl pl-12 pr-6 py-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all focus:bg-white tracking-tight"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="rounded-2xl border-border/60 hover:bg-muted font-black uppercase text-[10px] tracking-widest h-12 px-6">
                        <Filter className="h-4 w-4 mr-3 opacity-40" />
                        Apply Analytics Filters
                    </Button>
                </div>
            </div>

            {/* Courses List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {courses.map((c, i) => (
                    <Card key={i} className="rounded-[3rem] border-border/60 shadow-xl overflow-hidden bg-card/30 group hover:border-primary/20 transition-all duration-700 relative border-t-[8px] border-t-muted">
                        <CardHeader className="p-10 border-b border-border/20 bg-muted/10 flex flex-row items-center justify-between">
                            <div className="flex-1">
                                <Badge className="mb-4 bg-muted text-[9px] font-black border-none px-3 py-1 uppercase rounded-full tracking-widest text-muted-foreground opacity-60">{c.level}</Badge>
                                <CardTitle className="text-2xl font-black italic tracking-tighter group-hover:text-primary transition-colors">{c.title}</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-50 flex items-center gap-2 italic">
                                    <Play className="w-3 h-3 text-primary fill-primary/20" /> {c.duration} Assessment Load
                                </CardDescription>
                            </div>
                            <div className="w-14 h-14 rounded-[1.5rem] bg-card border border-border shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 space-y-8 bg-white/40">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest leading-none mb-2 underline decoration-primary/30">Personnel Adoption</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-3">
                                            {[1,2,3].map(j => (
                                                <div key={j} className="w-8 h-8 rounded-full border-2 border-white bg-muted/60 flex items-center justify-center text-[8px] font-black">U{j}</div>
                                            ))}
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-black text-white flex items-center justify-center text-[8px] font-black">+{c.enrollments}</div>
                                        </div>
                                        <span className="text-[10px] font-black italic ml-2 opacity-40">Employees Enrolled</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest mb-2">Cohort Progress</p>
                                    <p className="text-3xl font-black tracking-tighter italic text-primary">{c.progress}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/30">
                                    <div className="h-full bg-primary rounded-full transition-all duration-1000 group-hover:opacity-100 opacity-60" style={{ width: c.progress }} />
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[9px] font-black uppercase text-muted-foreground opacity-50 tracking-widest flex items-center gap-1.5 leading-none">
                                        <div className="w-1 h-1 rounded-full bg-primary" />
                                        Deployment active across secure nodes
                                    </span>
                                    <span className="text-[9px] font-black uppercase text-muted-foreground opacity-50 tracking-widest">{c.status}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardHeader className="p-0 border-t border-border/20">
                            <button className="w-full text-[10px] font-black uppercase tracking-widest py-6 hover:bg-black hover:text-white transition-all duration-300 italic">
                                View Full Intelligence Dataset node →
                            </button>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
}
