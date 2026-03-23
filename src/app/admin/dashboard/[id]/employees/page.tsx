"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users, Search, Filter, Loader2, Building2, UserCheck,
    Shield, Mail, Plus, Pencil, Trash2, X, Check, MoreVertical,
    Download, Briefcase, RefreshCw, AlertCircle
} from "lucide-react";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { toast } from "sonner";

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    designation: string;
    status: 'active' | 'inactive';
    created_at: string;
    company_id: number;
}

const emptyForm = {
    first_name: "",
    last_name: "",
    email: "",
    designation: "",
};

export default function CompanyEmployeesPage() {
    const params = useParams();
    const companyId = params?.id as string;
    const { token } = useAppSelector(s => s.auth);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    const fetchEmployees = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${companyId}/employees`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setEmployees(data.employees);
            }
        } catch (error) {
            toast.error("Network error: Could not load workforce data");
        } finally {
            setIsLoading(false);
        }
    }, [companyId, token]);

    useEffect(() => {
        if (companyId && token) fetchEmployees();
    }, [companyId, token, fetchEmployees]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/admin/employees/${isEditing}`
                : `${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${companyId}/employees`;

            const res = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                toast.success(isEditing ? "Personnel file updated" : "New operative added to workforce");
                setIsModalOpen(false);
                setFormData(emptyForm);
                setIsEditing(null);
                fetchEmployees();
            } else {
                toast.error(data.message || "Operation failed");
            }
        } catch (error) {
            toast.error("Critical error connecting to server");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Permanently offboard this employee from the system?")) return;
        setProcessingId(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/employees/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Employee removed successfully");
                fetchEmployees();
            }
        } catch (error) {
            toast.error("Internal service failure during deletion");
        } finally {
            setProcessingId(null);
        }
    };

    const openEdit = (emp: Employee) => {
        setIsEditing(emp.id);
        setFormData({
            first_name: emp.first_name,
            last_name: emp.last_name,
            email: emp.email,
            designation: emp.designation,
        });
        setIsModalOpen(true);
    };

    const toggleStatus = async (emp: Employee) => {
        setProcessingId(emp.id);
        try {
            const newStatus = emp.status === 'active' ? 'inactive' : 'active';
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/employees/${emp.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if ((await res.json()).success) {
                toast.success(`Access status: ${newStatus.toUpperCase()}`);
                fetchEmployees();
            }
        } catch (error) {
            toast.error("Status synchronization failed");
        } finally {
            setProcessingId(null);
        }
    };

    const filtered = employees.filter(e =>
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.designation.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Hub */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-8">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none flex items-center gap-3">
                        Workforce <span className="text-blue-600">Directory</span>
                        <div className="h-1 w-12 bg-blue-600 rounded-full hidden md:block" />
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground mt-2 italic opacity-60">Managing active personnel and training deployment matrices.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchEmployees}
                        className="p-3 rounded-xl border border-border hover:bg-muted transition-colors text-muted-foreground"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                    <button
                        onClick={() => { setIsEditing(null); setFormData(emptyForm); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Add Operative
                    </button>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Active Assets", value: employees.filter(e => e.status === 'active').length, icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "Total Workforce", value: employees.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Inactive Nodes", value: employees.filter(e => e.status === 'inactive').length, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "Growth Index", value: "+4.2%", icon: RefreshCw, color: "text-purple-500", bg: "bg-purple-500/10" },
                ].map((s) => (
                    <div key={s.label} className="bg-card border border-border p-5 rounded-2xl hover:border-blue-500/30 transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-16 h-16 ${s.bg} rounded-bl-[4rem] -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform`} />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{s.label}</span>
                            <s.icon className={`h-4 w-4 ${s.color}`} />
                        </div>
                        <p className="text-3xl font-black tracking-tighter relative z-10">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Utility Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-md border border-border p-4 rounded-2xl shadow-sm ring-1 ring-black/[0.02]">
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Scan directory by name, role or email..."
                        className="w-full bg-muted/40 border-none rounded-xl pl-12 pr-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                    <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all whitespace-nowrap">
                        <Filter className="h-3 w-3 opacity-40" />
                        Sort Matrix
                    </button>
                    <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md whitespace-nowrap">
                        <Download className="h-3 w-3 opacity-60" />
                        Export Log
                    </button>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl shadow-black/[0.02] relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 animate-pulse">Syncing Personnel Data...</p>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                <th className="px-8 py-6 text-left">Entity Identity</th>
                                <th className="px-8 py-6 text-left">Assignment</th>
                                <th className="px-8 py-6 text-left">Clearance</th>
                                <th className="px-8 py-6 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <Users className="w-16 h-16" />
                                            <p className="text-xl font-black italic uppercase tracking-tighter">No Personnel Records Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-blue-500/[0.03] transition-all group border-l-2 border-l-transparent hover:border-l-blue-500">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 flex items-center justify-center text-sm font-black text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
                                                    {emp.first_name[0]}{emp.last_name[0]}
                                                </div>
                                                <div>
                                                    <div className="text-base font-black italic tracking-tight group-hover:text-blue-600 transition-colors uppercase">
                                                        {emp.first_name} {emp.last_name}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground opacity-60">
                                                        <Mail className="w-3 h-3" />
                                                        {emp.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/80">
                                                    <Briefcase className="w-3 h-3 text-blue-500" />
                                                    {emp.designation}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground/40 italic font-medium">
                                                    Added {new Date(emp.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <button
                                                onClick={() => toggleStatus(emp)}
                                                disabled={processingId === emp.id}
                                                className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.1em] border transition-all flex items-center gap-2 active:scale-95 ${emp.status === "active"
                                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                                                    : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                                                    }`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'} ${emp.status === 'active' && 'animate-pulse'}`} />
                                                {emp.status}
                                            </button>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openEdit(emp)}
                                                    className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp.id)}
                                                    disabled={processingId === emp.id}
                                                    className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white transition-all active:scale-90 disabled:opacity-50"
                                                >
                                                    {processingId === emp.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Operative Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-card w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-8 border-b border-white/5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground leading-none">
                                        {isEditing ? "Modify" : "Initialize"} <span className="text-blue-500">Operative</span>
                                    </h2>
                                    <p className="text-xs font-medium text-muted-foreground mt-2 opacity-60">
                                        {isEditing ? `Refining credentials for record #${isEditing}` : "Registering new entity into workforce matrix"}
                                    </p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-muted-foreground transition-colors group">
                                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
                                    <div className="relative group">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                            className="w-full bg-muted/40 border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                                            placeholder="John"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
                                    <input
                                        required
                                        value={formData.last_name}
                                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full bg-muted/40 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secure Email Identity</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-muted/40 border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-mono font-bold"
                                        placeholder="operative@domain.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Operational Designation</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        value={formData.designation}
                                        onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full bg-muted/40 border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                                        placeholder="Security Engineer / Lead Analyst"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl border border-border text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all active:scale-95"
                                >
                                    Abort
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {isEditing ? "Synchronize Changes" : "Confirm Enrollment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
