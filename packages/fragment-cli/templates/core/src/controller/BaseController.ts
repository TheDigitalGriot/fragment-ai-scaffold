/**
 * {{PROJECT_NAME}} — BaseController
 *
 * Abstract base class for platform controllers.
 * Manages state, registers gRPC handlers, emits events.
 * Subclassed by ElectronController and VSCodeController.
 */

import { EventEmitter } from 'events';
import type { AppState, ModelId } from '../shared/types.js';
import { createDefaultState } from '../shared/state.js';
import { handleGrpcRequest, registerUnary } from './grpc-handler.js';

export abstract class BaseController extends EventEmitter {
  protected state: AppState;

  constructor(projectName: string) {
    super();
    this.state = createDefaultState(projectName);
    this._registerHandlers();
  }

  abstract getWorkspaceRoot(): string;

  getState(): AppState {
    return this.state;
  }

  updateState(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    this.emit('state-changed', this.state);
  }

  async handleRequest(
    postMessage: (msg: unknown) => Promise<void>,
    request: {
      service: string;
      method: string;
      message: unknown;
      request_id: string;
      is_streaming: boolean;
    },
  ): Promise<void> {
    return handleGrpcRequest(postMessage, request);
  }

  private _registerHandlers(): void {
    registerUnary('StateService', 'getState', async () => {
      return { state: JSON.stringify(this.state) };
    });

    registerUnary('ChatService', 'sendMessage', async (msg) => {
      const { model, content } = msg as { model: ModelId; content: string };
      this.emit('chat-message', { model, content });
      return { status: 'ok' };
    });

    registerUnary('ChatService', 'setActiveModel', async (msg) => {
      const { model } = msg as { model: ModelId };
      this.state.chat.activeModel = model;
      this.emit('state-changed', this.state);
      return { status: 'ok' };
    });

    registerUnary('ChatService', 'setViewMode', async (msg) => {
      const { mode } = msg as { mode: 'focused' | 'unified' };
      this.state.chat.viewMode = mode;
      this.emit('state-changed', this.state);
      return { status: 'ok' };
    });

    registerUnary('TimelineService', 'setFilter', async (msg) => {
      const { filter } = msg as { filter: string };
      this.state.timeline.filter = filter as AppState['timeline']['filter'];
      this.emit('state-changed', this.state);
      return { status: 'ok' };
    });
  }
}
