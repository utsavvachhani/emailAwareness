"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users, Loader2, Mail, Pencil, Trash2,
    RefreshCw, Plus, Check, UserCheck, UserX, Search,
    AlertTriangle, TrendingUp, ChevronRight
} from "lucide-react";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { toast } from "sonner";
import Link from "next/link";

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

const DESIGNATIONS = [
    "HR",
    "Software Developer",
    "Senior Developer",
    "Junior Developer",
    "Marketing",
    "UT",
    "Developer Options",
    "CEO",
    "Sales",
    "Data Analytics",
    "Data Entry",
    "Finance",
    "Operations",
    "Management",
    "Other"
];


export default function CompanyEmployeesPage() {
    const params = useParams();
    const companyId = params?.id as string;
    const { token } = useAppSelector(s => s.auth);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
    const [sortField, setSortField] = useState<"name" | "designation" | "date">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // CSV states
    const [csvPreviewData, setCsvPreviewData] = useState<any[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // Plan / Limit state
    const [companyPlan, setCompanyPlan] = useState<string>("none");
    const [isPaid, setIsPaid] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [paywallReason, setPaywallReason] = useState<"unpaid" | "limit">("unpaid");

    const PLAN_LIMITS: Record<string, number> = { basic: 30, standard: 75, premium: 120 };
    const planLimit = PLAN_LIMITS[companyPlan] ?? 0;
    const isAtLimit = isPaid && planLimit > 0 && employees.length >= planLimit;
    const canAdd = isPaid && companyPlan !== "none" && !isAtLimit;

    // Pre-check: shows paywall modal if conditions aren't met, returns true if blocked
    const checkPaywall = (): boolean => {
        if (companyPlan === "none" || !isPaid) {
            setPaywallReason("unpaid");
            setShowPaywall(true);
            return true;
        }
        if (isAtLimit) {
            setPaywallReason("limit");
            setShowPaywall(true);
            return true;
        }
        return false;
    };


    const fetchEmployees = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${companyId}/employees`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setEmployees(data.employees);
        } catch {
            toast.error("Failed to load employees");
        } finally {
            setIsLoading(false);
        }
    }, [companyId, token]);

    // Fetch company plan info
    const fetchCompanyPlan = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${companyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success && data.company) {
                setCompanyPlan((data.company.plan || "none").toLowerCase());
                setIsPaid(!!data.company.is_paid);
            }
        } catch { /* silent */ }
    }, [companyId, token]);

    useEffect(() => {
        if (companyId && token) {
            fetchEmployees();
            fetchCompanyPlan();
        }
    }, [companyId, token, fetchEmployees, fetchCompanyPlan]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Pre-check before sending to server
        if (!isEditing && checkPaywall()) return;
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

            // Handle backend enforcement errors specifically
            if (res.status === 403) {
                setIsModalOpen(false);
                if (data.unpaid) {
                    setPaywallReason("unpaid");
                } else if (data.limitReached) {
                    setPaywallReason("limit");
                }
                setShowPaywall(true);
                return;
            }

            if (!res.ok) throw new Error(data.message);

            toast.success(isEditing ? "Employee updated" : "Employee added");
            setIsModalOpen(false);
            setFormData(emptyForm);
            setIsEditing(null);
            fetchEmployees();
            fetchCompanyPlan(); // refresh limit display
        } catch (err: any) {
            toast.error(err.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split("\n");
            const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));

            const items = lines.slice(1).filter(line => line.trim()).map(line => {
                const values = line.split(",").map(v => v.trim());
                const obj: any = {};
                headers.forEach((header, i) => {
                    obj[header] = values[i] || "";
                });
                return obj;
            });

            // Normalize fields if headers are slightly different (e.g., first name -> first_name)
            const normalized = items.map(item => ({
                first_name: item.first_name || item.firstname || item.first || "",
                last_name: item.last_name || item.lastname || item.last || "",
                email: item.email || "",
                designation: item.designation || item.role || item.position || ""
            }));

            setCsvPreviewData(normalized);
            setIsPreviewOpen(true);
        };
        reader.readAsText(file);
        e.target.value = ""; // Reset input
    };

    const importEmployees = async () => {
        // Pre-check before bulk import
        if (checkPaywall()) {
            setIsPreviewOpen(false);
            return;
        }
        setIsImporting(true);
        let successCount = 0;
        let failCount = 0;
        let limitHit = false;

        for (const emp of csvPreviewData) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies/${companyId}/employees`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(emp),
                });
                const data = await res.json();
                if (res.ok) {
                    successCount++;
                } else if (res.status === 403 && data.limitReached) {
                    limitHit = true;
                    break; // stop importing once limit is hit
                } else {
                    failCount++;
                }
            } catch {
                failCount++;
            }
        }

        if (limitHit) {
            toast.warning(`Import stopped: limit reached after ${successCount} employees added.`);
            setPaywallReason("limit");
            setShowPaywall(true);
        } else {
            toast.success(`Import complete: ${successCount} added, ${failCount} failed`);
        }
        setIsPreviewOpen(false);
        setCsvPreviewData([]);
        fetchEmployees();
        fetchCompanyPlan();
        setIsImporting(false);
    };


    const handleDelete = async (id: number) => {
        if (!confirm("Delete this employee?")) return;
        setProcessingId(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/employees/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("Employee deleted");
            fetchEmployees();
        } catch (err: any) {
            toast.error(err.message || "Delete failed");
        } finally {
            setProcessingId(null);
        }
    };


    const toggleStatus = async (emp: Employee) => {
        const originalStatus = emp.status;
        const newStatus = originalStatus === "active" ? "inactive" : "active";
 
        // Optimistic UI Update
        setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: newStatus } : e));
        setProcessingId(emp.id);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/employees/${emp.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });
 
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Update failed");
            
            toast.success(`${emp.first_name}'s status is now ${newStatus}`);
        } catch (err: any) {
            // Revert on error
            setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: originalStatus } : e));
            toast.error(err.message || "Status update failed");
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

    const filtered = employees
        .filter(e => {
            const matchesSearch = `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
                e.email.toLowerCase().includes(search.toLowerCase()) ||
                e.designation.toLowerCase().includes(search.toLowerCase());
            
            const matchesStatus = filterStatus === "all" || e.status === filterStatus;
            
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            let valA: string | number = "";
            let valB: string | number = "";

            if (sortField === "name") {
                valA = `${a.first_name} ${a.last_name}`.toLowerCase();
                valB = `${b.first_name} ${b.last_name}`.toLowerCase();
            } else if (sortField === "designation") {
                valA = (a.designation || "").toLowerCase();
                valB = (b.designation || "").toLowerCase();
            } else {
                valA = new Date(a.created_at).getTime();
                valB = new Date(b.created_at).getTime();
            }

            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });


    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="module-header">
                <div>
                    <h1 className="module-title">Employees</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage company employees</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search employees..."
                            className="h-10 text-sm rounded-xl border border-input bg-background pl-9 pr-3 outline-none w-64 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as any)}
                        className="h-10 px-3 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer min-w-[120px]"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>

                    <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border">
                        <select
                            value={sortField}
                            onChange={e => setSortField(e.target.value as any)}
                            className="h-8 pl-2 pr-1 rounded-lg bg-transparent text-xs font-bold outline-none cursor-pointer"
                        >
                            <option value="name">Sort: Name</option>
                            <option value="designation">Sort: Role</option>
                            <option value="date">Sort: Joined</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-background transition-all border border-transparent hover:border-border"
                            title={sortOrder === "asc" ? "Ascending" : "Descending"}
                        >
                            <TrendingUp className={`w-4 h-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                        </button>
                    </div>


                    <button onClick={fetchEmployees} className="h-9 px-4 rounded-lg border border-border hover:bg-muted text-sm flex items-center gap-2">
                        <RefreshCw className={`w-4 h-4 ${isLoading && "animate-spin"}`} />
                        Refresh
                    </button>

                    <label
                        className={`h-9 px-3 rounded-lg border border-dashed text-sm flex items-center gap-2 transition-colors ${
                            canAdd
                                ? "border-border hover:bg-muted cursor-pointer"
                                : "border-border/30 opacity-40 cursor-not-allowed pointer-events-none"
                        }`}
                    >
                        <Mail className="w-4 h-4" />
                        Upload CSV
                        <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} disabled={!canAdd} />
                    </label>

                    <button
                        onClick={() => {
                            if (!canAdd) {
                                toast.error(isAtLimit
                                    ? `Limit reached (${employees.length}/${planLimit}). Upgrade your plan to add more.`
                                    : "Please subscribe to a plan and complete payment first.");
                                return;
                            }
                            setIsEditing(null); setFormData(emptyForm); setIsModalOpen(true);
                        }}
                        className={`h-9 px-4 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                            canAdd
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed"
                        }`}
                    >
                        <Plus className="w-4 h-4" />
                        {canAdd ? "Add" : "Limit Reached"}
                    </button>
                </div>
            </div>

            {/* ── Stats Strip ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        label: "Total Employees",
                        value: employees.length,
                        icon: Users,
                        color: "text-blue-600",
                        bg: "bg-blue-500/5 border-blue-500/10",
                    },
                    {
                        label: "Active",
                        value: employees.filter(e => e.status === "active").length,
                        icon: UserCheck,
                        color: "text-emerald-600",
                        bg: "bg-emerald-500/5 border-emerald-500/10",
                    },
                    {
                        label: "Inactive",
                        value: employees.filter(e => e.status === "inactive").length,
                        icon: UserX,
                        color: "text-red-500",
                        bg: "bg-red-500/5 border-red-500/10",
                    },
                    {
                        label: search ? "Filtered Results" : "Designations",
                        value: search
                            ? filtered.length
                            : new Set(employees.map(e => e.designation).filter(Boolean)).size,
                        icon: Search,
                        color: "text-purple-600",
                        bg: "bg-purple-500/5 border-purple-500/10",
                    },
                ].map(stat => (
                    <div key={stat.label} className={`rounded-2xl border p-4 flex items-center gap-4 ${stat.bg}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/60 dark:bg-black/20 border border-current/10 shrink-0`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className={`text-2xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Plan limit bar ───────────────────────────────────────── */}
            {isPaid && planLimit > 0 && (
                <div className={`rounded-2xl border p-4 flex items-center gap-5 ${
                    isAtLimit
                        ? "bg-red-500/5 border-red-500/15"
                        : employees.length >= planLimit * 0.8
                        ? "bg-amber-500/5 border-amber-500/15"
                        : "bg-muted/30 border-border/50"
                }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isAtLimit ? "bg-red-500/10" : "bg-muted/40"
                    }`}>
                        <TrendingUp className={`w-5 h-5 ${isAtLimit ? "text-red-500" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-black uppercase tracking-widest">
                                {companyPlan.charAt(0).toUpperCase() + companyPlan.slice(1)} Plan &mdash; Headcount
                            </p>
                            <span className={`text-xs font-black ${
                                isAtLimit ? "text-red-500" : "text-muted-foreground"
                            }`}>
                                {employees.length} / {planLimit}
                            </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                    isAtLimit ? "bg-red-500" :
                                    employees.length >= planLimit * 0.8 ? "bg-amber-500" : "bg-blue-500"
                                }`}
                                style={{ width: `${Math.min((employees.length / planLimit) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                    {isAtLimit && (
                        <Link
                            href={`/admin/dashboard/${companyId}/bills`}
                            className="shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl hover:bg-red-500/20 transition-all whitespace-nowrap"
                        >
                            Upgrade Plan <ChevronRight className="w-3 h-3" />
                        </Link>
                    )}
                    {!isAtLimit && employees.length >= planLimit * 0.8 && (
                        <Link
                            href={`/admin/dashboard/${companyId}/bills`}
                            className="shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl hover:bg-amber-500/20 transition-all whitespace-nowrap"
                        >
                            Upgrade Plan <ChevronRight className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            )}

            {/* ── Limit exceeded full banner ────────────────────────────── */}
            {isAtLimit && (
                <div className="flex items-center gap-5 p-5 bg-red-500/5 border border-red-500/20 rounded-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <p className="font-black text-red-700 text-sm">
                            Employee limit reached ({employees.length}/{planLimit}) for your <span className="uppercase">{companyPlan}</span> plan.
                        </p>
                        <p className="text-xs text-red-500/70 mt-0.5 font-medium">
                            Upgrade to Standard or Premium to onboard more team members.
                        </p>
                    </div>
                    <Link
                        href={`/admin/dashboard/${companyId}/bills`}
                        className="shrink-0 flex items-center gap-2 px-5 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                    >
                        Upgrade Plan <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-muted-foreground">
                        <Users className="w-10 h-10 mb-2 opacity-30" />
                        No employees found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-border bg-muted/30">
                                <tr>
                                    {["Employee", "Email", "Designation", "Status", "Joined", "Actions"].map(h => (
                                        <th key={h} className="text-left px-5 py-3 text-xs text-muted-foreground uppercase">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-border">
                                {filtered.map(emp => (
                                    <tr key={emp.id} className="hover:bg-muted/20">

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                    {emp.first_name[0]}{emp.last_name[0]}
                                                </div>
                                                <p className="text-sm font-medium">
                                                    {emp.first_name} {emp.last_name}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-muted-foreground flex items-center gap-1">
                                            <Mail className="w-3.5 h-3.5" />
                                            {emp.email}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-muted-foreground">
                                            {emp.designation || "—"}
                                        </td>

                                        <td className="px-5 py-4">
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


                                        <td className="px-5 py-4 text-sm text-muted-foreground">
                                            {new Date(emp.created_at).toLocaleDateString("en-IN")}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(emp)} className="p-2 text-blue-600 hover:bg-blue-500/10 rounded">
                                                    <Pencil className="w-4 h-4" />
                                                </button>

                                                <button onClick={() => handleDelete(emp.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded">
                                                    {processingId === emp.id
                                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                                        : <Trash2 className="w-4 h-4" />}
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

            {/* Modal (unchanged logic) */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl w-full max-w-md space-y-4">
                        <h2 className="text-lg font-semibold">{isEditing ? "Edit Employee" : "Add Employee"}</h2>

                        <input required placeholder="First name" value={formData.first_name}
                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                            className="w-full border px-3 py-2 rounded" />

                        <input required placeholder="Last name" value={formData.last_name}
                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                            className="w-full border px-3 py-2 rounded" />

                        <input required type="email" placeholder="Email" value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border px-3 py-2 rounded bg-background outline-none focus:ring-1 focus:ring-blue-500" />

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Designation</label>
                            <select
                                required
                                value={formData.designation}
                                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                className="w-full border px-3 py-2 rounded bg-background outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">Select Designation</option>
                                {DESIGNATIONS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>


                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Paywall & Limit Modal ─────────────────────────────────── */}
            {showPaywall && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Status Icon */}
                        <div className={`h-32 flex items-center justify-center ${
                            paywallReason === "limit" ? "bg-amber-500/10" : "bg-red-500/10"
                        }`}>
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${
                                paywallReason === "limit" ? "bg-amber-500/20 text-amber-600" : "bg-red-500/20 text-red-600"
                            }`}>
                                {paywallReason === "limit" ? (
                                    <TrendingUp className="w-8 h-8" />
                                ) : (
                                    <AlertTriangle className="w-8 h-8" />
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 text-center">
                            <h2 className="text-xl font-black italic tracking-tight uppercase mb-3">
                                {paywallReason === "limit" ? "Limit Reached" : "Payment Required"}
                            </h2>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-8 px-2 font-medium">
                                {paywallReason === "limit"
                                    ? `On your ${companyPlan.toUpperCase()} plan, you can add up to ${planLimit} employees. Please upgrade to onboard more team members.`
                                    : "You have not subscribed to a paid plan. Please select a plan and complete your payment to unlock employee management."}
                            </p>

                            <div className="space-y-3">
                                <Link
                                    href={`/admin/dashboard/${companyId}/bills`}
                                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl ${
                                        paywallReason === "limit"
                                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                                            : "bg-red-600 text-white hover:bg-red-700 shadow-red-500/20"
                                    }`}
                                >
                                    {paywallReason === "limit" ? "Upgrade My Plan" : "Go to Billing"}
                                    <ChevronRight className="w-4 h-4" />
                                </Link>

                                <button
                                    onClick={() => setShowPaywall(false)}
                                    className="w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CSV Import Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60] p-4">
                    <div className="bg-card p-6 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-semibold">CSV Preview</h2>
                                <p className="text-sm text-muted-foreground">Verify the data before importing</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setIsPreviewOpen(false); setCsvPreviewData([]); }}
                                    className="px-4 py-2 border rounded hover:bg-muted text-sm"
                                    disabled={isImporting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={importEmployees}
                                    disabled={isImporting}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded flex items-center gap-2 text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                >
                                    {isImporting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    Approve and Save
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto border border-border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left border-b border-border">First Name</th>
                                        <th className="px-4 py-2 text-left border-b border-border">Last Name</th>
                                        <th className="px-4 py-2 text-left border-b border-border">Email</th>
                                        <th className="px-4 py-2 text-left border-b border-border">Designation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {csvPreviewData.map((row, idx) => (
                                        <tr key={idx} className="border-b border-border/50 hover:bg-muted/30">
                                            <td className="px-4 py-2">{row.first_name}</td>
                                            <td className="px-4 py-2">{row.last_name}</td>
                                            <td className="px-4 py-2">{row.email}</td>
                                            <td className="px-4 py-2">{row.designation}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}