"use client";

import { Users, Search, Filter, Loader2, Building2, UserCheck, Shield, Mail } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const mockGlobalEmployees = [
    { name: "John Doe", company: "Acme Corp", email: "john@acme.com", role: "Engineering", status: "Active" },
    { name: "Jane Smith", company: "Global Tech", email: "jane@global.com", role: "Sales", status: "Inactive" },
    { name: "Sumanth Reddy", company: "Skyline Inc", email: "sumanth@skyline.com", role: "Marketing", status: "Active" },
    { name: "Alice Wagner", company: "Cyber Soft", email: "alice@cybersoft.com", role: "HR", status: "Active" },
];

import { useParams } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";

export default function CompanyEmployeesPage() {
    const params = useParams();
    const id = params?.id as string;
    const { token } = useAppSelector(s => s.auth);
    const [isLoading, setIsLoading] = useState(false);
    
    // In a real app, we would fetch employees for the specific company ID here.
    // For now, we'll keep the mock data but label it correctly for the selected company.

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                        Workforce Directory <span className="text-blue-600 opacity-60">/ {id}</span>
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground mt-2 italic opacity-60">Managing active personnel and training deployment for this entity.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                        {mockGlobalEmployees.length} Total Personnel
                    </span>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Workforce", value: "1,248", icon: Users, color: "blue" },
                    { label: "Active Nodes", value: "1,102", icon: UserCheck, color: "emerald" },
                    { label: "Critical Risk", value: "12", icon: Shield, color: "red" },
                    { label: "Unassigned", value: "34", icon: Mail, color: "amber" },
                ].map((s) => (
                    <div key={s.label} className="bg-card border border-border p-5 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{s.label}</span>
                            <s.icon className={`h-4 w-4 text-${s.color}-500`} />
                        </div>
                        <p className="text-2xl font-black">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-2xl shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
                    <input 
                        placeholder="Search by name, email or company..." 
                        className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all focus:bg-white"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors">
                        <Filter className="h-4 w-4 opacity-40" />
                        Apply Filters
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-lg">
                        Export Dataset
                    </button>
                </div>
            </div>

            {/* Directory Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-muted/30 border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-5 text-left">Identity</th>
                                <th className="px-6 py-5 text-left">Associated Entity</th>
                                <th className="px-6 py-5 text-left">Operational Role</th>
                                <th className="px-6 py-5 text-left">Status</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {mockGlobalEmployees.map((emp) => (
                                <tr key={emp.email} className="hover:bg-blue-500/[0.02] transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-border flex items-center justify-center text-[10px] font-black group-hover:scale-105 transition-transform">
                                                {emp.name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black italic tracking-tight">{emp.name}</div>
                                                <div className="text-[10px] text-muted-foreground lowercase opacity-60 group-hover:opacity-100 transition-opacity">{emp.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-sm font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                                            <Building2 className="w-4 h-4 text-blue-500" />
                                            {emp.company}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-muted/60 px-2.5 py-1 rounded-lg text-muted-foreground border border-border/50">
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter border ${
                                            emp.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                        }`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-blue-500 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Profile →
                                        </button>
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
