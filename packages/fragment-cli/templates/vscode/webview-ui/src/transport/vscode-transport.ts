import type { WebviewTransport } from '{{PACKAGE_SCOPE}}/ui/transport/types.js';

declare function acquireVsCodeApi(): {
  postMessage(msg: unknown): void;
  getState<T>(): T | undefined;
  setState<T>(state: T): void;
};

const vscodeApi = acquireVsCodeApi();

export const vsCodeTransport: WebviewTransport = {
  postMessage(msg: unknown): void {
    vscodeApi.postMessage(msg);
  },

  getState<T>(): T | undefined {
    return vscodeApi.getState<T>();
  },

  setState<T>(state: T): void {
    vscodeApi.setState(state);
  },

  onMessage(handler: (msg: unknown) => void): () => void {
    const listener = (event: MessageEvent) => handler(event.data);
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  },
};
