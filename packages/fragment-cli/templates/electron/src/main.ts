import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import type { ModelId, ChatMessage, ToolCall } from '{{PACKAGE_SCOPE}}/core/shared/types.js';
import { createDefaultState } from '{{PACKAGE_SCOPE}}/core/shared/state.js';
import { ClaudeAgent } from './agents/claude.js';
import { CodexAgent } from './agents/codex.js';
import { GeminiAgent } from './agents/gemini.js';
import type { AgentConnection } from './agents/types.js';

let mainWindow: BrowserWindow | null = null;
let state = createDefaultState('{{PROJECT_NAME}}');
let msgIdCounter = 0;

const agents: Record<ModelId, AgentConnection> = {
  claude: new ClaudeAgent(),
  codex: new CodexAgent(),
  gemini: new GeminiAgent(),
};

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400, height: 900, minWidth: 900, minHeight: 600,
    title: '{{PROJECT_NAME}}',
    backgroundColor: '#0a0a12',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
}

function sendToRenderer(channel: string, data: unknown): void {
  mainWindow?.webContents.send(channel, data);
}

function pushState(): void {
  sendToRenderer('state-update', { type: 'state-update', state: JSON.stringify(state) });
}

function registerIpcHandlers(): void {
  ipcMain.handle('grpc_request', async (_event, request) => {
    const { service, method, message, request_id } = request;

    if (service === 'StateService' && method === 'getState') {
      return { type: 'grpc_response', grpc_response: { request_id, message: { state: JSON.stringify(state) }, is_streaming: false } };
    }

    if (service === 'ChatService' && method === 'sendMessage') {
      const { model, content } = message as { model: ModelId; content: string };
      handleChatMessage(model, content);
      return { type: 'grpc_response', grpc_response: { request_id, message: { status: 'ok' }, is_streaming: false } };
    }

    if (service === 'ChatService' && method === 'setActiveModel') {
      const { model } = message as { model: ModelId };
      state.chat.activeModel = model;
      pushState();
      return { type: 'grpc_response', grpc_response: { request_id, message: { status: 'ok' }, is_streaming: false } };
    }

    if (service === 'ChatService' && method === 'setViewMode') {
      const { mode } = message as { mode: 'focused' | 'unified' };
      state.chat.viewMode = mode;
      pushState();
      return { type: 'grpc_response', grpc_response: { request_id, message: { status: 'ok' }, is_streaming: false } };
    }

    if (service === 'TimelineService' && method === 'setFilter') {
      const { filter } = message as { filter: string };
      state.timeline.filter = filter as typeof state.timeline.filter;
      pushState();
      return { type: 'grpc_response', grpc_response: { request_id, message: { status: 'ok' }, is_streaming: false } };
    }

    return { type: 'grpc_response', grpc_response: { request_id, error: `Unknown: ${service}.${method}`, is_streaming: false } };
  });
}

async function handleChatMessage(model: ModelId, content: string): Promise<void> {
  const userMsg: ChatMessage = {
    id: `msg-${++msgIdCounter}`, model, role: 'user', content,
    timestamp: new Date().toISOString(),
  };
  state.chat.messages[model].push(userMsg);
  pushState();

  const agent = agents[model];
  if (!agent.isConnected()) {
    await agent.connect();
    state.models[model].status = 'connected';
    pushState();
  }

  const assistantMsg: ChatMessage = {
    id: `msg-${++msgIdCounter}`, model, role: 'assistant', content: '',
    timestamp: new Date().toISOString(), toolCalls: [],
  };
  state.chat.messages[model].push(assistantMsg);

  await agent.sendMessage(
    content,
    (chunk) => {
      assistantMsg.content += chunk;
      state.models[model].lastActivity = new Date().toISOString();
      pushState();
    },
    (toolCall) => {
      state.timeline.entries.push(toolCall);
      assistantMsg.toolCalls?.push(toolCall);
      pushState();
    },
  );
}

app.whenReady().then(async () => {
  registerIpcHandlers();

  for (const [id, agent] of Object.entries(agents)) {
    try {
      await agent.connect();
      state.models[id as ModelId].status = 'connected';
    } catch {
      state.models[id as ModelId].status = 'error';
    }
  }

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
