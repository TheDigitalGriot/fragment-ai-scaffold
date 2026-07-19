import type { WebviewTransport } from "{{PACKAGE_SCOPE}}/ui/transport/types.js";

export type ConnStatus = "connecting" | "connected" | "disconnected" | "error";

export interface WebSocketTransportOptions {
  url: string; // ws://<lan-ip>:<port> (LAN) or wss://… (relay)
  reconnect?: boolean; // default true
  pingIntervalMs?: number; // app-level keepalive, default 10s
  onStatusChange?: (s: ConnStatus) => void;
}

/**
 * Network-backed sibling of vsCodeTransport / electron window.api. The "host"
 * is a daemon reachable over the network (LAN direct or relay). Speaks the SAME
 * grpc_request / grpc_response / state-update envelope as the in-process hosts,
 * so ProtoBusClient + AppStateContext work unchanged.
 */
export class WebSocketTransport implements WebviewTransport {
  private ws: WebSocket | null = null;
  private handlers = new Set<(msg: unknown) => void>();
  private outbox: string[] = [];
  private webviewState: unknown;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempt = 0;
  private closed = false;

  constructor(private opts: WebSocketTransportOptions) {
    this.connect();
  }

  private connect(): void {
    this.opts.onStatusChange?.("connecting");
    const ws = new WebSocket(this.opts.url); // RN global WebSocket
    this.ws = ws;
    ws.onopen = () => {
      this.attempt = 0;
      this.opts.onStatusChange?.("connected");
      for (const q of this.outbox.splice(0)) ws.send(q);
      this.startPing();
    };
    ws.onmessage = (e: MessageEvent) => {
      let data: unknown;
      try {
        data = JSON.parse(typeof e.data === "string" ? e.data : String(e.data));
      } catch {
        return;
      }
      for (const h of this.handlers) h(data);
    };
    ws.onerror = () => this.opts.onStatusChange?.("error");
    ws.onclose = () => {
      this.stopPing();
      this.opts.onStatusChange?.("disconnected");
      if (!this.closed && (this.opts.reconnect ?? true)) this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    const delay = Math.min(30_000, 1_000 * ++this.attempt); // linear backoff, cap 30s
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private startPing(): void {
    const interval = this.opts.pingIntervalMs ?? 10_000;
    this.stopPing();
    // Half-open sockets may never emit 'close'; app-level ping surfaces death.
    this.pingTimer = setInterval(
      () => this.postMessage({ type: "ping", timestamp: Date.now() }),
      interval,
    );
  }
  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  postMessage(msg: unknown): void {
    const raw = JSON.stringify(msg);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(raw);
    else this.outbox.push(raw); // buffer until (re)connected
  }
  onMessage(handler: (msg: unknown) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
  getState<T>(): T | undefined {
    return this.webviewState as T | undefined;
  }
  setState<T>(state: T): void {
    this.webviewState = state;
  }

  close(): void {
    this.closed = true;
    this.stopPing();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}
