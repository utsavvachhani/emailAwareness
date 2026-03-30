"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Shield, List, ArrowLeft, Loader2, 
  Video, FileText, CheckCircle2, Clock, 
  ShieldCheck, RefreshCcw, ChevronRight, Zap, Info, XCircle, AlertTriangle, X, PlayCircle,
  Plus, Search, Filter, Trash2, MoreVertical
} from "lucide-react";

import { toast } from "sonner";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  superadminGetCourseModules,
  superadminGetCourseDetails,
  superadminApproveCourse,
  superadminRejectCourse,
  superadminCreateModule,
  superadminDeleteModule
} from "@/api";

type Module = {
  id: number;
  course_id: number;
  title: string;
  type: "docs" | "video";
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

  // Module Modal State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [moduleSubmitting, setModuleSubmitting] = useState(false);
  const [moduleFormData, setModuleFormData] = useState({
      title: "",
      type: "docs" as "docs" | "video",
      duration: "10 mins",
      status: "published" as "published" | "draft"
  });

  const fetchData = useCallback(async () => {
    if (!courseId || !token) return;
    setIsLoading(true);
    try {
      const [courseRes, modRes] = await Promise.all([
        superadminGetCourseDetails(courseId),
        superadminGetCourseModules(courseId)
      ]);

      if (courseRes.data.success && modRes.data.success) {
        setCourse(courseRes.data.course);
        setModules(modRes.data.modules ?? []);
      }
    } catch {
      toast.error("Failed to load curriculum oversight data");
    } finally {
      setIsLoading(false);
    }
  }, [courseId, token]);

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

  const handleModuleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!moduleFormData.title.trim()) return toast.error("Module title is mandatory");
      
      setModuleSubmitting(true);
      try {
          const res = await superadminCreateModule(courseId, moduleFormData);
          if (res.data.success) {
              toast.success("New instructional node added");
              setIsModuleModalOpen(false);
              setModuleFormData({ title: "", type: "docs", duration: "10 mins", status: "published" });
              fetchData();
          }
      } catch (err: any) {
          toast.error(err.response?.data?.message || "Failed to add module");
      } finally {
          setModuleSubmitting(false);
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

  if (isLoading && modules.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Auditing Curriculum Modules...</p>
        </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-8 bg-white min-h-screen font-sans">
      {/* Superadmin Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => router.push(`/superadmin/dashboard/admins/${adminId}/companies/${companyId}/courses`)}
            className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 hover:bg-slate-100 transition-all shrink-0 group shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">
                <Zap className="w-3.5 h-3.5 text-blue-500 fill-blue-500" /> Module Verification Pipeline
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{course?.title || "Curriculum Registry"}</h1>
            <p className="text-sm text-slate-500 font-medium tracking-tight mt-0.5 opacity-60 italic leading-relaxed">
                Analyzing individual nodes for organizational training compliance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
             <button onClick={fetchData} className="h-11 px-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-2 text-sm font-semibold text-slate-700 shadow-sm">
                <RefreshCcw className={`w-4 h-4 ${isLoading && "animate-spin"}`} /> Refresh
             </button>
             <button 
                onClick={() => setIsModuleModalOpen(true)}
                className="h-11 px-6 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2"
             >
                <Plus className="w-4 h-4" /> Add Module
             </button>
        </div>
      </div>

      {/* Oversight Action Bar */}
      {course?.status === 'pending' && (
        <div className="p-8 bg-blue-50 border border-blue-500/10 rounded-[2.5rem] flex flex-col sm:flex-row sm:items-center justify-between gap-8 shadow-inner shadow-blue-500/5">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white border border-blue-100 flex items-center justify-center shadow-sm shrink-0">
                 <Info className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 leading-tight">Verification Required</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mt-1 opacity-70 italic max-w-xl">This course protocol is currently pending authorization. Inspect all instructional modules below before committing to the global registry.</p>
              </div>
           </div>
           <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={handleApprove}
                disabled={processingId === course.id}
                className="h-12 px-8 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {processingId === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Authorize Protocol
              </button>
              <button 
                onClick={() => setRejectionModal(true)}
                className="h-12 px-8 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Revoke
              </button>
           </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
              <p className="text-4xl font-bold text-slate-900 mb-2">{modules.length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Nodes</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
              <p className="text-4xl font-bold text-slate-900 mb-2">{modules.filter(m => m.status === 'published').length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Published State</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
              <p className="text-4xl font-bold text-slate-900 mb-2">{modules.filter(m => m.status === 'draft').length}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Draft</p>
          </div>
      </div>

      {/* Modules Audit Grid */}
      <div className="grid grid-cols-1 gap-6 pb-12">
          {modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] space-y-6">
              <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 flex items-center justify-center p-6 shadow-sm">
                <FileText className="w-12 h-12 text-slate-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Protocol Asset Void</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-3 font-medium opacity-60 italic">This course currently contains no instructional assets for review.</p>
              </div>
              <button 
                onClick={() => setIsModuleModalOpen(true)}
                className="h-12 px-8 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20"
              >
                PROVISION FIRST NODE
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {modules.map((m, idx) => (
                <div 
                  key={m.id} 
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group flex flex-col relative overflow-hidden"
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center p-3 border border-slate-100 shrink-0">
                      {m.type === 'video' ? <Video className="w-7 h-7 text-slate-400" /> : <FileText className="w-7 h-7 text-slate-400" />}
                    </div>
                    <div className="flex items-center gap-2">
                         <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tight border shadow-sm ${
                            m.status === "published" 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${m.status === "published" ? "bg-emerald-600" : "bg-amber-600"}`} />
                            {m.status}
                        </div>
                        <button onClick={() => handleDeleteModule(m.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 flex-1 relative z-10">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-300 font-mono italic">Node {String(idx + 1).padStart(2, '0')}</span>
                        <h3 className="font-bold text-lg tracking-tight text-slate-900 leading-tight uppercase truncate">{m.title}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                         {m.type === 'video' ? (
                            <span className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest flex items-center gap-1.5">
                                <PlayCircle className="w-3.5 h-3.5" /> Video Stream
                            </span>
                         ) : (
                             <span className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> Text Material
                            </span>
                         )}
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {m.duration || "Self-Paced"}
                         </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push(`/superadmin/dashboard/admins/${adminId}/companies/${companyId}/courses/${courseId}/modules/${m.id}`)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white font-bold text-[11px] uppercase tracking-widest text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-3 transition-all shadow-sm group-hover:border-blue-200 relative z-10"
                  >
                    INSPECT CONTENT <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}
      </div>

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

      {/* Add Module Modal */}
      {isModuleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
              <form onSubmit={handleModuleCreate} className="bg-white w-full max-w-lg rounded-[3rem] p-10 border border-slate-100 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
                   <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 shadow-sm shrink-0">
                            <Plus className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight uppercase italic">Provision Node</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Add instruction segment to protocol</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setIsModuleModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
                          <X className="w-6 h-6 text-slate-400 opacity-60" />
                      </button>
                  </div>

                  <div className="space-y-8">
                      <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Node Title <span className="text-red-500">*</span></label>
                          <input 
                              required
                              value={moduleFormData.title}
                              onChange={e => setModuleFormData({...moduleFormData, title: e.target.value})}
                              placeholder="e.g. Identifying Spear-Phishing Attacks"
                              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none italic"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Instruction Type</label>
                             <div className="relative">
                                <select 
                                    value={moduleFormData.type}
                                    onChange={e => setModuleFormData({...moduleFormData, type: e.target.value as any})}
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 appearance-none text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-inner cursor-pointer"
                                >
                                    <option value="docs">Document / Text</option>
                                    <option value="video">Video Stream</option>
                                </select>
                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                             </div>
                          </div>

                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Est. Duration</label>
                             <div className="relative">
                                <input 
                                    value={moduleFormData.duration}
                                    onChange={e => setModuleFormData({...moduleFormData, duration: e.target.value})}
                                    placeholder="e.g. 15 mins"
                                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-inner"
                                />
                                <Clock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                             </div>
                          </div>
                      </div>

                      <div className="flex gap-4 pt-6">
                          <button type="button" onClick={() => setIsModuleModalOpen(false)} className="flex-1 h-14 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">Abort</button>
                          <button 
                            type="submit" 
                            disabled={moduleSubmitting}
                            className="flex-1 h-14 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                          >
                             {moduleSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Commit Node"}
                          </button>
                      </div>
                  </div>
              </form>
          </div>
      )}
    </div>
  );
}
