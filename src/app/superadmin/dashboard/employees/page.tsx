"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users, Search, Download, RefreshCw, FileText, ChevronLeft, ChevronRight,
    TrendingDown, ShieldCheck, ExternalLink, Trash2, Loader2, Building2, Mail,
    X, Info, Calendar, Briefcase
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
    status: string;
    company_id: number;
    company_name: string;
    created_at: string;
}

interface Company {
    id: number;
    name: string;
}

export default function SuperadminEmployeesPage() {
    const token = useAppSelector(s => s.auth.token);
    
    // Data states
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
    
    // Filter/Search states
    const [search, setSearch] = useState("");
    const [companyFilter, setCompanyFilter] = useState<string>("all");
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
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id: number) => {
        setIsDeleting(id);
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
            toast.error(err.message || "Failed to delete employee");
        } finally {
            setIsDeleting(null);
        }
    };

    // Filtered & Sorted Logic
    const filtered = employees.filter(e => {
        const fullName = `${e.first_name || ""} ${e.last_name || ""}`.toLowerCase();
        const matchesSearch = fullName.includes(search.toLowerCase()) || 
                             (e.email || "").toLowerCase().includes(search.toLowerCase());
        const matchesCompany = companyFilter === "all" || e.company_id.toString() === companyFilter;
        return matchesSearch && matchesCompany;
    }).sort((a, b) => {

        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const exportToCSV = () => {
        const headers = ["ID", "Name", "Email", "Designation", "Company", "Status", "Joined"];
        const rows = filtered.map(e => [
            e.id, `${e.first_name} ${e.last_name}`, e.email, e.designation, e.company_name, e.status, new Date(e.created_at).toLocaleDateString()
        ]);
        
        const content = [headers, ...rows].map(r => r.join(",")).join("\n");
        const blob = new Blob([content], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `employees_export_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        toast.success("CSV exported successfully");
    };

    return (
        <div className="space-y-6">
            {/* Custom Modal for Employee Profile */}
            <Dialog.Root open={!!viewingEmployee} onOpenChange={(o) => !o && setViewingEmployee(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white rounded-3xl shadow-2xl p-8 z-[101] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 outline-none">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-2xl">
                                <Info className="w-8 h-8" />
                            </div>
                            <Dialog.Close className="p-2 hover:bg-muted rounded-xl transition-all">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </Dialog.Close>
                        </div>
                        
                        {viewingEmployee && (
                            <div className="space-y-6 text-slate-600">
                                <div>
                                    <h2 className="text-2xl font-normal text-slate-900 tracking-tight">
                                        {viewingEmployee.first_name} {viewingEmployee.last_name}
                                    </h2>
                                    <p className="text-sm font-normal text-muted-foreground mt-1">Global System Identifier: #{viewingEmployee.id}</p>
                                </div>

                                <div className="grid gap-4">
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50">
                                        <Mail className="w-4 h-4 opacity-40" />
                                        <span className="text-sm font-normal">{viewingEmployee.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50">
                                        <Building2 className="w-4 h-4 opacity-40 text-purple-500" />
                                        <span className="text-sm font-normal text-purple-600">{viewingEmployee.company_name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50">
                                        <Briefcase className="w-4 h-4 opacity-40 text-blue-500" />
                                        <span className="text-sm font-normal">{viewingEmployee.designation}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50">
                                        <Calendar className="w-4 h-4 opacity-40" />
                                        <span className="text-sm font-normal">Joined: {new Date(viewingEmployee.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        onClick={() => setViewingEmployee(null)}
                                        className="flex-1 h-12 rounded-2xl bg-slate-900 text-white text-sm font-normal hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                                    >
                                        Close Window
                                    </button>
                                </div>
                            </div>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            <div className="module-header no-print">
                <div>
                    <h1 className="module-title font-normal italic tracking-tight uppercase">Global Employee Insight</h1>
                    <p className="text-sm text-muted-foreground mt-1 tracking-tight font-normal">System-wide monitoring across all organizations</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="p-2.5 rounded-xl border border-border hover:bg-muted transition-all bg-card">
                        <RefreshCw className={`h-4.5 w-4.5 ${isLoading && "animate-spin"}`} />
                    </button>
                    <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-sm">
                        <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-1.5 hover:bg-muted rounded-lg text-sm font-normal transition-all">
                            <Download className="h-4 w-4" /> CSV
                        </button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-1.5 hover:bg-muted rounded-lg text-sm font-normal transition-all">
                            <FileText className="h-4 w-4" /> PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
                {[
                    { label: "Global Headcount", value: employees.length.toLocaleString(), icon: Users, color: "text-blue-500" },
                    { label: "Active Companies", value: companies.length, icon: Building2, color: "text-purple-500" },
                    { label: "Admin Accounts", value: new Set(employees.map(e => e.company_id)).size, icon: ShieldCheck, color: "text-emerald-500" },
                    { label: "Stability Rate", value: "100%", icon: TrendingDown, color: "text-blue-500" }
                ].map((stat, i) => (
                    <div key={i} className="bg-card border border-border p-4 rounded-3xl relative overflow-hidden group shadow-sm transition-all hover:border-blue-500/30">
                        <div className="flex items-center justify-between relative z-10">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                            <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                        </div>
                        <p className="text-3xl font-bold mt-2 tracking-tighter italic">{stat.value}</p>

                        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-3 items-center justify-between bg-muted/20 p-4 rounded-3xl border border-border shadow-inner no-print">
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                        <input
                            type="text"
                            placeholder="Find anyone by name or email..."
                            className="w-full h-11 pl-10 pr-4 bg-background border border-border rounded-2xl text-sm font-normal outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <select
                        value={companyFilter}
                        onChange={e => { setCompanyFilter(e.target.value); setCurrentPage(1); }}
                        className="h-11 px-4 border border-border rounded-2xl bg-background text-sm font-normal outline-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm min-w-[180px]"
                    >
                        <option value="all">🏢 All Companies</option>
                        {companies.map(c => (
                            <option key={c.id} value={c.id.toString()}>{c.name}</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-2 bg-background border border-border rounded-2xl h-11 px-3 shadow-sm">
                        <span className="text-[10px] font-normal uppercase text-muted-foreground whitespace-nowrap">Show:</span>
                        <select
                            value={itemsPerPage}
                            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="h-8 bg-transparent text-sm font-normal outline-none cursor-pointer"
                        >
                            <option value={10}>10 Entities</option>
                            <option value={20}>20 Entities</option>
                            <option value={30}>30 Entities</option>
                            <option value={50}>50 Entities</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-background border border-border rounded-2xl shadow-sm">
                    <select
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value as any)}
                        className="h-9 pl-3 pr-1 bg-transparent text-[10px] font-normal uppercase tracking-widest outline-none cursor-pointer"
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl shadow-blue-500/5 relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-50 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                {["Employee", "Company", "Email", "Role", "Status", "Joined", "Quick Actions"].map(h => (
                                    <th key={h} className="px-6 py-4 text-[12px] uppercase tracking-widest font-bold text-muted-foreground">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginated.length > 0 ? (
                                paginated.map(emp => (
                                    <tr key={emp.id} className="hover:bg-muted/5 transition-all group border-l-2 border-l-transparent hover:border-l-blue-500">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-600 flex items-center justify-center text-sm font-normal">
                                                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-normal text-slate-900">{emp.first_name} {emp.last_name}</p>
                                                    <p className="text-[10px] font-normal text-muted-foreground tracking-tight opacity-60">ID: #{emp.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-normal text-purple-600/80">{emp.company_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[13px] font-normal text-muted-foreground">{emp.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-normal text-slate-500 tracking-tight">{emp.designation}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-normal px-2 py-0.5 rounded-full uppercase tracking-tighter border ${
                                                emp.status === "active" 
                                                ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10" 
                                                : "bg-slate-500/5 text-slate-500 border-slate-500/10"
                                            }`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[13px] font-normal text-muted-foreground">
                                                {new Date(emp.created_at).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => setViewingEmployee(emp)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-normal transition-all"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    View
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(emp.id)}
                                                    disabled={isDeleting === emp.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-[11px] font-normal transition-all disabled:opacity-50"
                                                >
                                                    {isDeleting === emp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                    Remove
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-muted-foreground font-normal uppercase tracking-widest text-[10px]">
                                        No employee entities found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 bg-muted/10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 no-print">
                    <p className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest">
                        Total Records: <span className="text-slate-900">{filtered.length} Entities</span>
                    </p>
                    
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2.5 rounded-2xl border border-border hover:bg-muted transition-all disabled:opacity-30 bg-card"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-2xl font-normal text-xs transition-all ${
                                        currentPage === i + 1 
                                        ? "bg-slate-900 text-white shadow-xl" 
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
                            className="p-2.5 rounded-2xl border border-border hover:bg-muted transition-all disabled:opacity-30 bg-card"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Loader2 = ({ className }: { className?: string }) => (
    <RefreshCw className={`${className} animate-spin`} />
);
