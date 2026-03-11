import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
}

export function KPICard({ title, value, change, trend = "neutral", icon: Icon }: KPICardProps) {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div>
          <p className="kpi-label">{title}</p>
          <p className="kpi-value mt-2">{value}</p>
          {change && (
            <div className={`kpi-trend flex items-center gap-1 ${
              trend === "up" ? "kpi-trend-up" : trend === "down" ? "kpi-trend-down" : ""
            }`}>
              {trend === "up" && <TrendingUp className="h-3 w-3" />}
              {trend === "down" && <TrendingDown className="h-3 w-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="p-2 bg-secondary rounded-md group-hover:bg-foreground group-hover:text-background transition-colors">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
