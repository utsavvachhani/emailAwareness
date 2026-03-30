"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  BookOpen, List, ArrowLeft, Loader2, 
  Video, FileText, CheckCircle2, Clock, 
  Eye, EyeOff, LayoutList, ShieldCheck
} from "lucide-react";

import { toast } from "sonner";
import {
  superadminGetCourseModules,
  superadminGetCourseDetails,
} from "@/api";

type Module = {
  id: number;
  course_id: number;
  title: string;
  type: "docs" | "video";
  content: string | null;
  contentextra: string | null;
  video_url: string | null;
  image_url: string | null;
  duration: string | null;
  status: "draft" | "published";
  order_index: number;
  created_at: string;
};

export default function SuperadminCourseModulesOversight() {
  const params = useParams() as any;
  const router = useRouter();
  
  const adminId = params?.id || "";
  const companyId = params?.companyId || "";
  const courseId = params?.courseId || "";

  const [modules, setModules] = useState<Module[]>([]);
  const [courseStatus, setCourseStatus] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseRes, modRes] = await Promise.all([
        superadminGetCourseDetails(courseId),
        superadminGetCourseModules(courseId)
      ]);

      if (courseRes.data.success && modRes.data.success) {
        setCourseStatus(courseRes.data.course.status);
        setCourseTitle(courseRes.data.course.title);
        setModules(modRes.data.modules ?? []);
      }
    } catch {
      toast.error("Failed to load course oversight data");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse uppercase tracking-widest">Generating Curriculum Map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-700">
      {/* Oversight Header */}
      <div className="flex flex-col gap-6 pb-8 border-b border-border/80">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-blue-600 transition-colors w-fit group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Entity Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[2rem] bg-blue-600/10 border border-blue-600/20 flex items-center justify-center shadow-sm">
              <LayoutList className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                    courseStatus === 'approved' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                }`}>
                    {courseStatus} Review
                </span>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500" /> Oversight mode
                </div>
              </div>
              <h1 className="text-4xl font-black tracking-tighter italic uppercase">{courseTitle || "Curriculum Map"}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="px-6 py-3 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 border border-white/10">
                Privileged Access
             </div>
          </div>
        </div>
      </div>

      {/* Modules List Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Lesson Progression</h3>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-secondary px-3 py-1 rounded-full">
                {modules.length} Modules Identified
            </span>
          </div>

          {modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-card/50 border-2 border-dashed border-border rounded-[3rem]">
              <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-6 border border-border">
                <FileText className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Entity Curriculum is Empty</h3>
              <p className="text-sm text-muted-foreground/60 max-w-sm mt-3 font-medium italic">This course currently contains no instructional modules.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {modules.map((m, idx) => (
                <div 
                  key={m.id} 
                  className="group relative flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2rem] border border-border bg-card hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 cursor-pointer"
                  onClick={() => router.push(`/superadmin/dashboard/admins/${adminId}/companies/${companyId}/courses/${courseId}/modules/${m.id}`)}
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center font-black text-xl text-muted-foreground shrink-0 shadow-inner italic">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-black text-xl italic tracking-tight uppercase truncate">{m.title}</h3>
                      <div className={`flex items-center gap-1.5 text-[9px] font-black px-3 py-1 rounded-full border transition-colors ${
                          m.status === "published" 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}>
                        {m.status === "published" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {m.status}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      {m.type === 'video' ? (
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-500/10 px-4 py-1.5 rounded-xl border border-blue-500/20 shadow-sm">
                          <Video className="w-4 h-4" /> Video Curriculum
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 bg-orange-500/10 px-4 py-1.5 rounded-xl border border-orange-500/20 shadow-sm">
                          <FileText className="w-4 h-4" /> Reading Material
                        </div>
                      )}

                      {m.duration ? (
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 bg-slate-500/10 px-4 py-1.5 rounded-xl border border-slate-500/20 shadow-sm">
                          <Clock className="w-4 h-4" /> {m.duration}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 bg-slate-500/10 px-4 py-1.5 rounded-xl border border-slate-500/20 shadow-sm">
                          <Clock className="w-4 h-4" /> Self-Paced
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-border/50 pt-6 md:pt-0 md:pl-8">
                     <div className="p-4 rounded-2xl bg-secondary text-muted-foreground group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        <BookOpen className="w-5 h-5" />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Sidebar */}
        <div className="space-y-6">
           <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm space-y-8 sticky top-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pb-4 border-b border-border">Audit Context</h3>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Curriculum Health</span>
                   <div className="flex items-center justify-between">
                       <span className="text-sm font-bold">Total Lessons</span>
                       <span className="text-lg font-black italic">{modules.length}</span>
                   </div>
                </div>

                <div className="flex flex-col gap-2 pt-6 border-t border-border">
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin ID</span>
                   <span className="text-xs font-mono bg-secondary px-3 py-1.5 rounded-lg border border-border w-fit">{adminId}</span>
                </div>

                <div className="flex flex-col gap-2 pt-6 border-t border-border">
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Platform Role</span>
                   <div className="flex items-center gap-2 text-xs font-black text-blue-600">
                      <ShieldCheck className="w-4 h-4" /> Superadmin Oversight
                   </div>
                </div>
              </div>

              <button className="w-full h-14 rounded-2xl border border-border bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 transition-all shadow-xl shadow-black/10">
                 Finalize Audit
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
