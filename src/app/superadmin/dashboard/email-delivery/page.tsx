"use client";

import {
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const deliveryStats = [
  { name: "Mon", sent: 1245, delivered: 1198, opened: 892 },
  { name: "Tue", sent: 1320, delivered: 1287, opened: 978 },
  { name: "Wed", sent: 1189, delivered: 1156, opened: 834 },
  { name: "Thu", sent: 1456, delivered: 1423, opened: 1089 },
  { name: "Fri", sent: 1234, delivered: 1201, opened: 912 },
  { name: "Sat", sent: 456, delivered: 445, opened: 312 },
  { name: "Sun", sent: 234, delivered: 228, opened: 156 },
];

const statusDistribution = [
  { name: "Delivered", value: 7938, color: "hsl(var(--foreground))" },
  { name: "Opened", value: 5173, color: "hsl(var(--muted-foreground))" },
  { name: "Bounced", value: 196, color: "hsl(var(--border))" },
];

const recentLogs = [
  { id: 1, email: "john.smith@acme.com", status: "Opened", time: "2 min ago", lesson: "Phishing Awareness" },
  { id: 2, email: "sarah.j@globaltech.com", status: "Delivered", time: "5 min ago", lesson: "Phishing Awareness" },
  { id: 3, email: "m.chen@securebank.com", status: "Opened", time: "8 min ago", lesson: "Phishing Awareness" },
  { id: 4, email: "failed@invalid.com", status: "Bounced", time: "12 min ago", lesson: "Phishing Awareness" },
  { id: 5, email: "emily.d@healthcare.com", status: "Delivered", time: "15 min ago", lesson: "Phishing Awareness" },
  { id: 6, email: "r.wilson@retailmax.com", status: "Opened", time: "18 min ago", lesson: "Phishing Awareness" },
];

function getStatusIcon(status: string) {
  switch (status) {
    case "Opened":
      return <Eye className="h-4 w-4" />;
    case "Delivered":
      return <CheckCircle className="h-4 w-4" />;
    case "Bounced":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Mail className="h-4 w-4" />;
  }
}

export default function EmailDeliveryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Email Delivery</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor email delivery, open rates, and sender reputation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 h-9 px-4 border border-input text-sm rounded-md hover:bg-secondary transition-colors">
            <RefreshCw className="h-4 w-4" />
            Retry Failed
          </button>
          <button className="inline-flex items-center gap-2 h-9 px-4 border border-input text-sm rounded-md hover:bg-secondary transition-colors">
            <Settings className="h-4 w-4" />
            SMTP Settings
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Sent</p>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">7,134</p>
          <p className="text-xs text-muted-foreground mt-1">This week</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Delivered</p>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">6,938</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> 97.3% rate
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Opened</p>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">5,173</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> 74.6% rate
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Bounced</p>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">196</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" /> 2.7% rate
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Sender Score</p>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">94/100</p>
          <p className="text-xs text-muted-foreground mt-1">Excellent</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-sm font-medium">Delivery Trends (Last 7 Days)</h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deliveryStats} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
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
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="sent" fill="hsl(var(--border))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="delivered" fill="hsl(var(--muted-foreground))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="opened" fill="hsl(var(--foreground))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-sm font-medium">Status Distribution</h3>
          </div>
          <div className="p-4 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="border border-border rounded-lg">
        <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
          <h3 className="text-sm font-medium">Recent Activity</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all logs
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Recipient</th>
              <th>Lesson</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {recentLogs.map((log) => (
              <tr key={log.id}>
                <td className="font-mono text-sm">{log.email}</td>
                <td className="text-muted-foreground">{log.lesson}</td>
                <td>
                  <span className={`inline-flex items-center gap-1.5 ${log.status === "Bounced" ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}>
                    {getStatusIcon(log.status)}
                    {log.status}
                  </span>
                </td>
                <td className="text-muted-foreground text-sm">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
