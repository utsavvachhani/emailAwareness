"use client";

import {
  Fish,
  Plus,
  Play,
  Pause,
  BarChart3,
  Users,
  MousePointer,
  AlertTriangle,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const campaigns = [
  {
    id: 1,
    name: "Q1 2026 Security Test",
    status: "Active",
    companies: 5,
    recipients: 1245,
    clicked: 89,
    clickRate: 7.1,
    startDate: "Jan 15, 2026",
  },
  {
    id: 2,
    name: "Finance Department Test",
    status: "Completed",
    companies: 1,
    recipients: 234,
    clicked: 28,
    clickRate: 12.0,
    startDate: "Jan 5, 2026",
  },
  {
    id: 3,
    name: "Holiday Scam Awareness",
    status: "Completed",
    companies: 8,
    recipients: 2456,
    clicked: 312,
    clickRate: 12.7,
    startDate: "Dec 15, 2025",
  },
  {
    id: 4,
    name: "Executive Team Test",
    status: "Draft",
    companies: 3,
    recipients: 45,
    clicked: 0,
    clickRate: 0,
    startDate: null,
  },
];

const templates = [
  { id: 1, name: "Fake Password Reset", difficulty: "Medium", clickRate: 15 },
  { id: 2, name: "Urgent Invoice", difficulty: "Hard", clickRate: 22 },
  { id: 3, name: "IT Support Request", difficulty: "Easy", clickRate: 8 },
  { id: 4, name: "Package Delivery", difficulty: "Medium", clickRate: 18 },
];

export default function PhishingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Phishing Simulation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage simulated phishing campaigns
          </p>
        </div>
        <button className="inline-flex items-center gap-2 h-9 px-4 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors">
          <Plus className="h-4 w-4" />
          Create Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Campaigns</p>
            <Fish className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">{campaigns.length}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Recipients</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">
            {campaigns.reduce((sum, c) => sum + c.recipients, 0).toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Clicked</p>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">
            {campaigns.reduce((sum, c) => sum + c.clicked, 0)}
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Avg Click Rate</p>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-semibold font-mono mt-2">
            {(campaigns.filter(c => c.clickRate > 0).reduce((sum, c) => sum + c.clickRate, 0) /
              campaigns.filter(c => c.clickRate > 0).length).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Campaigns Table */}
        <div className="col-span-2 border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-sm font-medium">Campaigns</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Status</th>
                <th>Companies</th>
                <th>Recipients</th>
                <th>Clicked</th>
                <th>Click Rate</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      {campaign.startDate && (
                        <p className="text-xs text-muted-foreground">{campaign.startDate}</p>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${campaign.status === "Active" ? "status-active" :
                        campaign.status === "Completed" ? "status-inactive" :
                          "status-pending"
                      }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="font-mono">{campaign.companies}</td>
                  <td className="font-mono">{campaign.recipients}</td>
                  <td className="font-mono">{campaign.clicked}</td>
                  <td>
                    <span className={`font-mono ${campaign.clickRate > 10 ? "font-bold" : ""
                      }`}>
                      {campaign.clickRate}%
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
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Report
                        </DropdownMenuItem>
                        {campaign.status === "Active" ? (
                          <DropdownMenuItem>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Campaign
                          </DropdownMenuItem>
                        ) : campaign.status === "Draft" ? (
                          <DropdownMenuItem>
                            <Play className="h-4 w-4 mr-2" />
                            Launch Campaign
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Templates */}
        <div className="border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-sm font-medium">Phishing Templates</h3>
          </div>
          <div className="p-4 space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="border border-border rounded-md p-3 hover:bg-secondary/30 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{template.name}</span>
                  <span className="status-badge status-pending text-xs">{template.difficulty}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Avg click rate: {template.clickRate}%</span>
                </div>
              </div>
            ))}
            <button className="w-full h-9 border border-dashed border-border rounded-md text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
              + Create Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
