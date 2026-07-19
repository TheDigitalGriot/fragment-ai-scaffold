/**
 * {{PROJECT_NAME}} — Event Bus
 *
 * Transport-agnostic pub/sub backbone.
 * Typed events with handler registration.
 */

import type { BusEvent, EventHandler } from './types.js';

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private allHandlers = new Set<EventHandler>();

  on(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  onAll(handler: EventHandler): () => void {
    this.allHandlers.add(handler);
    return () => {
      this.allHandlers.delete(handler);
    };
  }

  emit(type: string, payload: unknown, source?: string): void {
    const event: BusEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      source,
    };

    const typeHandlers = this.handlers.get(type);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        handler(event);
      }
    }

    for (const handler of this.allHandlers) {
      handler(event);
    }
  }

  off(eventType: string, handler: EventHandler): void {
    this.handlers.get(eventType)?.delete(handler);
  }

  clear(): void {
    this.handlers.clear();
    this.allHandlers.clear();
  }
}
