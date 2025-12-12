'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart as LineChartIcon } from 'lucide-react';

interface HealthIndicator {
  id?: string;
  country: string;
  indicator: string;
  value: number;
  category?: string;
  date?: string;
}

interface HealthChartProps {
  indicators?: HealthIndicator[];
}

const chartConfig = {
  'totalCases': {
    label: 'Total Cases',
    color: 'hsl(var(--chart-1))',
  },
} satisfies Record<string, { label: string; color: string }>;

export default function HealthChart({ indicators = [] }: HealthChartProps) {
  const safeIndicators = Array.isArray(indicators) ? indicators : [];
  
  const chartData = Array.from(
    new Map(
      safeIndicators
        .filter((i) => i && i.indicator === 'Total Cases')
        .map((i) => [i.country, i])
    ).values()
  )
    .slice(0, 10)
    .map((indicator) => ({
      country: indicator.country,
      name: indicator.country.length > 10 ? indicator.country.substring(0, 10) + '...' : indicator.country,
      totalCases: Math.floor(indicator.value / 1000),
    }))
    .sort((a, b) => b.totalCases - a.totalCases);

  const hasData = chartData.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
            <LineChartIcon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>Grafik Data Kesehatan</CardTitle>
            <CardDescription>Total kasus per negara (Top 10)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillTotalCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-totalCases)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-totalCases)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="totalCases"
                fill="url(#fillTotalCases)"
                fillOpacity={0.4}
                stroke="var(--color-totalCases)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                <LineChartIcon className="w-8 h-8" />
              </div>
              <p className="text-lg font-semibold mb-1">Tidak Ada Data</p>
              <p className="text-sm">Data akan muncul setelah koneksi ke WHO API</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

