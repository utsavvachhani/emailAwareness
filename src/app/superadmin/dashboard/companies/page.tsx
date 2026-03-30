"use client";

import { useState, useEffect } from "react";
import {
    Building2, Trash2, Loader2, RefreshCw, Mail, Phone,
    Users, Globe, Hash, Shield, CheckCircle, XCircle,
    ExternalLink, MapPin, Briefcase, ArrowRight, X, ChevronRight,
    Search, Lock, Zap
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
    adminFirstName?: string;
    adminLastName?: string;
    adminEmail?: string;
    adminId?: number;
    created_at: string;
    status: 'pending' | 'approved' | 'rejected';
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
        // Simulate a small delay for smooth transition feel
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

    return (
        <div className="space-y-5 relative">
            
            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="module-header">
                <div>
                    <h1 className="module-title !text-xl">Central Registries</h1>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Cross-admin organizational management unit</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group/search">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within/search:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search Node..."
                            className="h-8 w-44 pl-8 pr-3 text-[11px] bg-muted/40 border border-border rounded-lg outline-none focus:border-blue-500/30 transition-all font-medium"
                        />
                    </div>
                    <button onClick={fetchCompanies} disabled={isLoading}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border hover:bg-muted transition-colors text-[11px] font-medium">
                        <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Filter Bar ───────────────────────────────────────────── */}
            <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl w-fit">
                {['all', 'pending', 'approved', 'rejected'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                            filterStatus === s 
                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" 
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                    >
                        {s}
                    </button>
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
                        <p className="text-[11px] font-medium opacity-60">No node registries found at current pointer</p>
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
                                                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider">
                                                    <Zap className="w-2.5 h-2.5" /> PRO
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${STATUS_STYLES[c.status] || STATUS_STYLES.pending}`}>
                                                        <div className={`w-1 h-1 rounded-full ${
                                                            c.status === 'approved' ? "bg-emerald-500" :
                                                            c.status === 'rejected' ? "bg-red-500" : "bg-amber-500"
                                                        }`} />
                                                        {c.status}
                                                    </span>
                                                    
                                                    {/* Status Quick Actions */}
                                                    <div className="flex items-center gap-1 relative z-20" onClick={e => e.stopPropagation()}>
                                                        {c.status === 'pending' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(c.id, 'approved')}
                                                                    className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-600 transition-colors border border-transparent hover:border-emerald-500/20"
                                                                    title="Approve Node"
                                                                >
                                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(c.id, 'rejected')}
                                                                    className="p-1 rounded-md hover:bg-red-500/10 text-red-500 transition-colors border border-transparent hover:border-red-500/20"
                                                                    title="Reject Node"
                                                                >
                                                                    <XCircle className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        ) : c.status === 'approved' ? (
                                                            <button
                                                                onClick={() => handleStatusUpdate(c.id, 'rejected')}
                                                                className="p-1 rounded-md hover:bg-red-500/10 text-red-500 transition-colors border border-transparent hover:border-red-500/20"
                                                                title="Revoke & Reject"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleStatusUpdate(c.id, 'approved')}
                                                                className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-600 transition-colors border border-transparent hover:border-emerald-500/20"
                                                                title="Authorize Node"
                                                            >
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-end">
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
                        onClick={() => {
                            if (!isRedirecting) setSlideCompany(null);
                        }}
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
                                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Node Oversight</p>
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
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 mb-1.5">Initialization</p>
                                    <p className="text-[10px] font-bold text-foreground">
                                        {new Date(slideCompany.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                            </div>

                            {/* Force Logistics */}
                            <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 relative group overflow-hidden">
                                <Users className="absolute -bottom-4 -right-4 w-20 h-20 text-blue-600/5 group-hover:scale-110 transition-transform duration-500" />
                                <div className="relative z-10 flex items-end justify-between">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600/40 mb-2">Registry Force</p>
                                        <p className="text-3xl font-black text-blue-600 leading-none">{slideCompany.num_employees.toLocaleString()}</p>
                                        <p className="text-[8px] font-black uppercase tracking-widest mt-1.5 text-blue-600/20">Operational Headcount</p>
                                    </div>
                                    <div className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">
                                        Active
                                    </div>
                                </div>
                            </div>

                            {/* Sync Channels */}
                            <div className="space-y-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">Communication Matrix</p>
                                <div className="space-y-2">
                                    {[
                                        { icon: Mail, label: "Sync Email", value: slideCompany.email },
                                        { icon: Phone, label: "Registry Protocol", value: slideCompany.phone || "+00 NIL" },
                                        { icon: Globe, label: "Registry Domain", value: slideCompany.website || "LOCAL NODE", isLink: true },
                                        { icon: MapPin, label: "Deployment Zone", value: slideCompany.address || "GLOBAL HUB" },
                                        { icon: Briefcase, label: "Industrial Sector", value: slideCompany.industry || "GENERAL" },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3.5 p-3 rounded-xl border border-border/40 hover:bg-muted/30 transition-all group/item">
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/30 group-hover/item:text-blue-500 group-hover/item:bg-blue-500/5 transition-all">
                                                <item.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-2">
                                                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-0.5">{item.label}</p>
                                                <p className={`text-[11px] font-bold text-foreground/80 truncate ${item.isLink ? "text-blue-500 hover:underline underline-offset-4 decoration-blue-500/20 cursor-pointer" : ""}`}>
                                                    {item.value}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Panel Footer — Administrative Override */}
                        <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border p-5 space-y-3">
                            <div className="p-3 bg-muted/30 rounded-xl border border-border/40 mb-2">
                                <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Node Status</p>
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase border ${STATUS_STYLES[slideCompany.status] || STATUS_STYLES.pending}`}>
                                        {slideCompany.status}
                                    </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium italic">Protocol awaiting authentication</p>
                            </div>

                            <button 
                                onClick={handleOverrideRedirect}
                                disabled={isRedirecting}
                                className="w-full h-11 rounded-xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-blue-500 shadow-xl shadow-blue-500/10 transition-all group disabled:opacity-70"
                            >
                                {isRedirecting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Transmitting...
                                    </>
                                ) : (
                                    <>
                                        Access Registry Override <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleStatusUpdate(slideCompany.id, slideCompany.status === 'approved' ? 'rejected' : 'approved')}
                                    className="h-10 rounded-lg border border-border hover:bg-muted text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-1.5"
                                >
                                    <RefreshCw className="w-3 h-3" /> Toggle View
                                </button>
                                <button
                                    onClick={(e) => handleDelete(slideCompany.id, e)}
                                    className="h-10 rounded-lg border border-red-500/10 bg-red-500/5 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-1.5"
                                >
                                    <Trash2 className="w-3 h-3" /> Decommission
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
