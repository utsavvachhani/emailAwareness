"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Download, User, Mail, Briefcase, 
  BookOpen, CheckCircle2, Clock, Target, 
  Loader2, Search, Users, RefreshCw, Phone,
  TrendingUp, Award, LayoutGrid, ShieldCheck,
  ChevronRight, Calendar, Info
} from "lucide-react";
import { toast } from "sonner";
import { adminGetEmployeeProgress } from "@/api";
import { useAppSelector } from "@/lib/redux/hooks";

interface ProgressData {
  id: number;
  user_id: number;
  course_id: number;
  module_id: number;
  status: string;
  completed_at: string;
  quiz_score: number | null;
  quiz_responses: any;
  module_title: string;
  module_type: string;
}

interface CourseData {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  total_modules: number;
}

interface EmployeeDetail {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  status: string;
  created_at: string;
  company_id: number;
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAppSelector(s => s.auth);
  const employeeId = params?.employeeId as string;
  const companyId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    employee: EmployeeDetail;
    courses: CourseData[];
    progress: ProgressData[];
  } | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const res = await adminGetEmployeeProgress(employeeId);
      if (res.data.success) {
        setData(res.data);
      }
    } catch {
      toast.error("Failed to load performance metrics");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const stats = useMemo(() => {
    if (!data) return null;
    const { courses, progress } = data;
    
    const courseStats = courses.map(c => {
      const completedModules = progress.filter(p => p.course_id === c.id && p.status === 'completed');
      const quizModules = progress.filter(p => p.course_id === c.id && p.module_type === 'quiz' && p.quiz_score !== null);
      const avgScore = quizModules.length > 0 
        ? Math.round(quizModules.reduce((acc, curr) => acc + (curr.quiz_score || 0), 0) / quizModules.length) 
        : null;
      
      return {
        ...c,
        completedCount: completedModules.length,
        isCompleted: completedModules.length >= c.total_modules && c.total_modules > 0,
        avgScore,
        progressPercent: c.total_modules > 0 ? Math.round((completedModules.length / c.total_modules) * 100) : 0
      };
    });

    const totalCompleted = courseStats.filter(c => c.isCompleted).length;
    const globalModulesCompleted = progress.filter(p => p.status === 'completed').length;
    const globalQuizModules = progress.filter(p => p.module_type === 'quiz' && p.quiz_score !== null);
    const globalAvgScore = globalQuizModules.length > 0
      ? Math.round(globalQuizModules.reduce((acc, curr) => acc + (curr.quiz_score || 0), 0) / globalQuizModules.length)
      : null;

    return {
      courseStats,
      totalCompleted,
      globalModulesCompleted,
      globalAvgScore,
      totalAssigned: courses.length
    };
  }, [data]);

  const handleDownloadReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-widest text-center uppercase">Calibrating Metrics...</p>
      </div>
    );
  }

  if (!data || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-bold">Node not found in registry</h2>
        <button onClick={() => router.back()} className="mt-4 text-sm text-blue-600 font-bold hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Inventory
        </button>
      </div>
    );
  }

  const { employee } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 print:p-0 print:space-y-4 print:mx-0 print:max-w-none">
      {/* ── Header Area ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
        <div className="space-y-4">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all w-fit"
          >
            <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
            Back to Registry
          </button>
          
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-500/20 border-2 border-white/10 ring-4 ring-blue-500/5">
              <span className="text-3xl font-black italic text-white tracking-tighter drop-shadow-md">
                {employee.first_name[0]}{employee.last_name[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black italic tracking-tighter text-foreground leading-none">
                  {employee.first_name} {employee.last_name}
                </h1>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  employee.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                }`}>
                  {employee.status}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-xl border border-border/50">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" /> {employee.designation}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-xl border border-border/50">
                  <Mail className="w-3.5 h-3.5 text-purple-600" /> {employee.email}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-xl border border-border/50">
                  <Calendar className="w-3.5 h-3.5 text-orange-600" /> Member since {new Date(employee.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadReport}
          className="h-12 px-8 rounded-2xl bg-foreground text-background font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-foreground/10 group active:scale-95"
        >
          <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          Export Audit Report
        </button>
      </div>

      {/* ── Print Header (Visible only in PDF) ────────────────────── */}
      <div className="hidden print:block border-b-2 border-foreground pb-8 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">CyberShield Audit Report</h1>
            <p className="text-sm font-bold text-muted-foreground mt-1">CURRICULUM PERFORMANCE & COMPLIANCE VERIFICATION</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Generated On</p>
            <p className="text-sm font-bold uppercase">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-10 mt-12">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-1">Trainee Profile</p>
            <div className="text-xl font-black">{employee.first_name} {employee.last_name}</div>
            <div className="space-y-1">
              <p className="text-xs font-bold flex items-center gap-2 italic"><Briefcase className="w-3 h-3"/> {employee.designation}</p>
              <p className="text-xs font-bold flex items-center gap-2"><Mail className="w-3 h-3"/> {employee.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div className="p-4 bg-muted rounded-2xl border border-border">
                <p className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Courses</p>
                <div className="text-xl font-black">{stats.totalAssigned}</div>
             </div>
             <div className="p-4 bg-muted rounded-2xl border border-border">
                <p className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Completed</p>
                <div className="text-xl font-black">{stats.totalCompleted}</div>
             </div>
             <div className="p-4 bg-muted rounded-2xl border border-border">
                <p className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Avg Quiz</p>
                <div className="text-xl font-black text-purple-600">{stats.globalAvgScore ?? 0}%</div>
             </div>
          </div>
        </div>
      </div>

      {/* ── Stats Wavefront ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-4">
        {[
          { label: "Assigned Courses", value: stats.totalAssigned, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-500/5" },
          { label: "Audit Completions", value: stats.totalCompleted, icon: Award, color: "text-emerald-600", bg: "bg-emerald-500/5" },
          { label: "Avg Assessment Score", value: `${stats.globalAvgScore ?? 0}%`, icon: Target, color: "text-purple-600", bg: "bg-purple-500/5" },
          { label: "Knowledge Points", value: stats.globalModulesCompleted * 10, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/5" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center gap-5 relative overflow-hidden group">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0 border border-current/10 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 truncate">{stat.label}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 opacity-5 ${stat.color}`}>
              <stat.icon className="w-full h-full rotate-12" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 print:flex print:flex-col">
        {/* ── Course Drildown ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-blue-600" />
              Curriculum Inventory
            </h3>
            <span className="text-[10px] font-black px-3 py-1 bg-secondary rounded-lg">VERIFIED DATA</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {stats.courseStats.map(c => (
              <div key={c.id} className="bg-card border border-border rounded-3xl p-6 hover:border-blue-500/30 transition-all shadow-sm group">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-black tracking-tight underline decoration-blue-500/30 decoration-2 underline-offset-4">{c.title}</h4>
                      {c.isCompleted && (
                        <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Certified
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 opacity-70 font-medium italic">{c.description || "Training module description restricted."}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className={`text-2xl font-black italic tracking-tighter leading-none ${c.avgScore && c.avgScore >= 80 ? 'text-purple-600' : 'text-foreground'}`}>
                      {c.avgScore !== null ? `${c.avgScore}%` : "—"}
                    </div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Avg Audit Score</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span className="flex items-center gap-1.5 italic">
                      <BookOpen className="w-3 h-3 text-blue-600" /> 
                      Node Progress: {c.completedCount} / {c.total_modules}
                    </span>
                    <span className={c.progressPercent === 100 ? 'text-emerald-600' : ''}>{c.progressPercent}% Vector</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out shadow-lg ${
                        c.progressPercent === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                      }`}
                      style={{ width: `${c.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
                  {data.progress.filter(p => p.course_id === c.id).slice(0, 4).map(mod => (
                    <div key={mod.id} className="flex flex-col p-3 rounded-2xl bg-secondary/30 border border-border/50 group/mod">
                       <div className="flex items-center justify-between mb-1">
                          <span className="w-4 h-4 rounded bg-white flex items-center justify-center text-[8px] font-black border border-border">
                            {mod.module_type === 'quiz' ? <Target className="w-2.5 h-2.5 text-purple-600" /> : <Clock className="w-2.5 h-2.5 text-blue-600" />}
                          </span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                       </div>
                       <p className="text-[10px] font-bold text-foreground line-clamp-1 leading-tight group-hover/mod:text-blue-600 transition-colors">{mod.module_title}</p>
                       <p className="text-[8px] font-black uppercase text-muted-foreground mt-1 opacity-50">{mod.quiz_score !== null ? `Score: ${mod.quiz_score}` : 'Verified'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Assessment Snapshot ─────────────────────────────────── */}
        <div className="space-y-8">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8 sticky top-24">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2 border-b border-border pb-4">
              <Award className="w-4 h-4 text-purple-600" />
              Certification Health
            </h3>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
                <div className="w-12 h-12 rounded-xl bg-white/50 backdrop-blur shadow-inner flex items-center justify-center border border-purple-500/10">
                  <ShieldCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-black text-purple-950 italic tracking-tighter leading-none">{stats.globalAvgScore ?? 0}%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-purple-900/60 mt-1">Logic Retention Rate</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">Top Performance Hubs</p>
                <div className="space-y-3">
                  {stats.courseStats.sort((a,b) => (b.avgScore || 0) - (a.avgScore || 0)).slice(0, 3).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                       <span className="text-[10px] font-black tracking-tight truncate max-w-[150px]">{c.title}</span>
                       <span className="text-[10px] font-black px-2 py-0.5 rounded bg-foreground text-background">{c.avgScore}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/15">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-orange-900">Audit Insight</h5>
                    <p className="text-[10px] font-medium text-orange-800/70 mt-1 leading-relaxed">
                      This trainee exhibits high proficiency in {stats.courseStats[0]?.title || 'assigned nodes'}. Interactive assessments suggest strong retention of security protocols.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ── Detailed Assessment Logs (PDF Focused) ───────────────── */}
      <div className="hidden print:block space-y-6 mt-12 bg-white">
        <h3 className="text-xl font-black uppercase tracking-widest border-b-2 border-foreground pb-4">Detailed Assessment Transcript</h3>
        <table className="w-full text-left">
           <thead className="bg-muted border-b border-border">
             <tr>
               <th className="px-4 py-3 text-[10px] font-black uppercase">Module Node</th>
               <th className="px-4 py-3 text-[10px] font-black uppercase">Taxonomy</th>
               <th className="px-4 py-3 text-[10px] font-black uppercase">Timestamp</th>
               <th className="px-4 py-3 text-[10px] font-black uppercase">Metric</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-border">
             {data.progress.map(p => (
               <tr key={p.id}>
                 <td className="px-4 py-3 text-xs font-bold">{p.module_title}</td>
                 <td className="px-4 py-3 text-xs uppercase font-black opacity-50">{p.module_type}</td>
                 <td className="px-4 py-3 text-xs">{new Date(p.completed_at).toLocaleDateString()}</td>
                 <td className="px-4 py-3 text-xs font-black">{p.quiz_score !== null ? `${p.quiz_score}%` : 'S-Tier'}</td>
               </tr>
             ))}
           </tbody>
        </table>
        
        <div className="mt-20 pt-8 border-t border-border flex justify-between items-center opacity-30 italic text-[10px]">
           <p>CyberShield Internal Training Portal &copy; 2026. Data verification wavefront standard-014.</p>
           <p>Signatory: __________________________</p>
        </div>
      </div>

    </div>
  );
}
