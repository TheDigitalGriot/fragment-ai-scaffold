/**
 * {{PROJECT_NAME}} — Event Bus Types
 */

export interface BusEvent {
  type: string;
  payload: unknown;
  timestamp: string;
  source?: string;
}

export interface BusAdapter {
  id: string;
  type: 'push' | 'poll';
  connect(bus: EventBus): Promise<void>;
  disconnect(): Promise<void>;
  onEvent?(event: BusEvent): Promise<void>;
  getUpdates?(since: string): Promise<BusEvent[]>;
}

export type EventHandler = (event: BusEvent) => void;

// Forward reference — implemented in event-bus.ts
export type EventBus = import('./event-bus.js').EventBus;
