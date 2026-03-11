import { AlertTriangle, Mail, TrendingDown, Clock } from "lucide-react";

const alerts = [
  {
    id: 1,
    type: "engagement",
    icon: TrendingDown,
    title: "Low engagement detected",
    description: "HealthCare Plus dropped below 50% engagement threshold",
    time: "2 hours ago",
    severity: "high",
  },
  {
    id: 2,
    type: "email",
    icon: Mail,
    title: "Email delivery failed",
    description: "12 emails bounced for RetailMax domain",
    time: "4 hours ago",
    severity: "medium",
  },
  {
    id: 3,
    type: "training",
    icon: Clock,
    title: "Overdue training",
    description: "GlobalTech has 45 employees with overdue lessons",
    time: "1 day ago",
    severity: "medium",
  },
  {
    id: 4,
    type: "security",
    icon: AlertTriangle,
    title: "High-risk user detected",
    description: "3 users clicked simulated phishing links",
    time: "2 days ago",
    severity: "high",
  },
];

export function AlertsPanel() {
  return (
    <div className="border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <h3 className="text-sm font-medium">Active Alerts</h3>
      </div>
      <div className="divide-y divide-border">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer">
            <div className="flex gap-3">
              <div className={`p-2 rounded-md ${
                alert.severity === "high" ? "bg-foreground text-background" : "bg-secondary"
              }`}>
                <alert.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                <p className="text-xs text-muted-foreground mt-2 font-mono">{alert.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
