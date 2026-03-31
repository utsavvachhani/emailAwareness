"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft, Edit3, XCircle, Plus, BookOpen, Loader2, Save, X,
  Video, FileText, Image as ImageIcon, CheckCircle2,
  Clock, Eye, EyeOff, Type, AlignLeft, Target, Trash2, List
} from "lucide-react";
import { toast } from "sonner";
import {
  adminGetModuleDetails,
  adminUpdateModule,
  adminUploadMedia,
} from "@/api";

// Dynamically import EditorJS to avoid SSR issues
const EditorJSComponent = dynamic(() => import("@/components/EditorJSComponent"), { 
  ssr: false,
  loading: () => <div className="h-40 flex items-center justify-center bg-secondary/20 rounded-2xl animate-pulse text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Initialising Editor...</div>
});

type Module = {
  id: number;
  course_id: number;
  title: string;
  type: "docs" | "video" | "quiz";
  content: string | null;
  contentextra: string | null;
  video_url: string | null;
  image_url: string | null;
  duration: string | null;
  status: "draft" | "published";
  order_index: number;
  created_at: string;
};

export default function ModuleViewPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params?.id as string;
  const courseId = params?.courseId as string;
  const moduleId = params?.moduleId as string;

  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    type: "docs" as "docs" | "video" | "quiz",
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
      const res = await adminGetModuleDetails(moduleId);
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
        toast.success("Media uploaded successfully!");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");

    setSaving(true);
    try {
      const payload = {
        ...form,
        order_index: module?.order_index ?? 0,
        video_url: form.type === 'video' ? form.video_url : null,
        image_url: form.type === 'docs' ? (form.image_url || null) : null,
        duration: form.type === 'quiz' ? '10 mins' : form.duration,
      };
      
      const res = await adminUpdateModule(moduleId, payload);

      if (res.data.success) {
        toast.success("Module updated");
        setModule(res.data.module);
        setIsEditing(false);
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
      if (Array.isArray(parsed)) {
        const blocks = parsed.flatMap((s: any) => {
          const b = [];
          if (s.headline) b.push({ type: 'header', data: { text: s.headline, level: 2 } });
          if (s.description) b.push({ type: 'paragraph', data: { text: s.description } });
          return b;
        });
        return { blocks };
      }
      return { blocks: [{ type: 'paragraph', data: { text: String(parsed) } }] };
    } catch {
      return { blocks: [{ type: 'paragraph', data: { text: rawData } }] };
    }
  }, [form.contentextra, form.content]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-widest text-center uppercase">Initialising Curriculum...</p>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold">Module not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-sm text-blue-600 font-bold hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
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
            onClick={() => router.back()}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-secondary transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {module.type === 'video' ? <Video className="w-3 h-3 text-blue-600" /> : module.type === 'quiz' ? <Target className="w-3 h-3 text-purple-600" /> : <FileText className="w-3 h-3 text-orange-600" />}
              {module.type} Module
            </div>
            <h1 className="text-xl font-bold tracking-tight">{module.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-background border border-border shadow-sm">
            <div className={`w-2 h-2 rounded-full ${form.type === 'video' ? 'bg-blue-600' : form.type === 'quiz' ? 'bg-purple-600' : 'bg-orange-500'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{form.type}</span>
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
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Main Title</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Module Title"
              className="w-full h-14 px-6 rounded-2xl border border-input bg-background outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-xl font-black"
            />
          </div>

          {form.type === 'video' ? (
            <div className="space-y-8">
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
                  placeholder="Describe the video content"
                  className="w-full p-6 rounded-2xl border border-input bg-background outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm"
                />
              </div>
              <div className="group relative">
                <input type="file" accept="video/*" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="w-full h-14 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground group-hover:bg-secondary">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                  {uploading ? "Uploading..." : "Click to Upload Video"}
                </div>
              </div>
            </div>
          ) : form.type === 'quiz' ? (
            <div className="space-y-10">
              <div className="bg-purple-50 border border-purple-100 p-8 rounded-3xl">
                <h3 className="text-lg font-black text-purple-900">Quiz Designer (5 Questions)</h3>
                <p className="text-sm text-purple-800/70 mt-1">Create multiple choice questions with verified answers.</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {(() => {
                  let quizData: any = { questions: [] };
                  try { if (form.contentextra) quizData = JSON.parse(form.contentextra); } 
                  catch (e) { console.error("Parse error", e); }
                  
                  const qList = quizData.questions || [];

                  const updateQuestion = (idx: number, field: string, val: any) => {
                    const newQs = Array.isArray(qList) ? [...qList] : [];
                    for(let k=0; k<=idx; k++) {
                       if(!newQs[k]) newQs[k] = { id: Date.now() + k, question: "", options: ["", "", "", ""], answer: 0 };
                    }

                    if (field === 'option') {
                      const newOpts = [...newQs[idx].options];
                      newOpts[val.oIdx] = val.text;
                      newQs[idx].options = newOpts;
                    } else {
                      newQs[idx][field] = val;
                    }
                    setForm(f => ({ ...f, contentextra: JSON.stringify({ ...quizData, questions: newQs }) }));
                  };

                  return Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-8 rounded-3xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-black text-xs shrink-0">{i + 1}</span>
                        <input
                          placeholder={`Question ${i + 1} text`}
                          value={qList[i]?.question || ""}
                          onChange={e => updateQuestion(i, 'question', e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none font-bold text-lg"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((__, j) => (
                          <div key={j} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${qList[i]?.answer === j ? 'bg-purple-600 border-purple-600 text-white' : 'bg-secondary/30 border-border'}`}>
                            <input
                              type="radio"
                              name={`q-${i}`}
                              checked={qList[i]?.answer === j}
                              onChange={() => updateQuestion(i, 'answer', j)}
                              className="w-4 h-4 accent-white cursor-pointer"
                            />
                            <input
                              placeholder={`Option ${j + 1}`}
                              value={qList[i]?.options?.[j] || ""}
                              onChange={e => updateQuestion(i, 'option', { oIdx: j, text: e.target.value })}
                              className="flex-1 bg-transparent border-none outline-none text-xs font-medium placeholder:text-muted-foreground/50"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              <div className="flex justify-end pt-8 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="h-12 px-8 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 transition-all shadow-xl shadow-purple-600/20 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Audit Configuration
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Module Summary</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={3}
                  placeholder="Summary text"
                  className="w-full p-4 rounded-2xl border border-input bg-background outline-none text-sm"
                />
              </div>
              <div className="min-h-[400px] p-6 rounded-3xl bg-secondary/10 border border-border">
                <EditorJSComponent 
                  holder="editorjs-edit" 
                  data={editorData} 
                  onChange={(data) => setForm(f => ({ ...f, contentextra: JSON.stringify(data) }))}
                />
              </div>
              <div className="group relative">
                <input type="file" accept="image/*" onChange={handleMediaUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="w-full aspect-video border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-2 text-xs font-bold text-muted-foreground group-hover:bg-secondary overflow-hidden">
                  {form.image_url ? <img src={form.image_url} alt="Cover" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 opacity-20" />}
                  {!form.image_url && "Upload Cover Image"}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-8 border-t border-border">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 h-14 rounded-2xl bg-blue-600 text-white font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Publish Curriculum Updates
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            {module.type === 'video' ? (
              <div className="space-y-8">
                <div className="aspect-video rounded-3xl overflow-hidden bg-black border border-border shadow-2xl">
                  {module.video_url ? <video src={module.video_url} controls className="w-full h-full" /> : <div className="h-full flex items-center justify-center text-white/20">No Video Available</div>}
                </div>
                <div className="bg-card border border-border rounded-3xl p-8">
                  <h2 className="text-xl font-black mb-4">Training Overview</h2>
                  <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{module.content || "No description provided."}</p>
                </div>
              </div>
            ) : module.type === 'quiz' ? (
              <div className="space-y-8">
                <div className="bg-purple-600 rounded-[40px] p-10 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-2">Knowledge Assessment</h2>
                    <p className="opacity-80">Verify learning retention with this 5-question logic audit.</p>
                  </div>
                  <Target className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {(() => {
                    try {
                      const qData = JSON.parse(module.contentextra || '{"questions":[]}');
                      const questions = qData.questions || [];
                      if (questions.length === 0) return <div className="p-20 text-center italic text-muted-foreground border-2 border-dashed border-border rounded-3xl">No questions configured.</div>;
                      
                      return questions.map((q: any, i: number) => (
                        <div key={i} className="p-8 rounded-3xl border border-border bg-card shadow-sm">
                          <h4 className="text-lg font-black mb-4 flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">{i + 1}</span>
                            {q.question}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((o: string, j: number) => (
                              <div key={j} className={`p-3 rounded-xl border text-xs font-bold flex justify-between items-center ${q.answer === j ? 'bg-emerald-50 border-emerald-500/20 text-emerald-700' : 'bg-secondary/20 border-border text-muted-foreground'}`}>
                                {o}
                                {q.answer === j && <span className="text-[8px] uppercase bg-emerald-500 text-white px-2 py-0.5 rounded-full">Correct</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    } catch { return <div className="p-10 text-center italic text-muted-foreground border-2 border-dashed border-border rounded-3xl">Incomplete assessment data.</div>; }
                  })()}
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {module.image_url && <div className="aspect-[21/9] rounded-[40px] overflow-hidden border border-border shadow-xl"><img src={module.image_url} alt="Cover" className="w-full h-full object-cover" /></div>}
                <div className="min-h-[400px]">
                  <EditorJSComponent holder="editor-view" data={editorData} readOnly={true} onChange={() => {}} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-4">Curriculum Pulse</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Duration</span>
                <span className="text-xs font-black px-3 py-1 bg-secondary rounded-lg">{module.duration || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Visibility</span>
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${module.status === 'published' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{module.status}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Type</span>
                <span className="text-xs font-black capitalize flex items-center gap-2">
                  {module.type === 'video' ? <Video className="w-3 h-3 text-blue-600" /> : module.type === 'quiz' ? <Target className="w-3 h-3 text-purple-600" /> : <FileText className="w-3 h-3 text-orange-600" />}
                  {module.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
