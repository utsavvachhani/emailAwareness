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
    approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
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
        <div className="space-y-6 relative">

            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="module-header">
                <div>
                    <h1 className="module-title">My Companies</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage companies registered under your account</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchCompanies} disabled={isLoading}
                        className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    <button onClick={openCreate}
                        className="flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                        <Plus className="h-4 w-4" />
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
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                            <stat.icon className="h-4 w-4 text-muted-foreground opacity-40" />
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Table Container ──────────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : companies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                        <Building2 className="w-12 h-12 mb-3 opacity-20" />
                        <p className="font-medium">No companies yet</p>
                        <p className="text-sm mt-1 opacity-60">Click "Add Company" to register your first company</p>
                    </div>
                ) : (
                    /* Scroll wrapper — scrollbar stays at the bottom of the container */
                    <div className="overflow-x-auto overflow-y-hidden">
                        <table className="w-full min-w-[800px]">
                            <thead className="border-b border-border bg-muted/30 sticky top-0 z-10">
                                <tr>
                                    {["Company", "ID", "Email", "Phone", "Employees",  "Plan", "Status", ""].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {companies.map(c => {
                                    const isSelected = slideCompany?.id === c.id;
                                    const planLabel = c.plan && c.plan !== "none" ? c.plan : null;

                                    return (
                                        <tr
                                            key={c.id}
                                            onClick={() => setSlideCompany(isSelected ? null : c)}
                                            className={`transition-all cursor-pointer group/row ${
                                                isSelected
                                                    ? "bg-blue-500/5 border-l-2 border-l-blue-500"
                                                    : "hover:bg-muted/30"
                                            }`}
                                        >
                                            {/* Company name */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3 min-w-[140px]">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0 border ${
                                                        c.status === "approved"
                                                            ? "bg-blue-500/10 border-blue-500/20 text-blue-600"
                                                            : "bg-muted border-border text-muted-foreground"
                                                    }`}>
                                                        {c.status === "approved" ? c.name.slice(0, 2).toUpperCase() : <Lock className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`font-semibold text-sm truncate max-w-[120px] ${isSelected ? "text-blue-600" : "group-hover/row:text-blue-600 transition-colors"}`}>
                                                            {c.name}
                                                        </p>
                                                        {c.industry && <p className="text-[10px] text-muted-foreground truncate">{c.industry}</p>}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Company ID */}
                                            <td className="px-4 py-3.5">
                                                <span className="text-[10px] font-mono bg-muted/60 text-muted-foreground px-2 py-1 rounded border border-border/40 whitespace-nowrap">
                                                    {c.company_id}
                                                </span>
                                            </td>

                                            {/* Email */}
                                            <td className="px-4 py-3.5 max-w-[180px]">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                                                    <Mail className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">{c.email}</span>
                                                </div>
                                            </td>

                                            {/* Phone */}
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Phone className="w-3 h-3 shrink-0" />
                                                    {c.phone || "—"}
                                                </div>
                                            </td>

                                            {/* Employees */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {c.num_employees ?? 0}
                                                </div>
                                            </td>


                                            {/* Plan */}
                                            <td className="px-4 py-3.5">
                                                {planLabel ? (
                                                    <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest border ${
                                                        c.is_paid
                                                            ? planLabel === "premium"
                                                                ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                                                : planLabel === "standard"
                                                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                    }`}>
                                                        {planLabel}{c.is_paid ? "" : " ⏳"}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">No plan</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5">
                                                <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest border ${STATUS_STYLES[c.status] || STATUS_STYLES.pending}`}>
                                                    {c.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center gap-1.5">
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
                                                        title="View details"
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
                        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] pointer-events-auto"
                        onClick={() => setSlideCompany(null)}
                    />

                    {/* Panel */}
                    <div className="relative w-full max-w-md bg-background border-l border-border shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300 pointer-events-auto overflow-y-auto">

                        {/* Panel Header */}
                        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border ${
                                    slideCompany.status === "approved"
                                        ? "bg-blue-500/10 border-blue-500/20 text-blue-600"
                                        : "bg-muted border-border text-muted-foreground"
                                }`}>
                                    {slideCompany.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="font-black text-base italic tracking-tight truncate max-w-[200px]">{slideCompany.name}</h2>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-widest ${STATUS_STYLES[slideCompany.status] || STATUS_STYLES.pending}`}>
                                        {slideCompany.status}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setSlideCompany(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Panel Body */}
                        <div className="flex-1 p-6 space-y-6">

                            {/* Company ID */}
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Company ID</p>
                                    <p className="font-mono font-bold text-sm">{slideCompany.company_id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">Registered</p>
                                    <p className="text-xs font-bold">
                                        {new Date(slideCompany.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                            </div>

                            {/* Plan + Employees */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1.5">Employees</p>
                                    <p className="text-2xl font-black italic text-blue-600">{slideCompany.num_employees ?? 0}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">headcount</p>
                                </div>
                                <div className={`p-4 rounded-2xl border ${
                                    slideCompany.plan && slideCompany.plan !== "none" && slideCompany.is_paid
                                        ? "bg-emerald-500/5 border-emerald-500/10"
                                        : slideCompany.plan && slideCompany.plan !== "none"
                                        ? "bg-amber-500/5 border-amber-500/10"
                                        : "bg-muted/30 border-border/50"
                                }`}>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1.5">Plan</p>
                                    <p className={`text-lg font-black italic uppercase ${
                                        slideCompany.plan && slideCompany.plan !== "none" && slideCompany.is_paid
                                            ? "text-emerald-600"
                                            : slideCompany.plan && slideCompany.plan !== "none"
                                            ? "text-amber-600"
                                            : "text-muted-foreground"
                                    }`}>
                                        {slideCompany.plan && slideCompany.plan !== "none" ? slideCompany.plan : "None"}
                                    </p>
                                    <p className={`text-[9px] font-bold mt-0.5 uppercase tracking-widest ${
                                        slideCompany.is_paid ? "text-emerald-600" : "text-amber-600"
                                    }`}>
                                        {slideCompany.plan && slideCompany.plan !== "none"
                                            ? slideCompany.is_paid ? `Active · ${PLAN_PRICE[slideCompany.plan] || ""}/mo` : "Payment Pending"
                                            : "No subscription"}
                                    </p>
                                </div>
                            </div>

                            {/* Contact info */}
                            <div className="space-y-3">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Contact Details</p>
                                {[
                                    { icon: Mail, label: "Email", value: slideCompany.email },
                                    { icon: Phone, label: "Phone", value: slideCompany.phone || "—" },
                                    { icon: Globe, label: "Website", value: slideCompany.website || "—", link: slideCompany.website },
                                    { icon: MapPin, label: "Address", value: slideCompany.address || "—" },
                                    { icon: Hash, label: "Industry", value: slideCompany.industry || "—" },
                                ].map(({ icon: Icon, label, value, link }) => (
                                    <div key={label} className="flex items-start gap-3 p-3 rounded-xl border border-border/30 hover:bg-muted/20 transition-colors">
                                        <div className="w-7 h-7 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
                                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{label}</p>
                                            {link ? (
                                                <a href={link} target="_blank" rel="noopener noreferrer"
                                                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 break-all mt-0.5">
                                                    {value} <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                                </a>
                                            ) : (
                                                <p className="text-xs font-semibold break-words mt-0.5">{value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Notes */}
                            {slideCompany.notes && (
                                <div className="p-4 bg-muted/20 rounded-2xl border border-border/40 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5 text-muted-foreground opacity-50" />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Notes</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{slideCompany.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Panel Footer — CTA buttons */}
                        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border p-5 space-y-2.5">
                            {slideCompany.status === "approved" ? (
                                <Link
                                    href={`/admin/dashboard/${slideCompany.company_id}`}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                                >
                                    Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            ) : (
                                <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-muted text-muted-foreground text-xs font-black uppercase tracking-widest cursor-not-allowed opacity-60">
                                    <Lock className="w-3.5 h-3.5" />
                                    Awaiting Approval
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={e => { openEdit(slideCompany, e); }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-bold transition-all"
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                    onClick={e => handleDelete(slideCompany.id, e)}
                                    disabled={processingId === slideCompany.id}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-500 text-xs font-bold transition-all disabled:opacity-40"
                                >
                                    {processingId === slideCompany.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add / Edit Modal ─────────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                <h2 className="font-semibold text-lg">{editingCompany ? "Edit Company" : "Add Company"}</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-muted rounded-md transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Company Name *</label>
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="Acme Corp" className="input-field" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email *</label>
                                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        placeholder="contact@company.com" className="input-field" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label>
                                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        placeholder="+91 9876543210" className="input-field" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Industry</label>
                                    <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                                        placeholder="Technology" className="input-field" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Website</label>
                                    <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                                        placeholder="https://company.com" className="input-field" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</label>
                                    <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                        placeholder="123 Main St, City" rows={2} className="input-field resize-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</label>
                                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                        placeholder="Any additional notes..." rows={2} className="input-field resize-none" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
                            <button onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {editingCompany ? "Save Changes" : "Create Company"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
