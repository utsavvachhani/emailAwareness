"use client";

import { useState, useEffect } from "react";
import {
    Building2, Plus, Pencil, Trash2, Loader2, RefreshCw,
    X, Check, Mail, Phone, Users, Globe, Hash, Lock,
    ChevronRight, ExternalLink, MapPin, FileText, Calendar,
    Shield, Zap, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/redux/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Company {
    id: number;
    company_id: string;
    name: string;
    email: string;
    phone?: string;
    num_employees: number;
    industry?: string;
    website?: string;
    address?: string;
    notes?: string;
    created_at: string;
    status: "pending" | "approved" | "rejected";
    plan?: string;
    is_paid?: boolean;
}

const emptyForm = {
    name: "", email: "", phone: "",
    industry: "", website: "", address: "", notes: "",
};

const STATUS_STYLES: Record<string, string> = {
    approved: "bg-emerald-500/5 text-emerald-600 border-emerald-500/10",
    rejected: "bg-red-500/5 text-red-500 border-red-500/10",
    pending: "bg-amber-500/5 text-amber-500 border-amber-500/10",
};

export default function AdminCompaniesPage() {
    const router = useRouter();
    const token = useAppSelector(s => s.auth.token);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    // Slide-over state
    const [slideCompany, setSlideCompany] = useState<Company | null>(null);

    const apiBase = `${process.env.NEXT_PUBLIC_API_URL}/admin/companies`;
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    const fetchCompanies = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(apiBase, { headers, credentials: "include" });
            const data = await res.json();
            if (data.success) setCompanies(data.companies);
        } catch { toast.error("Failed to load companies"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchCompanies(); }, [token]);

    const openCreate = () => {
        setEditingCompany(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (c: Company, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCompany(c);
        setForm({
            name: c.name, email: c.email, phone: c.phone || "",
            industry: c.industry || "", website: c.website || "",
            address: c.address || "", notes: c.notes || "",
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.email) { toast.error("Name and email required"); return; }
        setSaving(true);
        try {
            const url = editingCompany ? `${apiBase}/${editingCompany.id}` : apiBase;
            const method = editingCompany ? "PUT" : "POST";
            const res = await fetch(url, { method, headers, credentials: "include", body: JSON.stringify(form) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success(editingCompany ? "Company updated!" : "Company created!");
            setShowModal(false);
            fetchCompanies();
        } catch (err: any) { toast.error(err.message || "Save failed"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this company? This cannot be undone.")) return;
        setProcessingId(id);
        try {
            const res = await fetch(`${apiBase}/${id}`, { method: "DELETE", headers, credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success("Company deleted");
            if (slideCompany?.id === id) setSlideCompany(null);
            fetchCompanies();
        } catch (err: any) { toast.error(err.message || "Delete failed"); }
        finally { setProcessingId(null); }
    };

    const PLAN_PRICE: Record<string, string> = { basic: "₹1,499", standard: "₹2,499", premium: "₹3,999" };

    return (
        <div className="space-y-5 relative">

            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="module-header">
                <div>
                    <h1 className="module-title !text-xl">My Companies</h1>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Manage companies registered under your account</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchCompanies} disabled={isLoading}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border hover:bg-muted transition-colors text-[11px] font-medium">
                        <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    <button onClick={openCreate}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors">
                        <Plus className="h-3 w-3" />
                        Add Company
                    </button>
                </div>
            </div>

            {/* ── Stats Row ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Companies", value: companies.length, icon: Building2 },
                    { label: "Total Employees", value: companies.reduce((s, c) => s + (c.num_employees || 0), 0), icon: Users },
                    { label: "Industries", value: new Set(companies.map(c => c.industry).filter(Boolean)).size, icon: Hash },
                    { label: "Active Plans", value: companies.filter(c => c.plan && c.plan !== "none" && c.is_paid).length, icon: Shield },
                ].map(stat => (
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                            <stat.icon className="h-3.5 w-3.5 text-muted-foreground opacity-30" />
                        </div>
                        <p className="text-xl font-black text-foreground">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Table Container ──────────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col shadow-sm">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : companies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Building2 className="w-10 h-10 mb-2 opacity-10" />
                        <p className="text-[11px] font-medium opacity-60">No organizations found attached to this registry pointer</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                            <thead className="border-b border-border bg-muted/20">
                                <tr>
                                    {["Company", "ID", "Email", "Phone", "Employees",  "Plan", "Status", ""].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {companies.map(c => {
                                    const isSelected = slideCompany?.id === c.id;
                                    const planLabel = c.plan && c.plan !== "none" ? c.plan : null;

                                    return (
                                        <tr
                                            key={c.id}
                                            onClick={() => setSlideCompany(isSelected ? null : c)}
                                            className={`transition-all cursor-pointer group/row ${
                                                isSelected
                                                    ? "bg-blue-500/5 border-l-2 border-l-blue-500 shadow-inner"
                                                    : "hover:bg-muted/30 border-l-2 border-l-transparent"
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 border ${
                                                        c.status === "approved"
                                                            ? "bg-blue-500/10 border-blue-500/20 text-blue-600"
                                                            : "bg-muted border-border text-muted-foreground/60"
                                                    }`}>
                                                        {c.status === "approved" ? c.name.slice(0, 2).toUpperCase() : <Lock className="w-3 h-3" />}
                                                    </div>
                                                    <div className="min-w-0 pr-2">
                                                        <p className={`font-bold text-[11px] truncate max-w-[120px] ${isSelected ? "text-blue-600" : "text-foreground group-hover/row:text-blue-600 transition-colors"}`}>
                                                            {c.name}
                                                        </p>
                                                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium mt-0.5 truncate">{c.industry || "General Node"}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className="text-[10px] font-mono font-bold bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded border border-border/40 whitespace-nowrap">
                                                    #{c.company_id}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 max-w-[150px]">
                                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground group-hover/row:text-foreground transition-colors truncate">
                                                    <Mail className="w-3 h-3 shrink-0 opacity-40" />
                                                    <span className="truncate">{c.email}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                    <Phone className="w-2.5 h-2.5 shrink-0 opacity-40" />
                                                    {c.phone || "—"}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                                                    <Users className="w-3 h-3 text-blue-600" />
                                                    {c.num_employees.toLocaleString()}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {planLabel ? (
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                                                        c.is_paid
                                                            ? planLabel === "premium"
                                                                ? "bg-purple-500/5 text-purple-600 border-purple-500/10"
                                                                : planLabel === "standard"
                                                                ? "bg-blue-500/5 text-blue-600 border-blue-500/10"
                                                                : "bg-emerald-500/5 text-emerald-600 border-emerald-500/10"
                                                            : "bg-amber-500/5 text-amber-600 border-amber-500/10"
                                                    }`}>
                                                        {planLabel}{c.is_paid ? "" : " ⏳"}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] text-muted-foreground/30 uppercase tracking-[0.2em] font-black">NIL</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${STATUS_STYLES[c.status] || STATUS_STYLES.pending}`}>
                                                    <div className={`w-1 h-1 rounded-full ${
                                                        c.status === 'approved' ? "bg-emerald-500" :
                                                        c.status === 'rejected' ? "bg-red-500" : "bg-amber-500"
                                                    }`} />
                                                    {c.status}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center gap-1 justify-end">
                                                    <button
                                                        onClick={e => openEdit(c, e)}
                                                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-600 transition-all border border-transparent hover:border-blue-500/20"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={e => handleDelete(c.id, e)}
                                                        disabled={processingId === c.id}
                                                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-all border border-transparent hover:border-red-500/20 disabled:opacity-40"
                                                        title="Delete"
                                                    >
                                                        {processingId === c.id
                                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            : <Trash2 className="w-3.5 h-3.5" />
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => setSlideCompany(isSelected ? null : c)}
                                                        className={`p-1.5 rounded-lg transition-all border ${
                                                            isSelected
                                                                ? "bg-blue-500/10 border-blue-500/20 text-blue-600"
                                                                : "hover:bg-muted border-transparent hover:border-border text-muted-foreground"
                                                        }`}
                                                    >
                                                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Slide-over Detail Panel ──────────────────────────────── */}
            {slideCompany && (
                <div className="fixed inset-0 z-40 flex justify-end pointer-events-none">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-auto"
                        onClick={() => setSlideCompany(null)}
                    />

                    {/* Panel */}
                    <div className="relative w-full max-w-sm bg-background border-l border-border shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200 pointer-events-auto overflow-y-auto">

                        {/* Panel Header */}
                        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-black border ${
                                    slideCompany.status === "approved"
                                        ? "bg-blue-500/10 border-blue-500/20 text-blue-600"
                                        : "bg-muted border-border text-muted-foreground/60"
                                }`}>
                                    {slideCompany.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 pr-2">
                                    <h2 className="font-bold text-[13px] tracking-tight truncate max-w-[150px] uppercase">{slideCompany.name}</h2>
                                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Node Insights</p>
                                </div>
                            </div>
                            <button onClick={() => setSlideCompany(null)} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Panel Body */}
                        <div className="flex-1 p-5 space-y-6">

                            {/* Node Metadata Cluster */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/40 transition-colors">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 mb-1.5">Registry Pointer</p>
                                    <p className="font-mono font-bold text-[11px] text-foreground">#{slideCompany.company_id}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/40 transition-colors">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 mb-1.5">Node Creation</p>
                                    <p className="text-[10px] font-bold text-foreground">
                                        {new Date(slideCompany.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                            </div>

                            {/* Plan & Employees Cluster */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                    <Users className="w-4 h-4 text-blue-600 opacity-40 mb-3" />
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600/40 mb-1">Total Force</p>
                                    <p className="text-2xl font-black text-blue-600 leading-none">{slideCompany.num_employees.toLocaleString()}</p>
                                </div>
                                <div className={`p-5 rounded-2xl border ${
                                    slideCompany.plan && slideCompany.plan !== "none" && slideCompany.is_paid
                                        ? "bg-emerald-500/5 border-emerald-500/10"
                                        : slideCompany.plan && slideCompany.plan !== "none"
                                        ? "bg-amber-500/5 border-amber-500/10"
                                        : "bg-muted/30 border-border/40"
                                }`}>
                                    <Shield className={`w-4 h-4 opacity-40 mb-3 ${
                                        slideCompany.is_paid ? "text-emerald-600" : "text-amber-600"
                                    }`} />
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Logistics Tier</p>
                                    <p className={`text-base font-black uppercase leading-none ${
                                        slideCompany.is_paid ? "text-emerald-600" : "text-amber-600"
                                    }`}>
                                        {slideCompany.plan && slideCompany.plan !== "none" ? slideCompany.plan : "NIL"}
                                    </p>
                                    <p className="text-[8px] font-bold mt-1 uppercase tracking-widest opacity-60">
                                        {slideCompany.is_paid ? `Active Node` : "Sync Pending"}
                                    </p>
                                </div>
                            </div>

                            {/* Sync Channels */}
                            <div className="space-y-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">Communication Matrix</p>
                                <div className="space-y-2">
                                    {[
                                        { icon: Mail, label: "Registry Email", value: slideCompany.email },
                                        { icon: Phone, label: "Registry Protocol", value: slideCompany.phone || "+00 NIL" },
                                        { icon: Globe, label: "Digital Domain", value: slideCompany.website || "LOCAL NODE", link: slideCompany.website },
                                        { icon: MapPin, label: "Deployment Zone", value: slideCompany.address || "GLOBAL HUB" },
                                        { icon: Briefcase, label: "Industrial Sector", value: slideCompany.industry || "GENERAL" },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3.5 p-3 rounded-xl border border-border/40 hover:bg-muted/30 transition-all group/item focus-within:ring-1 focus-within:ring-blue-500/20">
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/30 group-hover/item:text-blue-500 group-hover/item:bg-blue-500/5 transition-all focus-within:ring-2">
                                                <item.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-2">
                                                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-0.5">{item.label}</p>
                                                {item.link ? (
                                                    <a href={item.link} target="_blank" rel="noopener noreferrer"
                                                        className="text-[11px] font-bold text-blue-500 hover:underline underline-offset-4 decoration-blue-500/20 flex items-center gap-1 truncate">
                                                        {item.value} <ExternalLink className="w-2.5 h-2.5 opacity-40 shrink-0" />
                                                    </a>
                                                ) : (
                                                    <p className="text-[11px] font-bold text-foreground/80 truncate">{item.value}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Node brief */}
                            {slideCompany.notes && (
                                <div className="p-4 bg-muted/20 rounded-xl border border-border/40 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-3 h-3 text-muted-foreground opacity-40" />
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">Administrative Brief</p>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-4">{slideCompany.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Panel Footer — Node Deployment */}
                        <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border p-5 space-y-3">
                            {slideCompany.status === "approved" ? (
                                <Link
                                    href={`/admin/dashboard/${slideCompany.company_id}`}
                                    className="w-full h-11 rounded-xl bg-blue-600 text-white font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all group"
                                >
                                    Deploy Node Console <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <div className="w-full h-11 rounded-xl bg-muted text-muted-foreground text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 cursor-not-allowed opacity-60">
                                    <Lock className="w-3.5 h-3.5" />
                                    Internal Approval Pending
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={e => { openEdit(slideCompany, e); }}
                                    className="flex-1 h-10 rounded-lg border border-border hover:bg-muted text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Edit Node
                                </button>
                                <button
                                    onClick={e => handleDelete(slideCompany.id, e)}
                                    disabled={processingId === slideCompany.id}
                                    className="flex-1 h-10 rounded-lg border border-red-500/10 bg-red-500/5 text-red-500 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                                >
                                    {processingId === slideCompany.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    Decommission
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add / Edit Modal ─────────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-blue-600" />
                                <h2 className="font-bold text-[14px]">{editingCompany ? "Modify Registry" : "Initialize Registry"}</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-muted rounded-md transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Company Entitlement *</label>
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="Corp ID..." className="input-field text-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Registry Email *</label>
                                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        placeholder="sync@node.com" className="input-field text-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Protocol Phone</label>
                                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        placeholder="+00 — NIL" className="input-field text-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Industrial Sector</label>
                                    <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                                        placeholder="Sector ID..." className="input-field text-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Digital Domain</label>
                                    <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                                        placeholder="https://node.internal" className="input-field text-sm" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Deployment Zone</label>
                                    <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                        placeholder="Geospatial Coordinates..." rows={2} className="input-field text-sm resize-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-widest">Internal Briefing</label>
                                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                        placeholder="Administrative Metadata..." rows={2} className="input-field text-sm resize-none" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-muted/10">
                            <button onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-[11px] font-bold rounded-lg border border-border hover:bg-muted transition-all">
                                Abort
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xl shadow-blue-500/10 disabled:opacity-50">
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                {editingCompany ? "Commit Updates" : "Initialize Registry"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const Briefcase = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);
