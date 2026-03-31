"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Shield, BookOpen, Plus, Search, 
  Filter, MoreVertical, Trash2, Calendar, 
  Clock, AlertCircle, CheckCircle2, ChevronRight, 
  RefreshCcw, Loader2, Info, X, Zap, 
  ArrowLeft, CheckCircle, BarChart3, Settings2, HelpCircle,
  Lock, Sparkles, Crown
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
  is_paid?: boolean;
  course_count: number;
  course_limit: number;
  can_create: boolean;
};

const PLAN_ICONS: Record<string, React.ElementType> = { basic: Zap, standard: Sparkles, premium: Crown };
const PLAN_COLORS: Record<string, string> = {
  basic: "text-emerald-600", standard: "text-blue-600", premium: "text-purple-600",
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

  const PlanIcon = PLAN_ICONS[planInfo?.plan ?? ""] ?? Zap;
  const planColor = PLAN_COLORS[planInfo?.plan ?? ""] ?? "text-muted-foreground";
  const canCreate = planInfo?.can_create ?? false;
  const noSubscription = !isLoading && planInfo && (!planInfo.is_paid || !planInfo.plan || planInfo.plan === "none");

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Training Courses</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Create and manage cybersecurity training courses for your employees
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-2 h-9 px-4 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-secondary transition-all disabled:opacity-50"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            {/* Plan badge */}

            {planInfo && planInfo.plan && planInfo.plan !== "none" && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${planColor}`}
                   style={{ backgroundColor: "var(--background)", borderColor: "currentColor", opacity: 0.9 }}>
                <PlanIcon className="w-3.5 h-3.5" />
                <span className="capitalize">{planInfo.plan} Plan</span>
                <span className="text-muted-foreground font-normal ml-1">
                  {planInfo.course_count}/{planInfo.course_limit} courses
                </span>
              </div>
            )}

            {/* Create / Lock button */}
            <button
              onClick={() => {
                if (noSubscription) { toast.error("Subscribe to a plan first (Billing page)."); return; }
                if (!canCreate)     { toast.error(`Plan limit reached. Upgrade to create more courses.`); return; }
                setIsModalOpen(true);
              }}
              className={`flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-all ${
                canCreate
                  ? "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              }`}
            >
              {canCreate ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {canCreate ? "Create Course" : (noSubscription ? "No Plan" : "Limit Reached")}
            </button>
          </div>
      </div>

      {noSubscription && (
          <div className="flex items-center gap-4 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-amber-800">No Active Subscription</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Select and pay for a plan from the Billing page to start creating courses.
              </p>
            </div>
            <a
              href={`/superadmin/dashboard/admins/${adminId}/companies/${companyId}/billing`}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-colors"
            >
              Go to Billing <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
      )}

      {/* Stats */}
      {!isLoading && courses.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total",    value: courses.length,                                     color: "text-foreground" },
            { label: "Approved", value: courses.filter(c => c.status === "approved").length, color: "text-emerald-600" },
            { label: "Pending",  value: courses.filter(c => c.status === "pending").length,  color: "text-amber-600"  },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      {courses.length > 0 && (
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
            {(["all", "pending", "approved", "rejected"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filterStatus === f ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                  type="text"
                  placeholder="Identify specific curriculum protocol..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-9 bg-card rounded-lg border border-border pl-10 pr-4 text-xs outline-none focus:border-blue-500/60 transition-colors"
              />
          </div>
        </div>
      )}

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
          {filteredCourses.length === 0 ? (
            <div className="col-span-full py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4 mx-auto">
                    <BookOpen className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-sm mb-1 uppercase tracking-tight">Curriculum Asset Void</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">No courses found matching your current oversight parameters.</p>
            </div>
          ) : (
            filteredCourses.map((c) => (
              <div 
                key={c.id} 
                className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-blue-500/30 hover:shadow-sm transition-all duration-200 group cursor-pointer"
                onClick={() => router.push(`/superadmin/dashboard/admins/${adminId}/companies/${companyId}/courses/${c.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/15 transition-colors">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                        c.status === 'approved' ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
                        c.status === 'pending' ? "bg-amber-500/10 text-amber-700 border-amber-500/20" :
                        "bg-red-500/10 text-red-600 border-red-500/20"
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                             c.status === 'approved' ? "bg-emerald-600" :
                             c.status === 'pending' ? "bg-amber-600" :
                             "bg-red-600"
                        }`} />
                        {c.status}
                    </span>
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-sm leading-tight group-hover:text-blue-600 transition-colors uppercase truncate">{c.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{c.description || "Instructional components pending detailed description..."}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                   <button 
                    onClick={(e) => { e.stopPropagation(); router.push(`/superadmin/dashboard/admins/${adminId}/companies/${companyId}/courses/${c.id}`); }}
                    className="flex-1 h-8 rounded-lg border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-all flex items-center justify-center gap-2"
                   >
                     <Settings2 className="w-3.5 h-3.5" /> Manage Modules
                   </button>
                   <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shadow-sm shrink-0">
                       <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                        <Clock className="w-3 h-3" /> {c.total_duration || 0}m
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        c.difficulty === 'high' ? "bg-purple-500/10 text-purple-700 border-purple-500/20" :
                        c.difficulty === 'medium' ? "bg-blue-500/10 text-blue-700 border-blue-500/20" :
                        "bg-green-500/10 text-green-700 border-green-500/20"
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                            c.difficulty === 'high' ? "bg-purple-500" :
                            c.difficulty === 'medium' ? "bg-blue-500" :
                            "bg-green-500"
                        }`} />
                        {c.difficulty}
                    </span>
                </div>
              </div>
            ))
          )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
              <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                   <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-sm">Create New Course</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Will be sent for superadmin approval</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                          <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                  </div>

                  {planInfo && (
                    <div className="px-6 py-3 bg-secondary/40 border-b border-border flex items-center gap-3">
                        <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground capitalize">{planInfo.plan}</span> plan —{" "}
                            <span className="text-foreground font-medium">{planInfo.course_count} of {planInfo.course_limit}</span> course slots used
                        </p>
                        <div className="ml-auto flex gap-1">
                            {Array.from({ length: planInfo.course_limit }).map((_, i) => (
                                <div key={i} className={`w-6 h-1.5 rounded-full ${i < planInfo.course_count ? "bg-blue-500" : "bg-border"}`} />
                            ))}
                        </div>
                    </div>
                  )}

                  <form onSubmit={handleCreate} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-medium mb-1.5">Course Title <span className="text-red-500">*</span></label>
                          <input 
                              required
                              value={formData.title}
                              onChange={e => setFormData({...formData, title: e.target.value})}
                              placeholder="e.g. Phishing Awareness 101"
                              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-blue-500/60 transition-colors placeholder:text-muted-foreground"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-medium mb-1.5">Description</label>
                          <textarea 
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              placeholder="Brief overview of what employees will learn..."
                              rows={3}
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-blue-500/60 transition-colors placeholder:text-muted-foreground resize-none"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-medium mb-1.5">Total Duration (Minutes)</label>
                             <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input 
                                    type="number"
                                    value={formData.total_duration}
                                    onChange={e => setFormData({...formData, total_duration: e.target.value})}
                                    className="w-full h-9 pl-9 pr-12 rounded-lg border border-input bg-background text-sm outline-none focus:border-blue-500/60 transition-colors"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mins</span>
                             </div>
                          </div>

                          <div>
                             <label className="block text-xs font-medium mb-1.5">Difficulty Level</label>
                             <select 
                                value={formData.difficulty}
                                onChange={e => setFormData({...formData, difficulty: e.target.value as any})}
                                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-blue-500/60 transition-colors"
                             >
                                <option value="low">🟢 Low</option>
                                <option value="medium">🔵 Medium</option>
                                <option value="high">🟣 High</option>
                             </select>
                          </div>
                      </div>

                      <div className="flex gap-3 pt-1">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-9 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors">Cancel</button>
                          <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-1 h-9 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-md shadow-blue-500/20"
                          >
                             {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit for Approval"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
