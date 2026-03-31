"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Shield, List, ArrowLeft, Loader2, 
  Video, FileText, CheckCircle2, Clock, 
  ShieldCheck, RefreshCcw, ChevronRight, Zap, Info, XCircle, AlertTriangle, X, PlayCircle,
  Plus, Search, Filter, Trash2, MoreVertical, LayoutList, Eye, EyeOff, Edit3, Save, AlignLeft, BookOpen, Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import {
  superadminGetModuleDetails,
  superadminUpdateModule,
  superadminUploadMedia
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
      const res = await superadminUploadMedia(formData);
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

  if (loading && !module) {
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
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Navbar */}
      <div className="flex items-center justify-between border-b pb-6 border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/superadmin/dashboard/admins/${adminId}/companies/${companyId}/courses/${courseId}`)}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-secondary transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {module.type === 'video' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              {module.type} Module Oversight
            </div>
            <h1 className="text-xl font-bold tracking-tight">{module.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchDetails(); toast.success("Lesson data refreshed!"); }}
            disabled={loading}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-secondary transition-all shadow-sm group"
            title="Reload Module Data"
          >
            <Loader2 className={`w-4 h-4 text-muted-foreground group-hover:text-blue-600 transition-colors ${loading ? 'animate-spin' : ''}`} />
          </button>

            <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-background border border-border shadow-sm">
               <div className={`w-2 h-2 rounded-full ${form.type === 'video' ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'}`} />
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{form.type} Module</span>
            </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 px-5 h-11 rounded-xl text-sm font-bold transition-all shadow-lg ${isEditing
              ? "bg-secondary text-foreground hover:bg-border"
              : "bg-foreground text-background hover:opacity-90 shadow-foreground/10"
              }`}
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {isEditing ? "Exit Editor" : "Edit Module"}
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl p-8 md:p-12 space-y-10">
          <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-secondary/50 border border-border/50 mx-auto mb-6">
             <div className={`w-2.5 h-2.5 rounded-full ${form.type === 'video' ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]'}`} />
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{form.type} Lesson Content Override</span>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Main Title</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full h-14 px-6 rounded-2xl border border-input bg-background outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-xl font-black"
              />
            </div>

            {form.type === 'video' ? (
              <div className="md:col-span-2 space-y-8">
                {form.video_url && (
                  <div className="rounded-3xl overflow-hidden border border-border bg-black aspect-video shadow-2xl">
                    <video src={form.video_url} controls className="w-full h-full" />
                  </div>
                )}
                
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Video Description</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    rows={6}
                    className="w-full p-6 rounded-2xl border border-input bg-background outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm leading-relaxed"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Duration (Mins) {form.type === 'video' && <span className="text-blue-500 ml-1">(Auto-detected)</span>}
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="number"
                        min="1"
                        readOnly={form.type === 'video'}
                        value={form.duration.replace(/\D/g, '')} 
                        onChange={e => setForm(f => ({ ...f, duration: e.target.value ? `${e.target.value} mins` : "" }))} 
                        className={`w-full h-14 pl-12 pr-12 rounded-2xl border border-input outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-bold ${
                          form.type === 'video' ? 'bg-secondary/40 text-muted-foreground cursor-not-allowed border-dashed' : 'bg-background'
                        }`} 
                      />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase opacity-50">MINS</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Video Asset</label>
                    <div className="group relative">
                      <input type="file" accept="video/*" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="w-full h-14 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground group-hover:bg-secondary">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : <Video className="w-4 h-4" />}
                        {uploading ? "Uploading..." : "Click to Upload Video"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (

              <div className="md:col-span-2 space-y-12">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Short Module Summary</label>
                    <textarea
                      value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      rows={3}
                      placeholder="A brief overview for students..."
                      className="w-full p-6 rounded-2xl border border-input bg-background outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm leading-relaxed"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2 underline-offset-8 decoration-blue-500 underline decoration-2">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rich Curriculum Editor</span>
                    </div>
                    
                    <div className="min-h-[400px] p-10 rounded-[32px] bg-secondary/10 border border-border shadow-inner">
                      <EditorJSComponent 
                        holder="editorjs-edit" 
                        data={editorData} 
                        onChange={(data) => setForm(f => ({ ...f, contentextra: JSON.stringify(data) }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Visual Asset (One per module)</label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="group relative">
                        <input type="file" accept="image/*" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="w-full aspect-video md:aspect-[21/9] border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-4 text-xs font-bold text-muted-foreground group-hover:border-blue-500/40 group-hover:bg-blue-500/5 transition-all overflow-hidden bg-background">
                           {form.image_url ? (
                             <img src={form.image_url} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                           ) : (
                             <>
                               {uploading ? <Loader2 className="w-10 h-10 animate-spin text-blue-500" /> : <ImageIcon className="w-10 h-10 opacity-20" />}
                               <span>{uploading ? "Processing Image..." : "Click to select Cover Image"}</span>
                             </>
                           )}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
                          <h4 className="text-sm font-bold text-orange-900 mb-2">Design Recommendation</h4>
                          <p className="text-xs text-orange-800/80 leading-relaxed">
                            Use a high-resolution horizontal image (16:9). This image will appear at the top of the module as a header to engage your students.
                          </p>
                        </div>
                        <div className="flex items-center gap-3 px-6 h-14 rounded-2xl bg-secondary/50 border border-border relative">
                           <Clock className="w-4 h-4 text-muted-foreground" />
                           <input 
                             type="number"
                             min="1"
                             placeholder="20" 
                             value={form.duration.replace(/\D/g, '')} 
                             onChange={e => setForm(f => ({ ...f, duration: e.target.value ? `${e.target.value} mins` : "" }))}
                             className="bg-transparent border-none outline-none text-sm font-bold flex-1"
                           />
                           <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">MINS</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-10 border-t border-border">
            <button
              type="submit"
              disabled={saving || uploading || (form.type === 'video' && !form.video_url)}
              className="flex-1 h-16 rounded-2xl bg-blue-600 text-white font-bold text-base hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Save className="w-6 h-6" />}
              {uploading ? "Waiting for upload..." : "Publish Administrative Override"}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            {/* Main Visual Content */}
            {module.type === 'video' ? (
              <div className="space-y-10">
                <div className="aspect-video rounded-3xl overflow-hidden bg-black border border-border shadow-2xl relative group">
                  {module.video_url ? (
                    <video src={module.video_url} controls className="w-full h-full" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-white/40 gap-4">
                      <Video className="w-12 h-12" />
                      <p className="font-bold text-sm">No video uploaded yet</p>
                    </div>
                  )}
                </div>
                <div className="bg-card border border-border rounded-3xl p-10 shadow-sm">
                   <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                     <AlignLeft className="w-5 h-5 text-blue-500" />
                     Training Overview
                   </h2>
                   <div className="text-foreground/80 leading-relaxed font-medium whitespace-pre-wrap">
                      {module.content || "No description provided for this video training."}
                   </div>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {module.image_url && (
                  <div className="aspect-video md:aspect-[21/9] rounded-[40px] overflow-hidden border border-border shadow-2xl relative">
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                     <img src={module.image_url} alt={module.title} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="space-y-12">
                   {module.content && (
                     <div className="bg-secondary/20 border-l-4 border-orange-500 p-10 rounded-2xl">
                        <p className="text-lg font-medium text-foreground/80 italic leading-relaxed">
                           "{module.content}"
                        </p>
                     </div>
                   )}

                   <div className="min-h-[500px]">
                      {module.contentextra || module.content ? (
                         <div className="editorjs-view animate-in fade-in slide-in-from-left-4 duration-700">
                            <EditorJSComponent 
                              holder="editorjs-view" 
                              data={editorData} 
                              readOnly={true}
                              onChange={() => {}}
                            />
                         </div>
                      ) : (
                        <div className="bg-card border-2 border-dashed border-border rounded-3xl p-20 text-center">
                           <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                           <h3 className="font-bold text-lg">No Curriculum Content</h3>
                           <p className="text-sm text-muted-foreground mt-2">Start building your rich training module with EditorJS.</p>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="sticky top-8 space-y-6">
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6 border-b border-border pb-4">Curriculum Pulse</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                      <Clock className="w-5 h-5 text-blue-500" /> Lesson Duration
                    </div>
                    <span className="text-xs font-black px-4 py-1.5 bg-secondary rounded-xl">{module.duration || "Self-Paced"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                      {module.status === 'published' ? <Eye className="w-5 h-5 text-emerald-500" /> : <EyeOff className="w-5 h-5 text-amber-500" />} visibility
                    </div>
                    <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border shadow-sm ${module.status === 'published' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-100 hover:bg-amber-500/20"
                      }`}>
                      {module.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-blue-500" /> Content Type
                    </div>
                    <span className="text-xs font-black capitalize flex items-center gap-2">
                       {module.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                       {module.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-foreground rounded-3xl p-8 text-background shadow-2xl relative overflow-hidden group">
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black tracking-tight uppercase tracking-tighter">Oversight Strategy</h4>
                    <p className="text-xs opacity-60 mt-2 leading-relaxed">This lesson is part of a company's core compliance curriculum. Superadmin interventions are documented and audited.</p>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-40">Registered on {new Date(module.created_at).toLocaleDateString()}</p>
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
