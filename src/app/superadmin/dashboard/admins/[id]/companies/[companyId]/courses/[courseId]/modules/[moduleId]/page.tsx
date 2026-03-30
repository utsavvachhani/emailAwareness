"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft, BookOpen, Loader2, XCircle,
  Video, FileText, Clock, Eye, AlignLeft, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { superadminGetModuleDetails } from "@/api";

// Dynamically import EditorJS for read-only viewing
const EditorJSComponent = dynamic(() => import("@/components/EditorJSComponent"), { 
  ssr: false,
  loading: () => <div className="h-40 flex items-center justify-center bg-secondary/20 rounded-2xl animate-pulse text-xs font-bold text-muted-foreground uppercase tracking-widest">Initialising Oversight Editor...</div>
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

export default function SuperadminModuleOversightPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params?.moduleId as string;

  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    if (!moduleId) return;
    setLoading(true);
    try {
      const res = await superadminGetModuleDetails(moduleId);
      if (res.data.success) {
        setModule(res.data.module);
      }
    } catch {
      toast.error("Failed to load module details");
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  // Convert content for EditorJS view
  const editorData = useMemo(() => {
    const rawData = module?.contentextra || module?.content;
    if (!rawData) return { blocks: [] };
    
    try {
      const parsed = JSON.parse(rawData);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) return parsed;
      return { blocks: [{ type: 'paragraph', data: { text: String(parsed) } }] };
    } catch {
      return { blocks: [{ type: 'paragraph', data: { text: rawData } }] };
    }
  }, [module]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse text-center">
            Initializing Privileged Module Inspection...
        </p>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold uppercase tracking-widest">Curriculum Asset Not Found</h2>
        <button onClick={() => router.back()} className="mt-4 text-xs font-black uppercase tracking-widest text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-3 h-3" /> Return to Oversight
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Oversight Navbar */}
      <div className="flex items-center justify-between border-b pb-8 border-border/80">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-2xl border border-border bg-card hover:bg-secondary transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">
              {module.type === 'video' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              {module.type} Inspection
            </div>
            <h1 className="text-3xl font-black tracking-tighter italic">{module.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-6 h-12 rounded-2xl bg-black text-white border border-white/10 shadow-xl shadow-black/10">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Oversight Mode</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* Inspection Viewport */}
          {module.type === 'video' ? (
            <div className="space-y-10">
              <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-black border border-border shadow-2xl relative">
                {module.video_url ? (
                  <video src={module.video_url} controls className="w-full h-full" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/30 gap-4">
                    <Video className="w-12 h-12" />
                    <p className="font-black uppercase tracking-widest text-[10px]">No video stream detected</p>
                  </div>
                )}
              </div>
              <div className="bg-card border border-border rounded-[2rem] p-10 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <AlignLeft className="w-20 h-20" />
                 </div>
                 <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                   <AlignLeft className="w-4 h-4 text-blue-600" />
                   Contextual Description
                 </h2>
                 <div className="text-foreground/80 leading-relaxed font-medium whitespace-pre-wrap text-sm">
                    {module.content || "No textual context identified for this training segment."}
                 </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {module.image_url && (
                <div className="aspect-video md:aspect-[21/9] rounded-[3rem] overflow-hidden border border-border shadow-2xl relative">
                   <img src={module.image_url} alt={module.title} className="w-full h-full object-cover opacity-90" />
                </div>
              )}
              
              <div className="space-y-10">
                 {module.content && (
                   <div className="bg-blue-600/[0.03] border-l-4 border-blue-600 p-8 rounded-2xl italic font-medium text-foreground/70">
                       "{module.content}"
                   </div>
                 )}

                 <div className="min-h-[500px] bg-card border border-border rounded-[3rem] p-12">
                    {module.contentextra || module.content ? (
                       <div className="editorjs-view opacity-90">
                          <EditorJSComponent 
                            holder="editorjs-view-superadmin" 
                            data={editorData} 
                            readOnly={true}
                            onChange={() => {}}
                          />
                       </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground/30 font-black uppercase tracking-widest text-[10px]">
                         <FileText className="w-12 h-12 mb-4" />
                         Empty Curriculum Data
                      </div>
                    )}
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Audit Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-8 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 pb-4 border-b border-border/80">Compliance Audit</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Clock className="w-4 h-4 text-blue-600" /> Estimated Time
                  </div>
                  <span className="text-xs font-black px-4 py-1.5 bg-secondary rounded-xl">{module.duration || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Eye className="w-4 h-4 text-blue-600" /> Lifecycle
                  </div>
                  <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border ${
                        module.status === 'published' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                    {module.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <BookOpen className="w-4 h-4 text-blue-600" /> Content Type
                  </div>
                  <span className="text-xs font-black capitalize">{module.type}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 text-white rounded-[2.5rem] p-8 space-y-6 shadow-2xl shadow-blue-600/20">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-black tracking-tighter italic">Oversight Policy</h4>
                <p className="text-[10px] font-medium text-white/60 mt-2 leading-relaxed tracking-wide">
                    Superadmins have read-only access to curriculum components for the purpose of quality assurance and policy enforcement.
                </p>
              </div>
              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest opacity-40">
                <span>Created {new Date(module.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
