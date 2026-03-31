"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Target, ChevronRight, CheckCircle2, 
  X, Loader2, Trophy, Award, Shield, AlertTriangle
} from "lucide-react";
import { 
  userGetCourseModules, 
  userMarkModuleComplete,
  userGetProgress
} from "@/api";
import { toast } from "sonner";

export default function UserQuizDedicatedPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;
  const moduleId = params?.moduleId as string;

  const [module, setModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  const fetchModule = useCallback(async () => {
    if (!courseId || !moduleId) return;
    setLoading(true);
    try {
      const [res, pRes] = await Promise.all([
        userGetCourseModules(courseId),
        userGetProgress()
      ]);

      if (res.data.success) {
        const found = res.data.modules.find((m: any) => m.id.toString() === moduleId);
        if (found) {
          setModule(found);
          const prog = pRes.data.progress.find((p: any) => p.module_id.toString() === moduleId);
          if (prog) {
            setFinished(true);
            setScore(prog.quiz_score || 0);
          }
        }
      }
    } catch {
      toast.error("Failed to load assessment logic");
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleId]);

  useEffect(() => { fetchModule(); }, [fetchModule]);

  const handleSubmit = async () => {
    if (quizAnswers.filter(a => a !== undefined).length < 5) {
      return toast.error("Please answer every question to proceed.");
    }

    setSubmitting(true);
    try {
      const qData = JSON.parse(module.contentextra || '{"questions":[]}');
      const questions = qData.questions || [];
      let finalScore = 0;
      questions.forEach((q: any, i: number) => {
        if (quizAnswers[i] === q.answer) finalScore++;
      });

      const res = await userMarkModuleComplete(moduleId, { score: finalScore, responses: quizAnswers });
      if (res.data.success) {
        setScore(finalScore);
        setFinished(true);
        toast.success("Assessment submitted successfully!");
      }
    } catch {
      toast.error("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-purple-500/10 rounded-full" />
           <div className="absolute inset-0 w-16 h-16 border-4 border-t-purple-600 rounded-full animate-spin" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Initializing Security Audit...</p>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
         <Shield className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
         <h1 className="text-2xl font-black mb-2">Audit Registry Error</h1>
         <p className="text-muted-foreground text-sm max-w-xs">The requested assessment could not be retrieved from the curriculum repository.</p>
         <button onClick={() => router.back()} className="mt-8 px-6 py-3 rounded-2xl bg-foreground text-background font-bold text-sm">Dashboard</button>
      </div>
    );
  }

  const qData = JSON.parse(module?.contentextra || '{"questions":[]}');
  const questions = qData.questions || [];

  if (finished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 animate-in fade-in duration-1000">
         <div className="max-w-2xl w-full bg-card border border-border rounded-[48px] p-12 text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 via-emerald-500 to-blue-600" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl group-hover:bg-purple-600/10 transition-colors duration-1000" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-1000" />

            <div className="w-24 h-24 rounded-[32px] bg-emerald-500/10 flex items-center justify-center mx-auto mb-10 relative">
               <Trophy className="w-12 h-12 text-emerald-600 relative z-10" />
               <div className="absolute inset-0 bg-emerald-500/20 rounded-[32px] animate-ping opacity-20" />
            </div>

            <h1 className="text-4xl font-black tracking-tighter mb-4">Audit Finalized</h1>
            <p className="text-muted-foreground font-medium mb-10 leading-relaxed max-w-sm mx-auto">
               Your security competency has been verified. The results are recorded in your organizational learning wavefront.
            </p>

            <div className="flex flex-col items-center gap-8 mb-12">
               <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                     <circle cx="96" cy="96" r="88" className="fill-none stroke-secondary stroke-[16]" />
                     <circle cx="96" cy="96" r="88" className="fill-none stroke-emerald-500 stroke-[16] transition-all duration-1000" style={{ strokeDasharray: 553, strokeDashoffset: 553 - (553 * (score / 5)) }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <p className="text-5xl font-black text-foreground">{score}</p>
                     <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-1">out of 5</p>
                  </div>
               </div>

               <div className="flex items-center gap-2 group cursor-default">
                  <div className={`w-3 h-3 rounded-full ${score >= 3 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'}`} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                     {score >= 3 ? "Competency Threshold Mastered" : "Threshold not met. Review curriculum."}
                  </p>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <button 
                 onClick={() => router.back()}
                 className="flex-1 h-16 rounded-[24px] bg-foreground text-background font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-foreground/10"
               >
                  <ArrowLeft className="w-4 h-4" /> Finalize & Return
               </button>
               <button 
                 onClick={() => { setFinished(false); setQuizAnswers([]); }}
                 className="flex-1 h-16 rounded-[24px] bg-secondary text-foreground font-black text-sm flex items-center justify-center gap-2 hover:bg-border transition-all"
               >
                  Retake Audit
               </button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.back()} 
              className="p-3.5 rounded-2xl border border-border bg-card hover:bg-secondary transition-all group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="bg-purple-600/10 text-purple-600 p-1 rounded-md">
                    <Target className="w-3 h-3" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Competency Verification</span>
              </div>
              <h1 className="text-3xl font-black tracking-tighter leading-tight">{module.title}</h1>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-col items-end">
             <div className="flex items-center gap-2 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                   <div key={i} className={`w-10 h-1.5 rounded-full transition-all duration-500 ${quizAnswers[i] !== undefined ? 'bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.3)]' : 'bg-secondary'}`} />
                ))}
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{quizAnswers.filter(a => a !== undefined).length} of 5 checkpoints</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {questions.map((q: any, i: number) => (
            <section key={i} className="animate-in fade-in slide-in-from-left-8 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="mb-8 flex items-center gap-5">
                 <span className="w-10 h-10 rounded-2xl bg-foreground text-background flex items-center justify-center font-black text-sm shadow-xl shadow-foreground/10 shrink-0">{i + 1}</span>
                 <h2 className="text-xl md:text-2xl font-black tracking-tight leading-snug">{q.question}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {(q.options || []).map((opt: string, j: number) => {
                    const active = quizAnswers[i] === j;
                    return (
                       <button 
                         key={j} 
                         onClick={() => setQuizAnswers(prev => {
                           const n = [...prev];
                           n[i] = j;
                           return n;
                         })}
                         className={`p-6 rounded-[32px] border text-left flex items-start gap-5 transition-all duration-500 relative group overflow-hidden ${
                            active ? "bg-purple-600 border-purple-600 text-white shadow-2xl shadow-purple-600/30 scale-[1.02]" : "bg-card border-border hover:border-purple-600/30 hover:bg-white"
                         }`}
                       >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border font-black text-xs shrink-0 transition-colors ${
                             active ? "bg-white text-purple-600 border-white" : "border-border text-muted-foreground group-hover:border-purple-600/20"
                          }`}>
                             {String.fromCharCode(65 + j)}
                          </div>
                          <span className="text-sm font-bold flex-1 pt-1.5 leading-relaxed">{opt}</span>
                       </button>
                    );
                 })}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-24 border-t border-border pt-12 pb-20 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-4 group cursor-default">
              <div className="p-3 rounded-2xl bg-amber-100/50 group-hover:bg-amber-100 transition-colors">
                 <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                 <p className="text-sm font-black tracking-tight uppercase tracking-widest text-[10px]">Verification Protocol</p>
                 <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Once submitted, results cannot be modified for this attempt.</p>
              </div>
           </div>

           <button
             disabled={submitting || quizAnswers.filter(a => a !== undefined).length < 5}
             onClick={handleSubmit}
             className="w-full md:w-auto h-16 px-16 rounded-[28px] bg-purple-600 text-white font-black text-lg hover:bg-purple-500 transition-all shadow-2xl shadow-purple-600/30 flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale transition-all duration-500"
           >
              {submitting ? <Loader2 className="animate-spin w-6 h-6" /> : <Shield className="w-5 h-5" />}
              {submitting ? "Processing Audit..." : "Submit Formal Audit"}
           </button>
        </div>
      </div>
    </div>
  );
}
