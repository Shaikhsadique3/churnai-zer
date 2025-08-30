import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SaveRateTrendData {
  date: string;
  save_rate: number;
  total_attempts: number;
  successful_saves: number;
}

interface SaveRateTrendChartProps {
  data: SaveRateTrendData[];
}

export const SaveRateTrendChart: React.FC<SaveRateTrendChartProps> = ({ data }) => {
  const avgSaveRate = data.length > 0 
    ? data.reduce((sum, item) => sum + item.save_rate, 0) / data.length 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Save Rate Trend</CardTitle>
        <p className="text-sm text-muted-foreground">
          Daily save rate performance over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis 
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Save Rate']}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as SaveRateTrendData;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">
                          {new Date(label).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-primary">
                          Save Rate: {data.save_rate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.successful_saves} saved / {data.total_attempts} attempts
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="save_rate" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium">Average Save Rate</div>
            <div className="text-2xl font-bold text-primary">
              {avgSaveRate.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="font-medium">Best Day</div>
            <div className="text-muted-foreground">
              {data.length > 0 
                ? Math.max(...data.map(d => d.save_rate)).toFixed(1) + '%'
                : 'N/A'
              }
            </div>
          </div>
          <div>
            <div className="font-medium">Total Attempts</div>
            <div className="text-muted-foreground">
              {data.reduce((sum, item) => sum + item.total_attempts, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};