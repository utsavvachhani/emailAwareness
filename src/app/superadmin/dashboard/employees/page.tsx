"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users, Search, Download, RefreshCw, FileText, ChevronLeft, ChevronRight,
    TrendingUp, ShieldCheck, ExternalLink, Trash2, Building2, Mail,
    X, Info, Calendar, Briefcase, Plus, Check, UserCheck, UserX, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/redux/hooks";
import * as Dialog from "@radix-ui/react-dialog";

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    designation: string;
    status: 'active' | 'inactive';
    company_id: number;
    company_name: string;
    created_at: string;
}

interface Company {
    id: number;
    name: string;
}

const emptyForm = {
    first_name: "",
    last_name: "",
    email: "",
    designation: "",
    company_id: "",
};

const DESIGNATIONS = [
    "HR", "Software Developer", "Senior Developer", "Junior Developer",
    "Marketing", "UT", "Developer Options", "CEO", "Sales",
    "Data Analytics", "Data Entry", "Finance", "Operations",
    "Management", "Other"
];

export default function SuperadminEmployeesPage() {
    const token = useAppSelector(s => s.auth.token);
    
    // Data states
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
    
    // Form states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Filter/Search states
    const [search, setSearch] = useState("");
    const [companyFilter, setCompanyFilter] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
    const [sortField, setSortField] = useState<"name" | "company" | "date">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [empRes, compRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/employees`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/companies`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            
            const [empData, compData] = await Promise.all([empRes.json(), compRes.json()]);
            
            if (empData.success) setEmployees(empData.employees);
            if (compData.success) setCompanies(compData.companies);
        } catch {
            toast.error("Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchData();
    }, [fetchData, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = isEditing
                ? `${process.env.NEXT_PUBLIC_API_URL}/superadmin/employees/${isEditing}`
                : `${process.env.NEXT_PUBLIC_API_URL}/superadmin/companies/${formData.company_id}/employees`;

            const res = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success(isEditing ? "Employee protocol updated" : "Employee initialized");
            setIsModalOpen(false);
            setFormData(emptyForm);
            setIsEditing(null);
            fetchData();
        } catch (err: any) {
            toast.error(err.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Decommission this employee record?")) return;
        setProcessingId(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/employees/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Employee removed from system");
                setEmployees(prev => prev.filter(e => e.id !== id));
            } else {
                throw new Error(data.message);
            }
        } catch (err: any) {
            toast.error(err.message || "Decommission failed");
        } finally {
            setProcessingId(null);
        }
    };

    const toggleStatus = async (emp: Employee) => {
        const originalStatus = emp.status;
        const newStatus = originalStatus === "active" ? "inactive" : "active";
 
        setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: newStatus } : e));
        setProcessingId(emp.id);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/employees/${emp.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });
 
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Update failed");
            
            toast.success(`${emp.first_name}'s status synchronized to ${newStatus}`);
        } catch (err: any) {
            setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: originalStatus } : e));
            toast.error(err.message || "Sync failed");
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
            company_id: emp.company_id.toString(),
        });
        setIsModalOpen(true);
    };

    // Filter logic
    const filtered = employees.filter(e => {
        const fullName = `${e.first_name || ""} ${e.last_name || ""}`.toLowerCase();
        const matchesSearch = fullName.includes(search.toLowerCase()) || 
                             (e.email || "").toLowerCase().includes(search.toLowerCase());
        const matchesCompany = companyFilter === "all" || e.company_id.toString() === companyFilter;
        const matchesStatus = filterStatus === "all" || e.status === filterStatus;
        return matchesSearch && matchesCompany && matchesStatus;
    }).sort((a, b) => {
        let valA: any = "";
        let valB: any = "";

        if (sortField === "name") {
            valA = `${a.first_name} ${a.last_name}`.toLowerCase();
            valB = `${b.first_name} ${b.last_name}`.toLowerCase();
        } else if (sortField === "company") {
            valA = (a.company_name || "").toLowerCase();
            valB = (b.company_name || "").toLowerCase();
        } else {
            valA = new Date(a.created_at).getTime();
            valB = new Date(b.created_at).getTime();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const exportToCSV = () => {
        const headers = ["ID", "Name", "Email", "Role", "Company", "Status", "Joined"];
        const rows = filtered.map(e => [
            e.id, `${e.first_name} ${e.last_name}`, e.email, e.designation, e.company_name, e.status, new Date(e.created_at).toLocaleDateString()
        ]);
        const content = [headers, ...rows].map(r => r.join(",")).join("\n");
        const blob = new Blob([content], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `global_employees_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="module-header no-print">
                <div>
                    <h1 className="module-title font-black italic tracking-tight uppercase">Global Employee Insight</h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium italic opacity-60">System-wide monitoring across all organizations</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="p-2.5 rounded-xl border border-border hover:bg-muted transition-all bg-card shadow-sm">
                        <RefreshCw className={`h-4.5 w-4.5 ${isLoading && "animate-spin"}`} />
                    </button>
                    <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-sm">
                        <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-1.5 hover:bg-muted rounded-lg text-[11px] font-black uppercase tracking-widest transition-all">
                            <Download className="h-4 w-4" /> CSV
                        </button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-1.5 hover:bg-muted rounded-lg text-[11px] font-black uppercase tracking-widest transition-all">
                            <FileText className="h-4 w-4" /> PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
                {[
                    { label: "Global Headcount", value: employees.length, icon: Users, color: "text-blue-600", bg: "bg-blue-500/5", filter: "all" },
                    { label: "Active Nodes", value: employees.filter(e => e.status === "active").length, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-500/5", filter: "active" },
                    { label: "Inactive Nodes", value: employees.filter(e => e.status === "inactive").length, icon: UserX, color: "text-red-500", bg: "bg-red-500/5", filter: "inactive" },
                    { label: "Admin Portfolio", value: companies.length, icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-500/5", filter: null }
                ].map((stat, i) => {
                    const isActive = stat.filter && filterStatus === stat.filter;
                    return (
                        <button
                            key={i}
                            onClick={() => stat.filter && setFilterStatus(stat.filter as any)}
                            disabled={!stat.filter}
                            className={`rounded-2xl border p-4 flex items-center gap-4 transition-all text-left group shadow-sm ${stat.bg} ${
                                stat.filter ? "cursor-pointer" : "cursor-default"
                            } ${isActive ? "ring-2 ring-blue-500 border-transparent shadow-xl scale-[1.02]" : "hover:border-blue-500/30"}`}
                        >
                            <div className="flex-1 min-w-0">
                                <p className={`text-3xl font-black italic tracking-tighter transition-all ${stat.color} ${isActive ? "scale-110 origin-left" : ""}`}>
                                    {stat.value}
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 truncate">{stat.label}</p>
                            </div>
                            <stat.icon className={`h-6 w-6 ${stat.color} opacity-20 group-hover:opacity-100 transition-all group-hover:scale-110`} />
                        </button>
                    );
                })}
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col lg:flex-row gap-3 items-center justify-between bg-muted/20 p-4 rounded-3xl border border-border shadow-inner no-print">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                        <input
                            type="text"
                            placeholder="Find anyone by name or email..."
                            className="w-full h-11 pl-10 pr-4 bg-background border border-border rounded-2xl text-[13px] font-medium outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <select
                        value={companyFilter}
                        onChange={e => { setCompanyFilter(e.target.value); setCurrentPage(1); }}
                        className="h-11 px-4 border border-border rounded-2xl bg-background text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm min-w-[200px]"
                    >
                        <option value="all">🏢 Global Distribution</option>
                        {companies.map(c => (
                            <option key={c.id} value={c.id.toString()}>{c.name}</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-2 bg-background border border-border rounded-2xl h-11 px-4 shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Display:</span>
                        <select
                            value={itemsPerPage}
                            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="h-8 bg-transparent text-[11px] font-black uppercase outline-none cursor-pointer"
                        >
                            <option value={10}>10 Nodes</option>
                            <option value={20}>20 Nodes</option>
                            <option value={50}>50 Nodes</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-background border border-border rounded-2xl shadow-sm">
                    <select
                        value={sortField}
                        onChange={e => setSortField(e.target.value as any)}
                        className="h-9 pl-3 pr-1 bg-transparent text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer"
                    >
                        <option value="date">Registry Date</option>
                        <option value="name">Alphabetical</option>
                        <option value="company">Organization</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}
                        className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted transition-all"
                    >
                        <TrendingUp className={`w-4 h-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Registry Table */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl shadow-blue-500/5 relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-50 flex items-center justify-center">
                        <RefreshCw className="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                {["Node Entity", "Organization", "Designation", "Status", "Registry Date", "Actions"].map(h => (
                                    <th key={h} className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-muted-foreground opacity-60 font-mono italic">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginated.length > 0 ? (
                                paginated.map(emp => (
                                    <tr key={emp.id} className="hover:bg-muted/10 transition-all group border-l-4 border-l-transparent hover:border-l-blue-600">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-bold text-slate-800 tracking-tight">{emp.first_name} {emp.last_name}</p>
                                                    <p className="text-[10px] font-medium text-muted-foreground opacity-60 font-mono tracking-tighter">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-3.5 h-3.5 text-purple-600 opacity-40" />
                                                <span className="text-[12px] font-bold text-purple-600">{emp.company_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-3.5 h-3.5 opacity-30" />
                                                <span className="text-[11px] font-bold text-slate-500 tracking-tight">{emp.designation}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center gap-1.5 min-w-[70px]">
                                                <button
                                                    onClick={() => toggleStatus(emp)}
                                                    disabled={processingId === emp.id}
                                                    className={`group relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 ease-in-out outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed ${
                                                        emp.status === "active" 
                                                            ? "bg-emerald-500 hover:bg-emerald-600 shadow-inner" 
                                                            : "bg-slate-300 hover:bg-slate-400 shadow-inner"
                                                    }`}
                                                >
                                                    <span
                                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xl transition duration-300 ease-in-out ${
                                                            emp.status === "active" ? "translate-x-[22px]" : "translate-x-0.5"
                                                        } ${processingId === emp.id ? "scale-75 opacity-70" : "scale-100"}`}
                                                    />
                                                </button>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                    emp.status === "active" ? "text-emerald-600" : "text-slate-500"
                                                }`}>
                                                    {emp.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 opacity-30" />
                                                <p className="text-[12px] font-medium text-muted-foreground italic">
                                                {new Date(emp.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setViewingEmployee(emp)} className="p-2 rounded-xl bg-muted/50 text-slate-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => openEdit(emp)} className="p-2 rounded-xl bg-muted/50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm">
                                                    <Info className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(emp.id)}
                                                    disabled={processingId === emp.id}
                                                    className="p-2 rounded-xl bg-muted/50 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    {processingId === emp.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <Users className="w-12 h-12 text-muted-foreground opacity-10 mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">No employee entities detected</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Strip */}
                <div className="p-6 bg-muted/10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 no-print">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                        Total System Registry: <span className="text-slate-900">{filtered.length} Entities</span>
                    </p>
                    
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2.5 rounded-2xl border border-border hover:bg-muted transition-all disabled:opacity-30 bg-card shadow-sm"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-2xl text-[11px] font-black transition-all ${
                                        currentPage === i + 1 
                                        ? "bg-slate-900 text-white shadow-xl scale-110" 
                                        : "hover:bg-muted text-slate-500 bg-card border border-border"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2.5 rounded-2xl border border-border hover:bg-muted transition-all disabled:opacity-30 bg-card shadow-sm"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Add / Edit Modal */}
            <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-md bg-white rounded-[32px] shadow-2xl p-8 z-[101] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/20 outline-none">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${isEditing ? "bg-amber-600 shadow-amber-500/20" : "bg-blue-600 shadow-blue-500/20"}`}>
                                {isEditing ? <Info className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                            </div>
                            <Dialog.Close className="p-2 hover:bg-muted rounded-xl transition-all">
                                <X className="w-5 h-5 text-muted-foreground font-bold" />
                            </Dialog.Close>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-2xl font-black italic tracking-tight uppercase text-slate-900">
                                {isEditing ? "Modify Node" : "Initialize Entity"}
                            </h2>
                            <p className="text-sm text-muted-foreground font-medium italic opacity-60">
                                Update global registry parameters
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
                                    <input required placeholder="First name" value={formData.first_name}
                                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full h-12 bg-muted/30 border border-transparent rounded-2xl px-4 text-sm font-medium focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:opacity-30" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
                                    <input required placeholder="Last name" value={formData.last_name}
                                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full h-12 bg-muted/30 border border-transparent rounded-2xl px-4 text-sm font-medium focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:opacity-30" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Protocol</label>
                                <input required type="email" placeholder="email@organization.com" value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-12 bg-muted/30 border border-transparent rounded-2xl px-4 text-sm font-medium focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:opacity-30" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Organization</label>
                                <select 
                                    required 
                                    disabled={!!isEditing}
                                    value={formData.company_id}
                                    onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                                    className="w-full h-12 bg-muted/30 border border-transparent rounded-2xl px-4 text-sm font-medium focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-50 appearance-none"
                                >
                                    <option value="">Select Company</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Operational Role</label>
                                <select
                                    required
                                    value={formData.designation}
                                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    className="w-full h-12 bg-muted/30 border border-transparent rounded-2xl px-4 text-sm font-medium focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none"
                                >
                                    <option value="">Select Designation</option>
                                    {DESIGNATIONS.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                disabled={isSubmitting}
                                className="w-full h-14 bg-slate-900 text-white rounded-[20px] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group mt-4 disabled:opacity-50"
                            >
                                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 group-hover:scale-125 transition-transform" />}
                                {isEditing ? "Sync Changes" : "Commit Entity"}
                            </button>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Profile Detail View */}
            <Dialog.Root open={!!viewingEmployee} onOpenChange={(o) => !o && setViewingEmployee(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-sm bg-white rounded-[40px] shadow-2xl p-8 z-[101] border border-white/20 outline-none">
                        <div className="flex justify-center -mt-20 mb-6">
                            <div className="w-24 h-24 rounded-[32px] bg-white p-1 shadow-2xl ring-4 ring-blue-500/5">
                                <div className="w-full h-full rounded-[28px] bg-blue-600 flex items-center justify-center text-white text-3xl font-black italic">
                                    {viewingEmployee?.first_name[0]}{viewingEmployee?.last_name[0]}
                                </div>
                            </div>
                        </div>

                        {viewingEmployee && (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <h2 className="text-2xl font-black italic tracking-tighter text-slate-900">
                                        {viewingEmployee.first_name} {viewingEmployee.last_name}
                                    </h2>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-40">System Node Identifier: #{viewingEmployee.id}</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { label: "Mail Routine", value: viewingEmployee.email, icon: Mail, color: "text-blue-600" },
                                        { label: "Organization", value: viewingEmployee.company_name, icon: Building2, color: "text-purple-600" },
                                        { label: "Operational Role", value: viewingEmployee.designation, icon: Briefcase, color: "text-emerald-600" },
                                        { label: "Registry Date", value: new Date(viewingEmployee.created_at).toLocaleDateString(), icon: Calendar, color: "text-amber-600" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-muted/30 border border-border/50 group hover:border-blue-500/30 transition-all">
                                            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <item.icon className={`w-4 h-4 ${item.color}`} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5 opacity-40">{item.label}</p>
                                                <p className="text-sm font-bold text-slate-800">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => setViewingEmployee(null)}
                                    className="w-full h-14 rounded-3xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                                >
                                    Seal Viewport
                                </button>
                            </div>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
