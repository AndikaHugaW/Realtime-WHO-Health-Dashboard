'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface HealthIndicator {
  id?: string;
  country: string;
  indicator: string;
  value: number;
  category?: string;
  date?: string;
}

interface HealthTrendChartProps {
  indicators?: HealthIndicator[];
}

export default function HealthTrendChart({ indicators = [] }: HealthTrendChartProps) {
  const safeIndicators = Array.isArray(indicators) ? indicators : [];
  
  // Get top 5 countries by total cases
  const countryTotals = safeIndicators
    .filter(i => i.indicator === 'Total Cases')
    .reduce((acc, curr) => {
      if (!acc[curr.country]) {
        acc[curr.country] = 0;
      }
      acc[curr.country] += curr.value || 0;
      return acc;
    }, {} as Record<string, number>);

  const topCountries = Object.entries(countryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country]) => country);

  const chartConfig = {
    cases: {
      label: 'Cases',
      color: 'hsl(var(--chart-1))',
    },
    recovered: {
      label: 'Recovered',
      color: 'hsl(var(--chart-2))',
    },
    deaths: {
      label: 'Deaths',
      color: 'hsl(var(--chart-4))',
    },
  } satisfies Record<string, { label: string; color: string }>;

  const chartData = topCountries.map((country, idx) => {
    const countryIndicators = safeIndicators.filter(i => i.country === country);
    const cases = countryIndicators.find(i => i.indicator === 'Total Cases')?.value || 0;
    const deaths = countryIndicators.find(i => i.indicator === 'Deaths')?.value || 0;
    const recovered = countryIndicators.find(i => i.indicator === 'Recovered')?.value || 0;
    
    return {
      country: country,
      name: country.length > 15 ? country.substring(0, 15) + '...' : country,
      cases: Math.floor(cases / 1000) + (idx * 10),
      deaths: Math.floor(deaths / 100),
      recovered: Math.floor(recovered / 1000) + (idx * 8),
    };
  });

  const hasData = chartData.length > 0 && chartData.some(d => d.cases > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>Trend Indikator Kesehatan</CardTitle>
            <CardDescription>Perbandingan tren Cases, Deaths, dan Recovered</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <LineChart data={chartData}>
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
              <Line 
                type="monotone" 
                dataKey="cases" 
                stroke="var(--color-cases)" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="recovered" 
                stroke="var(--color-recovered)" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="deaths" 
                stroke="var(--color-deaths)" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                <TrendingUp className="w-8 h-8" />
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

