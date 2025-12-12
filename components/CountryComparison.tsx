'use client';

import { Globe2, Trophy, Award, Medal, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HealthIndicator {
  id?: string;
  country: string;
  indicator: string;
  value: number;
  category?: string;
  date?: string;
}

interface CountryComparisonProps {
  indicators?: HealthIndicator[];
}

export default function CountryComparison({ indicators = [] }: CountryComparisonProps) {
  // Ensure indicators is an array
  const safeIndicators = Array.isArray(indicators) ? indicators : [];
  
  // Get total cases per country
  const countryData = safeIndicators
    .filter((i) => i && i.indicator === 'Total Cases')
    .reduce((acc, curr) => {
      if (!acc[curr.country]) {
        acc[curr.country] = 0;
      }
      acc[curr.country] += curr.value || 0;
      return acc;
    }, {} as Record<string, number>);

  const sortedCountries = Object.entries(countryData)
    .map(([country, value]) => ({ country, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (index === 1) return <Award className="w-4 h-4 text-gray-400" />;
    if (index === 2) return <Medal className="w-4 h-4 text-orange-500" />;
    return null;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'bg-yellow-500/20 text-yellow-400';
    if (index === 1) return 'bg-gray-500/20 text-gray-400';
    if (index === 2) return 'bg-orange-500/20 text-orange-400';
    return 'bg-blue-500/20 text-blue-400';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>Perbandingan Negara</CardTitle>
            <CardDescription>Total kasus per negara (Top 10)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {sortedCountries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                <Globe2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-semibold">Tidak ada data</p>
            </div>
          ) : (
            sortedCountries.map((item, index) => {
              const rankIcon = getRankIcon(index);
              return (
                <div
                  key={item.country}
                  className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${getRankColor(index)} flex items-center justify-center font-bold text-sm`}>
                      {rankIcon || <span>{index + 1}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <p className="font-semibold text-foreground">{item.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      {Math.floor(item.value / 1000).toLocaleString('id-ID')}K
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">cases</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

