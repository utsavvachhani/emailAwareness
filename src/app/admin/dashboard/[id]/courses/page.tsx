"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAppSelector } from "@/lib/redux/hooks";
import {
  BookOpen, Plus, Clock, CheckCircle2, AlertCircle,
  Loader2, X, Trash2, Lock, ChevronRight, Zap, Sparkles, Crown,
  XCircle, Info, RefreshCcw, List,
} from "lucide-react";

import { toast } from "sonner";
import {
  adminGetCoursesByCompany,
  adminCreateCourse,
  adminDeleteCourse,
  adminGetCompanyPlanInfo,
  adminGetCourseModules,
  adminCreateModule,
  adminUpdateModule,
  adminDeleteModule,
} from "@/api";


// ─── Types ────────────────────────────────────────────────────────────────────
type Course = {
  id: number;
  title: string;
  description: string | null;
  total_duration: string | null;
  difficulty: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
};

type PlanInfo = {
  plan: string;
  is_paid: boolean;
  course_count: number;
  course_limit: number;
  can_create: boolean;
};

type Module = {
  id: number;
  course_id: number;
  title: string;
  content: string | null;
  video_url: string | null;
  order_index: number;
  created_at: string;
};


// ─── Config ───────────────────────────────────────────────────────────────────
const DIFF_CFG = {
  low:    { label: "Low",    badge: "bg-green-500/10 text-green-700 border-green-500/20",    dot: "bg-green-500" },
  medium: { label: "Medium", badge: "bg-blue-500/10 text-blue-700 border-blue-500/20",      dot: "bg-blue-500" },
  high:   { label: "High",   badge: "bg-purple-500/10 text-purple-700 border-purple-500/20", dot: "bg-purple-500" },
};

const STATUS_CFG = {
  pending:  { label: "Pending Review", Icon: Clock,        cls: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  approved: { label: "Approved",       Icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  rejected: { label: "Rejected",       Icon: XCircle,      cls: "bg-red-500/10 text-red-600 border-red-500/20" },
};

const PLAN_ICONS: Record<string, React.ElementType> = { basic: Zap, standard: Sparkles, premium: Crown };
const PLAN_COLORS: Record<string, string> = {
  basic: "text-emerald-600", standard: "text-blue-600", premium: "text-purple-600",
};

// ─── Create Course Modal ──────────────────────────────────────────────────────
function CreateCourseModal({
  open, onClose, onCreated, companyId, planInfo,
}: {
  open: boolean; onClose: () => void; onCreated: () => void;
  companyId: string; planInfo: PlanInfo | null;
}) {
  const [form, setForm] = useState({ title: "", description: "", total_duration: "", difficulty: "medium" });
  const [submitting, setSubmitting] = useState(false);

  const reset = () => setForm({ title: "", description: "", total_duration: "", difficulty: "medium" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Course title is required"); return; }
    setSubmitting(true);
    try {
      // companyId goes in the URL, not the body
      const res = await adminCreateCourse(companyId, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        total_duration: form.total_duration ? `${form.total_duration} mins` : undefined,
        difficulty: form.difficulty,
      });
      if (res.data.success) {
        toast.success("Course submitted for superadmin approval! 🎉");
        reset();
        onCreated();
        onClose();
      } else {
        toast.error(res.data.message || "Failed to create course");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const slotsUsed = planInfo?.course_count ?? 0;
  const slotsTotal = planInfo?.course_limit ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
           style={{ animation: "fadeIn 0.15s ease" }}>
        {/* Header */}
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
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Plan quota bar */}
        {planInfo && (
          <div className="px-6 py-3 bg-secondary/40 border-b border-border flex items-center gap-3">
            <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground capitalize">{planInfo.plan}</span> plan —{" "}
              <span className="text-foreground font-medium">{slotsUsed} of {slotsTotal}</span> course slots used
            </p>
            <div className="ml-auto flex gap-1">
              {Array.from({ length: slotsTotal }).map((_, i) => (
                <div key={i} className={`w-6 h-1.5 rounded-full ${i < slotsUsed ? "bg-blue-500" : "bg-border"}`} />
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Phishing Awareness 101"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-blue-500/60 transition-colors placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Description</label>
            <textarea
              placeholder="Brief overview of what employees will learn..."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
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
                  min="1"
                  placeholder="45"
                  value={form.total_duration}
                  onChange={(e) => setForm(f => ({ ...f, total_duration: e.target.value }))}
                  className="w-full h-9 pl-9 pr-12 rounded-lg border border-input bg-background text-sm outline-none focus:border-blue-500/60 transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">MINS</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Difficulty Level</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm(f => ({ ...f, difficulty: e.target.value }))}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-blue-500/60 transition-colors"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🔵 Medium</option>
                <option value="high">🟣 High</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => { reset(); onClose(); }}
              className="flex-1 h-9 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-9 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-md shadow-blue-500/20"
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                : "Submit for Approval"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({ course, onDelete, onManageModules, deleting }: {
  course: Course; onDelete: (id: number) => void; onManageModules: () => void; deleting: boolean;
}) {
  const diff = DIFF_CFG[course.difficulty] ?? DIFF_CFG.medium;
  const stat = STATUS_CFG[course.status] ?? STATUS_CFG.pending;
  const { Icon: StatusIcon } = stat;

  return (
    <div  
      className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-blue-500/30 hover:shadow-sm transition-all duration-200 group cursor-pointer"
      onClick={onManageModules}
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/15 transition-colors">
          <BookOpen className="w-5 h-5 text-blue-600" />
        </div>
        <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${stat.cls}`}>
          <StatusIcon className="w-3 h-3" /> {stat.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-semibold text-sm leading-tight">{course.title}</h3>
        {course.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{course.description}</p>
        )}
        {course.status === 'rejected' && (
          <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-red-600 font-medium leading-tight">
              Rejected courses are automatically deleted 10 days after rejection. 
              {course.rejection_reason && <span className="block mt-1 font-bold italic">Reason: {course.rejection_reason}</span>}
            </p>
          </div>
        )}
      </div>

      {/* Actions / Buttons based on status */}
      <div className="flex items-center gap-2">
        <button
          onClick={onManageModules}
          className="flex-1 h-8 rounded-lg border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-all flex items-center justify-center gap-2"
        >
          <List className="w-3.5 h-3.5" /> Manage Modules
        </button>
        <button
          onClick={() => onDelete(course.id)}
          disabled={deleting}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40"
          title="Delete course"
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="h-px bg-border/50 my-1" />

      {/* Plan & Difficulty Footer */}
      <div className="flex items-center gap-2">
        {course.total_duration && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
            <Clock className="w-3 h-3" /> {course.total_duration}
          </div>
        )}
        <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diff.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
          {diff.label}
        </span>
      </div>
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminCoursesPage() {
  const params = useParams();
  const router = useRouter();
  // The [id] in the URL is the company_id string (e.g. EZE-56474)
  const companyId = params?.id as string;

  const [courses, setCourses] = useState<Course[]>([]);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");



  const fetchData = useCallback(async () => {
    if (!companyId) return;
    try {
      const [coursesRes, planRes] = await Promise.allSettled([
        adminGetCoursesByCompany(companyId),
        adminGetCompanyPlanInfo(companyId),
      ]);
      if (coursesRes.status === "fulfilled" && coursesRes.value.data.success) {
        setCourses(coursesRes.value.data.courses ?? []);
      }
      if (planRes.status === "fulfilled" && planRes.value.data.success) {
        setPlanInfo(planRes.value.data);
      }
    } catch (err) {
      console.error("fetchData:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleManageModules = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    if (course?.status === "pending") {
      return toast.warning("Course is under review. Please wait for superadmin approval.");
    }
    if (course?.status === "rejected") {
      return toast.error("Course has been rejected. Check the reason in the card.");
    }
    router.push(`/admin/dashboard/${companyId}/courses/${courseId}`);
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this course permanently?")) return;
    setDeletingId(id);
    try {
      const res = await adminDeleteCourse(String(id));
      if (res.data.success) {
        toast.success("Course deleted");
        setCourses(prev => prev.filter(c => c.id !== id));
        // Refresh plan info to update quota
        const planRes = await adminGetCompanyPlanInfo(companyId);
        if (planRes.data.success) setPlanInfo(planRes.data);
      } else {
        toast.error(res.data.message || "Failed to delete");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Server error");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = filter === "all" ? courses : courses.filter(c => c.status === filter);
  const PlanIcon = PLAN_ICONS[planInfo?.plan ?? ""] ?? Zap;
  const planColor = PLAN_COLORS[planInfo?.plan ?? ""] ?? "text-muted-foreground";

  const canCreate = planInfo?.can_create ?? false;
  const noSubscription = !loading && planInfo && (!planInfo.is_paid || !planInfo.plan || planInfo.plan === "none");

  return (
    <>
      <CreateCourseModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={fetchData}
        companyId={companyId}
        planInfo={planInfo}
      />



      <div className="space-y-6">
        {/* ── Header ── */}
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
              disabled={loading}
              className="flex items-center gap-2 h-9 px-4 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-secondary transition-all disabled:opacity-50"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
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
                setShowModal(true);
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

        {/* ── No subscription banner ── */}
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
              href={`/admin/dashboard/${companyId}/bills`}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-colors"
            >
              Go to Billing <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* ── Stats ── */}
        {!loading && courses.length > 0 && (
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

        {/* ── Filter tabs ── */}
        {courses.length > 0 && (
          <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
            {(["all", "pending", "approved", "rejected"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === f ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {/* ── Course grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 h-52 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-sm mb-1">
              {filter === "all" ? "No courses yet" : `No ${filter} courses`}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              {filter === "all" && canCreate
                ? "Create your first course — it will be sent to the superadmin for approval."
                : filter === "all"
                ? "Subscribe to a plan from the Billing page to start creating training courses."
                : `You have no ${filter} courses at the moment.`}
            </p>
            {filter === "all" && canCreate && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 transition-colors shadow-md shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" /> Create First Course
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onDelete={handleDelete}
                onManageModules={() => handleManageModules(course.id)}
                deleting={deletingId === course.id}
              />
            ))}
  

          </div>
        )}
      </div>
    </>
  );
}
