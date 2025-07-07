import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockChartData = [
  { date: "Jan 1", churnScore: 0.34 },
  { date: "Jan 8", churnScore: 0.42 },
  { date: "Jan 15", churnScore: 0.38 },
  { date: "Jan 22", churnScore: 0.31 },
  { date: "Jan 29", churnScore: 0.29 },
  { date: "Feb 5", churnScore: 0.35 },
  { date: "Feb 12", churnScore: 0.28 },
];

export const ChurnTrendChart = () => {
  return (
    <Card className="border-2 hover:border-primary/20 transition-colors">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          Churn Score Over Time
        </CardTitle>
        <p className="text-sm text-muted-foreground">Weekly trend analysis</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Churn Score"]}
              />
              <Line 
                type="monotone" 
                dataKey="churnScore" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--accent))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-muted-foreground">Average Churn Score</span>
          </div>
          <span className="font-medium text-foreground">32.4%</span>
        </div>
      </CardContent>
    </Card>
  );
};