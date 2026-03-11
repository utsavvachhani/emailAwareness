"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  UserPlus,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const employees = [
  { id: 1, name: "John Smith", email: "john.s@acme.com", company: "Acme Corporation", department: "Engineering", engagement: 92, lastTraining: "2 days ago", status: "Protected" },
  { id: 2, name: "Sarah Johnson", email: "sarah.j@globaltech.com", company: "GlobalTech", department: "Finance", engagement: 45, lastTraining: "1 week ago", status: "At Risk" },
  { id: 3, name: "Michael Chen", email: "m.chen@securebank.com", company: "SecureBank", department: "Operations", engagement: 88, lastTraining: "Today", status: "Protected" },
  { id: 4, name: "Emily Davis", email: "emily.d@healthcare.com", company: "HealthCare Plus", department: "Medical", engagement: 12, lastTraining: "Never", status: "Vulnerable" },
  { id: 5, name: "Robert Wilson", email: "r.wilson@retailmax.com", company: "RetailMax", department: "Sales", engagement: 76, lastTraining: "4 days ago", status: "Protected" },
  { id: 6, name: "Alice Brown", email: "alice.b@dataflow.com", company: "DataFlow Systems", department: "HR", engagement: 54, lastTraining: "3 days ago", status: "At Risk" },
];

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="module-header">
        <div>
          <h1 className="module-title">Employee Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track individual performance and risk levels across all organizations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 h-9 px-4 border border-input text-sm rounded-md hover:bg-secondary transition-colors">
            <Download className="h-4 w-4" />
            Export Data
          </button>
          <button className="inline-flex items-center gap-2 h-9 px-4 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors">
            <UserPlus className="h-4 w-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Employees</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">4,128</p>
          <p className="text-xs text-muted-foreground mt-1">Across 56 companies</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Protected</p>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">3,456</p>
          <p className="text-xs text-muted-foreground mt-1">High engagement</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">At Risk</p>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">482</p>
          <p className="text-xs text-muted-foreground mt-1">Low training activity</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Never Trained</p>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">190</p>
          <p className="text-xs text-muted-foreground mt-1">Requires follow-up</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center gap-2 h-9 px-4 border border-input text-sm rounded-md hover:bg-secondary transition-colors">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Company & Dept</th>
              <th>Engagement</th>
              <th>Last Activity</th>
              <th>Risk Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>
                  <div>
                    <p className="font-medium text-sm">{employee.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{employee.email}</p>
                  </div>
                </td>
                <td>
                  <div>
                    <p className="text-sm">{employee.company}</p>
                    <p className="text-xs text-muted-foreground">{employee.department}</p>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground rounded-full"
                        style={{ width: `${employee.engagement}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs">{employee.engagement}%</span>
                  </div>
                </td>
                <td className="text-muted-foreground text-sm">{employee.lastTraining}</td>
                <td>
                  <span className={`status-badge ${employee.status === "Protected" ? "status-active" :
                      employee.status === "At Risk" ? "status-pending" : "bg-foreground text-background"
                    }`}>
                    {employee.status}
                  </span>
                </td>
                <td>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-secondary rounded transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>View Performance</DropdownMenuItem>
                      <DropdownMenuItem>Resend Training</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove User</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
