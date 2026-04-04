import { spawn } from 'child_process';
import type { AgentConnection, AgentResponse } from './types.js';
import type { ToolCall } from '{{PACKAGE_SCOPE}}/core/shared/types.js';

export class GeminiAgent implements AgentConnection {
  model = 'gemini' as const;
  private connected = false;

  async connect(): Promise<void> { this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  isConnected(): boolean { return this.connected; }

  async sendMessage(
    content: string,
    onChunk: (text: string) => void,
    onToolCall: (toolCall: ToolCall) => void,
  ): Promise<AgentResponse> {
    return new Promise((resolve) => {
      const child = spawn('gemini', ['-m', content], {
        stdio: ['pipe', 'pipe', 'pipe'], shell: true,
      });

      let fullContent = '';
      const toolCalls: ToolCall[] = [];

      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        fullContent += text;
        onChunk(text);
      });

      child.on('close', (code) => {
        if (code !== 0 && !fullContent) {
          fullContent = `Gemini exited with code ${code}. Ensure gemini CLI is installed.`;
          onChunk(fullContent);
        }
        resolve({ content: fullContent, toolCalls });
      });

      child.on('error', (err) => {
        const msg = `Failed to start gemini: ${err.message}. Ensure gemini CLI is installed.`;
        onChunk(msg);
        resolve({ content: msg, toolCalls: [] });
      });
    });
  }
}
