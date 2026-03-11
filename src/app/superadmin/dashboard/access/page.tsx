"use client";

import {
  Shield,
  Plus,
  MoreHorizontal,
  Key,
  Eye,
  Pencil,
  Trash2,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roles = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full access to all modules and settings",
    users: 1,
    permissions: ["All"],
    isSystem: true,
  },
  {
    id: 2,
    name: "Internal Admin",
    description: "Manage companies, employees, and content",
    users: 3,
    permissions: ["Companies", "Employees", "Content", "Reports"],
    isSystem: true,
  },
  {
    id: 3,
    name: "Support Agent",
    description: "View-only access to assist customers",
    users: 5,
    permissions: ["Companies (Read)", "Employees (Read)", "Reports (Read)"],
    isSystem: true,
  },
];

const admins = [
  {
    id: 1,
    name: "System Administrator",
    email: "admin@eamt.io",
    role: "Super Admin",
    lastActive: "2 min ago",
    status: "Online",
  },
  {
    id: 2,
    name: "Jane Cooper",
    email: "jane.cooper@eamt.io",
    role: "Internal Admin",
    lastActive: "1 hour ago",
    status: "Offline",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.j@eamt.io",
    role: "Internal Admin",
    lastActive: "3 hours ago",
    status: "Offline",
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah.w@eamt.io",
    role: "Support Agent",
    lastActive: "30 min ago",
    status: "Online",
  },
];

const auditLogs = [
  {
    id: 1,
    action: "Updated company settings",
    user: "Jane Cooper",
    target: "Acme Corporation",
    time: "10 min ago",
    ip: "192.168.1.45",
  },
  {
    id: 2,
    action: "Created new lesson",
    user: "Mike Johnson",
    target: "Phishing Awareness v2",
    time: "1 hour ago",
    ip: "192.168.1.32",
  },
  {
    id: 3,
    action: "Exported report",
    user: "Sarah Williams",
    target: "Monthly Engagement",
    time: "2 hours ago",
    ip: "192.168.1.78",
  },
  {
    id: 4,
    action: "Suspended company",
    user: "System Administrator",
    target: "Metro Construction",
    time: "1 day ago",
    ip: "192.168.1.10",
  },
];

export default function AccessControlPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Access Control</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage roles, permissions, and admin users
          </p>
        </div>
        <button className="inline-flex items-center gap-2 h-9 px-4 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors">
          <Plus className="h-4 w-4" />
          Add Admin User
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Roles */}
        <div className="border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-sm font-medium">Roles</h3>
          </div>
          <div className="p-4 space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="border border-border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{role.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{role.users} users</span>
                </div>
                <p className="text-xs text-muted-foreground">{role.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {role.permissions.slice(0, 3).map((perm) => (
                    <span key={perm} className="status-badge status-pending text-[10px]">
                      {perm}
                    </span>
                  ))}
                  {role.permissions.length > 3 && (
                    <span className="status-badge status-pending text-[10px]">
                      +{role.permissions.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Users */}
        <div className="col-span-2 border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-sm font-medium">Admin Users</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Last Active</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {admin.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{admin.name}</p>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge status-active">{admin.role}</span>
                  </td>
                  <td className="text-muted-foreground text-sm">{admin.lastActive}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 text-xs ${admin.status === "Online" ? "text-foreground" : "text-muted-foreground"
                      }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${admin.status === "Online" ? "bg-foreground" : "bg-muted-foreground"
                        }`} />
                      {admin.status}
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
                          <Eye className="h-4 w-4 mr-2" />
                          View Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Key className="h-4 w-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log */}
      <div className="border border-border rounded-lg">
        <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
          <h3 className="text-sm font-medium">Audit Log</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View full log
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>User</th>
              <th>Target</th>
              <th>Time</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td className="font-medium">{log.action}</td>
                <td className="text-muted-foreground">{log.user}</td>
                <td className="text-muted-foreground">{log.target}</td>
                <td className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {log.time}
                </td>
                <td className="font-mono text-xs text-muted-foreground">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
