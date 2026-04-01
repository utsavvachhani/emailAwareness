"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Shield, BookOpen, Plus, Search, 
  Trash2, Clock, AlertCircle, RefreshCcw, 
  Loader2, Info, X, Zap, 
  ArrowLeft, CheckCircle2, Settings2, Lock, Sparkles, Crown, ArrowRight,
  List, XCircle
} from "lucide-react";

import { toast } from "sonner";
import { 
  superadminGetCompanyCourses, 
  superadminDeleteCourse, 
  superadminCreateCourse,
  superadminGetCompanyPlanInfo,
  superadminGetCompanyEmployees,
  superadminAssignCourseToEmployees
} from "@/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Course = {
  id: number;
  title: string;
  description: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  total_duration: string | null;
  difficulty: "low" | "medium" | "high";
  rejection_reason?: string | null;
  moduleCount?: number;
};

type Employee = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
};

type PlanInfo = {
  plan: string;
  is_paid?: boolean;
  course_count: number;
  course_limit: number;
  can_create: boolean;
};

// ─── Config ───────────────────────────────────────────────────────────────────
const DIFF_CFG = {
    low:    { label: "Low Intensity",    badge: "bg-green-500/10 text-green-700 border-green-500/20",    dot: "bg-green-500" },
    medium: { label: "Medium Load", badge: "bg-blue-500/10 text-blue-700 border-blue-500/20",      dot: "bg-blue-500" },
    high:   { label: "High Demand",   badge: "bg-purple-500/10 text-purple-700 border-purple-500/20", dot: "bg-purple-500" },
};
  
const STATUS_CFG = {
    pending:  { label: "Pending Review", Icon: Clock,        cls: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
    approved: { label: "Approved",       Icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
    rejected: { label: "Rejected",       Icon: XCircle,      cls: "bg-red-500/10 text-red-600 border-red-500/20" },
};

const PLAN_ICONS: Record<string, React.ElementType> = { basic: Zap, standard: Sparkles, premium: Crown };

// ─── Course Card Component ────────────────────────────────────────────────────
function CourseCard({ course, onDelete, onManageModules, onAssign, deleting }: {
    course: Course; onDelete: (id: number) => void; onManageModules: () => void; onAssign: () => void; deleting: boolean;
}) {
    const diff = DIFF_CFG[course.difficulty] ?? DIFF_CFG.medium;
    const stat = STATUS_CFG[course.status] ?? STATUS_CFG.pending;
    const { Icon: StatusIcon } = stat;
  
    return (
      <div  
        className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden"
        onClick={onManageModules}
      >
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <BookOpen className="w-20 h-20 rotate-12" />
        </div>

        {/* Top */}
        <div className="flex items-start justify-between gap-2 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-600/20 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-500">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border shadow-sm ${stat.cls}`}>
            <StatusIcon className="w-3.5 h-3.5" /> {stat.label}
          </span>
        </div>
  
        {/* Content */}
        <div className="flex-1 relative z-10">
          <h3 className="font-black text-sm leading-tight text-foreground uppercase truncate group-hover:text-blue-600 transition-colors">{course.title}</h3>
          {course.description && (
            <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed font-medium lowercase italic">{course.description}</p>
          )}
          {course.status === 'rejected' && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-red-600 font-bold leading-tight uppercase tracking-tight">
                Rejected protocols undergo decommissioning.
                {course.rejection_reason && <span className="block mt-1 italic font-black">Reason: {course.rejection_reason}</span>}
              </p>
            </div>
          )}
        </div>
  
        {/* Actions / Buttons based on status */}
        <div className="flex items-center gap-3 pt-6 border-t border-border/40 relative z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onManageModules(); }}
            className="flex-1 h-9 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Settings2 className="w-3.5 h-3.5" /> Protocols
          </button>
          {course.status === 'approved' && (
            <button
              onClick={(e) => { e.stopPropagation(); onAssign(); }}
              className="flex-1 h-9 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
            >
              <Plus className="w-3.5 h-3.5" /> Deploy
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(course.id); }}
            disabled={deleting}
            className="w-9 h-9 rounded-xl border border-border text-muted-foreground hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center group/del disabled:opacity-40"
            title="Delete course"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 transition-transform group-hover/del:scale-110" />}
          </button>
        </div>
  
        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] relative z-10 text-muted-foreground/60">
          {course.total_duration && (
            <div className="flex items-center gap-1.5 font-bold">
              <Clock className="w-3 h-3" /> {course.total_duration} Session
            </div>
          )}
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-sm ${diff.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
            {diff.label}
          </span>
        </div>
      </div>
    );
}

// ─── Assign Course Sidebar ───────────────────────────────────────────────────
function AssignCourseSidebar({
    open, onClose, courseId, courseTitle, companyId
  }: {
    open: boolean; onClose: () => void; courseId: number | null; 
    courseTitle: string; companyId: string;
  }) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
  
    useEffect(() => {
      if (open && companyId) {
        const fetchEmps = async () => {
          setLoading(true);
          try {
            const res = await superadminGetCompanyEmployees(companyId);
            if (res.data.success) setEmployees(res.data.employees || []);
          } catch (err) { toast.error("Failed to fetch employees"); }
          finally { setLoading(false); }
        };
        fetchEmps();
      }
    }, [open, companyId]);
  
    const handleAssign = async () => {
      if (!courseId || selected.length === 0) return;
      setAssigning(true);
      try {
        const res = await superadminAssignCourseToEmployees(courseId, selected);
        if (res.data.success) {
          toast.success("Training protocols deployed to workforce! 🚀");
          onClose();
          setSelected([]);
        }
      } catch { toast.error("Assignment protocols failed"); }
      finally { setAssigning(false); }
    };
  
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 z-[60] flex justify-end">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all" onClick={onClose} />
        <div className="relative w-full max-w-sm bg-card border-l border-border shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500">
          <div className="p-8 border-b border-border bg-muted/10 flex items-center justify-between">
            <div>
              <h2 className="font-black text-xl uppercase tracking-tighter">Deploy Training</h2>
              <p className="text-[10px] uppercase font-black tracking-widest text-blue-600 mt-1 truncate max-w-[200px]">{courseTitle}</p>
            </div>
            <button onClick={onClose} className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
          </div>
  
          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center justify-between underline-offset-4 decoration-blue-600/30">
               Personnel Selection Group ({selected.length})
               {selected.length > 0 && <button onClick={() => setSelected([])} className="text-blue-600 hover:opacity-70 transition-opacity">Reset Group</button>}
            </div>
            
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse border border-border/40" />)}
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center">
                <Shield className="w-10 h-10 text-muted-foreground/30 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Personnel Registry Void</p>
              </div>
            ) : (
              employees.map(emp => (
                <div 
                  key={emp.id}
                  onClick={() => setSelected(prev => prev.includes(emp.id) ? prev.filter(id => id !== emp.id) : [...prev, emp.id])}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                    selected.includes(emp.id) ? "border-blue-600 bg-blue-600/[0.03] shadow-inner" : "border-border bg-background hover:border-blue-600/30 hover:bg-muted/5 shadow-sm"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                    selected.includes(emp.id) ? "bg-blue-600 text-white shadow-lg" : "bg-muted text-muted-foreground border border-border"
                  }`}>
                    {emp.first_name[0]}{emp.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black uppercase truncate tracking-tight">{emp.first_name} {emp.last_name}</p>
                    <p className="text-[10px] text-muted-foreground truncate font-medium lowercase italic">{emp.email}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selected.includes(emp.id) ? "bg-blue-600 border-blue-600 shadow-md" : "border-border"
                  }`}>
                    {selected.includes(emp.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
              ))
            )}
          </div>
  
          <div className="p-8 border-t border-border bg-muted/5">
            <button 
              disabled={selected.length === 0 || assigning}
              onClick={handleAssign}
              className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:translate-y-0"
            >
              {assigning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
              {assigning ? "Provisioning Lifecycle..." : `Deploy Enrollment (${selected.length})`}
            </button>
          </div>
        </div>
      </div>
    );
}

// ─── Main Registry Page ────────────────────────────────────────────────────────
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
  const [assignState, setAssignState] = useState<{ open: boolean; id: number | null; title: string }>({ open: false, id: null, title: "" });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const canCreate = planInfo?.can_create ?? false;
  const noSubscription = !isLoading && planInfo && (!planInfo.is_paid || !planInfo.plan || planInfo.plan === "none");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
      title: "",
      description: "",
      total_duration: "45",
      difficulty: "medium" as "low" | "medium" | "high"
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
    setDeletingId(id);
    try {
      const res = await superadminDeleteCourse(id);
      if (res.data.success) {
        toast.success("Course decommissioned successfully");
        setCourses(prev => prev.filter(c => c.id !== id));
      }
    } catch {
      toast.error("Decommissioning failed");
    } finally {
        setDeletingId(null);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <AssignCourseSidebar 
        open={assignState.open}
        onClose={() => setAssignState(prev => ({ ...prev, open: false }))}
        courseId={assignState.id}
        courseTitle={assignState.title}
        companyId={companyId}
      />

      {/* Corporate Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
          <div className="space-y-4">
              <nav className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  <Link href={`/superadmin/dashboard/admins/${adminId}`} className="hover:text-blue-600 transition-colors">Admin Node</Link>
                  <ArrowRight className="w-3 h-3 opacity-30" />
                  <Link href={`/superadmin/dashboard/admins/${adminId}/companies/${companyId}`} className="hover:text-blue-600 transition-colors">Enterprise Node</Link>
                  <ArrowRight className="w-3 h-3 opacity-30" />
                  <span className="text-blue-600 font-black">Curriculum Registry</span>
              </nav>
              <div className="space-y-1">
                  <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-foreground text-background flex items-center justify-center text-xl font-black shadow-xl">
                          <BookOpen className="w-7 h-7" />
                      </div>
                      <div>
                          <h1 className="text-4xl font-black tracking-tight text-foreground uppercase leading-none">
                              Curriculum <span className="text-blue-600">Registry</span>
                          </h1>
                          <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-2 opacity-60">
                             Centralized instructional oversight for organization node {companyId.toString().slice(0, 8)}
                          </p>
                      </div>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="flex items-center gap-2 h-11 px-5 rounded-2xl border border-border bg-card text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all disabled:opacity-50 shadow-sm"
              >
                <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Registry Sync
              </button>

              <button
                onClick={() => {
                  if (noSubscription) { toast.error("Subscription required for creation."); return; }
                  if (!canCreate) { toast.error("Plan limit reached."); return; }
                  setIsModalOpen(true);
                }}
                className={`flex items-center gap-3 h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl ${
                  canCreate
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                }`}
              >
                {canCreate ? <Plus className="w-4 h-4 stroke-[3]" /> : <Lock className="w-4 h-4" />}
                {canCreate ? "Initialize Protocol" : "Limit Reached"}
              </button>
          </div>
      </div>

      {noSubscription && (
          <div className="flex items-center gap-5 p-6 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] animate-in zoom-in-95 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500 transition-colors duration-500">
              <AlertCircle className="w-6 h-6 text-amber-600 group-hover:text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-amber-900 uppercase tracking-tight">Suspended Curriculum Protocol</p>
              <p className="text-[11px] text-amber-600 mt-1 font-bold lowercase tracking-tight italic opacity-80">
                Organization node requires an active subscription verification to enable curriculum deployment.
              </p>
            </div>
            <Link
              href={`/superadmin/dashboard/admins/${adminId}/companies/${companyId}/billing`}
              className="shrink-0 flex items-center gap-2 px-6 py-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 hover:-translate-y-0.5"
            >
              Access Billing <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
      )}

      {/* Registry Filters & Discovery */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-muted/20 p-3 rounded-[2rem] border border-border/50">
          <div className="flex gap-2 bg-background p-1.5 rounded-2xl shadow-inner border border-border/40">
            {(["all", "pending", "approved", "rejected"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  filterStatus === f ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full md:max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                  type="text"
                  placeholder="Identify curriculum component..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-12 bg-background rounded-2xl border border-border pl-14 pr-6 text-xs font-bold uppercase tracking-tight outline-none focus:border-blue-500/60 transition-all shadow-sm focus:shadow-md"
              />
          </div>
      </div>

      {/* Course Registry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-64 rounded-[2rem] bg-muted/40 animate-pulse border border-border/50" />
            ))
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full py-40 text-center animate-in fade-in duration-1000">
                <div className="w-24 h-24 rounded-[2.5rem] bg-muted border border-border flex items-center justify-center mb-8 mx-auto opacity-30 shadow-inner">
                    <BookOpen className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-black text-sm uppercase tracking-[0.3em] text-muted-foreground">Registry component void</h3>
                <p className="text-[10px] text-muted-foreground/60 max-w-xs mx-auto mt-4 font-black uppercase tracking-widest italic leading-relaxed">No curriculum protocols identified under current discovery parameters.</p>
            </div>
          ) : (
            filteredCourses.map((c) => (
              <CourseCard 
                key={c.id} 
                course={c}
                deleting={deletingId === c.id}
                onDelete={handleDelete}
                onManageModules={() => router.push(`/superadmin/dashboard/admins/${adminId}/companies/${companyId}/courses/${c.id}`)}
                onAssign={() => setAssignState({ open: true, id: c.id, title: c.title })}
              />
            ))
          )}
      </div>

      {/* Initialize Protocol Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
              <div className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 group">
                   <div className="px-10 py-8 border-b border-border bg-muted/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <BookOpen className="w-32 h-32 rotate-12" />
                      </div>
                      <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-600/30">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="font-black text-2xl uppercase tracking-tighter">Initialize Protocol</h2>
                                <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-60">Define organization-specific curriculum</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-border hover:bg-red-500 hover:text-white hover:border-red-500 transition-all group/close">
                              <X className="w-5 h-5 transition-transform group-hover/close:rotate-90" />
                          </button>
                      </div>
                  </div>

                  <form onSubmit={handleCreate} className="p-10 space-y-8 animate-in slide-in-from-bottom-2 duration-700">
                      <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Curriculum Designator <span className="text-red-500">*</span></label>
                          <input 
                              required
                              value={formData.title}
                              onChange={e => setFormData({...formData, title: e.target.value})}
                              placeholder="e.g. THREAT DETECTION ALPHA"
                              className="w-full h-14 rounded-2xl bg-muted/40 border border-border px-6 text-xs font-black uppercase tracking-tight outline-none focus:border-blue-600 focus:bg-background transition-all shadow-inner focus:shadow-md"
                          />
                      </div>

                      <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Operational Scope</label>
                          <textarea 
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              placeholder="Map instructional objectives for platform agents..."
                              rows={3}
                              className="w-full rounded-2xl bg-muted/40 border border-border px-6 py-4 text-xs font-black lowercase tracking-tight outline-none focus:border-blue-600 focus:bg-background transition-all shadow-inner focus:shadow-md resize-none"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Session Depth</label>
                             <div className="relative">
                                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input 
                                    type="number"
                                    value={formData.total_duration}
                                    onChange={e => setFormData({...formData, total_duration: e.target.value})}
                                    className="w-full h-14 pl-12 rounded-2xl bg-muted/40 border border-border text-xs font-black outline-none focus:border-blue-600 focus:bg-background transition-all shadow-inner"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase opacity-40">Min</span>
                             </div>
                          </div>

                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Intensity Key</label>
                             <select 
                                value={formData.difficulty}
                                onChange={e => setFormData({...formData, difficulty: e.target.value as any})}
                                className="w-full h-14 rounded-2xl bg-muted/40 border border-border px-6 text-xs font-black uppercase outline-none focus:border-blue-600 focus:bg-background transition-all shadow-inner cursor-pointer"
                             >
                                <option value="low">Low Intensity</option>
                                <option value="medium">Medium Load</option>
                                <option value="high">High Demand</option>
                             </select>
                          </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all duration-300">Abort Initialization</button>
                          <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-1 h-14 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-60 shadow-2xl shadow-blue-600/30"
                          >
                             {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5 stroke-[3]" />}
                             {isSubmitting ? "Provisioning..." : "Authorize Deployment"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}

