/**
 * {{PROJECT_NAME}} — Core Types
 * Shared across all surfaces via path aliases.
 */

export type ModelId = 'claude' | 'codex' | 'gemini';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export type ChatViewMode = 'focused' | 'unified';

export type TimelineFilter = 'all' | ModelId;

export interface ModelConnection {
  model: ModelId;
  status: ConnectionStatus;
  lastActivity?: string;
  error?: string;
}

export interface ToolCall {
  id: string;
  model: ModelId;
  tool: string;
  target: string;
  timestamp: string;
  input?: string;
  output?: string;
  duration?: number;
  status: 'running' | 'complete' | 'error';
}

export interface ChatMessage {
  id: string;
  model: ModelId;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}

export interface AppState {
  projectName: string;
  version: string;
  models: Record<ModelId, ModelConnection>;
  chat: {
    activeModel: ModelId;
    viewMode: ChatViewMode;
    messages: Record<ModelId, ChatMessage[]>;
  };
  timeline: {
    filter: TimelineFilter;
    entries: ToolCall[];
  };
}

export const MODEL_COLORS: Record<ModelId, string> = {
  claude: '#ff8c32',
  codex: '#10b981',
  gemini: '#3b82f6',
};

export const MODEL_LABELS: Record<ModelId, string> = {
  claude: 'Claude',
  codex: 'Codex',
  gemini: 'Gemini',
};
