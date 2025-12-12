'use client';

import { TrendingUp } from 'lucide-react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, Defs, LinearGradient, Stop } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HealthIndicator {
  id?: string;
  country: string;
  indicator: string;
  value: number;
  category?: string;
  date?: string;
}

interface CategoryDistributionProps {
  indicators?: HealthIndicator[];
}

export default function CategoryDistribution({ indicators = [] }: CategoryDistributionProps) {
  const safeIndicators = Array.isArray(indicators) ? indicators : [];
  
  // Get top countries by total cases
  const countries = Array.from(new Set(safeIndicators.map(i => i.country))).slice(0, 6);
  
  // Group by country and calculate totals for different indicators
  const chartData = countries.map(country => {
    const countryData = safeIndicators.filter(i => i.country === country);
    
    return {
      country: country.length > 10 ? country.substring(0, 10) : country,
      fullCountry: country,
      'Total Cases': Math.floor((countryData.find(i => i.indicator === 'Total Cases')?.value || 0) / 1000),
      'Deaths': Math.floor((countryData.find(i => i.indicator === 'Deaths')?.value || 0) / 100),
      'Recovered': Math.floor((countryData.find(i => i.indicator === 'Recovered')?.value || 0) / 1000),
      'Active Cases': Math.floor((countryData.find(i => i.indicator === 'Active Cases')?.value || 0) / 1000),
      'Vaccination Rate': Math.floor((countryData.find(i => i.indicator === 'Vaccination Rate')?.value || 0)),
    };
  });

  const chartConfig = {
    'Total Cases': {
      label: 'Total Cases',
      color: 'hsl(182, 91%, 60%)', // Bright Neon Cyan
    },
    'Recovered': {
      label: 'Recovered',
      color: 'hsl(142, 76%, 55%)', // Bright Neon Green
    },
    'Active Cases': {
      label: 'Active Cases',
      color: 'hsl(48, 96%, 63%)', // Bright Neon Yellow
    },
    'Deaths': {
      label: 'Deaths',
      color: 'hsl(326, 78%, 68%)', // Bright Neon Pink
    },
    'Vaccination Rate': {
      label: 'Vaccination Rate',
      color: 'hsl(25, 95%, 63%)', // Bright Neon Orange
    },
  } satisfies ChartConfig;

  const hasData = chartData.length > 0 && chartData.some(d => d['Total Cases'] > 0);

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <div className="flex items-center gap-3 w-full justify-center">
          <div className="p-2 bg-pink-500/20 text-pink-400 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-center">
            <CardTitle>Distribusi Kategori</CardTitle>
            <CardDescription>
              Perbandingan indikator kesehatan antar negara
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[400px]"
          >
            <RadarChart data={chartData}>
              <Defs>
                <LinearGradient id="gradientTotalCases" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="hsl(182, 91%, 70%)" stopOpacity={0.8} />
                  <Stop offset="50%" stopColor="hsl(182, 91%, 60%)" stopOpacity={0.7} />
                  <Stop offset="100%" stopColor="hsl(182, 91%, 50%)" stopOpacity={0.5} />
                </LinearGradient>
                <LinearGradient id="gradientRecovered" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="hsl(142, 76%, 65%)" stopOpacity={0.8} />
                  <Stop offset="50%" stopColor="hsl(142, 76%, 55%)" stopOpacity={0.7} />
                  <Stop offset="100%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.5} />
                </LinearGradient>
                <LinearGradient id="gradientActiveCases" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="hsl(48, 96%, 73%)" stopOpacity={0.8} />
                  <Stop offset="50%" stopColor="hsl(48, 96%, 63%)" stopOpacity={0.7} />
                  <Stop offset="100%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0.5} />
                </LinearGradient>
                <LinearGradient id="gradientDeaths" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="hsl(326, 78%, 78%)" stopOpacity={0.8} />
                  <Stop offset="50%" stopColor="hsl(326, 78%, 68%)" stopOpacity={0.7} />
                  <Stop offset="100%" stopColor="hsl(326, 78%, 58%)" stopOpacity={0.5} />
                </LinearGradient>
              </Defs>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <PolarAngleAxis dataKey="country" />
              <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
              <Radar
                dataKey="Total Cases"
                fill="url(#gradientTotalCases)"
                stroke="hsl(182, 91%, 60%)"
                strokeWidth={2}
              />
              <Radar
                dataKey="Recovered"
                fill="url(#gradientRecovered)"
                stroke="hsl(142, 76%, 55%)"
                strokeWidth={2}
              />
              <Radar
                dataKey="Active Cases"
                fill="url(#gradientActiveCases)"
                stroke="hsl(48, 96%, 63%)"
                strokeWidth={2}
              />
              <Radar
                dataKey="Deaths"
                fill="url(#gradientDeaths)"
                stroke="hsl(326, 78%, 68%)"
                strokeWidth={2}
              />
            </RadarChart>
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
