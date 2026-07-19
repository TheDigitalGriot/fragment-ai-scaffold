import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getState: () => ipcRenderer.invoke('app:get-state'),
  setModel: (model: string) => ipcRenderer.invoke('app:set-model', model),
  sendMessage: (content: string) => ipcRenderer.invoke('app:send-message', content),
  drive: (intent: { model?: string; content: string }) => ipcRenderer.invoke('app:drive', intent),
  debugInfo: () => ipcRenderer.invoke('app:debug-info'),
});

declare global {
  interface Window {
    api: {
      getState: () => Promise<unknown>;
      setModel: (model: string) => Promise<unknown>;
      sendMessage: (content: string) => Promise<unknown>;
      drive: (intent: { model?: string; content: string }) => Promise<unknown>;
      debugInfo: () => Promise<unknown>;
    };
  }
}
