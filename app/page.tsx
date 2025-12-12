'use client';

import { useEffect, useState } from 'react';
import HealthDashboard from '@/components/HealthDashboard';
import { HealthUpdateEvent } from '@/lib/realtime';
import { Radio, Wifi, WifiOff } from 'lucide-react';

export default function Home() {
  const [healthUpdates, setHealthUpdates] = useState<HealthUpdateEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;
      
      eventSource = new EventSource('/api/who/stream');

      eventSource.onopen = () => {
        if (isMounted) {
          console.log('SSE Connected to WHO Stream');
          setIsConnected(true);
        }
      };

      eventSource.onmessage = (event) => {
        if (!isMounted) return;
        
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'connected') {
            setIsConnected(true);
          } else if (data.type === 'health-update') {
            setHealthUpdates((prev) => [data.data, ...prev].slice(0, 50));
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = () => {
        if (isMounted) {
          console.error('SSE connection error');
          setIsConnected(false);
          eventSource?.close();
          
          reconnectTimeout = setTimeout(() => {
            if (isMounted) {
              console.log('Reconnecting SSE...');
              connect();
            }
          }, 3000);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      eventSource?.close();
    };
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-border">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                <Radio className="w-5 h-5" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                WHO Health Data Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground text-sm ml-11">
              Real-time Global Health Monitoring dari World Health Organization
            </p>
          </div>
          <div className={`flex items-center gap-3 px-4 py-2 bg-card rounded-lg border transition-colors ${
            isConnected ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
          }`}>
            <div className="relative">
              {isConnected ? (
                <div className="p-1.5 bg-green-600 rounded-lg">
                  <Wifi className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="p-1.5 bg-red-600 rounded-lg">
                  <WifiOff className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div>
              <span className={`text-sm font-semibold block ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Terhubung' : 'Terputus'}
              </span>
              <span className="text-xs text-muted-foreground">Real-time Stream</span>
            </div>
          </div>
        </div>
        <HealthDashboard recentUpdates={healthUpdates} />
      </div>
    </main>
  );
}
