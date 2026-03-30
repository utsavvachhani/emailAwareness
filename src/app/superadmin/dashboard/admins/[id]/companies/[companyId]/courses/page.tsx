"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Shield, BookOpen, Plus, Search, 
  Filter, MoreVertical, Trash2, Calendar, 
  Clock, AlertCircle, CheckCircle2, ChevronRight, 
  RefreshCcw, Loader2, Info, X, Zap, 
  ArrowLeft, CheckCircle, BarChart3, Settings2, HelpCircle
} from "lucide-react";

import { toast } from "sonner";
import { 
  superadminGetCompanyCourses, 
  superadminDeleteCourse, 
  superadminResetCourse,
  superadminCreateCourse,
  superadminGetCompanyPlanInfo
} from "@/api";

type Course = {
  id: number;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  total_duration: string;
  difficulty: "low" | "medium" | "high";
};

type PlanInfo = {
  plan: string;
  course_count: number;
  course_limit: number;
  can_create: boolean;
};

export default function SuperadminCompanyCourses() {
  const params = useParams() as any;
  const router = useRouter();
  
  const adminId = params?.id || "";
  const companyId = params?.companyId || "";

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
      title: "",
      description: "",
      total_duration: "45",
      difficulty: "medium"
  });

  const fetchData = useCallback(async () => {
    if (!companyId) return;
    setIsLoading(true);
    try {
      const [coursesRes, planRes] = await Promise.all([
        superadminGetCompanyCourses(companyId),
        superadminGetCompanyPlanInfo(companyId)
      ]);
      
      if (coursesRes.data.success) setCourses(coursesRes.data.courses);
      if (planRes.data.success) setPlanInfo(planRes.data);
    } catch {
      toast.error("Failed to load organizational curriculum data");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title.trim()) return toast.error("Course title is mandatory");
      
      setIsSubmitting(true);
      try {
          const res = await superadminCreateCourse(companyId, formData);
          if (res.data.success) {
              toast.success("New curriculum protocol initialized");
              setIsModalOpen(false);
              setFormData({ title: "", description: "", total_duration: "45", difficulty: "medium" });
              fetchData();
          }
      } catch (err: any) {
          toast.error(err.response?.data?.message || "Failed to create course");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Decommission this course protocol? This action is irreversible.")) return;
    try {
      const res = await superadminDeleteCourse(id);
      if (res.data.success) {
        toast.success("Course decommissioned successfully");
        fetchData();
      }
    } catch {
      toast.error("Decommissioning failed");
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-10 bg-white min-h-screen font-sans">
      {/* Superadmin Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => router.push(`/superadmin/dashboard/admins/${adminId}/companies/${companyId}`)}
            className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 hover:bg-slate-100 transition-all shrink-0 group shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">
                <Shield className="w-3.5 h-3.5 text-blue-500 fill-blue-500" /> Organizational Curriculum
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Training Courses</h1>
            <p className="text-sm text-slate-500 font-medium tracking-tight mt-1 opacity-60 italic leading-relaxed">
                Create and manage cybersecurity training courses for your employees
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-4">
             <button onClick={fetchData} className="h-11 px-6 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-2 text-sm font-semibold text-slate-700 shadow-sm">
                <RefreshCcw className={`w-4 h-4 ${isLoading && "animate-spin"}`} /> Refresh
             </button>
             
             {planInfo && (
                <div className="h-11 px-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-tight">{planInfo.plan} Plan</span>
                  </div>
                  <div className="h-4 w-[1px] bg-emerald-200" />
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-emerald-600/60 uppercase">{planInfo.course_count}/{planInfo.course_limit} courses</span>
                    <div className="w-16 h-1.5 bg-emerald-200/50 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-1000" 
                            style={{ width: `${(planInfo.course_count / planInfo.course_limit) * 100}%` }}
                        />
                    </div>
                  </div>
                </div>
             )}

             <button 
                onClick={() => setIsModalOpen(true)}
                className="h-11 px-8 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
             >
                <Plus className="w-4 h-4" /> Create Course
             </button>
        </div>
      </div>

      {/* Global Oversight Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 flex items-center justify-between shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <BarChart3 className="w-24 h-24" />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Global Assets</p>
                  <p className="text-4xl font-bold text-slate-900 tracking-tight">{courses.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <BookOpen className="w-7 h-7" />
              </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-8 flex items-center justify-between shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <CheckCircle2 className="w-24 h-24" />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Authorized</p>
                  <p className="text-4xl font-bold text-slate-900 tracking-tight">{courses.filter(c => c.status === 'approved').length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                  <CheckCircle2 className="w-7 h-7" />
              </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-8 flex items-center justify-between shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <Clock className="w-24 h-24" />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Awaiting Auth</p>
                  <p className="text-4xl font-bold text-slate-900 tracking-tight">{courses.filter(c => c.status === 'pending').length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                  <Clock className="w-7 h-7" />
              </div>
          </div>
      </div>

      {/* Oversight Registry Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-inner">
          <div className="flex bg-white rounded-2xl p-1 gap-1 border border-slate-200">
              {(["all", "pending", "approved", "rejected"] as const).map((s) => (
                <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`h-11 px-8 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                    filterStatus === s 
                        ? "bg-slate-900 text-white shadow-lg" 
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                >
                    {s}
                </button>
              ))}
          </div>

          <div className="relative flex-1 max-w-sm ml-auto mr-1">
              <input 
                  type="text"
                  placeholder="Identify specific curriculum protocol..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-11 bg-white rounded-xl border border-slate-200 px-12 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400 transition-all font-bold italic"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
      </div>

      {/* Curriculum Protocol Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {filteredCourses.length === 0 ? (
            <div className="col-span-full py-40 text-center space-y-6">
                <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mx-auto shadow-inner">
                    <BookOpen className="w-10 h-10 text-slate-300" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Curriculum Asset Void</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium opacity-60 italic">No courses found matching your current oversight parameters.</p>
                </div>
            </div>
          ) : (
            filteredCourses.map((c) => (
              <div 
                key={c.id} 
                className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden flex flex-col"
              >
                <div className="flex items-start justify-between relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all shadow-sm shrink-0">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <div className={`flex items-center gap-1.5 px-4 h-8 rounded-full text-[10px] font-bold uppercase tracking-tight shadow-sm border ${
                        c.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        c.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-red-50 text-red-600 border-red-100"
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                             c.status === 'approved' ? "bg-emerald-600" :
                             c.status === 'pending' ? "bg-amber-600" :
                             "bg-red-600"
                        }`} />
                        {c.status}
                    </div>
                </div>

                <div className="space-y-3 flex-1 relative z-10">
                    <h3 className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors leading-tight uppercase truncate">{c.title}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2 opacity-70 italic">{c.description || "Instructional components pending detailed description..."}</p>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-50 relative z-10">
                   <button 
                    onClick={() => router.push(`/superadmin/dashboard/admins/${adminId}/companies/${companyId}/courses/${c.id}`)}
                    className="w-full h-12 rounded-2xl border border-slate-200 bg-white font-bold text-[11px] uppercase tracking-widest text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-3 transition-all shadow-sm group-hover:border-blue-200"
                   >
                     <Settings2 className="w-4 h-4 text-slate-400" /> MANAGE MODULES
                   </button>

                   <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                                <Clock className="w-3.5 h-3.5" /> {c.total_duration || 0}m
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                c.difficulty === 'high' ? "bg-red-50 text-red-600" :
                                c.difficulty === 'medium' ? "bg-blue-50 text-blue-600" :
                                "bg-emerald-50 text-emerald-600"
                            }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                    c.difficulty === 'high' ? "bg-red-500" :
                                    c.difficulty === 'medium' ? "bg-blue-500" :
                                    "bg-emerald-500"
                                }`} />
                                {c.difficulty}
                            </span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm shrink-0">
                            <Trash2 className="w-4 h-4" />
                        </button>
                   </div>
                </div>
              </div>
            ))
          )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
              <form onSubmit={handleCreate} className="bg-white w-full max-w-lg rounded-[3rem] p-10 border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 shadow-sm shrink-0">
                            <BookOpen className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight">Create New Course</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Will be sent for superadmin approval</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
                          <X className="w-6 h-6 text-slate-400 opacity-60" />
                      </button>
                  </div>

                  {planInfo && (
                    <div className="mb-10 p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between shadow-inner">
                        <div className="flex items-center gap-3">
                            <Info className="w-4 h-4 text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                                <span className="text-slate-900 border-b border-slate-900 pb-0.5">{planInfo.plan}</span> plan — {planInfo.course_count} of {planInfo.course_limit} course slots used
                            </span>
                        </div>
                        <div className="flex gap-1">
                            {Array.from({ length: planInfo.course_limit }).map((_, i) => (
                                <div key={i} className={`w-6 h-1.5 rounded-full ${i < planInfo.course_count ? "bg-blue-600" : "bg-slate-200"}`} />
                            ))}
                        </div>
                    </div>
                  )}

                  <div className="space-y-8">
                      <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Course Title <span className="text-red-500">*</span></label>
                          <input 
                              required
                              value={formData.title}
                              onChange={e => setFormData({...formData, title: e.target.value})}
                              placeholder="e.g. Phishing Awareness 101"
                              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                          />
                      </div>

                      <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Description</label>
                          <textarea 
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              placeholder="Brief overview of what employees will learn..."
                              className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Total Duration (Minutes)</label>
                             <div className="relative">
                                <input 
                                    type="number"
                                    value={formData.total_duration}
                                    onChange={e => setFormData({...formData, total_duration: e.target.value})}
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-14 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-inner"
                                />
                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mins</span>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Difficulty Level</label>
                             <div className="relative">
                                <select 
                                    value={formData.difficulty}
                                    onChange={e => setFormData({...formData, difficulty: e.target.value as any})}
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 appearance-none text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-inner cursor-pointer"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                             </div>
                          </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                          <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-1 h-14 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                          >
                             {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Approval"}
                          </button>
                      </div>
                  </div>
              </form>
          </div>
      )}
    </div>
  );
}
