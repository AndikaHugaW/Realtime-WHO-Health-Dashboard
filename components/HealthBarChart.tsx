'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface HealthIndicator {
  id?: string;
  country: string;
  indicator: string;
  value: number;
  category?: string;
  date?: string;
}

interface HealthBarChartProps {
  indicators?: HealthIndicator[];
}

export default function HealthBarChart({ indicators = [] }: HealthBarChartProps) {
  const safeIndicators = Array.isArray(indicators) ? indicators : [];
  
  // Get data for multiple indicators per country
  const countries = Array.from(new Set(safeIndicators.map(i => i.country))).slice(0, 6);
  
  const chartConfig = {
    totalCases: {
      label: 'Total Cases',
      color: 'hsl(var(--chart-1))',
    },
    recovered: {
      label: 'Recovered',
      color: 'hsl(var(--chart-2))',
    },
    activeCases: {
      label: 'Active Cases',
      color: 'hsl(var(--chart-3))',
    },
    deaths: {
      label: 'Deaths',
      color: 'hsl(var(--chart-4))',
    },
  } satisfies Record<string, { label: string; color: string }>;

  const chartData = countries.map(country => {
    const countryData = safeIndicators.filter(i => i.country === country);
    return {
      country: country,
      name: country.length > 12 ? country.substring(0, 12) + '...' : country,
      totalCases: Math.floor((countryData.find(i => i.indicator === 'Total Cases')?.value || 0) / 1000),
      deaths: Math.floor((countryData.find(i => i.indicator === 'Deaths')?.value || 0) / 100),
      recovered: Math.floor((countryData.find(i => i.indicator === 'Recovered')?.value || 0) / 1000),
      activeCases: Math.floor((countryData.find(i => i.indicator === 'Active Cases')?.value || 0) / 1000),
    };
  });

  const hasData = chartData.length > 0 && chartData.some(d => d.totalCases > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>Perbandingan Indikator</CardTitle>
            <CardDescription>Cases, Deaths, Recovered, dan Active Cases</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart data={chartData}>
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
              <Bar dataKey="totalCases" fill="var(--color-totalCases)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recovered" fill="var(--color-recovered)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="activeCases" fill="var(--color-activeCases)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="deaths" fill="var(--color-deaths)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                <BarChart3 className="w-8 h-8" />
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

