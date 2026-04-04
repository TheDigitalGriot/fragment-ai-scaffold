import type { AgentConnection, AgentResponse } from './types.js';
import type { ToolCall } from '{{PACKAGE_SCOPE}}/core/shared/types.js';

export class ClaudeAgent implements AgentConnection {
  model = 'claude' as const;
  private connected = false;

  async connect(): Promise<void> {
    const token = process.env.CLAUDE_CODE_OAUTH_TOKEN;
    if (!token) {
      console.warn('CLAUDE_CODE_OAUTH_TOKEN not set. Run `claude setup-token` to authenticate.');
    }
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async sendMessage(
    content: string,
    onChunk: (text: string) => void,
    onToolCall: (toolCall: ToolCall) => void,
  ): Promise<AgentResponse> {
    const { Agent } = await import('@anthropic-ai/claude-agent-sdk');
    const agent = new Agent({ model: 'claude-sonnet-4-6' });
    const toolCalls: ToolCall[] = [];
    let fullContent = '';

    try {
      const response = await agent.run(content);
      if (typeof response === 'string') {
        fullContent = response;
        onChunk(response);
      } else if (response && typeof response === 'object') {
        const text = (response as { content?: string }).content || String(response);
        fullContent = text;
        onChunk(text);
      }
    } catch (error) {
      const errorMsg = `Error: ${error instanceof Error ? error.message : String(error)}`;
      fullContent = errorMsg;
      onChunk(errorMsg);
    }

    return { content: fullContent, toolCalls };
  }
}
