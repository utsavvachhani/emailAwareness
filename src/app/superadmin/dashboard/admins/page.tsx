"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Loader2, User, Mail, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/redux/hooks";

interface Admin {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
    status: string;
    is_verified: boolean;
    created_at: string;
}

export default function AdminApprovalsPage() {
    const token = useAppSelector(s => s.auth.token);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [allAdmins, setAllAdmins] = useState<Admin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [tab, setTab] = useState<"pending" | "all">("pending");

    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            const [pendingRes, allRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/admins/pending`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/admins/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                }),
            ]);
            const [pd, ad] = await Promise.all([pendingRes.json(), allRes.json()]);
            if (pd.success) setAdmins(pd.admins);
            if (ad.success) setAllAdmins(ad.admins);
        } catch {
            toast.error("Failed to load admin data");
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

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            pending:  "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
            active:   "bg-green-500/10 text-green-600 border-green-500/20",
            rejected: "bg-red-500/10 text-red-500 border-red-500/20",
        };
        return (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${styles[status] || ""}`}>
                {status === "pending" && <Clock className="w-3 h-3" />}
                {status === "active"  && <CheckCircle className="w-3 h-3" />}
                {status === "rejected" && <XCircle className="w-3 h-3" />}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const displayList = tab === "pending" ? admins : allAdmins;

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

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
                {(["pending", "all"] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                        {t === "pending" ? `Pending Approval (${admins.length})` : `All Admins (${allAdmins.length})`}
                    </button>
                ))}
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
                                {["Name", "Email", "Mobile", "Status", "Registered", tab === "pending" ? "Action" : ""].map(h => (
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
                                    {tab !== "pending" && <td />}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
