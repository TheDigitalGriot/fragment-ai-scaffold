import type { ModelId, ToolCall } from '{{PACKAGE_SCOPE}}/core/shared/types.js';

export interface AgentResponse {
  content: string;
  toolCalls: ToolCall[];
}

export interface AgentConnection {
  model: ModelId;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  sendMessage(
    content: string,
    onChunk: (text: string) => void,
    onToolCall: (toolCall: ToolCall) => void,
  ): Promise<AgentResponse>;
}
