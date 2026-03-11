"use client";

import {
  Building2,
  Users,
  Mail,
  Eye,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { KPICard } from "@/components/superadmin/dashboard/KPICard";
import { CompaniesTable } from "@/components/superadmin/dashboard/CompaniesTable";
import { AlertsPanel } from "@/components/superadmin/dashboard/AlertsPanel";
import { GrowthChart } from "@/components/superadmin/dashboard/GrowthChart";

const kpis = [
  {
    title: "Total Companies",
    value: "56",
    change: "+8 this month",
    trend: "up" as const,
    icon: Building2,
  },
  {
    title: "Active Employees",
    value: "4,128",
    change: "+312 this week",
    trend: "up" as const,
    icon: Users,
  },
  {
    title: "Emails Sent",
    value: "12.4K",
    change: "This week",
    trend: "neutral" as const,
    icon: Mail,
  },
  {
    title: "Open Rate",
    value: "68.2%",
    change: "+2.4% vs last week",
    trend: "up" as const,
    icon: Eye,
  },
  {
    title: "Quiz Completion",
    value: "84.6%",
    change: "-1.2% vs last week",
    trend: "down" as const,
    icon: CheckCircle,
  },
  {
    title: "High-Risk Companies",
    value: "3",
    change: "Requires attention",
    trend: "down" as const,
    icon: AlertTriangle,
  },
  {
    title: "MRR",
    value: "$48.2K",
    change: "+$4.8K this month",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Growth Rate",
    value: "14.2%",
    change: "Month over month",
    trend: "up" as const,
    icon: TrendingUp,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Email Awareness Micro Training — Platform Overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 px-3 text-sm border border-input rounded-md bg-background">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <GrowthChart />
        </div>
        <div>
          <AlertsPanel />
        </div>
      </div>

      {/* Companies Table */}
      <CompaniesTable />
    </div>
  );
}
