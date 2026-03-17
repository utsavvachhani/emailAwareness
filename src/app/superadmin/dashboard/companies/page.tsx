"use client";

import { useState, useEffect } from "react";
import {
    Building2, Trash2, Loader2, RefreshCw, Mail, Phone,
    Users, Globe, Hash, User,
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/redux/hooks";

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
}

export default function SuperadminCompaniesPage() {
    const token = useAppSelector(s => s.auth.token);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [search, setSearch] = useState("");

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

    useEffect(() => { fetchCompanies(); }, [token]);

    const handleDelete = async (id: number) => {
        if (!confirm("Permanently delete this company?")) return;
        setProcessingId(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/companies/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success("Company deleted");
            fetchCompanies();
        } catch (err: any) { toast.error(err.message || "Delete failed"); }
        finally { setProcessingId(null); }
    };

    const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company_id.toLowerCase().includes(search.toLowerCase()) ||
        (c.adminEmail || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="module-header">
                <div>
                    <h1 className="module-title">All Companies</h1>
                    <p className="text-sm text-muted-foreground mt-1">View and manage all registered companies across all admins</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search companies..."
                        className="h-9 text-sm rounded-lg border border-input bg-background px-3 outline-none focus:border-foreground transition-colors w-56"
                    />
                    <button onClick={fetchCompanies} disabled={isLoading}
                        className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Companies", value: companies.length, icon: Building2 },
                    { label: "Total Employees", value: companies.reduce((s, c) => s + (c.num_employees || 0), 0).toLocaleString(), icon: Users },
                    { label: "Industries", value: new Set(companies.map(c => c.industry).filter(Boolean)).size, icon: Hash },
                    { label: "Admins Registered", value: new Set(companies.map(c => c.adminId).filter(Boolean)).size, icon: User },
                ].map(stat => (
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Building2 className="w-12 h-12 mb-3 opacity-30" />
                        <p className="font-medium">{search ? "No companies match your search" : "No companies yet"}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-border bg-muted/30">
                                <tr>
                                    {["Company", "Company ID", "Email", "Phone", "Employees", "Admin Owner", "Registered", "Action"].map(h => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map(c => (
                                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-600">
                                                    {c.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{c.name}</p>
                                                    {c.industry && <p className="text-xs text-muted-foreground">{c.industry}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{c.company_id}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Mail className="w-3.5 h-3.5" />
                                                {c.email}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Phone className="w-3.5 h-3.5" />
                                                {c.phone || "—"}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                {c.num_employees.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-semibold text-blue-600">
                                                    {(c.adminFirstName?.[0] || "?")}{(c.adminLastName?.[0] || "")}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium">{c.adminFirstName} {c.adminLastName}</p>
                                                    <p className="text-[10px] text-muted-foreground">{c.adminEmail || "No admin"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">
                                            {new Date(c.created_at).toLocaleDateString("en-IN")}
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                disabled={processingId === c.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-medium disabled:opacity-50"
                                            >
                                                {processingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
