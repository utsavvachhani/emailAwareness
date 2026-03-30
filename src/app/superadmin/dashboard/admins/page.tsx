"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle, XCircle, Clock, Loader2, User, Users, Mail,
    RefreshCw, AlertTriangle, Ban, Unlock, Eye,
    Calendar, Phone, Shield, ExternalLink, Search,
    Filter, X, ChevronRight, ArrowRight, Trash2,
    BadgeCheck, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/redux/hooks";
import Link from "next/link";

interface UserData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
    status: string;
    role?: string;
    is_verified: boolean;
    created_at: string;
    last_login?: string;
}

const STATUS_STYLES: Record<string, string> = {
    active: "bg-emerald-500/5 text-emerald-600 border-emerald-500/10",
    pending: "bg-amber-500/5 text-amber-500 border-amber-500/10",
    rejected: "bg-red-500/5 text-red-500 border-red-500/10",
    blocked: "bg-gray-500/5 text-gray-500 border-gray-500/10",
};

export default function AdminApprovalsPage() {
    const token = useAppSelector(s => s.auth.token);
    const [admins, setAdmins] = useState<UserData[]>([]);
    const [allAdmins, setAllAdmins] = useState<UserData[]>([]);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [tab, setTab] = useState<"pending" | "all" | "users">("pending");
    const [slideUser, setSlideUser] = useState<UserData | null>(null);

    // Filter/Sort States
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            const [pendingRes, allRes, usersRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/admins/pending`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/admins/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/users/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                }),
            ]);
            const [pd, ad, ud] = await Promise.all([pendingRes.json(), allRes.json(), usersRes.json()]);
            if (pd.success) setAdmins(pd.admins);
            if (ad.success) setAllAdmins(ad.admins);
            if (ud.success) {
                const filteredUsers = ud.users.filter((u: any) => u.role === 'user');
                setAllUsers(filteredUsers);
            }
        } catch {
            toast.error("Failed to load registry clusters");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAdmins(); }, [token]);

    const handleAction = async (id: number, action: "approve" | "reject" | "block" | "unblock", role?: string) => {
        setProcessingId(id);
        const type = (role || (tab === "users" ? "user" : "admin")) === 'user' ? "users" : "admins";
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/${type}/${id}/${action}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success(`${type === "users" ? "User" : "Admin"} ${action} protocol complete`);

            // Re-fetch to sync
            fetchAdmins();

            if (slideUser?.id === id) {
                const newStatus = action === "approve" ? "active" : action === "reject" ? "rejected" : action === "block" ? "blocked" : "active";
                setSlideUser(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (err: any) {
            toast.error(err.message || "Protocol transmission failure");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: number, type: "admin" | "user") => {
        if (!confirm(`Permanently de-authorize this ${type} node?`)) return;
        setProcessingId(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/${type}s/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success(`${type} entry purged from registry`);
            fetchAdmins();
            if (slideUser?.id === id) setSlideUser(null);
        } catch (err: any) {
            toast.error(err.message || "De-authorization failed");
        } finally {
            setProcessingId(null);
        }
    };

    const displayList = (tab === "pending" ? admins : tab === "all" ? allAdmins : allUsers)
        .filter(admin => {
            const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase();
            const matchesSearch = fullName.includes(search.toLowerCase()) ||
                admin.email.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = filterStatus === "all" || admin.status === filterStatus;
            return matchesSearch && matchesStatus;
        });

    return (
        <div className="space-y-5 relative">

            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="module-header">
                <div>
                    <h1 className="module-title !text-xl">Authorization Hub</h1>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Global identity and access provision unit</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group/search">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within/search:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Find Identity..."
                            className="h-8 w-44 pl-8 pr-3 text-[11px] bg-muted/40 border border-border rounded-lg outline-none focus:border-blue-500/30 transition-all font-medium"
                        />
                    </div>
                    <button onClick={fetchAdmins} disabled={isLoading}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border hover:bg-muted transition-colors text-[11px] font-medium">
                        <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Tabs / Filters ───────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl w-fit">
                    {(["pending", "all", "users"] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setSearch(""); }}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${tab === t
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                        >
                            {t === "pending" ? `Requests [${admins.length}]` : t === "all" ? `Admins [${allAdmins.length}]` : `Final Users [${allUsers.length}]`}
                        </button>
                    ))}
                </div>

                {tab !== "pending" && (
                    <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-xl w-fit">
                        {['all', 'active', 'blocked'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filterStatus === s
                                        ? "bg-muted text-foreground border border-border shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Stats Overview ───────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Pending Requests", value: admins.length, icon: Clock, color: "text-amber-500" },
                    { label: "Active Admins", value: allAdmins.filter(a => a.status === 'active').length, icon: ShieldCheck, color: "text-blue-600" },
                    { label: "Global Users", value: allUsers.length, icon: Users, color: "text-emerald-600" },
                    { label: "System Blocks", value: allAdmins.filter(a => a.status === 'blocked').length + allUsers.filter(u => u.status === 'blocked').length, icon: Ban, color: "text-red-500" },
                ].map(stat => (
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                            <stat.icon className={`h-3.5 w-3.5 ${stat.color} opacity-40`} />
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
                ) : displayList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <User className="w-10 h-10 mb-2 opacity-10" />
                        <p className="text-[11px] font-medium opacity-60">Identity registry currently empty</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                            <thead className="border-b border-border bg-muted/20">
                                <tr>
                                    {["Identity", "Email Access", "Registry Contact", "Status", "Joined", ""].map(h => (
                                        <th key={h} className="px-5 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {displayList.map(admin => {
                                    const isSelected = slideUser?.id === admin.id;
                                    return (
                                        <tr
                                            key={admin.id}
                                            onClick={() => setSlideUser(isSelected ? null : admin)}
                                            className={`transition-all cursor-pointer group/row ${isSelected
                                                    ? "bg-blue-500/5 border-l-2 border-l-blue-500 shadow-inner"
                                                    : "hover:bg-muted/30 border-l-2 border-l-transparent"
                                                }`}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[11px] font-black text-blue-600 transition-all group-hover/row:bg-blue-600/10">
                                                        {admin.firstName[0]}{admin.lastName[0]}
                                                    </div>
                                                    <div className="min-w-0 pr-2">
                                                        <p className={`font-bold text-[11px] truncate max-w-[150px] ${isSelected ? "text-blue-600" : "text-foreground group-hover/row:text-blue-600 transition-colors"}`}>
                                                            {admin.firstName} {admin.lastName}
                                                        </p>
                                                        {!admin.is_verified && <p className="text-[9px] text-amber-600 font-bold uppercase tracking-tight">Unverified ID</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 max-w-[180px]">
                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground group-hover/row:text-foreground transition-colors truncate">
                                                    <Mail className="w-3.5 h-3.5 shrink-0 opacity-40" />
                                                    <span className="truncate">{admin.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                    <Phone className="w-3 h-3 shrink-0 opacity-40" />
                                                    {admin.mobile || "—"}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${STATUS_STYLES[admin.status] || STATUS_STYLES.pending}`}>
                                                    <div className="w-1 h-1 rounded-full bg-current opacity-40" />
                                                    {admin.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                    <Calendar className="w-3 h-3 opacity-40" />
                                                    {new Date(admin.created_at).toLocaleDateString("en-IN")}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    {admin.status === 'pending' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleAction(admin.id, "approve", admin.role)}
                                                                className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-colors border border-transparent hover:border-emerald-500/20"
                                                                title="Authorize Admin"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(admin.id, "reject", admin.role)}
                                                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors border border-transparent hover:border-red-500/20"
                                                                title="Deny Access"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {admin.status === 'active' ? (
                                                                <button
                                                                    onClick={() => handleAction(admin.id, "block", admin.role)}
                                                                    className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-600 transition-colors border border-transparent hover:border-amber-500/20"
                                                                    title="Block Registry Entry"
                                                                >
                                                                    <Ban className="w-4 h-4" />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAction(admin.id, "unblock", admin.role)}
                                                                    className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-colors border border-transparent hover:border-emerald-500/20"
                                                                    title="Restore Entry"
                                                                >
                                                                    <Unlock className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(admin.id, tab === "users" ? "user" : "admin")}
                                                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors border border-transparent hover:border-red-500/20"
                                                                title="Purge Node"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => setSlideUser(isSelected ? null : admin)}
                                                        className={`p-1.5 rounded-lg transition-all border ${isSelected
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
            {slideUser && (
                <div className="fixed inset-0 z-40 flex justify-end pointer-events-none">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-auto"
                        onClick={() => setSlideUser(null)}
                    />

                    {/* Panel */}
                    <div className="relative w-full max-w-sm bg-background border-l border-border shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200 pointer-events-auto overflow-y-auto scrollbar-hide">

                        {/* Panel Header */}
                        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[12px] font-black text-blue-600">
                                    {slideUser.firstName[0]}{slideUser.lastName[0]}
                                </div>
                                <div className="min-w-0 pr-2">
                                    <h2 className="font-bold text-[13px] tracking-tight truncate max-w-[150px] uppercase">{slideUser.firstName} {slideUser.lastName}</h2>
                                    <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Identity Blueprint</p>
                                </div>
                            </div>
                            <button onClick={() => setSlideUser(null)} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Panel Body */}
                        <div className="flex-1 p-5 space-y-6">

                            {/* Verification Cluster */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 mb-1.5">Verification Status</p>
                                    <div className="flex items-center gap-2">
                                        <BadgeCheck className={`w-3.5 h-3.5 ${slideUser.is_verified ? "text-blue-500" : "text-muted-foreground/30"}`} />
                                        <p className={`text-[10px] font-black uppercase ${slideUser.is_verified ? "text-blue-600" : "text-muted-foreground"}`}>
                                            {slideUser.is_verified ? "Authenticated" : "Unverified"}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 mb-1.5">Node Activity</p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-muted-foreground/40" />
                                        <p className="text-[10px] font-bold text-foreground">
                                            {slideUser.last_login ? new Date(slideUser.last_login).toLocaleDateString() : "No record"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Node Core Metrics */}
                            <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600/40 mb-2">Role Tier</p>
                                    <p className="text-xl font-black text-blue-600 leading-none">ADMIN</p>
                                </div>
                                <Shield className="w-8 h-8 text-blue-600/10" />
                            </div>

                            {/* Access Channels */}
                            <div className="space-y-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">IDENTITY CHANNELS</p>
                                <div className="space-y-2">
                                    {[
                                        { icon: Mail, label: "Registry Email", value: slideUser.email },
                                        { icon: Phone, label: "Protocol Mobile", value: slideUser.mobile || "+00 NIL" },
                                        { icon: Calendar, label: "Entry Timestamp", value: new Date(slideUser.created_at).toLocaleString() },
                                        { icon: Shield, label: "Security Level", value: slideUser.role === "superadmin" ? "MASTER" : "ADMIN_HUB" },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3.5 rounded-xl border border-border/40 hover:bg-muted/30 transition-all group/item">
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/40 group-hover/item:text-blue-500 group-hover/item:bg-blue-500/5 transition-all">
                                                <item.icon className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-2">
                                                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-0.5">{item.label}</p>
                                                <p className="text-[11px] font-bold text-foreground/80 truncate">
                                                    {item.value}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Panel Footer — Node Control */}
                        <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-border p-5 space-y-3">
                            {tab !== "users" && (
                                <Link
                                    href={`/superadmin/dashboard/admins/${slideUser.id}`}
                                    className="w-full h-11 rounded-xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all group"
                                >
                                    Deploy Node Override <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}

                            {slideUser.status === 'pending' ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleAction(slideUser.id, "approve", slideUser.role)}
                                        className="h-10 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" /> Authorize
                                    </button>
                                    <button
                                        onClick={() => handleAction(slideUser.id, "reject", slideUser.role)}
                                        className="h-10 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-3.5 h-3.5" /> Deny
                                    </button>
                                </div>
                            ) : slideUser.status === 'active' ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleAction(slideUser.id, "block", slideUser.role)}
                                        className="h-10 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-600 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Ban className="w-3.5 h-3.5" /> Block
                                    </button>
                                    <button
                                        onClick={() => handleDelete(slideUser.id, tab === "users" ? "user" : "admin")}
                                        className="h-10 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            ) : slideUser.status === 'blocked' ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleAction(slideUser.id, "unblock", slideUser.role)}
                                        className="h-10 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Unlock className="w-3.5 h-3.5" /> Restore
                                    </button>
                                    <button
                                        onClick={() => handleDelete(slideUser.id, tab === "users" ? "user" : "admin")}
                                        className="h-10 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleDelete(slideUser.id, tab === "users" ? "user" : "admin")}
                                    className="w-full h-10 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Purge Identity Record
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
