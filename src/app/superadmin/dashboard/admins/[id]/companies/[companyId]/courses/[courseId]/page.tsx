"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Shield, List, ArrowLeft, Loader2, 
  Video, FileText, CheckCircle2, Clock, 
  ShieldCheck, RefreshCcw, ChevronRight, Zap, Info, XCircle, AlertTriangle, X, PlayCircle,
  Plus, Search, Filter, Trash2, MoreVertical, LayoutList, Eye, EyeOff, Target,
  ChevronUp, ChevronDown
} from "lucide-react";

import { toast } from "sonner";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  superadminGetCourseModules,
  superadminGetCourseDetails,
  superadminApproveCourse,
  superadminRejectCourse,
  superadminCreateModule,
  superadminUpdateModule,
  superadminDeleteModule,
  superadminGetCompanyPlanInfo,
  superadminUploadMedia,
  superadminReorderModules,
} from "@/api";

type Module = {
  id: number;
  course_id: number;
  title: string;
  type: "docs" | "video" | "quiz";
  content?: string;
  contentextra?: string;
  video_url?: string;
  image_url?: string;
  duration: string | null;
  status: "draft" | "published";
  created_at: string;
};

export default function SuperadminCourseModulesOversight() {
  const params = useParams() as any;
  const router = useRouter();
  const { token } = useAppSelector(s => s.auth);
  
  const adminId = params?.id || "";
  const companyId = params?.companyId || "";
  const courseId = params?.courseId || "";

  const [modules, setModules] = useState<Module[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [rejectionModal, setRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Module Inline Form State
  const [showForm, setShowForm] = useState(false);
  const [editModule, setEditModule] = useState<Module | null>(null);
  const [form, setForm] = useState({
      title: "",
      type: "docs" as "docs" | "video" | "quiz",
      content: "",
      contentextra: "",
      video_url: "",
      image_url: "",
      duration: "",
      status: "published" as "published" | "draft"
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [planInfo, setPlanInfo] = useState<any>(null);

  const videoModules = modules.filter(m => m.type === 'video');
  const docModules = modules.filter(m => m.type === 'docs');
  const quizModules = modules.filter(m => m.type === 'quiz');
  const courseTitle = course?.title;
  const courseStatus = course?.status;

  const fetchData = useCallback(async () => {
    if (!courseId || !token) return;
    setIsLoading(true);
    try {
      const [courseRes, modRes, planRes] = await Promise.all([
        superadminGetCourseDetails(courseId),
        superadminGetCourseModules(courseId),
        superadminGetCompanyPlanInfo(companyId)
      ]);

      if (courseRes.data.success && modRes.data.success) {
        setCourse(courseRes.data.course);
        setModules(modRes.data.modules ?? []);
        if (planRes.data.success) setPlanInfo(planRes.data);
      }
    } catch {
      toast.error("Failed to load curriculum oversight data");
    } finally {
      setIsLoading(false);
    }
  }, [courseId, token, companyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async () => {
      if (!course?.id) return;
      setProcessingId(course.id);
      try {
          const res = await superadminApproveCourse(String(course.id));
          if (res.data.success) {
              toast.success("Curriculum authorized successfully");
              fetchData();
          }
      } catch (err: any) {
          toast.error(err.response?.data?.message || "Approval failed");
      } finally {
          setProcessingId(null);
      }
  };

  const handleReject = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!rejectionReason.trim()) return toast.error("Please specify a reason");
      if (!course?.id) return;

      setIsLoading(true);
      try {
          const res = await superadminRejectCourse(String(course.id), { reason: rejectionReason });
          if (res.data.success) {
              toast.success("Protocol rejected");
              setRejectionModal(false);
              setRejectionReason("");
              fetchData();
          }
      } catch (err: any) {
          toast.error(err.response?.data?.message || "Rejection failed");
      } finally {
          setIsLoading(false);
      }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("media", file);

    try {
      const res = await superadminUploadMedia(formData);
      if (res.data.success) {
        setForm(f => ({ 
          ...f, 
          video_url: res.data.secure_url,
          duration: res.data.duration ? `${Math.ceil(res.data.duration / 60)} mins` : f.duration
        }));
        toast.success("Media asset processed successfully");
      }
    } catch {
      toast.error("Media processing failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.title.trim()) return toast.error("Module title is mandatory");
      if (form.type === 'video' && !form.video_url) return toast.error("Please upload a video first");
      if (form.type === 'quiz' && !form.contentextra) {
         setForm(f => ({ ...f, contentextra: JSON.stringify({ questions: [] }) }));
      }
      
      setSaving(true);
      try {
          const res = editModule 
            ? await superadminUpdateModule(String(editModule.id), form)
            : await superadminCreateModule(courseId, { ...form, order_index: modules.length });

          if (res.data.success) {
              toast.success(editModule ? "Instructional node updated" : "New instructional node added");
              setShowForm(false);
              setEditModule(null);
              setForm({ title: "", type: "docs", content: "", contentextra: "", video_url: "", image_url: "", duration: "", status: "published" });
              fetchData();
          }
      } catch (err: any) {
          toast.error(err.response?.data?.message || "Failed to save module");
      } finally {
          setSaving(false);
      }
  };

  const moveModule = async (index: number, direction: 'up' | 'down') => {
    if (courseStatus !== 'approved' && courseStatus !== 'pending') return toast.error("Course sequence is locked.");
    
    const newItems = [...modules];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    // Swap
    [newItems[index], newItems[targetIdx]] = [newItems[targetIdx], newItems[index]];

    // Recalculate indices
    const updatedOrders = newItems.map((m, i) => ({ id: m.id, order_index: i }));
    
    try {
      const res = await superadminReorderModules(courseId, updatedOrders);
      if (res.data.success) {
        setModules(newItems.map((m, i) => ({ ...m, order_index: i })));
        toast.success("Instructional flow updated");
      }
    } catch {
      toast.error("Failed to reorder instructional nodes");
    }
  };

  const toggleStatus = async (m: Module) => {
    const newStatus = m.status === 'published' ? 'draft' : 'published';
    try {
      const res = await superadminUpdateModule(String(m.id), { status: newStatus });
      if (res.data.success) {
        toast.success(`Module set to ${newStatus}`);
        fetchData();
      }
    } catch {
      toast.error("Status update failed");
    }
  };

  const handleDeleteModule = async (id: number) => {
      if (!confirm("Permanent decommissioning of this instructional node? This action cannot be reversed.")) return;
      try {
          const res = await superadminDeleteModule(String(id));
          if (res.data.success) {
              toast.success("Module decommissioned");
              fetchData();
          }
      } catch {
          toast.error("Decommissioning failed");
      }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => router.push(`/superadmin/dashboard/admins/${adminId}/companies/${companyId}/courses`)}
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Curriculum Registry
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-sm">
              <LayoutList className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{courseTitle || "Curriculum Builder"}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {courseStatus === 'pending' ? "⏳ Verification Required: Audit instructional nodes before authorization." : "Analyze individual nodes for organizational training compliance"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (courseStatus !== 'approved') return toast.error("Course is under review and cannot be modified.");
                if (planInfo && modules.length >= planInfo.module_limit) {
                   return toast.error(`Total limit reached: max ${planInfo.module_limit} modules allowed.`);
                }
                setEditModule(null);
                setForm({ title: "", type: "docs", content: "", contentextra: "", video_url: "", image_url: "", duration: "", status: "published" });
                setShowForm(true);
              }}
              disabled={courseStatus !== 'approved'}
              className={`flex items-center gap-2 px-6 h-11 rounded-xl text-white text-sm font-bold transition-all shadow-lg ${
                courseStatus === 'approved' 
                  ? "bg-orange-500 hover:bg-orange-400 shadow-orange-500/20" 
                  : "bg-slate-400 cursor-not-allowed opacity-60"
              }`}
            >
              <FileText className="w-4 h-4" /> Add Document
            </button>
            <button
              onClick={() => {
                if (courseStatus !== 'approved') return toast.error("Course is under review.");
                if (planInfo && modules.length >= planInfo.module_limit) return toast.error("Total limit reached.");
                setEditModule(null);
                setForm({ title: "", type: "quiz", content: "Knowledge Assessment", contentextra: JSON.stringify({ questions: [] }), video_url: "", image_url: "", duration: "10 mins", status: "published" });
                setShowForm(true);
              }}
              disabled={courseStatus !== 'approved'}
              className={`flex items-center gap-2 px-6 h-11 rounded-xl text-white text-sm font-bold transition-all shadow-lg ${
                courseStatus === 'approved' 
                  ? "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20" 
                  : "bg-slate-400 cursor-not-allowed opacity-60"
              }`}
            >
              <Target className="w-4 h-4" /> Add Quiz
            </button>

            <button
              onClick={() => {
                if (courseStatus !== 'approved') return toast.error("Course is under review and cannot be modified.");
                if (planInfo) {
                  if (modules.length >= planInfo.module_limit) {
                    return toast.error(`Total limit reached: max ${planInfo.module_limit} modules allowed.`);
                  }
                  if (videoModules.length >= planInfo.video_limit) {
                    return toast.error(`Video limit reached: max ${planInfo.video_limit} videos allowed.`);
                  }
                }
                setEditModule(null);
                setForm({ title: "", type: "video", content: "", contentextra: "", video_url: "", image_url: "", duration: "", status: "published" });
                setShowForm(true);
              }}
              disabled={courseStatus !== 'approved'}
              className={`flex items-center gap-2 px-6 h-11 rounded-xl text-white text-sm font-bold transition-all shadow-lg ${
                courseStatus === 'approved' 
                  ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20" 
                  : "bg-slate-400 cursor-not-allowed opacity-60"
              }`}
            >
              <Video className="w-4 h-4" /> Add Video
            </button>

            {showForm && (
              <button
                onClick={() => setShowForm(false)}
                className="flex items-center gap-2 px-3 h-11 rounded-xl bg-secondary text-foreground text-sm font-bold hover:bg-border transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Oversight Action Bar */}
      {courseStatus === 'pending' && (
        <div className="p-6 bg-blue-50 border border-blue-500/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-blue-100 flex items-center justify-center shadow-sm shrink-0">
                 <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">Verification Required</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5 opacity-70 italic max-w-xl">Inspect all nodes before authorizing this protocol for organizational deployment.</p>
              </div>
           </div>
           <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={handleApprove}
                disabled={processingId === course?.id}
                className="h-10 px-6 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {processingId === course?.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Authorize Protocol
              </button>
              <button 
                onClick={() => setRejectionModal(true)}
                className="h-10 px-6 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all shadow-md shadow-red-500/20 flex items-center gap-2"
              >
                <XCircle className="w-3.5 h-3.5" />
                Revoke
              </button>
           </div>
        </div>
      )}

      {/* Stats Cards */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                <List className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Lessons</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">{modules.length}</span>
              {planInfo && (
                <span className="text-[10px] font-bold text-muted-foreground">
                  Limit: {planInfo.module_limit}
                </span>
              )}
            </div>
            <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
               <div className="h-full bg-blue-600 transition-all" style={{ width: planInfo ? `${(modules.length / planInfo.module_limit) * 100}%` : '0%' }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Video className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Video Modules</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">{videoModules.length}</span>
              {planInfo && (
                <span className="text-[10px] font-bold text-muted-foreground">
                   Limit: {planInfo.video_limit}
                </span>
              )}
            </div>
            <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 transition-all" style={{ width: planInfo ? `${(videoModules.length / planInfo.video_limit) * 100}%` : '0%' }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Document Lessons</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">{docModules.length}</span>
              <span className="text-[10px] font-bold text-muted-foreground capitalize">{planInfo?.plan ?? '...'} Plan</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
               <div className="h-full bg-orange-500 transition-all" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quizzes / Assessments</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold">{quizModules.length}</span>
              <span className="text-[10px] font-bold text-muted-foreground">Verification System</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
               <div className="h-full bg-purple-600 transition-all" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}

      {showForm ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="px-6 py-5 border-b border-border bg-secondary/10 flex items-center justify-between">
            <h3 className="font-bold text-sm">{editModule ? "Edit Lesson Details" : "New Lesson Creation"}</h3>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-background border border-border shadow-sm">
               <div className={`w-2 h-2 rounded-full ${form.type === 'video' ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' : form.type === 'quiz' ? 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.4)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'}`} />
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{form.type} Module</span>
            </div>
          </div>
          
          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Module Name</label>
                <input
                  placeholder="e.g. Security Principles Part 1"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Estimated Duration (Mins) {form.type === 'video' && <span className="text-blue-500 ml-1">(Auto-detected)</span>}
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="number"
                    min="1"
                    placeholder="15"
                    readOnly={form.type === 'video'}
                    value={form.duration.replace(/\D/g, '')}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value ? `${e.target.value} mins` : "" }))}
                    className={`w-full h-12 pl-12 pr-12 rounded-xl border border-input outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-medium ${
                      form.type === 'video' ? 'bg-secondary/40 text-muted-foreground cursor-not-allowed border-dashed' : 'bg-background'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase opacity-50">MINS</span>
                </div>
              </div>

              {form.type === 'video' ? (
                <>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Video Description</label>
                    <textarea
                      placeholder="Brief overview of the video training..."
                      value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      rows={3}
                      className="w-full p-4 rounded-xl border border-input bg-background outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm resize-none"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Video Training URL (Cloudinary / External)</label>
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          placeholder="Upload a video below to generate URL..."
                          value={form.video_url}
                          readOnly
                          className={`w-full h-12 pl-12 pr-4 rounded-xl border border-input outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-xs font-medium italic ${
                            form.video_url ? 'bg-secondary/40 text-blue-600 border-dashed cursor-default' : 'bg-secondary/20 text-muted-foreground cursor-not-allowed'
                          }`}
                        />
                        {form.video_url && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[8px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-widest">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Cloudinary Verified
                          </div>
                        )}
                      </div>
                      
                      <div className="group relative">
                        <input 
                          type="file" 
                          accept="video/*" 
                          onChange={handleMediaUpload}
                          disabled={uploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className={`w-full py-4 px-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                          uploading ? "bg-secondary/50 border-blue-500/50" : "border-border hover:border-blue-500/40 hover:bg-secondary/20"
                        }`}>
                          {uploading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                              <span className="text-[10px] font-bold text-blue-600">Processing video...</span>
                            </>
                          ) : (
                            <>
                              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Plus className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-[10px] font-bold text-muted-foreground group-hover:text-blue-600">
                                {form.video_url ? "Replace Current Video" : "Upload Video to Cloudinary"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : form.type === 'quiz' ? (
                 <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Assessment Description</label>
                    <textarea
                      placeholder="Brief overview of what this quiz covers..."
                      value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      rows={3}
                      className="w-full p-4 rounded-xl border border-input bg-background outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm resize-none leading-relaxed"
                    />
                  </div>
                  <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-start gap-3">
                     <div className="p-2 rounded-lg bg-white text-purple-600 shadow-sm shrink-0">
                       <Target className="w-4 h-4" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-purple-900">Setting up an interactive assessment...</p>
                       <p className="text-[10px] text-purple-700/80 font-medium mt-1 leading-relaxed">
                          After creation, click on the quiz in the list below to build your 5-question audit and specify correct answers.
                       </p>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Short Description (Optional)</label>
                    <textarea
                      placeholder="Brief overview of what this material covers..."
                      value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      rows={3}
                      className="w-full p-4 rounded-xl border border-input bg-background outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm resize-none leading-relaxed"
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                     <div className="p-2 rounded-lg bg-white text-blue-600 shadow-sm shrink-0">
                       <FileText className="w-4 h-4" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-blue-900">Configuring an instructional node...</p>
                       <p className="text-[10px] text-blue-700/80 font-medium mt-1 leading-relaxed">
                          After creation, click on the node in the list below to audit or modify the document content and structure.
                       </p>
                     </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Visibility Status</label>
                <div className="flex gap-2 p-1 bg-secondary/30 rounded-xl w-fit">
                  {(["draft", "published"] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`px-6 h-10 rounded-lg text-xs font-bold capitalize transition-all flex items-center gap-2 ${
                        form.status === s 
                          ? "bg-foreground text-background shadow-md" 
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {s === "published" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditModule(null); }}
                className="flex-1 h-12 rounded-xl border border-border font-bold text-xs hover:bg-secondary transition-all"
              >
                Cancel Changes
              </button>
              <button
                type="submit"
                disabled={saving || uploading || (form.type === 'video' && !form.video_url)}
                className="flex-[2] h-12 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {uploading ? "Waiting for upload..." : editModule ? "Update Existing Lesson" : "Create & Add to Course"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-card border border-border rounded-2xl border-dashed">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium text-muted-foreground">Auditing curriculum modules...</p>
            </div>
          ) : modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-card border border-border rounded-2xl border-dashed">
              <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-6 border border-border">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold">Protocol currently empty</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-8 leading-relaxed">
                Add instructional nodes to build a structured training protocol. Each node can be audited for compliance.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-8 h-12 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-all shadow-xl shadow-foreground/10"
              >
                <Plus className="w-4 h-4" /> Provision First Node
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {modules.map((m, idx) => (
                <div 
                  key={m.id} 
                  className="group relative flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border border-border bg-card hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/superadmin/dashboard/admins/${adminId}/companies/${companyId}/courses/${courseId}/modules/${m.id}`)}
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center font-bold text-sm text-muted-foreground shrink-0 shadow-inner">
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-sm uppercase tracking-tight truncate">{m.title}</h3>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleStatus(m); }}
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                          m.status === "published" 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-600 border-amber-100 hover:bg-amber-500/20"
                        }`}
                      >
                        {m.status === "published" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {m.status}
                      </button>
                    </div>
                    {m.content && (
                      <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed opacity-80 mb-2">
                        {(() => {
                           if (!m.content) return "Node details pending further inspection...";
                           try {
                             const parsed = JSON.parse(m.content);
                             if (Array.isArray(parsed) && parsed.length > 0) {
                               return parsed[0].headline || parsed[0].description || "Untitled Section";
                             }
                             return m.content;
                           } catch {
                             return m.content;
                           }
                        })()}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {m.type === 'video' ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 shadow-sm shadow-blue-500/10">
                          <Video className="w-3.5 h-3.5" /> Video Lesson
                        </div>
                      ) : m.type === 'quiz' ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 shadow-sm shadow-purple-500/10">
                          <Target className="w-3.5 h-3.5" /> Interactive Quiz
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20 shadow-sm shadow-orange-500/10">
                          <FileText className="w-3.5 h-3.5" /> Docs Material
                        </div>
                      )}

                      {m.duration && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-500/10 px-2.5 py-1 rounded-lg border border-slate-500/20 shadow-sm shadow-slate-500/10">
                          <Clock className="w-3.5 h-3.5" /> {m.duration}
                        </div>
                      )}

                      <div className="text-[10px] font-medium text-muted-foreground ml-auto hidden md:block">
                        Modified {new Date(m.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>                   <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-1 mr-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveModule(idx, 'up'); }}
                          disabled={idx === 0 || (courseStatus !== 'approved' && courseStatus !== 'pending')}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveModule(idx, 'down'); }}
                          disabled={idx === modules.length - 1 || (courseStatus !== 'approved' && courseStatus !== 'pending')}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditModule(m);
                        setForm({
                          title: m.title,
                          type: m.type,
                          content: m.content ?? "",
                          contentextra: m.contentextra ?? "",
                          video_url: m.video_url ?? "",
                          image_url: m.image_url ?? "",
                          duration: m.duration ?? "",
                          status: m.status
                        });
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="p-3 rounded-xl bg-secondary hover:bg-foreground hover:text-background transition-all"
                      title="Edit Lesson"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDeleteModule(m.id); 
                      }}
                      className="p-3 rounded-xl bg-secondary hover:bg-red-500 hover:text-white text-red-500 transition-all"
                      title="Delete Lesson"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 no-print">
              <form onSubmit={handleReject} className="bg-white w-full max-w-md rounded-[3rem] p-10 border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 border border-red-100 shadow-sm">
                          <AlertTriangle className="w-7 h-7" />
                      </div>
                      <button type="button" onClick={() => setRejectionModal(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
                          <X className="w-6 h-6 text-slate-400 opacity-60" />
                      </button>
                  </div>

                  <div className="mb-10">
                      <h2 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight uppercase italic">Revoke Authorization</h2>
                      <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed opacity-70 italic border-l-2 border-red-200 pl-4">
                          Provide instructional feedback for the administrator regarding the rejection of this curriculum protocol.
                      </p>
                  </div>

                  <div className="space-y-6">
                      <textarea 
                          required
                          value={rejectionReason}
                          onChange={e => setRejectionReason(e.target.value)}
                          placeholder="Specify the reason for revocation..."
                          className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/30 transition-all min-h-[150px] shadow-inner font-bold italic"
                      />
                      
                      <div className="flex gap-4">
                          <button type="button" onClick={() => setRejectionModal(false)} className="flex-1 h-14 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Abort</button>
                          <button type="submit" className="flex-[2] h-14 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-2">
                             Commit Rejection
                          </button>
                      </div>
                  </div>
              </form>
          </div>
      )}
    </div>
  );
}
