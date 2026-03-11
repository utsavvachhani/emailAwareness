"use client";

import {
  Settings as SettingsIcon,
  Globe,
  Mail,
  Palette,
  FileText,
  Database,
  Bell,
  Key,
  Save
} from "lucide-react";
import { useState } from "react";

const tabs = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "email", label: "Email Templates", icon: Mail },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Key },
  { id: "legal", label: "Legal Pages", icon: FileText },
  { id: "backup", label: "Backup & Restore", icon: Database },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure platform settings and preferences
          </p>
        </div>
        <button className="inline-flex items-center gap-2 h-9 px-4 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors">
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === tab.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="col-span-3 border border-border rounded-lg p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Platform Name</label>
                    <input
                      type="text"
                      defaultValue="Email Awareness Micro Training"
                      className="h-9 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Support Email</label>
                    <input
                      type="email"
                      defaultValue="support@eamt.io"
                      className="h-9 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Timezone</label>
                    <select className="h-9 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-foreground transition-colors">
                      <option>UTC (Coordinated Universal Time)</option>
                      <option>EST (Eastern Standard Time)</option>
                      <option>PST (Pacific Standard Time)</option>
                      <option>GMT (Greenwich Mean Time)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Language</label>
                    <select className="h-9 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-foreground transition-colors">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="text-sm font-medium mb-4">Training Schedule</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Send Day</label>
                    <select className="h-9 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-foreground transition-colors">
                      <option>Monday</option>
                      <option>Tuesday</option>
                      <option>Wednesday</option>
                      <option>Thursday</option>
                      <option>Friday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Send Time</label>
                    <input
                      type="time"
                      defaultValue="09:00"
                      className="h-9 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "branding" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Branding</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Logo</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center max-w-md">
                    <div className="h-16 w-16 bg-secondary rounded-lg mx-auto flex items-center justify-center mb-4">
                      <Mail className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your logo here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, SVG up to 2MB
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Footer Text</label>
                  <textarea
                    rows={3}
                    defaultValue="© 2026 Email Awareness Micro Training. All rights reserved."
                    className="w-full max-w-md rounded-md border border-input bg-background p-3 text-sm outline-none focus:border-foreground transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">WhatsApp CTA Link</label>
                  <input
                    type="url"
                    placeholder="https://wa.me/..."
                    className="h-9 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-foreground transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Email Templates</h3>
              <div className="grid grid-cols-2 gap-4">
                {["Welcome Email", "Weekly Training", "Quiz Reminder", "Password Reset", "Account Suspended", "Invoice"].map((template) => (
                  <div key={template} className="border border-border rounded-lg p-4 hover:bg-secondary/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-secondary rounded flex items-center justify-center">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{template}</p>
                        <p className="text-xs text-muted-foreground">Click to edit</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab !== "general" && activeTab !== "branding" && activeTab !== "email" && (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Coming Soon</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This settings section is under development
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
