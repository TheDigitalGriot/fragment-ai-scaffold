/**
 * {{PROJECT_NAME}} — Core Types
 *
 * Shared types consumed by all surfaces via path aliases.
 * This file is the skeleton — flesh out with your project's domain types.
 */

export interface AppState {
  projectName: string;
  version: string;
  connectedModels: ModelConnection[];
}

export interface ModelConnection {
  model: 'claude' | 'codex' | 'gemini';
  status: 'connected' | 'disconnected' | 'error';
  lastActivity?: string;
}

export interface ToolCall {
  id: string;
  model: 'claude' | 'codex' | 'gemini';
  tool: string;
  target: string;
  timestamp: string;
  input?: string;
  output?: string;
  duration?: number;
}

export interface ChatMessage {
  id: string;
  model: 'claude' | 'codex' | 'gemini';
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}
