"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState } from "react";
import {
    Users, Shield, Loader2, Search, Filter, RefreshCcw, Download, UserPlus, MoreVertical, Edit2, Trash2, CheckCircle2, XCircle, Mail
} from "lucide-react";
import { superadminGetCompanyEmployees, superadminGetCompanyDetails } from "@/api";
import { useParams } from "next/navigation";

export default function SuperadminCompanyEmployeesReview() {
    const { id: adminId, companyId } = useParams();
    const { token } = useAppSelector(s => s.auth);
    const [employees, setEmployees] = useState<any[]>([]);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empRes, detailRes] = await Promise.all([
                superadminGetCompanyEmployees(companyId as string),
                superadminGetCompanyDetails(companyId as string)
            ]);

            if (empRes.data.success && detailRes.data.success) {
                setEmployees(empRes.data.employees);
                setCompany(detailRes.data.company);
            }
        } catch (err) {
            console.error("Superadmin company employees fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && companyId) fetchData();
    }, [token, companyId]);

    const activeCount = employees.filter(e => (e.status || 'active').toLowerCase() === 'active').length;
    const inactiveCount = employees.length - activeCount;
    const uniqueDesignations = new Set(employees.map(e => e.designation || e.department || 'General')).size;

    const filteredEmployees = employees.filter(emp =>
        `${emp.first_name} ${emp.last_name} ${emp.email} ${emp.designation || emp.department}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    const limit = company?.plan === 'basic' ? 30 : company?.plan === 'standard' ? 100 : 500;
    const percentage = Math.min((employees.length / limit) * 100, 100);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter italic uppercase">Employees</h1>
                    <p className="text-sm text-muted-foreground font-medium">Manage company employees oversight for {company?.name}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            className="bg-card border border-border rounded-xl pl-10 pr-4 h-11 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className="h-11 rounded-xl border border-border bg-card px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                    <button onClick={fetchData} className="p-3 rounded-xl border border-border bg-card hover:bg-secondary transition-all">
                        <RefreshCcw className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="flex items-center gap-2 h-11 px-6 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                        <Download className="w-4 h-4" /> Export DATA
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Employees", value: employees.length, color: "blue", icon: Users },
                    { label: "Active", value: activeCount, color: "emerald", icon: CheckCircle2 },
                    { label: "Inactive", value: inactiveCount, color: "red", icon: XCircle },
                    { label: "Designations", value: uniqueDesignations, color: "purple", icon: Search },
                ].map((s) => (
                    <div key={s.label} className="bg-card border border-border rounded-3xl p-6 flex items-center gap-5 shadow-sm">
                        <div className={`p-4 rounded-2xl bg-${s.color}-500/10 border border-${s.color}-500/20`}>
                            <s.icon className={`w-6 h-6 text-${s.color}-600`} />
                        </div>
                        <div>
                            <p className="text-3xl font-black italic tracking-tighter">{s.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Headcount Bar */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest italic">{company?.plan} Plan — Headcount</h3>
                    </div>
                    <span className="text-xs font-black italic">{employees.length} / {limit}</span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-border">
                    <div 
                        className="h-full bg-blue-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Employee Table */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border bg-secondary/30">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Employee</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Email</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Designation</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Joined</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredEmployees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-secondary/20 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 font-black text-xs uppercase">
                                                {emp.first_name[0]}{emp.last_name[0]}
                                            </div>
                                            <p className="font-black text-sm uppercase italic tracking-tight">{emp.first_name} {emp.last_name}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="text-xs font-medium">{emp.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-foreground/70 uppercase tracking-tight">{emp.designation || emp.department || 'Management'}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col items-center w-fit gap-1">
                                            <div className="w-12 h-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center px-1">
                                                <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40 translate-x-6" />
                                            </div>
                                            <span className="text-[8px] font-black uppercase text-emerald-600 tracking-tighter">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs font-black text-muted-foreground italic">{new Date(emp.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-border">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button className="p-2 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-border">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function TrendingUp(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
        </svg>
    )
}
