'use client';

import { useEffect, useRef } from 'react';
import { Activity, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { HealthUpdateEvent } from '@/lib/realtime';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentHealthUpdatesProps {
  updates: HealthUpdateEvent[];
}

export default function RecentHealthUpdates({ updates }: RecentHealthUpdatesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevUpdatesLength = useRef(0);

  useEffect(() => {
    if (updates.length > prevUpdatesLength.current && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    prevUpdatesLength.current = updates.length;
  }, [updates.length]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Update Data Real-time</CardTitle>
              <CardDescription>Live updates dari WHO</CardDescription>
            </div>
          </div>
          {updates.length > 0 && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
              {updates.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div ref={scrollRef} className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {updates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-semibold mb-1">Belum ada update data</p>
              <p className="text-xs text-muted-foreground">Update akan muncul di sini</p>
            </div>
          ) : (
            updates.map((update, index) => {
              const isIncrease = update.change > 0;
              const timestamp = new Date(update.timestamp * 1000);
              const uniqueKey = `${update.country}-${update.indicator}-${update.timestamp}-${index}`;

              return (
                <div
                  key={uniqueKey}
                  className={`flex items-center justify-between p-4 bg-card rounded-lg border transition-colors duration-200 hover:bg-muted/50 ${
                    isIncrease ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'
                  } ${index === 0 ? 'bg-blue-500/10' : 'border-border'}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isIncrease ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {isIncrease ? (
                        <ArrowUpCircle className="w-4 h-4" />
                      ) : (
                        <ArrowDownCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{update.country}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {update.indicator} • {format(timestamp, 'HH:mm:ss')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isIncrease ? 'text-red-400' : 'text-green-400'}`}>
                      {isIncrease ? '+' : ''}
                      {update.change.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Value: {update.value.toLocaleString('id-ID')}</p>
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

