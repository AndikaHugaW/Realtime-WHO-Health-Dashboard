import { NextRequest } from 'next/server';
import { realtimeEmitter } from '@/lib/realtime';
import { WHO_API, generateMockUpdate, type WHOUpdateEvent } from '@/lib/who-api';
import { prisma } from '@/lib/prisma';

// Store previous values to detect changes
const previousValues = new Map<string, number>();

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      );

      // Listen for health updates
      const onHealthUpdate = (data: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'health-update', data })}\n\n`)
        );
      };

      realtimeEmitter.on('health-update', onHealthUpdate);

      // Fetch and process real WHO API data every 5 seconds
      const interval = setInterval(async () => {
        try {
          // Fetch real data from WHO API
          const healthData = await WHO_API.getHealthIndicators();
          
          if (healthData && healthData.length > 0) {
            // Process each indicator to detect changes
            for (const data of healthData) {
              const key = `${data.country}-${data.indicator}`;
              const previousValue = previousValues.get(key);
              const currentValue = data.value;
              
              // Calculate change (0 if no previous value)
              const change = previousValue !== undefined ? currentValue - previousValue : 0;
              
              // Emit update if value changed or if it's the first time (initial data)
              if (previousValue === undefined || previousValue !== currentValue) {
                // Create update event
                const update: WHOUpdateEvent = {
                  country: data.country,
                  indicator: data.indicator,
                  value: currentValue,
                  change: change,
                  timestamp: Math.floor(Date.now() / 1000),
                };

                try {
                  // Save to database
                  const indicator = await prisma.healthIndicator.findFirst({
                    where: {
                      country: data.country,
                      indicator: data.indicator,
                    },
                    orderBy: { date: 'desc' },
                  });

                  if (indicator) {
                    // Update existing indicator
                    await prisma.healthIndicator.update({
                      where: { id: indicator.id },
                      data: {
                        value: currentValue,
                        category: data.category,
                        date: new Date(data.date),
                        isAlert: data.isAlert,
                      },
                    });

                    // Create update record
                    await prisma.healthUpdate.create({
                      data: {
                        indicatorId: indicator.id,
                        country: data.country,
                        indicatorName: data.indicator,
                        value: currentValue,
                        change: change,
                        timestamp: update.timestamp,
                      },
                    });
                  } else {
                    // Create new indicator
                    const newIndicator = await prisma.healthIndicator.create({
                      data: {
                        country: data.country,
                        indicator: data.indicator,
                        value: currentValue,
                        category: data.category,
                        date: new Date(data.date),
                        isAlert: data.isAlert,
                      },
                    });

                    // Create update record
                    await prisma.healthUpdate.create({
                      data: {
                        indicatorId: newIndicator.id,
                        country: data.country,
                        indicatorName: data.indicator,
                        value: currentValue,
                        change: change,
                        timestamp: update.timestamp,
                      },
                    });
                  }
                } catch (dbError: any) {
                  // Database might not be migrated - continue anyway
                  console.log('Database operation failed:', dbError.message);
                }

                // Emit real-time update
                realtimeEmitter.emit('health-update', update);
              }
              
              // Always update previous value for change detection
              previousValues.set(key, currentValue);
            }
          } else {
            // If no real data, fallback to mock update (for demonstration)
            const update = generateMockUpdate();
            realtimeEmitter.emit('health-update', update);
          }
        } catch (error: any) {
          console.error('Error fetching WHO API data:', error.message);
          // Fallback to mock data if WHO API fails
          const update = generateMockUpdate();
          realtimeEmitter.emit('health-update', update);
        }
      }, 5000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        realtimeEmitter.off('health-update', onHealthUpdate);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

