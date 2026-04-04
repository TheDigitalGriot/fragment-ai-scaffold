import type { WebviewTransport } from '{{PACKAGE_SCOPE}}/ui/transport/types.js';

declare global {
  interface Window {
    electronAPI: {
      send(channel: string, data: unknown): void;
      on(channel: string, callback: (...args: unknown[]) => void): () => void;
      invoke(channel: string, data: unknown): Promise<unknown>;
    };
  }
}

export const electronTransport: WebviewTransport = {
  postMessage(msg: unknown): void {
    const grpcMsg = msg as { type?: string; grpc_request?: unknown };
    if (grpcMsg.type === 'grpc_request') {
      window.electronAPI.invoke('grpc_request', grpcMsg.grpc_request).then((response) => {
        window.dispatchEvent(new MessageEvent('message', { data: response }));
      });
    }
  },

  getState<T>(): T | undefined {
    const stored = localStorage.getItem('fragment-state');
    return stored ? JSON.parse(stored) : undefined;
  },

  setState<T>(state: T): void {
    localStorage.setItem('fragment-state', JSON.stringify(state));
  },

  onMessage(handler: (msg: unknown) => void): () => void {
    const unsubIpc = window.electronAPI.on('state-update', (...args: unknown[]) => {
      handler(args[0]);
    });

    const windowHandler = (event: MessageEvent) => handler(event.data);
    window.addEventListener('message', windowHandler);

    return () => {
      unsubIpc();
      window.removeEventListener('message', windowHandler);
    };
  },
};
