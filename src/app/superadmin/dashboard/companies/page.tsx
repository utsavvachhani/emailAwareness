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
            <div className="module-header italic">
                <div>
                    <h1 className="module-title text-black !text-xl">Global Entities</h1>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Cross-admin organizational management hub 0xAF</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group/search mr-2">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40 group-focus-within/search:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Find node..."
                            className="h-8 w-40 pl-8 pr-3 text-[10px] bg-muted/40 border border-border rounded-lg outline-none focus:border-blue-500/30 transition-all font-bold"
                        />
                    </div>
                    <button onClick={fetchCompanies} disabled={isLoading}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border hover:bg-muted transition-colors text-[11px] font-medium">
                        <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                        Sync Registry
                    </button>
                    {/* Filter Dropdown */}
                    <select 
                        value={filterStatus} 
                        onChange={e => setFilterStatus(e.target.value)}
                        className="h-8 px-2 border border-border rounded-lg bg-background text-[10px] font-bold outline-none focus:border-blue-500/30"
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
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-4 shadow-sm group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                            <stat.icon className="h-3.5 w-3.5 text-blue-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xl font-black text-foreground">{stat.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* ── Table Container ──────────────────────────────────────── */}
           <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col shadow-sm">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Building2 className="w-10 h-10 mb-2 opacity-10" />
                        <p className="text-[11px] font-medium opacity-60">No organizations found attached to this registry pointer</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                            <thead className="border-b border-border bg-muted/20">
                                <tr>
                                    {["Company", "ID", "Email", "Phone", "Employees", "Plan", "Status", ""].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filtered.map(c => {
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
                                                            ? "bg-blue-600 text-white border-blue-600"
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
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${STATUS_STYLES[c.status] || STATUS_STYLES.pending}`}>
                                                        {c.status}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center gap-1 justify-end">
                                                    {c.status !== "approved" && (
                                                        <button
                                                            disabled={processingId === c.id}
                                                            onClick={() => handleStatusUpdate(c.id, 'approved')}
                                                            className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                                        >
                                                            {processingId === c.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <CheckCircle className="w-2.5 h-2.5" />}
                                                            Approve
                                                        </button>
                                                    )}
                                                    {c.status !== "rejected" && (
                                                        <button
                                                            disabled={processingId === c.id}
                                                            onClick={() => handleStatusUpdate(c.id, 'rejected')}
                                                            className="flex items-center gap-1 px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                                        >
                                                            {processingId === c.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <XCircle className="w-2.5 h-2.5" />}
                                                            Revoked
                                                        </button>
                                                    )}
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
            <AnimatePresence>
                {slideCompany && (
                    <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-auto"
                            onClick={() => setSlideCompany(null)}
                        />

                        {/* Panel */}
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="relative w-full max-w-sm bg-background border-l border-border shadow-2xl h-full flex flex-col pointer-events-auto overflow-y-auto"
                        >

                            {/* Panel Header */}
                            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-black border ${
                                        slideCompany.status === "approved"
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-muted border-border text-muted-foreground/60"
                                    }`}>
                                        {slideCompany.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 pr-2">
                                        <h2 className="font-bold text-[13px] tracking-tight truncate max-w-[150px] uppercase">{slideCompany.name}</h2>
                                        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Registry Insights</p>
                                    </div>
                                </div>
                                <button onClick={() => setSlideCompany(null)} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Panel Body */}
                            <div className="flex-1 p-5 space-y-6">

                                {/* Metadata Cluster */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 mb-1.5">Registry Pointer</p>
                                        <p className="font-mono font-bold text-[11px] text-foreground">#{slideCompany.company_id}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 mb-1.5">Initialized</p>
                                        <p className="text-[10px] font-bold text-foreground">
                                            {new Date(slideCompany.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                    </div>
                                </div>

                                {/* Force Multiplier */}
                                <div className="p-5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/10">
                                    <Users className="w-4 h-4 opacity-40 mb-3" />
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Total Force</p>
                                    <p className="text-2xl font-black leading-none">{slideCompany.num_employees.toLocaleString()}</p>
                                </div>

                                {/* Communication channels */}
                                <div className="space-y-3">
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">Protocol Matrix</p>
                                    <div className="space-y-2">
                                        {[
                                            { icon: Mail, label: "Registry Email", value: slideCompany.email },
                                            { icon: Phone, label: "Registry Channel", value: slideCompany.phone || "+00 NIL" },
                                            { icon: Globe, label: "Digital Horizon", value: slideCompany.website || "LOCAL NODE", link: slideCompany.website },
                                            { icon: MapPin, label: "Deployment Zone", value: slideCompany.address || "GLOBAL HUB" },
                                            { icon: Briefcase, label: "Industrial Sector", value: slideCompany.industry || "GENERAL" },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3.5 p-3 rounded-xl border border-border/40 bg-card">
                                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/30">
                                                    <item.icon className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-0.5">{item.label}</p>
                                                    {item.link ? (
                                                        <a href={item.link} target="_blank" rel="noopener noreferrer"
                                                            className="text-[11px] font-bold text-blue-500 hover:underline truncate">
                                                            {item.value} <ExternalLink className="w-2.5 h-2.5 opacity-40 inline" />
                                                        </a>
                                                    ) : (
                                                        <p className="text-[11px] font-bold text-foreground/80 truncate">{item.value}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Panel Footer */}
                            <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border p-5 space-y-3">
                                <button
                                    onClick={handleOverrideRedirect}
                                    disabled={isRedirecting}
                                    className="w-full h-11 rounded-xl bg-blue-600 text-white font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all group disabled:opacity-70"
                                >
                                    {isRedirecting ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Establishing Link
                                        </>
                                    ) : (
                                        <>
                                            Deploy Node Console <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleStatusUpdate(slideCompany.id, slideCompany.status === 'approved' ? 'rejected' : 'approved')}
                                        className="h-10 rounded-lg border border-border hover:bg-muted text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Protocol Reset
                                    </button>
                                    <button
                                        onClick={e => handleDelete(slideCompany.id, e)}
                                        disabled={processingId === slideCompany.id}
                                        className="h-10 rounded-lg border border-red-500/10 bg-red-500/5 text-red-500 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                                    >
                                        {processingId === slideCompany.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                        Decommission
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
