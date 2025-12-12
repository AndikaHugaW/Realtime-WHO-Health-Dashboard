// Real-time event emitter for health data updates
import { EventEmitter } from 'events';

export interface HealthUpdateEvent {
  country: string;
  indicator: string;
  value: number;
  change: number;
  timestamp: number;
}

class RealtimeEmitter extends EventEmitter {
  private static instance: RealtimeEmitter;

  private constructor() {
    super();
  }

  public static getInstance(): RealtimeEmitter {
    if (!RealtimeEmitter.instance) {
      RealtimeEmitter.instance = new RealtimeEmitter();
    }
    return RealtimeEmitter.instance;
  }

  public emitHealthUpdate(data: HealthUpdateEvent) {
    this.emit('health-update', data);
  }

  public onHealthUpdate(callback: (data: HealthUpdateEvent) => void) {
    this.on('health-update', callback);
  }

  public offHealthUpdate(callback: (data: HealthUpdateEvent) => void) {
    this.off('health-update', callback);
  }
}

export const realtimeEmitter = RealtimeEmitter.getInstance();
export type { HealthUpdateEvent };

