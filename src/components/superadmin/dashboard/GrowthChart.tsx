import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", companies: 12, employees: 890 },
  { month: "Feb", companies: 18, employees: 1240 },
  { month: "Mar", companies: 24, employees: 1680 },
  { month: "Apr", companies: 31, employees: 2150 },
  { month: "May", companies: 42, employees: 2890 },
  { month: "Jun", companies: 48, employees: 3420 },
  { month: "Jul", companies: 56, employees: 4100 },
];

export function GrowthChart() {
  return (
    <div className="border border-border rounded-lg">
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
        <h3 className="text-sm font-medium">Growth Overview</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-foreground" />
            <span className="text-muted-foreground">Companies</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-muted-foreground" />
            <span className="text-muted-foreground">Employees (÷100)</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="month" 
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
            <Line
              type="monotone"
              dataKey="companies"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--foreground))" }}
            />
            <Line
              type="monotone"
              dataKey="employees"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
              activeDot={{ r: 4, fill: "hsl(var(--muted-foreground))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
