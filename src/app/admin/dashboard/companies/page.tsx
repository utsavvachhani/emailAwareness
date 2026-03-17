"use client";

import { useState, useEffect } from "react";
import {
    Building2, Plus, Pencil, Trash2, Loader2, RefreshCw,
    X, Check, Mail, Phone, Users, Globe, Hash,
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
    created_at: string;
}

const emptyForm = {
    name: "", email: "", phone: "", num_employees: 0,
    industry: "", website: "", address: "", notes: "",
};

export default function AdminCompaniesPage() {
    const token = useAppSelector(s => s.auth.token);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

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

    const openEdit = (c: Company) => {
        setEditingCompany(c);
        setForm({
            name: c.name, email: c.email, phone: c.phone || "",
            num_employees: c.num_employees, industry: c.industry || "",
            website: c.website || "", address: c.address || "", notes: c.notes || "",
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.email) {
            toast.error("Company name and email are required");
            return;
        }
        setSaving(true);
        try {
            const url = editingCompany ? `${apiBase}/${editingCompany.id}` : apiBase;
            const method = editingCompany ? "PUT" : "POST";
            const res = await fetch(url, { method, headers, credentials: "include", body: JSON.stringify(form) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success(editingCompany ? "Company updated!" : "Company created! Check your email.");
            setShowModal(false);
            fetchCompanies();
        } catch (err: any) { toast.error(err.message || "Save failed"); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this company?")) return;
        setProcessingId(id);
        try {
            const res = await fetch(`${apiBase}/${id}`, { method: "DELETE", headers, credentials: "include" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success("Company deleted");
            fetchCompanies();
        } catch (err: any) { toast.error(err.message || "Delete failed"); }
        finally { setProcessingId(null); }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
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

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Companies", value: companies.length, icon: Building2, color: "blue" },
                    { label: "Total Employees", value: companies.reduce((s, c) => s + (c.num_employees || 0), 0), icon: Users, color: "green" },
                    { label: "Industries", value: new Set(companies.map(c => c.industry).filter(Boolean)).size, icon: Hash, color: "purple" },
                    { label: "With Website", value: companies.filter(c => c.website).length, icon: Globe, color: "orange" },
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
                ) : companies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Building2 className="w-12 h-12 mb-3 opacity-30" />
                        <p className="font-medium">No companies yet</p>
                        <p className="text-sm mt-1">Click "Add Company" to register your first company</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-border bg-muted/30">
                                <tr>
                                    {["Company", "Company ID", "Email", "Phone", "Employees", "Industry", "Registered", "Actions"].map(h => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {companies.map(c => (
                                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-600">
                                                    {c.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{c.name}</p>
                                                    {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-blue-500 transition-colors">{c.website}</a>}
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
                                        <td className="px-5 py-4 text-sm text-muted-foreground">{c.industry || "—"}</td>
                                        <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">
                                            {new Date(c.created_at).toLocaleDateString("en-IN")}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEdit(c)}
                                                    className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-600 transition-colors border border-transparent hover:border-blue-500/20">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDelete(c.id)}
                                                    disabled={processingId === c.id}
                                                    className="p-1.5 rounded-md hover:bg-red-500/10 text-red-500 transition-colors border border-transparent hover:border-red-500/20 disabled:opacity-50">
                                                    {processingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
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
                        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
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
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">No. of Employees</label>
                                    <input type="number" min={0} value={form.num_employees} onChange={e => setForm(f => ({ ...f, num_employees: Number(e.target.value) }))}
                                        placeholder="100" className="input-field" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Industry</label>
                                    <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                                        placeholder="Technology" className="input-field" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Website</label>
                                    <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                                        placeholder="https://company.com" className="input-field" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</label>
                                    <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                        placeholder="123 Main St, City, Country" rows={2} className="input-field resize-none" />
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
                                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
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
