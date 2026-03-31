"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import dynamic from "next/dynamic";
import { 
  Shield, BookOpen, Target, CheckCircle, Clock, Star, Award, 
  FileText, TrendingUp, ChevronRight, Loader2, PlayCircle, 
  CheckCircle2, AlertCircle, RefreshCcw
} from "lucide-react";
import { 
  userGetAssignedCourses, 
  userGetProgress, 
  userMarkModuleComplete, 
  userUnmarkModuleComplete,
  userGetCourseModules 
} from "@/api";
import { toast } from "sonner";

// Dynamically import EditorJS to avoid SSR issues
const EditorJSComponent = dynamic(() => import("@/components/EditorJSComponent"), { 
  ssr: false,
  loading: () => <div className="h-40 flex items-center justify-center bg-secondary/20 rounded-2xl animate-pulse text-xs font-bold text-muted-foreground uppercase tracking-widest">Hydrating Curriculum...</div>
});

// ─── Types ────────────────────────────────────────────────────────────────────
type Course = {
  id: number;
  title: string;
  description: string | null;
  total_duration: string | null;
  difficulty: string;
  company_name: string;
};

type Module = {
  id: number;
  title: string;
  type: 'docs' | 'video' | 'quiz';
  duration: string;
  status: string;
};

type Progress = {
  module_id: number;
  status: 'completed';
};

// ─── Learning Center Component ────────────────────────────────────────────────
function LearningCenter({ 
  course, onBack, progress, onProgressUpdate 
}: { 
  course: Course; onBack: () => void; 
  progress: Progress[]; onProgressUpdate: () => void;
}) {
  const router = useRouter();
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<any>(null);
  const [completing, setCompleting] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Convert content to EditorJS format
  const editorData = useMemo(() => {
    const rawData = activeModule?.contentextra || activeModule?.content;
    if (!rawData) return { blocks: [] };
    
    try {
      const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
        return parsed;
      }
      if (Array.isArray(parsed)) {
        const blocks = parsed.flatMap((s: any) => {
          const b = [];
          if (s.headline) b.push({ type: 'header', data: { text: s.headline, level: 2 } });
          if (s.description) b.push({ type: 'paragraph', data: { text: s.description } });
          return b;
        });
        return { blocks };
      }
      return { blocks: [{ type: 'paragraph', data: { text: String(rawData) } }] };
    } catch {
      return { blocks: [{ type: 'paragraph', data: { text: String(rawData) } }] };
    }
  }, [activeModule]);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await userGetCourseModules(course.id);
      if (res.data.success) {
        const mods = res.data.modules || [];
        setModules(mods);
        if (mods.length > 0) setActiveModule(mods[0]);
      }
    } catch { toast.error("Failed to load modules"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchModules(); }, [course.id]);

  const toggleComplete = async (mid: number, isDone: boolean, quizData?: any) => {
    setCompleting(true);
    try {
      const res = isDone 
        ? await userUnmarkModuleComplete(mid)
        : await userMarkModuleComplete(mid, quizData);
      
      if (res.data.success) {
        toast.success(isDone ? "Module marked as incomplete" : "Module completed! 🎯");
        onProgressUpdate();
        if (quizData) setQuizScore(quizData.score);
      }
    } catch { toast.error("Failed to update progress"); }
    finally { setCompleting(false); }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-card rounded-3xl border border-border animate-pulse">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Initializing Learning Center...</p>
      </div>
    );
  }

  const isModuleDone = (mid: number) => progress.some(p => p.module_id === mid);

  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-[80vh]">
      {/* Sidebar: Curriculum Navigator */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-blue-600 transition-colors mb-2 bg-secondary/50 w-fit px-4 py-2 rounded-xl"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
        </button>

        <div className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col h-full shadow-sm">
          <div className="p-6 border-b border-border bg-gradient-to-br from-blue-500/5 to-transparent">
            <h2 className="text-lg font-black tracking-tight leading-tight">{course.title}</h2>
            <div className="flex items-center gap-2 mt-2">
               <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase">{course.difficulty}</span>
               <span className="text-[10px] font-bold text-muted-foreground">{modules.length} Sessions</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[60vh] xl:max-h-none">
            {modules.map((m, idx) => {
              const active = activeModule?.id === m.id;
              const progObj = progress.find(p => p.module_id === m.id);
              const done = !!progObj;
              const score = (progObj as any)?.quiz_score;

              return (
                <button
                  key={m.id}
                  onClick={() => { setActiveModule(m); setQuizAnswers([]); setQuizScore(score ?? null); }}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all text-left border ${
                    active 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                      : done 
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600/80 hover:bg-emerald-500/10"
                        : "bg-background border-border hover:border-blue-500/30"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-black text-xs ${
                    active ? "bg-white/20" : done ? "bg-emerald-500 text-white" : "bg-blue-500/10 text-blue-600"
                  }`}>
                    {done ? (m.type === 'quiz' ? <Target className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />) : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${active ? "text-white" : "text-foreground"}`}>{m.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-[10px] font-bold uppercase ${active ? "text-white/60" : "text-muted-foreground"}`}>
                        {m.type === 'video' ? "Video" : m.type === 'quiz' ? "Audit" : "Article"} • {m.duration}
                      </p>
                      {done && score !== undefined && score !== null && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${active ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'}`}>
                          Score: {score}/5
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col h-full shadow-xl">
          {activeModule ? (
            <>
              {/* Media Player / Display */}
              {activeModule.type === 'video' ? (
                <div className="aspect-video bg-black w-full relative group">
                  {activeModule.video_url ? (
                    <video 
                      src={activeModule.video_url} 
                      controls 
                      className="w-full h-full object-contain"
                      poster={activeModule.image_url}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-4">
                       <PlayCircle className="w-16 h-16" />
                       <p className="text-sm font-bold uppercase tracking-widest">Video Content Missing</p>
                    </div>
                  )}
                </div>
              ) : (
                activeModule.image_url && (
                  <div className="w-full aspect-[21/9] overflow-hidden border-b border-border">
                    <img 
                      src={activeModule.image_url} 
                      alt={activeModule.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )
              )}

              <div className="p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 text-blue-600 mb-2">
                       {activeModule.type === 'video' ? <PlayCircle className="w-5 h-5" /> : activeModule.type === 'quiz' ? <Target className="w-5 h-5 text-purple-600" /> : <FileText className="w-5 h-5" />}
                       <span className={`text-xs font-black uppercase tracking-widest ${activeModule.type === 'quiz' ? 'text-purple-600' : 'text-blue-600'}`}>{activeModule.type === 'quiz' ? 'Knowledge Audit' : activeModule.type + ' Session'}</span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight">{activeModule.title}</h1>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {activeModule.type !== 'quiz' && (
                      <button
                        disabled={completing}
                        onClick={() => toggleComplete(activeModule.id, isModuleDone(activeModule.id))}
                        className={`h-12 px-6 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${
                          isModuleDone(activeModule.id)
                            ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                            : "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20"
                        }`}
                      >
                        {completing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isModuleDone(activeModule.id) ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Unmark Complete
                          </>
                        ) : (
                          "Mark Session Complete"
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {activeModule.type === 'quiz' ? (
                  <div className="py-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-32 h-32 rounded-[40px] bg-purple-600/10 flex items-center justify-center mb-8 relative group">
                        <div className="absolute inset-0 bg-purple-600/20 rounded-[40px] animate-ping opacity-20" />
                        <Target className="w-16 h-16 text-purple-600 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter mb-4 text-foreground leading-tight">Formal Competency Audit</h2>
                    <p className="text-muted-foreground max-w-sm font-medium leading-relaxed mb-10">
                       This module requires a verified knowledge audit. You will be redirected to a dedicated exam environment to complete this session.
                    </p>
                    
                    <button
                      onClick={() => {
                        router.push(`/user/dashboard/courses/${course.id}/quiz/${activeModule.id}`);
                      }}
                      className="h-16 px-12 rounded-[32px] bg-purple-600 text-white font-black text-lg hover:bg-purple-500 transition-all shadow-2xl shadow-purple-600/30 flex items-center gap-4 group"
                    >
                       Start High-Fidelity Assessment
                       <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {isModuleDone(activeModule.id) && (
                       <div className="mt-8 flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-100/50 border border-emerald-500/20 text-emerald-600 font-black text-[10px] uppercase tracking-widest animate-in slide-in-from-bottom-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Knowledge Verified (Score: {quizScore}/5)
                       </div>
                    )}
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                    <div className="font-medium whitespace-pre-wrap">{activeModule.content}</div>
                    
                    {activeModule.contentextra && (
                      <div className="mt-8 editorjs-view animate-in fade-in slide-in-from-left-4 duration-700">
                          <EditorJSComponent 
                            holder={`editor-user-${activeModule.id}`} 
                            data={editorData} 
                            readOnly={true}
                            onChange={() => {}}
                          />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center gap-6">
               <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center animate-bounce">
                  <BookOpen className="w-10 h-10 text-muted-foreground" />
               </div>
               <div>
                  <h3 className="text-xl font-bold">Select a module to begin</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs">Interactive learning materials will appear here as you navigate through the curriculum.</p>
               </div>
            </div>
          )}
        </div>
        
        {/* Course Info Card */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl p-8 text-white flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Company Training</p>
              <h4 className="text-xl font-black">{course.company_name}</h4>
           </div>
           <Award className="w-12 h-12 text-white/20" />
        </div>
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  const { userInfo } = useAppSelector(s => s.auth);
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [learningCourse, setLearningCourse] = useState<Course | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([userGetAssignedCourses(), userGetProgress()]);
      if (cRes.data.success) setCourses(cRes.data.courses || []);
      if (pRes.data.success) setProgress(pRes.data.progress || []);
    } catch { toast.error("Failed to load dashboard data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const completedCount = progress.length;

  if (learningCourse) {
    return (
      <div className="max-w-7xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <LearningCenter 
          course={learningCourse}
          onBack={() => setLearningCourse(null)}
          progress={progress}
          onProgressUpdate={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Welcome back, {userInfo?.firstName ?? "Hero"}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-md leading-relaxed">
            Your cybersecurity shield is getting stronger every day. Continue your training to stay protected against modern digital threats.
          </p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-4 shadow-xl flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
             </div>
             <div>
                <p className="text-2xl font-black leading-none">{completedCount}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Modules Done</p>
             </div>
          </div>
          <button onClick={fetchData} className="p-3 rounded-2xl border border-border bg-card hover:bg-secondary transition-all">
            <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Course Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight">Your Training Curriculum</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">{courses.length} Assigned</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-3xl bg-secondary animate-pulse border border-border" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg">All systems clear!</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">You have no pending training assignments at the moment. Keep staying alert!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div 
                key={course.id}
                onClick={() => setLearningCourse(course)}
                className="group relative rounded-3xl border border-border bg-card p-6 flex flex-col gap-6 hover:border-blue-500/40 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="flex items-start justify-between">
                   <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{course.difficulty} Difficulty</span>
                      <span className="text-[10px] font-bold text-blue-600">{course.total_duration}</span>
                   </div>
                </div>

                <div>
                   <h3 className="text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors">{course.title}</h3>
                   <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{course.description}</p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">From: <span className="text-foreground">{course.company_name}</span></p>
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                       <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bonus Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
          <div className="rounded-3xl border border-border bg-card p-6 flex items-center gap-6 shadow-sm">
             <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                <Award className="w-10 h-10 text-white" />
             </div>
             <div>
                <h3 className="text-lg font-bold">Certification Status</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-snug">Complete all assigned modules to unlock your "Cyber Awareness Shield" certification.</p>
             </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-center shadow-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-emerald-500" />
                   <p className="text-sm font-bold tracking-tight uppercase tracking-widest text-[10px]">Your Learning wavefront</p>
                </div>
                <p className="text-sm font-black text-blue-600">
                  {courses.length > 0 ? Math.min(100, Math.round((progress.length / (courses.length * 5)) * 100)) : 0}%
                </p>
             </div>
             <div className="h-2 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-1000" 
                  style={{ width: `${courses.length > 0 ? Math.min(100, (progress.length / (courses.length * 5)) * 100) : 0}%` }} 
                />
             </div>
          </div>
      </div>
    </div>
  );
}
