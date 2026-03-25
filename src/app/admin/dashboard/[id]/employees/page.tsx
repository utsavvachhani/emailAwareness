"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users, Loader2, Mail, Pencil, Trash2,
    RefreshCw, Plus, Check, UserCheck, UserX, Search
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // CSV states
    const [csvPreviewData, setCsvPreviewData] = useState<any[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);


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
            if (!res.ok) throw new Error(data.message);

            toast.success(isEditing ? "Employee updated" : "Employee added");
            setIsModalOpen(false);
            setFormData(emptyForm);
            setIsEditing(null);
            fetchEmployees();
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
        setIsImporting(true);
        let successCount = 0;
        let failCount = 0;

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
                if (res.ok) successCount++;
                else failCount++;
            } catch {
                failCount++;
            }
        }

        toast.success(`Import complete: ${successCount} successful, ${failCount} failed`);
        setIsPreviewOpen(false);
        setCsvPreviewData([]);
        fetchEmployees();
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
        setProcessingId(emp.id);
        try {
            const newStatus = emp.status === "active" ? "inactive" : "active";

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/employees/${emp.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if ((await res.json()).success) {
                toast.success(`Status: ${newStatus}`);
                fetchEmployees();
            }
        } catch {
            toast.error("Status update failed");
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

    const filtered = employees.filter(e =>
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.designation.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="module-header">
                <div>
                    <h1 className="module-title">Employees</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage company employees</p>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search employees..."
                        className="h-9 text-sm rounded-lg border border-input bg-background px-3 outline-none w-56"
                    />

                    <button onClick={fetchEmployees} className="h-9 px-4 rounded-lg border border-border hover:bg-muted text-sm flex items-center gap-2">
                        <RefreshCw className={`w-4 h-4 ${isLoading && "animate-spin"}`} />
                        Refresh
                    </button>

                    <label className="h-9 px-3 rounded-lg border border-dashed border-border hover:bg-muted text-sm flex items-center gap-2 cursor-pointer">
                        <Mail className="w-4 h-4" />
                        Upload CSV
                        <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                    </label>

                    <button
                        onClick={() => { setIsEditing(null); setFormData(emptyForm); setIsModalOpen(true); }}
                        className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add
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
                                            <div className="flex flex-col items-center gap-1">
                                                <button
                                                    onClick={() => toggleStatus(emp)}
                                                    disabled={processingId === emp.id}
                                                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-200 outline-none ${emp.status === "active" ? "bg-emerald-500 shadow-sm" : "bg-slate-300"
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${emp.status === "active" ? "translate-x-5.5" : "translate-x-0.5"
                                                            }`}
                                                    />
                                                </button>
                                                <span className={`text-[9px] font-bold uppercase tracking-tight ${emp.status === "active" ? "text-emerald-600" : "text-slate-500"}`}>
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