import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OfferPerformanceData {
  offer_type: string;
  success_count: number;
  total_count: number;
  success_rate: number;
  revenue_saved: number;
}

interface OfferPerformanceChartProps {
  data: OfferPerformanceData[];
}

export const OfferPerformanceChart: React.FC<OfferPerformanceChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Offer Performance</CardTitle>
        <p className="text-sm text-muted-foreground">
          Success rates and revenue impact by offer type
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="offer_type" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'success_rate' ? `${value}%` : value,
                  name === 'success_rate' ? 'Success Rate' : 
                  name === 'revenue_saved' ? 'Revenue Saved' : name
                ]}
                labelFormatter={(label) => `Offer: ${label}`}
              />
              <Bar 
                dataKey="success_rate" 
                fill="hsl(var(--primary))" 
                name="success_rate"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Best Performing</div>
            <div className="text-muted-foreground">
              {data.reduce((prev, current) => 
                prev.success_rate > current.success_rate ? prev : current
              )?.offer_type || 'N/A'}
            </div>
          </div>
          <div>
            <div className="font-medium">Highest Revenue Impact</div>
            <div className="text-muted-foreground">
              {data.reduce((prev, current) => 
                prev.revenue_saved > current.revenue_saved ? prev : current
              )?.offer_type || 'N/A'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};