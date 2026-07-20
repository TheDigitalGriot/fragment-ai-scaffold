import type { ModelId, ChatMessage, ToolCall } from '{{PACKAGE_SCOPE}}/core/shared/types.js';
import { resolveAnthropicAuth, describeAuth, authEnv } from '{{PACKAGE_SCOPE}}/core/shared/auth.js';
import type { VSCodeController } from '../controller/VSCodeController.js';
import { spawn, type ChildProcess } from 'child_process';

export class AgentManager {
  private controller: VSCodeController;
  private msgIdCounter = 0;

  constructor(controller: VSCodeController) {
    this.controller = controller;

    controller.on('chat-message', ({ model, content }: { model: ModelId; content: string }) => {
      this.handleChatMessage(model, content);
    });
  }

  async connectAll(): Promise<void> {
    const state = this.controller.getState();
    for (const model of ['claude', 'codex', 'gemini'] as ModelId[]) {
      state.models[model].status = 'connected';
    }
    this.controller.emit('state-changed', state);
  }

  async disconnectAll(): Promise<void> {
    const state = this.controller.getState();
    for (const model of ['claude', 'codex', 'gemini'] as ModelId[]) {
      state.models[model].status = 'disconnected';
    }
  }

  private async handleChatMessage(model: ModelId, content: string): Promise<void> {
    const state = this.controller.getState();

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${++this.msgIdCounter}`,
      model, role: 'user', content,
      timestamp: new Date().toISOString(),
    };
    state.chat.messages[model].push(userMsg);
    this.controller.emit('state-changed', state);

    // Add assistant placeholder
    const assistantMsg: ChatMessage = {
      id: `msg-${++this.msgIdCounter}`,
      model, role: 'assistant', content: '',
      timestamp: new Date().toISOString(), toolCalls: [],
    };
    state.chat.messages[model].push(assistantMsg);

    // Send to agent (simplified — uses CLI subprocess pattern)
    const cli = model === 'claude' ? 'claude' : model === 'codex' ? 'codex' : 'gemini';

    // Claude auth: STRICT subscription-first (CLAUDE_CODE_OAUTH_TOKEN). If no
    // credential resolves, surface an actionable message instead of spawning —
    // a Griot tool never silently bills the metered API (see core/shared/auth).
    const claudeAuth = model === 'claude' ? resolveAnthropicAuth() : undefined;
    if (claudeAuth && claudeAuth.mode === 'none') {
      assistantMsg.content = describeAuth(claudeAuth);
      this.controller.emit('state-changed', state);
      return;
    }
    const childEnv = claudeAuth ? authEnv(claudeAuth) : process.env;

    try {
      const child = spawn(cli, ['-m', content], { shell: true, stdio: ['pipe', 'pipe', 'pipe'], env: childEnv });
      let fullContent = '';

      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        fullContent += text;
        assistantMsg.content = fullContent;
        state.models[model].lastActivity = new Date().toISOString();
        this.controller.emit('state-changed', state);
      });

      child.on('close', () => {
        if (!fullContent) {
          assistantMsg.content = `${cli} CLI not available. Install and authenticate to use.`;
          this.controller.emit('state-changed', state);
        }
      });

      child.on('error', () => {
        assistantMsg.content = `Failed to start ${cli}. Ensure it is installed.`;
        this.controller.emit('state-changed', state);
      });
    } catch {
      assistantMsg.content = `Failed to start ${cli}. Ensure it is installed.`;
      this.controller.emit('state-changed', state);
    }
  }
}
