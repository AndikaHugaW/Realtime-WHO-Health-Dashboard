'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Activity, Zap, Shield, AlertOctagon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Outbreak {
  id?: string;
  disease: string;
  country: string;
  severity: string;
  cases: number;
  status?: string;
}

export default function OutbreakAlerts() {
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutbreaks();
    const interval = setInterval(fetchOutbreaks, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOutbreaks = async () => {
    try {
      const response = await fetch('/api/who/outbreaks');
      const data = await response.json();
      // Ensure data is always an array
      setOutbreaks(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching outbreaks:', error);
      setOutbreaks([]); // Set empty array on error
      setLoading(false);
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500',
          text: 'text-red-400',
          badge: 'bg-red-600 text-white',
          icon: <Zap className="w-4 h-4" />,
        };
      case 'high':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500',
          text: 'text-orange-400',
          badge: 'bg-orange-600 text-white',
          icon: <AlertOctagon className="w-4 h-4" />,
        };
      case 'medium':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500',
          text: 'text-yellow-400',
          badge: 'bg-yellow-600 text-white',
          icon: <AlertTriangle className="w-4 h-4" />,
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500',
          text: 'text-blue-400',
          badge: 'bg-blue-600 text-white',
          icon: <Shield className="w-4 h-4" />,
        };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Memuat...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>Outbreak Alerts</CardTitle>
            <CardDescription>Active outbreaks worldwide</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {!Array.isArray(outbreaks) || outbreaks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                <Shield className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-semibold mb-1">Tidak ada outbreak aktif</p>
              <p className="text-xs text-muted-foreground">Semua kondisi aman</p>
            </div>
          ) : (
            outbreaks.filter(o => o).map((outbreak, index) => {
              const config = getSeverityConfig(outbreak.severity || 'low');
              return (
                <div
                  key={outbreak.id || `outbreak-${index}`}
                  className={`p-4 rounded-lg border-l-4 ${config.border} ${config.bg} border border-border`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${config.badge} rounded-lg`}>
                        {config.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{outbreak.disease}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {outbreak.country} • {outbreak.cases.toLocaleString('id-ID')} cases
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 ${config.badge} rounded-full text-xs font-semibold uppercase`}>
                      {outbreak.severity}
                    </span>
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

