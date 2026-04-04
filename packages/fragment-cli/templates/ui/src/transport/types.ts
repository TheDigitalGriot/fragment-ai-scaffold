/**
 * {{PROJECT_NAME}} — WebviewTransport Interface
 *
 * Platform abstraction for communication between webview UI and host.
 * VS Code: acquireVsCodeApi()
 * Electron: window.electronAPI (via contextBridge)
 */

export interface WebviewTransport {
  postMessage(msg: unknown): void;
  getState<T>(): T | undefined;
  setState<T>(state: T): void;
}

let _transport: WebviewTransport | null = null;

export function setTransport(transport: WebviewTransport): void {
  _transport = transport;
}

export function getTransport(): WebviewTransport {
  if (!_transport) {
    throw new Error(
      'WebviewTransport not initialized. Call setTransport() before React mounts.',
    );
  }
  return _transport;
}
