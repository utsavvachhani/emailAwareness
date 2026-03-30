"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState, use } from "react";
import {
    Users, Building2, CreditCard, Shield, 
    TrendingUp, ArrowRight, Loader2, Globe, Award, Plus, ArrowLeft, Mail, BookOpen, RefreshCw, Phone, CheckCircle, XCircle, Trash2
} from "lucide-react";
import { superadminGetAdminCompanies } from "@/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function SuperadminAdminCompaniesPage() {
    const { id: adminId } = useParams();
    const token = useAppSelector(s => s.auth.token);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const res = await superadminGetAdminCompanies(adminId as string);
            if (res.data.success) {
                setCompanies(res.data.companies);
            }
        } catch (err) {
            console.error("Superadmin fetch admin companies error:", err);
            toast.error("Failed to load managed entities");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && adminId) fetchCompanies();
    }, [token, adminId]);

    const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
        setProcessingId(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/companies/${id}/status`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ status }),
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success(`Entity ${status}`);
            fetchCompanies();
        } catch (err: any) { toast.error(err.message || "Update failed"); }
        finally { setProcessingId(null); }
    };

    return (
        <div className="space-y-10 max-w-[1400px] mx-auto pb-12">
            {/* Contextual Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/80">
                <div className="space-y-5">
                    <div className="flex items-center gap-3">
                         <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 border border-white/10">
                             <Building2 className="w-7 h-7 text-white" />
                         </div>
                         <div>
                             <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                                 Managed <span className="text-blue-600">Entities</span>
                             </h1>
                             <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
                                 Showing companies assigned to Admin #[<span className="text-foreground mono uppercase text-xs">{adminId}</span>]
                             </p>
                         </div>
                    </div>
                </div>
                <button 
                    onClick={fetchCompanies}
                    disabled={loading}
                    className="flex items-center gap-2 h-11 px-6 rounded-xl border border-border hover:bg-muted transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Sync Records
                </button>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stat-card border-blue-600/10 bg-blue-600/[0.01]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Entity Portfolio</p>
                    <p className="text-3xl font-black tracking-tighter">{companies.length} Companies</p>
                    <div className="mt-3 flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-blue-500" />
                         <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Active Monitoring</span>
                    </div>
                </div>
                <div className="stat-card border-purple-600/10 bg-purple-600/[0.01]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Total Workforce</p>
                    <p className="text-3xl font-black tracking-tighter">{companies.reduce((acc, c) => acc + (c.num_employees || 0), 0)} Staff</p>
                    <div className="mt-3 flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-purple-500" />
                         <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Global Headcount</span>
                    </div>
                </div>
                <div className="stat-card border-emerald-600/10 bg-emerald-600/[0.01]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Portfolio Tier</p>
                    <p className="text-3xl font-black tracking-tighter capitalize">{companies.filter(c => c.plan === 'enterprise').length} Ent.</p>
                    <div className="mt-3 flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500" />
                         <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Enterprise Share</span>
                    </div>
                </div>
            </div>

            {/* Entities Table */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex h-[30vh] items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : companies.length === 0 ? (
                    <div className="flex h-[30vh] flex-col items-center justify-center text-center opacity-30 select-none">
                        <Building2 className="w-16 h-16 mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest">No entities assigned to this admin</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Entity Portfolio</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Staffing</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Subscription</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Compliance</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Oversight</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {companies.map((company) => (
                                    <tr key={company.id} className="hover:bg-muted/10 transition-colors group cursor-default">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center font-black group-hover:scale-105 transition-transform duration-300">
                                                    {company.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm">{company.name}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Mail className="w-3 h-3 text-muted-foreground" />
                                                        <p className="text-[10px] text-muted-foreground font-medium">{company.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-3.5 h-3.5 text-blue-600" />
                                                    <span className="text-sm font-black tracking-tight">{company.num_employees} Users</span>
                                                </div>
                                                <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, (company.num_employees / 50) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${company.plan === 'enterprise' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                                                <span className="text-xs font-black uppercase tracking-widest">{company.plan || 'Free'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest whitespace-nowrap ${
                                                company.status === 'approved' 
                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                                : company.status === 'rejected'
                                                ? 'bg-red-500/10 text-red-600 border-red-500/20'
                                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                            }`}>
                                                {company.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <Link 
                                                    href={`/superadmin/dashboard/admins/${adminId}/companies/${company.company_id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg shadow-black/10"
                                                >
                                                    Oversight <ArrowRight className="w-3 h-3" />
                                                </Link>
                                                {company.status === 'pending' ? (
                                                     <div className="flex items-center gap-1.5">
                                                        <button 
                                                            onClick={() => handleStatusUpdate(company.id, 'approved')}
                                                            disabled={processingId === company.id}
                                                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500 transition-colors hover:text-white"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusUpdate(company.id, 'rejected')}
                                                            disabled={processingId === company.id}
                                                            className="p-2 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500 transition-colors hover:text-white"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                     </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(company.id, company.status === 'approved' ? 'rejected' : 'approved')}
                                                        disabled={processingId === company.id}
                                                        className={`p-2 rounded-lg border transition-colors ${
                                                            company.status === 'approved' 
                                                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500 hover:text-white'
                                                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                                        }`}
                                                        title={company.status === 'approved' ? 'Revoke Approval' : 'Grant Approval'}
                                                    >
                                                        {company.status === 'approved' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                    </button>
                                                )}
                                            </div>
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
