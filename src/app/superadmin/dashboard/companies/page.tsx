"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  Download,
  Upload,
  Pencil,
  Pause,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const companies = [
  {
    id: 1,
    name: "Acme Corporation",
    industry: "Technology",
    plan: "Enterprise",
    employees: 450,
    activeUsers: 423,
    engagement: 87,
    lastTraining: "Jan 17, 2026",
    risk: "Low",
    status: "Active",
  },
  {
    id: 2,
    name: "GlobalTech Industries",
    industry: "Manufacturing",
    plan: "Business",
    employees: 230,
    activeUsers: 198,
    engagement: 62,
    lastTraining: "Jan 14, 2026",
    risk: "Medium",
    status: "Active",
  },
  {
    id: 3,
    name: "SecureBank Ltd",
    industry: "Finance",
    plan: "Enterprise",
    employees: 890,
    activeUsers: 867,
    engagement: 94,
    lastTraining: "Jan 18, 2026",
    risk: "Low",
    status: "Active",
  },
  {
    id: 4,
    name: "HealthCare Plus",
    industry: "Healthcare",
    plan: "Business",
    employees: 156,
    activeUsers: 89,
    engagement: 45,
    lastTraining: "Jan 7, 2026",
    risk: "High",
    status: "Active",
  },
  {
    id: 5,
    name: "RetailMax",
    industry: "Retail",
    plan: "Starter",
    employees: 78,
    activeUsers: 71,
    engagement: 71,
    lastTraining: "Jan 16, 2026",
    risk: "Low",
    status: "Active",
  },
  {
    id: 6,
    name: "DataFlow Systems",
    industry: "Technology",
    plan: "Business",
    employees: 320,
    activeUsers: 289,
    engagement: 78,
    lastTraining: "Jan 15, 2026",
    risk: "Low",
    status: "Active",
  },
  {
    id: 7,
    name: "Metro Construction",
    industry: "Construction",
    plan: "Starter",
    employees: 145,
    activeUsers: 98,
    engagement: 52,
    lastTraining: "Jan 10, 2026",
    risk: "Medium",
    status: "Suspended",
  },
  {
    id: 8,
    name: "EduTech Academy",
    industry: "Education",
    plan: "Business",
    employees: 89,
    activeUsers: 82,
    engagement: 91,
    lastTraining: "Jan 17, 2026",
    risk: "Low",
    status: "Active",
  },
];

function getRiskClass(risk: string) {
  switch (risk) {
    case "Low":
      return "risk-low";
    case "Medium":
      return "risk-medium";
    case "High":
      return "risk-high";
    default:
      return "";
  }
}

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState("all");

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = selectedPlan === "all" || company.plan === selectedPlan;
    const matchesRisk = selectedRisk === "all" || company.risk === selectedRisk;
    return matchesSearch && matchesPlan && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Company Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all registered companies and their settings
          </p>
        </div>
        <button className="inline-flex items-center gap-2 h-9 px-4 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors">
          <Plus className="h-4 w-4" />
          Add Company
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground transition-colors"
          />
        </div>
        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="h-9 px-3 text-sm border border-input rounded-md bg-background"
        >
          <option value="all">All Plans</option>
          <option value="Starter">Starter</option>
          <option value="Business">Business</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <select
          value={selectedRisk}
          onChange={(e) => setSelectedRisk(e.target.value)}
          className="h-9 px-3 text-sm border border-input rounded-md bg-background"
        >
          <option value="all">All Risk Levels</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="High">High Risk</option>
        </select>
        <button className="inline-flex items-center gap-2 h-9 px-4 border border-input text-sm rounded-md hover:bg-secondary transition-colors">
          <Filter className="h-4 w-4" />
          More Filters
        </button>
        <button className="inline-flex items-center gap-2 h-9 px-4 border border-input text-sm rounded-md hover:bg-secondary transition-colors">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Companies</p>
          <p className="text-2xl font-semibold font-mono mt-1">{companies.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-semibold font-mono mt-1">
            {companies.filter(c => c.status === "Active").length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">High Risk</p>
          <p className="text-2xl font-semibold font-mono mt-1">
            {companies.filter(c => c.risk === "High").length}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Total Employees</p>
          <p className="text-2xl font-semibold font-mono mt-1">
            {companies.reduce((sum, c) => sum + c.employees, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Industry</th>
              <th>Plan</th>
              <th>Employees</th>
              <th>Active Users</th>
              <th>Engagement</th>
              <th>Last Training</th>
              <th>Risk</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map((company) => (
              <tr key={company.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{company.name}</span>
                  </div>
                </td>
                <td className="text-muted-foreground">{company.industry}</td>
                <td>
                  <span className="status-badge status-active">{company.plan}</span>
                </td>
                <td className="font-mono">{company.employees}</td>
                <td className="font-mono">{company.activeUsers}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground rounded-full"
                        style={{ width: `${company.engagement}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs">{company.engagement}%</span>
                  </div>
                </td>
                <td className="text-muted-foreground text-sm">{company.lastTraining}</td>
                <td className={getRiskClass(company.risk)}>{company.risk}</td>
                <td>
                  <span className={`status-badge ${company.status === "Active" ? "status-active" : "status-inactive"
                    }`}>
                    {company.status}
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
                      <DropdownMenuItem>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Company
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Employees
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Pause className="h-4 w-4 mr-2" />
                        Suspend Company
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Company
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCompanies.length} of {companies.length} companies
        </p>
        <div className="flex items-center gap-2">
          <button className="h-8 px-3 text-sm border border-input rounded-md hover:bg-secondary transition-colors disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="h-8 w-8 text-sm border border-foreground bg-foreground text-background rounded-md">
            1
          </button>
          <button className="h-8 w-8 text-sm border border-input rounded-md hover:bg-secondary transition-colors">
            2
          </button>
          <button className="h-8 px-3 text-sm border border-input rounded-md hover:bg-secondary transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
