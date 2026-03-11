import { MoreHorizontal, ExternalLink } from "lucide-react";
import Link from "next/link";

const companies = [
  {
    id: 1,
    name: "Acme Corporation",
    industry: "Technology",
    plan: "Enterprise",
    employees: 450,
    engagement: 87,
    lastTraining: "2 days ago",
    risk: "Low",
  },
  {
    id: 2,
    name: "GlobalTech Industries",
    industry: "Manufacturing",
    plan: "Business",
    employees: 230,
    engagement: 62,
    lastTraining: "5 days ago",
    risk: "Medium",
  },
  {
    id: 3,
    name: "SecureBank Ltd",
    industry: "Finance",
    plan: "Enterprise",
    employees: 890,
    engagement: 94,
    lastTraining: "1 day ago",
    risk: "Low",
  },
  {
    id: 4,
    name: "HealthCare Plus",
    industry: "Healthcare",
    plan: "Business",
    employees: 156,
    engagement: 45,
    lastTraining: "12 days ago",
    risk: "High",
  },
  {
    id: 5,
    name: "RetailMax",
    industry: "Retail",
    plan: "Starter",
    employees: 78,
    engagement: 71,
    lastTraining: "3 days ago",
    risk: "Low",
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

export function CompaniesTable() {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <h3 className="text-sm font-medium">Recent Companies</h3>
        <Link
          href="/superadmin/dashboard/companies"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Industry</th>
            <th>Plan</th>
            <th>Employees</th>
            <th>Engagement</th>
            <th>Last Training</th>
            <th>Risk</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td className="font-medium">{company.name}</td>
              <td className="text-muted-foreground">{company.industry}</td>
              <td>
                <span className="status-badge status-active">{company.plan}</span>
              </td>
              <td className="font-mono">{company.employees}</td>
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
                <button className="p-1 hover:bg-secondary rounded transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
