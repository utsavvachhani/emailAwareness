"use client";
import { Video, Play, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function AdminVideosPage() {
    return (
        <div className="space-y-10 animate-fade-in mb-20">
            <div className="module-header flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40">
                <div>
                    <h1 className="module-title flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <Video className="w-5 h-5 text-red-600" />
                        </div>
                        Curated Training Library
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1 italic font-medium opacity-60">High-impact cybersecurity awareness videos for your workforce</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Featured Video */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="aspect-video rounded-[2.5rem] bg-neutral-900 border border-border shadow-2xl relative overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl shadow-red-600/40 group-hover:scale-110 transition-transform duration-500">
                                <Play className="w-8 h-8 text-white fill-white ml-1" />
                            </div>
                        </div>
                        <div className="absolute bottom-10 left-10 right-10 z-20">
                            <Badge className="mb-4 bg-red-500 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 border-none shadow-lg">Featured Module</Badge>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter">Advanced Social Engineering Defense</h2>
                            <p className="text-white/60 text-sm mt-2 max-w-lg font-medium">Learn how to identify and neutralize sophisticated psychological manipulation tactics used by modern threat actors.</p>
                        </div>
                        {/* Placeholder gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-blue-900/40" />
                    </div>
                </div>

                {/* Playlist Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card border border-border/60 rounded-[2.5rem] p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Next in Sequence</h3>
                            <ChevronRight className="w-4 h-4 opacity-20" />
                        </div>
                        <div className="space-y-4">
                            {[
                                { t: "Password Hygiene", d: "08:24", p: "100%" },
                                { t: "Phishing Red Flags", d: "12:15", p: "45%" },
                                { t: "Mobile Security", d: "10:02", p: "0%" },
                            ].map((v, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-all cursor-pointer group">
                                    <div className="w-16 aspect-video rounded-lg bg-muted flex items-center justify-center border border-border/50 group-hover:scale-105 transition-transform overflow-hidden relative">
                                        <Play className="w-3 h-3 text-muted-foreground opacity-40 group-hover:text-red-600 transition-colors" />
                                        <div className="absolute bottom-1 right-1 bg-black/80 text-[8px] font-black text-white px-1 rounded-sm">{v.d}</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black italic truncate group-hover:text-red-600 transition-colors">{v.t}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex-1 h-1 bg-muted rounded-full">
                                                <div className="h-full bg-red-500/60 rounded-full" style={{ width: v.p }} />
                                            </div>
                                            <span className="text-[9px] font-black opacity-30">{v.p}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                {[
                    { title: "Phishing Labs", count: 12, col: "red" },
                    { title: "Compliance", count: 8, col: "blue" },
                    { title: "Physical Security", count: 15, col: "emerald" },
                    { title: "Cloud Hybrid", count: 6, col: "purple" },
                ].map((cat, i) => (
                    <Card key={i} className="rounded-[2rem] border-border/60 bg-card/40 p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-1">
                        <div className={`w-12 h-12 rounded-2xl bg-${cat.col}-500/10 flex items-center justify-center border border-${cat.col}-500/20 mb-6 group-hover:scale-110 transition-transform`}>
                            <Video className={`w-5 h-5 text-${cat.col}-600`} />
                        </div>
                        <h4 className="text-xl font-black italic tracking-tighter group-hover:text-primary transition-colors">{cat.title}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mt-1">{cat.count} Operations Modules</p>
                    </Card>
                ))}
            </div>
        </div>
    );
}
