'use client';

import { useEffect, useRef } from 'react';
import { Activity, ArrowDown, ArrowUp } from 'lucide-react';
import { StockUpdateEvent } from '@/lib/realtime';
import { format } from 'date-fns';

interface RecentUpdatesProps {
  updates: StockUpdateEvent[];
}

export default function RecentUpdates({ updates }: RecentUpdatesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevUpdatesLength = useRef(0);

  // Auto scroll to top when new update arrives
  useEffect(() => {
    if (updates.length > prevUpdatesLength.current && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    prevUpdatesLength.current = updates.length;
  }, [updates.length]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Update Stok Real-time
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Live updates</p>
          </div>
        </div>
        {updates.length > 0 && (
          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full shadow-sm">
            {updates.length}
          </span>
        )}
      </div>
      <div ref={scrollRef} className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {updates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada update stok</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Update akan muncul di sini</p>
          </div>
        ) : (
          updates.map((update, index) => {
            const isSold = update.event === 'sold';
            const timestamp = new Date(update.timestamp * 1000);
            const uniqueKey = `${update.medicine_id}-${update.timestamp}-${index}`;

            return (
              <div
                key={uniqueKey}
                className={`flex items-center justify-between p-4 bg-gradient-to-r ${
                  isSold 
                    ? 'from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-l-4 border-red-500' 
                    : 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-l-4 border-green-500'
                } rounded-lg transition-all duration-200 hover:shadow-md ${
                  index === 0 ? 'animate-pulse-once' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg shadow-sm ${
                      isSold 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    }`}
                  >
                    {isSold ? (
                      <ArrowDown className="w-4 h-4" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{update.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {format(timestamp, 'dd/MM/yyyy HH:mm:ss')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${isSold ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {isSold ? '-' : '+'}
                    {update.quantity}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Stok: {update.stock}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

