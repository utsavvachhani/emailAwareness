"use client";

import {
  Shield,
  Lock,
  Key,
  Smartphone,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useState } from "react";

const securityFeatures = [
  {
    id: "2fa",
    name: "Two-Factor Authentication",
    description: "Require 2FA for all admin logins",
    icon: Smartphone,
    enabled: true,
  },
  {
    id: "ip-restrict",
    name: "IP Restrictions",
    description: "Limit access to specific IP addresses",
    icon: Globe,
    enabled: false,
  },
  {
    id: "login-alerts",
    name: "Login Alerts",
    description: "Email notifications for new logins",
    icon: AlertTriangle,
    enabled: true,
  },
  {
    id: "encryption",
    name: "Data Encryption",
    description: "Encrypt all sensitive data at rest",
    icon: Lock,
    enabled: true,
  },
  {
    id: "gdpr",
    name: "GDPR Compliance",
    description: "Enable GDPR data handling controls",
    icon: Shield,
    enabled: true,
  },
  {
    id: "session",
    name: "Session Timeout",
    description: "Auto-logout after 30 minutes of inactivity",
    icon: Clock,
    enabled: true,
  },
];

const recentLogins = [
  {
    id: 1,
    user: "System Administrator",
    ip: "192.168.1.10",
    location: "New York, US",
    device: "Chrome on macOS",
    time: "Just now",
    status: "success",
  },
  {
    id: 2,
    user: "Jane Cooper",
    ip: "192.168.1.45",
    location: "London, UK",
    device: "Safari on macOS",
    time: "1 hour ago",
    status: "success",
  },
  {
    id: 3,
    user: "Unknown",
    ip: "203.45.67.89",
    location: "Unknown",
    device: "Chrome on Windows",
    time: "2 hours ago",
    status: "failed",
  },
  {
    id: 4,
    user: "Mike Johnson",
    ip: "192.168.1.32",
    location: "Berlin, DE",
    device: "Firefox on Ubuntu",
    time: "3 hours ago",
    status: "success",
  },
];

export default function SecurityPage() {
  const [features, setFeatures] = useState(securityFeatures);

  const toggleFeature = (id: string) => {
    setFeatures(features.map(f =>
      f.id === id ? { ...f, enabled: !f.enabled } : f
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Security & Compliance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage security settings and compliance controls
          </p>
        </div>
      </div>

      {/* Security Score */}
      <div className="border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Security Score</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Based on enabled security features and configurations
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold font-mono">92/100</p>
            <p className="text-sm text-muted-foreground">Excellent</p>
          </div>
        </div>
        <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-foreground rounded-full" style={{ width: "92%" }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Security Features */}
        <div className="border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-sm font-medium">Security Features</h3>
          </div>
          <div className="divide-y divide-border">
            {features.map((feature) => (
              <div key={feature.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${feature.enabled ? "bg-foreground text-background" : "bg-secondary"
                    }`}>
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{feature.name}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFeature(feature.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${feature.enabled ? "bg-foreground" : "bg-secondary"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${feature.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logins */}
        <div className="border border-border rounded-lg">
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-sm font-medium">Recent Login Attempts</h3>
          </div>
          <div className="divide-y divide-border">
            {recentLogins.map((login) => (
              <div key={login.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${login.status === "success" ? "bg-secondary" : "bg-foreground text-background"
                      }`}>
                      {login.status === "success" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{login.user}</p>
                      <p className="text-xs text-muted-foreground">{login.device}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{login.time}</span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground ml-11">
                  <span className="font-mono">{login.ip}</span>
                  <span>{login.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="border border-border rounded-lg">
        <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
          <h3 className="text-sm font-medium">API Keys</h3>
          <button className="inline-flex items-center gap-2 h-8 px-3 text-xs border border-input rounded-md hover:bg-secondary transition-colors">
            <Key className="h-3 w-3" />
            Generate New Key
          </button>
        </div>
        <div className="p-4">
          <div className="border border-border rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Production API Key</p>
                <p className="text-xs text-muted-foreground mt-1">Created on Jan 1, 2026</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-secondary px-2 py-1 rounded">
                  eamt_live_****************************
                </code>
                <button className="text-xs text-muted-foreground hover:text-foreground">
                  Show
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
