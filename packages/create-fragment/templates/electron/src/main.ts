import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { execSync } from 'child_process';
import * as fs from 'fs';
import started from 'electron-squirrel-startup';
import { query } from '@anthropic-ai/claude-agent-sdk';

if (started) {
  app.quit();
}

// ─── Claude Agent SDK (Windows .cmd fix) ────────────────────────────────────

let claudeCodePath: string | undefined;

function findClaudeCodeExecutable(): string | undefined {
  try {
    if (process.platform === 'win32') {
      try {
        const cmdResult = execSync('where claude.cmd', { encoding: 'utf-8' }).trim().split('\n')[0];
        if (fs.existsSync(cmdResult)) return cmdResult;
      } catch {}
      const npmGlobalPaths = [
        path.join(process.env.APPDATA || '', 'npm', 'claude.cmd'),
        path.join(process.env.LOCALAPPDATA || '', 'npm', 'claude.cmd'),
      ];
      for (const p of npmGlobalPaths) {
        if (fs.existsSync(p)) return p;
      }
    } else {
      const result = execSync('which claude', { encoding: 'utf-8' }).trim();
      if (fs.existsSync(result)) return result;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function getCliJsPath(claudePath: string): { cliJsPath: string; isCmd: boolean } {
  const isCmd = claudePath.endsWith('.cmd');
  if (!isCmd) return { cliJsPath: claudePath, isCmd: false };
  const npmDir = path.dirname(claudePath);
  return { cliJsPath: path.join(npmDir, 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js'), isCmd: true };
}

// ─── Chat State ─────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  model: string;
  content: string;
  timestamp: string;
}

interface ToolCall {
  tool: string;
  target: string;
  model: string;
  timestamp: string;
  status: string;
}

const chatMessages: Record<string, ChatMessage[]> = { claude: [], codex: [], gemini: [] };
const toolTimeline: ToolCall[] = [];
let activeModel = 'claude';

// ─── IPC Handlers ───────────────────────────────────────────────────────────

function registerHandlers() {
  claudeCodePath = findClaudeCodeExecutable();
  console.log('[{{PROJECT_NAME}}] Claude path:', claudeCodePath);

  ipcMain.handle('app:get-state', () => ({
    activeModel,
    models: {
      claude: { connected: !!claudeCodePath },
      codex: { connected: false },
      gemini: { connected: false },
    },
    chatMessages,
    toolTimeline,
  }));

  ipcMain.handle('app:set-model', (_, model: string) => {
    activeModel = model;
    return { success: true, activeModel };
  });

  ipcMain.handle('app:send-message', async (_, content: string) => {
    chatMessages[activeModel].push({
      role: 'user', model: activeModel, content,
      timestamp: new Date().toISOString(),
    });

    if (activeModel === 'claude') return await handleClaudeMessage(content);

    const reply: ChatMessage = {
      role: 'assistant', model: activeModel,
      content: `${activeModel} is not connected yet. Install the ${activeModel} CLI to use.`,
      timestamp: new Date().toISOString(),
    };
    chatMessages[activeModel].push(reply);
    return { success: true, message: reply };
  });

  ipcMain.handle('app:debug-info', () => {
    const { cliJsPath, isCmd } = claudeCodePath ? getCliJsPath(claudeCodePath) : { cliJsPath: undefined, isCmd: false };
    return {
      claudeCodePath, cliJsPath, isCmd,
      pathExists: claudeCodePath ? fs.existsSync(claudeCodePath) : false,
      cliJsExists: cliJsPath ? fs.existsSync(cliJsPath) : false,
      platform: process.platform,
      oauthToken: !!process.env.CLAUDE_CODE_OAUTH_TOKEN,
    };
  });
}

async function handleClaudeMessage(content: string): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
  if (!claudeCodePath) {
    const reply: ChatMessage = { role: 'assistant', model: 'claude', content: 'Claude CLI not found. Install with: npm install -g @anthropic-ai/claude-code', timestamp: new Date().toISOString() };
    chatMessages.claude.push(reply);
    return { success: false, message: reply, error: 'CLI not found' };
  }

  const { cliJsPath, isCmd } = getCliJsPath(claudeCodePath);
  if (isCmd && !fs.existsSync(cliJsPath)) {
    const reply: ChatMessage = { role: 'assistant', model: 'claude', content: `cli.js not found at: ${cliJsPath}`, timestamp: new Date().toISOString() };
    chatMessages.claude.push(reply);
    return { success: false, message: reply, error: 'cli.js not found' };
  }

  toolTimeline.push({ tool: 'claude:query', target: content.slice(0, 80), model: 'claude', timestamp: new Date().toISOString(), status: 'running' });

  try {
    const result = query({
      prompt: content,
      options: {
        maxTurns: 5,
        pathToClaudeCodeExecutable: cliJsPath,
        ...(isCmd && { executable: 'node' as const }),
      },
    });

    let responseText = '';
    for await (const message of result) {
      if (message.type === 'assistant') {
        for (const block of message.message.content) {
          if (block.type === 'text') responseText += block.text;
        }
      }
    }

    toolTimeline[toolTimeline.length - 1].status = 'complete';
    const reply: ChatMessage = { role: 'assistant', model: 'claude', content: responseText || '(empty response)', timestamp: new Date().toISOString() };
    chatMessages.claude.push(reply);
    return { success: true, message: reply };
  } catch (error) {
    toolTimeline[toolTimeline.length - 1].status = 'error';
    const errorMsg = error instanceof Error ? error.message : String(error);
    const reply: ChatMessage = { role: 'assistant', model: 'claude', content: `Error: ${errorMsg}`, timestamp: new Date().toISOString() };
    chatMessages.claude.push(reply);
    return { success: false, message: reply, error: errorMsg };
  }
}

// ─── Window ─────────────────────────────────────────────────────────────────

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1400, height: 900, minWidth: 900, minHeight: 600,
    title: '{{PROJECT_NAME}}',
    backgroundColor: '#0a0a12',
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.openDevTools();
};

app.on('ready', () => { registerHandlers(); createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
