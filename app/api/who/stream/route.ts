import { NextRequest } from 'next/server';
import { realtimeEmitter } from '@/lib/realtime';
import { generateMockUpdate } from '@/lib/who-api';
import { prisma } from '@/lib/prisma';

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

      // Simulate real-time updates every 5 seconds
      const interval = setInterval(async () => {
        const update = generateMockUpdate();
        
        // Save to database
        const indicator = await prisma.healthIndicator.findFirst({
          where: {
            country: update.country,
            indicator: update.indicator,
          },
          orderBy: { date: 'desc' },
        });

        if (indicator) {
          // Update existing indicator
          await prisma.healthIndicator.update({
            where: { id: indicator.id },
            data: {
              value: update.value,
              date: new Date(),
            },
          });

          // Create update record
          await prisma.healthUpdate.create({
            data: {
              indicatorId: indicator.id,
              country: update.country,
              indicatorName: update.indicator,
              value: update.value,
              change: update.change,
              timestamp: update.timestamp,
            },
          });
        }

        // Emit real-time update
        realtimeEmitter.emit('health-update', update);
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

