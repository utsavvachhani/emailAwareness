"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts";
import {
  Download,
  Calendar,
  Users,
  Target,
  AlertCircle,
  TrendingUp
} from "lucide-react";

const engagementData = [
  { name: "Week 1", rate: 65 },
  { name: "Week 2", rate: 72 },
  { name: "Week 3", rate: 68 },
  { name: "Week 4", rate: 84 },
  { name: "Week 5", rate: 79 },
  { name: "Week 6", rate: 92 },
];

const riskDistribution = [
  { name: "Low Risk", value: 45, color: "hsl(var(--foreground))" },
  { name: "Medium Risk", value: 35, color: "hsl(var(--muted-foreground))" },
  { name: "High Risk", value: 20, color: "hsl(var(--border))" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Analytics & Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed insights into training performance and security risk
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 h-9 px-4 border border-input text-sm rounded-md hover:bg-secondary transition-colors">
            <Calendar className="h-4 w-4" />
            Last 30 Days
          </button>
          <button className="inline-flex items-center gap-2 h-9 px-4 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Avg Engagement</p>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">78.4%</p>
          <p className="text-xs text-muted-foreground mt-1">+5.2% from last month</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">92.1%</p>
          <p className="text-xs text-muted-foreground mt-1">Target: 95%</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Simulated Clicks</p>
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">4.2%</p>
          <p className="text-xs text-muted-foreground mt-1">-1.5% from last test</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Vulnerable Areas</p>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">2</p>
          <p className="text-xs text-muted-foreground mt-1">Requires immediate focus</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Engagement Chart */}
        <div className="border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-sm font-medium">Engagement Trend</h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--foreground))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-sm font-medium">Risk Distribution</h3>
          </div>
          <div className="p-4 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-4">
              {riskDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Industry Benchmarking */}
      <div className="border border-border rounded-lg">
        <div className="px-4 py-3 border-b border-border bg-secondary/30">
          <h3 className="text-sm font-medium">Industry Benchmarking (Top Performance)</h3>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: "Technology", score: 92, avg: 78 },
              { name: "Finance", score: 88, avg: 82 },
              { name: "Healthcare", score: 76, avg: 74 },
              { name: "Retail", score: 84, avg: 71 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px"
                }}
              />
              <Bar dataKey="score" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avg" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
