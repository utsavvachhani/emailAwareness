"use client";

import { CreditCard, Download, Search, Filter, Loader2, FileText, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

const mockBills = [
    { id: "INV-2026-001", company: "Acme Corp", amount: 45000, date: "2026-03-15", status: "Paid", items: 250 },
    { id: "INV-2026-002", company: "Global Tech", amount: 12500, date: "2026-03-10", status: "Pending", items: 100 },
    { id: "INV-2026-003", company: "Skyline Inc", amount: 75000, date: "2026-03-05", status: "Overdue", items: 500 },
    { id: "INV-2026-004", company: "Cyber Soft", amount: 18000, date: "2026-02-28", status: "Paid", items: 150 },
];

export default function AdminBillsPage() {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Billing & Invoices</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage subscriptions and download invoices for all companies.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Download className="h-4 w-4" />
                    Download All Report
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "Total Revenue", value: "₹1,50,500", icon: CreditCard, color: "blue" },
                    { label: "Pending Payments", value: "₹12,500", icon: Clock, color: "yellow" },
                    { label: "Unpaid/Overdue", value: "₹75,000", icon: FileText, color: "red" },
                ].map((s) => (
                    <div key={s.label} className="bg-card border border-border p-5 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</span>
                            <s.icon className={`h-4 w-4 text-${s.color}-500`} />
                        </div>
                        <p className="text-2xl font-bold">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-xl">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                        placeholder="Search invoices or companies..." 
                        className="w-full bg-muted/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                        <Filter className="h-4 w-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-left">Invoice ID</th>
                                <th className="px-6 py-4 text-left">Company</th>
                                <th className="px-6 py-4 text-left">Amount</th>
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {mockBills.map((bill) => (
                                <tr key={bill.id} className="hover:bg-muted/20 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-mono font-medium text-blue-600">{bill.id}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="font-medium">{bill.company}</div>
                                        <div className="text-[10px] text-muted-foreground">{bill.items} Licenses</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold">₹{bill.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(bill.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter border ${
                                            bill.status === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                            bill.status === "Pending" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                                            "bg-red-500/10 text-red-500 border-red-500/20"
                                        }`}>
                                            {bill.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-blue-500/10 text-blue-600 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                            <Download className="h-4 w-4" />
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
