"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Loader2, User, Mail, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/redux/hooks";

import { Trash2 } from "lucide-react";

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
}

export default function AdminApprovalsPage() {
    const token = useAppSelector(s => s.auth.token);
    const [admins, setAdmins] = useState<UserData[]>([]);
    const [allAdmins, setAllAdmins] = useState<UserData[]>([]);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [tab, setTab] = useState<"pending" | "all" | "users">("pending");

    // Filter/Sort States
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [sortField, setSortField] = useState<"name" | "date">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAdmins(); }, [token]);

    const handleAction = async (id: number, action: "approve" | "reject") => {
        setProcessingId(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/admins/${id}/${action}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success(`Admin ${action === "approve" ? "approved" : "rejected"} successfully!`);
            fetchAdmins();
        } catch (err: any) {
            toast.error(err.message || "Action failed");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: number, type: "admin" | "user") => {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
        setProcessingId(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/${type}s/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success(`${type === "admin" ? "Admin" : "User"} deleted successfully!`);
            fetchAdmins();
        } catch (err: any) {
            toast.error(err.message || "Delete failed");
        } finally {
            setProcessingId(null);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            pending:  "bg-blue-500/10 text-blue-600 border-blue-500/20",
            active:   "bg-green-500/10 text-green-600 border-green-500/20",
            rejected: "bg-red-500/10 text-red-500 border-red-500/20",
        };
        return (
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${styles[status] || ""}`}>
                {status === "pending" && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                {status === "active"  && <span className="w-1.5 h-1.5 rounded-full bg-green-600" />}
                {status === "rejected" && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const displayList = (tab === "pending" ? admins : tab === "all" ? allAdmins : allUsers)
        .filter(admin => {
            const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase();
            const matchesSearch = fullName.includes(search.toLowerCase()) || 
                                 admin.email.toLowerCase().includes(search.toLowerCase());
            
            const matchesStatus = filterStatus === "all" || admin.status === filterStatus;
            
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            let valA: string | number = "";
            let valB: string | number = "";
            
            if (sortField === "name") {
                valA = `${a.firstName} ${a.lastName}`.toLowerCase();
                valB = `${b.firstName} ${b.lastName}`.toLowerCase();
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
            <div className="module-header">
                <div>
                    <h1 className="module-title">Admin Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">Review and approve admin account requests</p>
                </div>
                <div className="flex items-center gap-3">
                    {admins.length > 0 && (
                        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-1.5">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-600">{admins.length} pending</span>
                        </div>
                    )}
                    <button onClick={fetchAdmins} disabled={isLoading} className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20 p-4 rounded-xl border border-border">
                <div className="flex gap-2 items-center w-full sm:w-auto">
                    {(["pending", "all", "users"] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setSearch(""); }}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                                tab === t 
                                ? "bg-foreground text-background shadow-lg" 
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                        >
                            {t === "pending" ? `Pending (${admins.length})` : t === "all" ? `Admins (${allAdmins.length})` : `Users (${allUsers.length})`}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="h-9 text-sm rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-blue-500/20 w-48 transition-all"
                    />

                    {tab !== "users" && (
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="h-9 px-2 rounded-lg border border-input bg-background text-xs font-medium outline-none"
                        >
                            <option value="all">Status: All</option>
                            <option value="active">Status: Active</option>
                            <option value="pending">Status: Pending</option>
                            <option value="rejected">Status: Rejected</option>
                        </select>
                    )}

                    <div className="flex items-center gap-1 bg-background border border-input rounded-lg h-9 px-1">
                        <select
                            value={sortField}
                            onChange={e => setSortField(e.target.value as any)}
                            className="h-7 pl-1 text-[10px] font-black uppercase tracking-tight bg-transparent outline-none cursor-pointer"
                        >
                            <option value="name">Sort: Name</option>
                            <option value="date">Sort: Joined</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}
                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-all"
                        >
                            <RefreshCw className={`h-3 w-3 ${sortOrder === "desc" ? "rotate-180" : ""} transition-transform`} />
                        </button>
                    </div>
                </div>
            </div>


            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : displayList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <User className="w-12 h-12 mb-3 opacity-30" />
                        <p>{tab === "pending" ? "No pending admin requests" : "No admins found"}</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-border bg-muted/30">
                            <tr>
                                {["Name", "Email", "Mobile", "Status", "Registered", "Action"].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {displayList.map(admin => (
                                <tr key={admin.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-semibold text-blue-600">
                                                {admin.firstName[0]}{admin.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{admin.firstName} {admin.lastName}</p>
                                                {!admin.is_verified && <span className="text-xs text-yellow-600">Email not verified</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="w-4 h-4" />
                                            {admin.email}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-muted-foreground">{admin.mobile || "—"}</td>
                                    <td className="px-5 py-4"><StatusBadge status={admin.status} /></td>
                                    <td className="px-5 py-4 text-sm text-muted-foreground">
                                        {new Date(admin.created_at).toLocaleDateString("en-IN")}
                                    </td>
                                    {tab === "pending" && (
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleAction(admin.id, "approve")}
                                                    disabled={processingId === admin.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20 transition-all text-sm font-medium disabled:opacity-50"
                                                >
                                                    {processingId === admin.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(admin.id, "reject")}
                                                    disabled={processingId === admin.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-medium disabled:opacity-50"
                                                >
                                                    {processingId === admin.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                    {tab === "all" && (
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => handleDelete(admin.id, "admin")}
                                                disabled={processingId === admin.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-medium disabled:opacity-50"
                                            >
                                                {processingId === admin.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                    {tab === "users" && (
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => handleDelete(admin.id, "user")}
                                                disabled={processingId === admin.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-medium disabled:opacity-50"
                                            >
                                                {processingId === admin.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
