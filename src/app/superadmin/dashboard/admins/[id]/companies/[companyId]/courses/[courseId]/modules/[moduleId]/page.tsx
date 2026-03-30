"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft, Edit3, XCircle, Info, Loader2, X,
  Video, FileText, Image as ImageIcon,
  Clock, PlayCircle, EyeOff, Type, AlignLeft, ShieldCheck, Zap
} from "lucide-react";
import { toast } from "sonner";
import {
  superadminGetModuleDetails,
  superadminUpdateModule,
  adminUploadMedia, // We'll use the same media upload API if it works, or we can use the superadmin-specific one we just added
} from "@/api";

// Dynamically import EditorJS to avoid SSR issues
const EditorJSComponent = dynamic(() => import("@/components/EditorJSComponent"), {
  ssr: false,
  loading: () => <div className="h-40 flex items-center justify-center bg-secondary/20 rounded-2xl animate-pulse text-xs font-bold text-muted-foreground uppercase tracking-widest italic">Initializing Editor Viewport...</div>
});

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

export default function SuperadminModuleEditPage() {
  const params = useParams() as any;
  const router = useRouter();

  const adminId = params?.id || "";
  const companyId = params?.companyId || "";
  const courseId = params?.courseId || "";
  const moduleId = params?.moduleId || "";

  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    type: "docs" as "docs" | "video",
    content: "",
    contentextra: "",
    video_url: "",
    image_url: "",
    duration: "",
    status: "published" as "draft" | "published"
  });

  const fetchDetails = useCallback(async () => {
    if (!moduleId) return;
    setLoading(true);
    try {
      const res = await superadminGetModuleDetails(moduleId);
      if (res.data.success) {
        const m = res.data.module;
        setModule(m);
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
      }
    } catch {
      toast.error("Failed to load module details");
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("media", file);

    try {
      // Note: We're using adminUploadMedia here as it maps to /admin/upload-media,
      // but in the backend we also just added /superadmin/upload-media.
      // For now, I'll use the superadmin API if available or just the axios instance.
      const res = await adminUploadMedia(formData);
      if (res.data.success) {
        if (form.type === 'video') {
          const durationMins = res.data.duration ? Math.ceil(res.data.duration / 60) : 0;
          setForm(f => ({
            ...f,
            video_url: res.data.secure_url,
            duration: durationMins > 0 ? `${durationMins} mins` : f.duration
          }));
        } else {
          setForm(f => ({
            ...f,
            image_url: res.data.secure_url
          }));
        }
        toast.success("Media asset processed successfully!");
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

    setSaving(true);
    try {
      const payload = {
        ...form,
        order_index: module?.order_index ?? 0,
        video_url: form.type === 'video' ? form.video_url : null,
        image_url: form.type === 'docs' ? (form.image_url || null) : null,
      };

      const res = await superadminUpdateModule(moduleId, payload);

      if (res.data.success) {
        toast.success("Instructional node updated");
        setModule(res.data.module);
        setIsEditing(false);
        fetchDetails(); // Full refresh
      }
    } catch {
      toast.error("Failed to update module");
    } finally {
      setSaving(false);
    }
  };

  const editorData = useMemo(() => {
    const rawData = form.contentextra || form.content;
    if (!rawData) return { blocks: [] };

    try {
      const parsed = JSON.parse(rawData);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) return parsed;
      return { blocks: [{ type: 'paragraph', data: { text: String(parsed) } }] };
    } catch {
      return { blocks: [{ type: 'paragraph', data: { text: rawData } }] };
    }
  }, [form.contentextra, form.content]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse italic">Initalizing Oversight Editor...</p>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-[2rem] bg-red-50 flex items-center justify-center text-red-500 border border-red-100 shadow-inner">
          <XCircle className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Node Not Found</h2>
          <p className="text-sm text-slate-500 font-medium italic mt-2 opacity-60">The requested instructional asset is missing from the registry.</p>
        </div>
        <button onClick={() => router.back()} className="h-12 px-8 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
          Return to Registry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Oversight Navbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-10 gap-8">
        <div className="flex items-center gap-8">
          <button
            onClick={() => router.back()}
            className="p-4 rounded-[1.5rem] border border-border bg-card hover:bg-secondary transition-all shadow-xl shadow-black/5 hover:-translate-x-1"
          >
            <ArrowLeft className="w-5 h-5 pointer-events-none" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2 italic">
              {module.type === 'video' ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {module.type} Intervention Hub
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900">{module.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 no-print">
          <div className="flex items-center gap-4 px-6 h-12 rounded-[1.5rem] bg-slate-50 border border-slate-200">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Superadmin Mode</span>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-3 px-8 h-14 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl relative overflow-hidden group ${isEditing
              ? "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
              : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/40"
              }`}
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {isEditing ? "Exit Editor" : "Modify Node"}
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white border border-slate-100 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 p-12 md:p-16 space-y-12 animate-in zoom-in-95 duration-500">
          <div className="flex items-center gap-3 px-6 py-2.5 rounded-[1.5rem] bg-blue-600/5 border border-blue-600/10 w-fit mx-auto mb-6">
            <Zap className={`w-3.5 h-3.5 ${form.type === 'video' ? 'text-blue-600' : 'text-orange-500'} fill-current opacity-40`} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/60 italic">Administrative Curriculum Intervention</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="md:col-span-2 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2 italic">Protocol Label</label>
              <input
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full h-16 px-8 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600/20 transition-all text-2xl font-black italic tracking-tight placeholder:opacity-20"
              />
            </div>

            {form.type === 'video' ? (
              <div className="md:col-span-2 space-y-12">
                {form.video_url && (
                  <div className="rounded-[3rem] overflow-hidden border border-slate-200 bg-black aspect-video shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                    <video src={form.video_url} controls className="w-full h-full object-contain" />
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2 italic">Contextual Analysis</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    rows={6}
                    placeholder="Provide detailed instruction context..."
                    className="w-full p-8 rounded-[2rem] bg-slate-50 border border-slate-100 outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600/20 transition-all text-base font-bold italic leading-relaxed shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2 italic">Est. Duration</label>
                    <div className="relative">
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                        type="number"
                        min="1"
                        readOnly={true}
                        value={form.duration.replace(/\D/g, '')}
                        className="w-full h-16 pl-16 pr-16 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 opacity-60 cursor-not-allowed font-black italic text-slate-500"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Mins (Synced)</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2 italic">Stream Asset Provision</label>
                    <div className="group relative">
                      <input type="file" accept="video/*" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                      <div className="w-full h-16 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-slate-50 group-hover:border-blue-600/40 transition-all shadow-inner">
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : <Video className="w-5 h-5" />}
                        {uploading ? "Provisioning Asset..." : "Provision Video Stream"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="md:col-span-2 space-y-16">
                <div className="space-y-12">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2 italic">Strategic Overview</label>
                    <textarea
                      value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      rows={3}
                      placeholder="Concise instruction brief..."
                      className="w-full p-8 rounded-[2rem] bg-slate-50 border border-slate-100 outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600/20 transition-all text-base font-bold italic leading-relaxed shadow-inner"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <ShieldCheck className="w-6 h-6 text-blue-600" />
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 italic">Instructional Registry Editor</span>
                    </div>

                    <div className="min-h-[500px] p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 shadow-inner overflow-hidden">
                      <EditorJSComponent
                        holder="editorjs-superadmin-edit"
                        data={editorData}
                        onChange={(data) => setForm(f => ({ ...f, contentextra: JSON.stringify(data) }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2 italic">Visual Compliance Asset</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="group relative">
                      <input type="file" accept="image/*" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                      <div className="w-full aspect-[21/9] border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:border-blue-600/40 group-hover:bg-blue-600/[0.02] transition-all overflow-hidden bg-slate-50 shadow-inner">
                        {form.image_url ? (
                          <img src={form.image_url} alt="Compliance Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <>
                            {uploading ? <Loader2 className="w-12 h-12 animate-spin text-blue-600 opacity-20" /> : <ImageIcon className="w-12 h-12 opacity-10" />}
                            <span>{uploading ? "Analyzing Image..." : "Identify Compliance Header"}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="bg-blue-600/5 border border-blue-600/10 p-8 rounded-[2.5rem] shadow-sm italic">
                        <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-3 flex items-center gap-2 italic">
                          <Info className="w-4 h-4" /> Global Policy
                        </h4>
                        <p className="text-[11px] font-bold text-blue-800/60 leading-relaxed uppercase tracking-tighter">
                          Superadmin edits are audited. Ensure instructional assets align with regional cybersecurity regulations and organizational mandates.
                        </p>
                      </div>
                      <div className="flex items-center gap-4 px-8 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
                        <Clock className="w-5 h-5 text-slate-300" />
                        <input
                          type="number"
                          min="1"
                          placeholder="20"
                          value={form.duration.replace(/\D/g, '')}
                          onChange={e => setForm(f => ({ ...f, duration: e.target.value ? `${e.target.value} mins` : "" }))}
                          className="bg-transparent border-none outline-none text-base font-black flex-1 italic placeholder:opacity-20"
                        />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-40">Mins (Est)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-6 pt-12 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving || uploading || (form.type === 'video' && !form.video_url)}
              className="flex-1 h-16 rounded-[2rem] bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-900/40 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-6 h-6 animate-spin text-blue-400" /> : <ShieldCheck className="w-6 h-6 text-blue-400" />}
              {uploading ? "Awaiting Data Ingestion..." : "Commit Administrative Override"}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 space-y-12">
            {/* Main Visual Content */}
            {module.type === 'video' ? (
              <div className="space-y-12">
                <div className="aspect-video rounded-[3rem] overflow-hidden bg-black border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative group/vid">
                  {module.video_url ? (
                    <video src={module.video_url} controls className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/20 gap-8 animate-pulse italic">
                      <Video className="w-20 h-20 opacity-10" />
                      <p className="font-black uppercase tracking-[0.4em] text-[11px]">Asset Void Identified</p>
                    </div>
                  )}
                  <div className="absolute top-8 left-8 px-6 py-2.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover/vid:opacity-100 transition-opacity italic">
                    Privileged Stream Pipeline
                  </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-150 transition-transform duration-[2000ms]">
                    <AlignLeft className="w-64 h-64" />
                  </div>
                  <h2 className="text-xs font-black italic uppercase tracking-[0.3em] mb-10 flex items-center gap-4 text-slate-400">
                    <AlignLeft className="w-6 h-6 text-blue-600" />
                    Logical Overview Synthesis
                  </h2>
                  <div className="text-slate-800 leading-[2] font-black italic text-lg opacity-80 border-l-[6px] border-blue-600/20 pl-10">
                    {module.content || "Administrative summary pending for this instruction node."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {module.image_url && (
                  <div className="aspect-[21/9] rounded-[4rem] overflow-hidden border border-slate-100 shadow-2xl relative group">
                    <img src={module.image_url} alt={module.title} className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-12 left-12">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 italic mb-2">Protocol Insight Mapping</p>
                      <h4 className="text-3xl font-black italic text-white uppercase tracking-tighter">{module.title}</h4>
                    </div>
                  </div>
                )}

                <div className="space-y-16">
                  {module.content && (
                    <div className="bg-slate-900 text-white p-16 rounded-[3.5rem] italic font-black text-2xl leading-[1.6] shadow-2xl tracking-tight relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform">
                        <Zap className="w-32 h-32 text-blue-500 fill-blue-500" />
                      </div>
                      <span className="relative z-10 opacity-90">"{module.content}"</span>
                    </div>
                  )}

                  <div className="min-h-[600px] p-16 bg-white border border-slate-100 rounded-[4rem] shadow-sm relative overflow-hidden group">
                    {module.contentextra || module.content ? (
                      <div className="editorjs-view opacity-90 relative z-10">
                        <EditorJSComponent
                          holder="editorjs-superadmin-view"
                          data={editorData}
                          readOnly={true}
                          onChange={() => { }}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground/20 font-black uppercase tracking-[0.5em] text-[11px] italic gap-10">
                        <FileText className="w-24 h-24 opacity-5" />
                        Logical Registry Void
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8 no-print">
            <div className="sticky top-12 space-y-8">
              <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10 border-b border-slate-50 pb-6 italic">Registry Pulse</h3>
                <div className="space-y-8 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                      <Clock className="w-5 h-5 text-blue-600" /> Est. Run-Time
                    </div>
                    <span className="text-[10px] font-black px-5 py-2 bg-slate-50 rounded-xl border border-slate-100 italic">{module.duration || "Self-Paced Node"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                      {module.status === 'published' ? <ShieldCheck className="w-5 h-5 text-emerald-500" /> : <EyeOff className="w-5 h-5 text-amber-500" />} visibility
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-5 py-2 rounded-full border shadow-sm ${module.status === 'published' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                      {module.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                      <Zap className="w-5 h-5 text-blue-600" /> Core Asset
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-3">
                      {module.type === 'video' ? <Video className="w-4 h-4 text-blue-400" /> : <FileText className="w-4 h-4 text-orange-400" />}
                      {module.type} pipeline
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col gap-8">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center border border-white/5 shadow-xl">
                    <ShieldCheck className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black italic tracking-tighter uppercase leading-none">Administrative Protocol</h4>
                    <p className="text-[11px] font-bold opacity-60 mt-4 leading-relaxed uppercase tracking-tighter italic">
                      This instruction node is under global oversight. Superadmin interventions are documented as administrative curriculum overrides.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 italic">Protocol Mapped on {new Date(module.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
