import { NextRequest } from 'next/server';
import { realtimeEmitter } from '@/lib/realtime';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      );

      // Listen for stock updates
      const onStockUpdate = (data: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'stock-update', data })}\n\n`)
        );
      };

      realtimeEmitter.onStockUpdate(onStockUpdate);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        realtimeEmitter.offStockUpdate(onStockUpdate);
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

