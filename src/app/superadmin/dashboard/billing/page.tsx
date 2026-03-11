"use client";

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Download,
  Plus,
  MoreHorizontal
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mrrData = [
  { month: "Aug", mrr: 28400 },
  { month: "Sep", mrr: 31200 },
  { month: "Oct", mrr: 35800 },
  { month: "Nov", mrr: 39400 },
  { month: "Dec", mrr: 43600 },
  { month: "Jan", mrr: 48200 },
];

const subscriptions = [
  {
    id: 1,
    company: "Acme Corporation",
    plan: "Enterprise",
    amount: 2499,
    status: "Active",
    nextBilling: "Feb 1, 2026",
    employees: 450,
  },
  {
    id: 2,
    company: "SecureBank Ltd",
    plan: "Enterprise",
    amount: 2499,
    status: "Active",
    nextBilling: "Feb 5, 2026",
    employees: 890,
  },
  {
    id: 3,
    company: "GlobalTech Industries",
    plan: "Business",
    amount: 999,
    status: "Active",
    nextBilling: "Feb 10, 2026",
    employees: 230,
  },
  {
    id: 4,
    company: "HealthCare Plus",
    plan: "Business",
    amount: 999,
    status: "Overdue",
    nextBilling: "Jan 15, 2026",
    employees: 156,
  },
  {
    id: 5,
    company: "RetailMax",
    plan: "Starter",
    amount: 299,
    status: "Active",
    nextBilling: "Feb 8, 2026",
    employees: 78,
  },
];

const plans = [
  { name: "Starter", price: 299, employees: "Up to 100", features: ["Weekly training", "Basic reports", "Email support"] },
  { name: "Business", price: 999, employees: "Up to 500", features: ["All Starter features", "Advanced analytics", "Phishing simulation", "Priority support"] },
  { name: "Enterprise", price: 2499, employees: "Unlimited", features: ["All Business features", "Custom branding", "API access", "Dedicated CSM"] },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Billing & Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage pricing plans, subscriptions, and revenue
          </p>
        </div>
        <button className="inline-flex items-center gap-2 h-9 px-4 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors">
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">MRR</p>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">$48,200</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +10.5% vs last month
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">54</p>
          <p className="text-xs text-muted-foreground mt-1">+6 new this month</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Churn Rate</p>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">2.1%</p>
          <p className="text-xs text-muted-foreground mt-1">Industry avg: 5%</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">2</p>
          <p className="text-xs text-muted-foreground mt-1">$1,998 outstanding</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* MRR Chart */}
        <div className="col-span-2 border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-sm font-medium">Monthly Recurring Revenue</h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mrrData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value) => `$${value / 1000}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "MRR"]}
                />
                <Line
                  type="monotone"
                  dataKey="mrr"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(var(--foreground))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-sm font-medium">Pricing Plans</h3>
          </div>
          <div className="p-4 space-y-4">
            {plans.map((plan) => (
              <div key={plan.name} className="border border-border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{plan.name}</span>
                  <span className="font-mono font-semibold">${plan.price}/mo</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{plan.employees} employees</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="border border-border rounded-lg">
        <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
          <h3 className="text-sm font-medium">Active Subscriptions</h3>
          <button className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Download className="h-3 w-3" />
            Export
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Employees</th>
              <th>Status</th>
              <th>Next Billing</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td className="font-medium">{sub.company}</td>
                <td>
                  <span className="status-badge status-active">{sub.plan}</span>
                </td>
                <td className="font-mono">${sub.amount}</td>
                <td className="font-mono">{sub.employees}</td>
                <td>
                  <span className={`status-badge ${sub.status === "Active" ? "status-active" : "bg-foreground text-background"
                    }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="text-muted-foreground">{sub.nextBilling}</td>
                <td>
                  <button className="p-1 hover:bg-secondary rounded transition-colors">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
