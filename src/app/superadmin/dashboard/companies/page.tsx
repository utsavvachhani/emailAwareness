"use client";

import { useState, useEffect } from "react";
import {
    Building2, Trash2, Loader2, RefreshCw, Mail, Phone,
    Users, Globe, Shield, CheckCircle, XCircle,
    MapPin, Briefcase, ArrowRight, X, ChevronRight,
    Search, Zap, Clock, PieChart, Activity, BarChart3, Hash, ExternalLink, FileText, Lock, Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    adminFirstName?: string;
    adminLastName?: string;
    adminEmail?: string;
    adminId?: number;
    created_at: string;
    status: 'pending' | 'approved' | 'rejected';
    plan?: string;
    is_paid?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
    approved: "bg-emerald-500/5 text-emerald-600 border-emerald-500/10",
    rejected: "bg-red-500/5 text-red-500 border-red-500/10",
    pending: "bg-amber-500/5 text-amber-500 border-amber-500/10",
};

export default function SuperadminCompaniesPage() {
    const token = useAppSelector(s => s.auth.token);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [slideCompany, setSlideCompany] = useState<Company | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const router = useRouter();

    const fetchCompanies = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/companies`, {
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) setCompanies(data.companies);
        } catch { toast.error("Failed to load companies"); }
        finally { setIsLoading(false); }
    };

    const handleOverrideRedirect = async () => {
        if (!slideCompany || !slideCompany.adminId) {
            toast.error("Registry orphan detected: No Admin ID found");
            return;
        }
        setIsRedirecting(true);
        await new Promise(r => setTimeout(r, 600));
        router.push(`/superadmin/dashboard/admins/${slideCompany.adminId}/companies/${slideCompany.company_id}`);
    };

    useEffect(() => { fetchCompanies(); }, [token]);

    const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
        setProcessingId(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/companies/${id}/status`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ status }),
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success(`Registry updated to ${status}`);
            
            setCompanies(prev => prev.map(c => c.id === id ? { ...c, status } : c));
            if (slideCompany?.id === id) setSlideCompany({ ...slideCompany, status });
        } catch (err: any) { toast.error(err.message || "Update failed"); }
        finally { setProcessingId(null); }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Permanently decommissioning this registry node. Proceed?")) return;
        setProcessingId(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/companies/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success("Registry decommissioned");
            if (slideCompany?.id === id) setSlideCompany(null);
            fetchCompanies();
        } catch (err: any) { toast.error(err.message || "Delete failed"); }
        finally { setProcessingId(null); }
    };

    const filtered = companies.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.company_id.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === "all" || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: companies.length,
        staff: companies.reduce((s, c) => s + (c.num_employees || 0), 0),
        industries: new Set(companies.map(c => c.industry).filter(Boolean)).size,
        activePlans: companies.filter(c => c.plan && c.plan !== "none" && c.is_paid).length,
    };

    return (
        <div className="space-y-5 relative">
            
            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="module-header">
                <div>
                    <h1 className="module-title !text-xl text-foreground font-black uppercase tracking-tight">Global Entity Registry</h1>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-bold uppercase tracking-widest">Cross-admin organizational management hub 0xAF</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group/search mr-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within/search:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="FIND REGISTRY NODE..."
                            className="h-9 w-48 pl-10 pr-4 text-[10px] bg-muted/40 border border-border rounded-xl outline-none focus:border-blue-500/30 transition-all font-black tracking-widest placeholder:text-muted-foreground/30 focus:bg-background"
                        />
                    </div>
                    <button onClick={fetchCompanies} disabled={isLoading}
                        className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-border bg-card hover:bg-muted transition-all text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95 disabled:opacity-50">
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        Sync Registry
                    </button>
                    <select 
                        value={filterStatus} 
                        onChange={e => setFilterStatus(e.target.value)}
                        className="h-9 px-3 border border-border rounded-xl bg-background text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500/30 transition-all"
                    >
                        <option value="all">ALL NODES</option>
                        <option value="approved">APPROVED</option>
                        <option value="pending">PENDING</option>
                        <option value="rejected">REJECTED</option>
                    </select>
                </div>
            </div>

            {/* ── Stats Row ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Global Registries", value: stats.total, icon: Building2 },
                    { label: "Total Workforce", value: stats.staff, icon: Users },
                    { label: "Industrial Sectors", value: stats.industries, icon: Hash },
                    { label: "Strategic Tier", value: stats.activePlans, icon: Shield },
                ].map(stat => (
                    <div key={stat.label} className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
                            <stat.icon className="h-4 w-4 text-blue-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-2xl font-black text-foreground tracking-tighter">{stat.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* ── Table Container ──────────────────────────────────────── */}
            <div className="rounded-[2rem] border border-border bg-card overflow-hidden flex flex-col shadow-sm">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600/40" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Accessing Entity Registry Cluster</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                        <Building2 className="w-16 h-16 mb-4 opacity-5" />
                        <h2 className="text-xl font-black uppercase tracking-tight text-foreground/40 mb-2">No Registry Matches</h2>
                        <p className="text-[11px] font-medium uppercase tracking-widest opacity-40">No entries detected in current sector search</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                            <thead className="border-b border-border bg-muted/20">
                                <tr>
                                    {["Organization Hub", "Registry Pointer", "Access Channel", "Force Multiplier", "Status Protocol", ""].map(h => (
                                        <th key={h} className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filtered.map(c => {
                                    const isSelected = slideCompany?.id === c.id;

                                    return (
                                        <tr
                                            key={c.id}
                                            onClick={() => setSlideCompany(isSelected ? null : c)}
                                            className={`transition-all cursor-pointer group/row ${
                                                isSelected
                                                    ? "bg-blue-600/5 border-l-4 border-l-blue-600"
                                                    : "hover:bg-muted/30 border-l-4 border-l-transparent"
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[11px] font-black shrink-0 border transition-all duration-300 ${
                                                        c.status === "approved"
                                                            ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                                                            : "bg-muted border-border text-muted-foreground/60 group-hover/row:scale-110"
                                                    }`}>
                                                        {c.status === "approved" ? c.name.slice(0, 2).toUpperCase() : <Lock className="w-4 h-4" />}
                                                    </div>
                                                    <div className="min-w-0 pr-2">
                                                        <p className={`font-black text-[14px] tracking-tight truncate max-w-[150px] uppercase ${isSelected ? "text-blue-600" : "text-foreground group-hover/row:text-blue-600 transition-colors"}`}>
                                                            {c.name}
                                                        </p>
                                                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5 truncate">{c.industry || "General Node"}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="text-[11px] font-mono font-black bg-muted/60 text-muted-foreground px-2 py-1 rounded-xl border border-border/40">
                                                    #{c.company_id}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 max-w-[180px]">
                                                <div className="flex items-center gap-2 text-[12px] font-bold text-muted-foreground group-hover/row:text-foreground transition-colors truncate uppercase tracking-tighter">
                                                    <Mail className="w-3.5 h-3.5 shrink-0 opacity-40 text-blue-500" />
                                                    <span className="truncate">{c.email}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-[12px] font-black text-foreground">
                                                    <Users className="w-4 h-4 text-blue-600 opacity-40" />
                                                    {c.num_employees.toLocaleString()}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${STATUS_STYLES[c.status] || STATUS_STYLES.pending}`}>
                                                        <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor] ${
                                                            c.status === 'approved' ? "bg-emerald-500" :
                                                            c.status === 'rejected' ? "bg-red-500" : "bg-amber-500"
                                                        }`} />
                                                        {c.status}
                                                    </span>
                                                    {/* Toggle Actions */}
                                                    <div className="flex items-center gap-1.5 opacity-0 group-hover/row:opacity-100 transition-all translate-x-1 group-hover/row:translate-x-0" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            disabled={processingId === c.id}
                                                            onClick={() => handleStatusUpdate(c.id, 'approved')}
                                                            className={`p-2 rounded-xl transition-all border ${c.status === 'approved' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20' : 'bg-muted text-muted-foreground border-transparent hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:scale-110'}`}
                                                            title="Authorize"
                                                        >
                                                            {processingId === c.id && c.status !== 'approved' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            disabled={processingId === c.id}
                                                            onClick={() => handleStatusUpdate(c.id, 'rejected')}
                                                            className={`p-2 rounded-xl transition-all border ${c.status === 'rejected' ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20' : 'bg-muted text-muted-foreground border-transparent hover:bg-red-600 hover:text-white hover:border-red-600 hover:scale-110'}`}
                                                            title="Decline"
                                                        >
                                                            {processingId === c.id && c.status === 'rejected' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        onClick={e => handleDelete(c.id, e)}
                                                        disabled={processingId === c.id}
                                                        className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-all border border-transparent hover:border-red-500/20 disabled:opacity-40"
                                                        title="Delete Registry"
                                                    >
                                                        {processingId === c.id
                                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                                            : <Trash2 className="w-4 h-4" />
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => setSlideCompany(isSelected ? null : c)}
                                                        className={`p-2 rounded-xl transition-all border ${
                                                            isSelected
                                                                ? "bg-blue-600/10 border-blue-600/20 text-blue-600"
                                                                : "hover:bg-muted border-transparent hover:border-border text-muted-foreground"
                                                        }`}
                                                    >
                                                        <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? "rotate-90" : ""}`} />
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
            <AnimatePresence>
                {slideCompany && (
                    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-auto"
                            onClick={() => { if(!isRedirecting) setSlideCompany(null); }}
                        />

                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="relative w-full max-w-sm bg-background border-l border-border shadow-[0_0_50px_rgba(0,0,0,0.2)] h-full flex flex-col pointer-events-auto overflow-y-auto scrollbar-hide"
                        >

                            {/* Panel Header */}
                            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-8 py-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[13px] font-black border transition-all ${
                                        slideCompany.status === "approved"
                                            ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                                            : "bg-muted border-border text-muted-foreground/60"
                                    }`}>
                                        {slideCompany.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 pr-2">
                                        <h2 className="font-black text-[18px] tracking-tighter truncate max-w-[180px] uppercase leading-tight">{slideCompany.name}</h2>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mt-0.5">Registry Insight Node</p>
                                    </div>
                                </div>
                                <button onClick={() => setSlideCompany(null)} className="p-2.5 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground active:scale-90 border border-transparent hover:border-border">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Panel Body */}
                            <div className="flex-1 p-8 space-y-8">

                                {/* Node Metadata Cluster */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-muted/40 border border-border/60 hover:bg-muted transition-colors">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 mb-2">Registry Pointer</p>
                                        <p className="font-mono font-black text-[14px] text-foreground tracking-tight">#{slideCompany.company_id}</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-muted/40 border border-border/60 hover:bg-muted transition-colors">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50 mb-2">Protocol Init</p>
                                        <p className="text-[12px] font-black text-foreground uppercase tracking-tight">
                                            {new Date(slideCompany.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                </div>

                                {/* Controller Authority Card */}
                                <div className="p-6 rounded-[2rem] bg-blue-600/[0.03] border border-blue-500/10 group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all group-hover:scale-110 duration-700">
                                        <Shield className="w-20 h-20 text-blue-600" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/60">Assigned Controller Authority</p>
                                    </div>
                                    <div className="space-y-1.5 relative z-10">
                                        <p className="text-lg font-black text-foreground tracking-tight uppercase leading-tight">{slideCompany.adminFirstName} {slideCompany.adminLastName}</p>
                                        <p className="text-[12px] font-bold text-muted-foreground flex items-center gap-2 lowercase tracking-normal">
                                            <Mail className="w-4 h-4 opacity-40 text-blue-500" /> {slideCompany.adminEmail}
                                        </p>
                                    </div>
                                    <Link 
                                        href={`/superadmin/dashboard/admins/${slideCompany.adminId}`}
                                        className="mt-6 inline-flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-500 transition-all group/link underline-offset-4 decoration-blue-500/20 hover:underline"
                                    >
                                        Inspect Controller Node <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1.5 transition-transform" />
                                    </Link>
                                </div>

                                {/* Force Multiplier Matrix */}
                                <div className="p-8 rounded-[2.5rem] bg-blue-600 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                                    <Users className="absolute -bottom-8 -right-8 w-40 h-40 opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000" />
                                    <div className="relative z-10">
                                        <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-60 mb-6">Workforce Force Multiplier</p>
                                        <div className="flex items-end gap-3 mb-8">
                                            <p className="text-6xl font-black leading-none tracking-tighter">{slideCompany.num_employees.toLocaleString()}</p>
                                            <p className="text-[12px] font-black uppercase tracking-widest opacity-60 pb-1.5">Nodes Active</p>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: "75%" }}
                                                transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                                                className="h-full bg-white rounded-full shadow-[0_0_15px_white]" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Registry Channels */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-1">Registry Protocol Channels</p>
                                    <div className="space-y-3">
                                        {[
                                            { icon: Mail, label: "Registry Email", value: slideCompany.email },
                                            { icon: Phone, label: "Registry contact", value: slideCompany.phone || "UNSET PROTOCOL" },
                                            { icon: Globe, label: "Digital domain", value: slideCompany.website || "LOCAL NODE", link: slideCompany.website },
                                            { icon: MapPin, label: "Deployment Zone", value: slideCompany.address || "GLOBAL HUB" },
                                            { icon: Briefcase, label: "Registry Sector", value: slideCompany.industry || "GENERAL" },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-5 p-5 rounded-2xl border border-border/60 hover:bg-muted/40 transition-all group/item shadow-sm">
                                                <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/30 group-hover/item:text-blue-500 group-hover/item:bg-blue-500/5 transition-all outline outline-0 outline-blue-500/20 group-hover/item:outline-8">
                                                    <item.icon className="w-4 h-4 transition-transform group-hover/item:scale-110" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-1">{item.label}</p>
                                                    {item.link ? (
                                                        <a href={item.link} target="_blank" rel="noopener noreferrer"
                                                            className="text-[13px] font-black text-blue-500 hover:underline decoration-blue-500/20 truncate flex items-center gap-1.5 uppercase tracking-tight">
                                                            {item.value} <ExternalLink className="w-3 h-3 opacity-40" />
                                                        </a>
                                                    ) : (
                                                        <p className="text-[13px] font-black text-foreground/80 truncate uppercase tracking-tight">{item.value || "—"}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Panel Footer Interface */}
                            <div className="sticky bottom-0 bg-background/90 backdrop-blur-xl border-t border-border p-8 space-y-4">
                                <button 
                                    onClick={handleOverrideRedirect}
                                    disabled={isRedirecting}
                                    className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 hover:bg-blue-700 shadow-[0_20px_40px_rgba(37,99,235,0.25)] transition-all group disabled:opacity-70 active:scale-95"
                                >
                                    {isRedirecting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" /> Link Establishing
                                        </>
                                    ) : (
                                        <>
                                            Deploy Node Oversight <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleStatusUpdate(slideCompany.id, slideCompany.status === 'approved' ? 'rejected' : 'approved')}
                                        className="h-12 rounded-xl border border-border hover:bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                                    >
                                        <RefreshCw className="w-4 h-4" /> Reset protocol
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(slideCompany.id, e)}
                                        className="h-12 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" /> Decommission
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
