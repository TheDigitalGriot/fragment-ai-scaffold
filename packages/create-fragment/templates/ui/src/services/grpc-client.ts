/**
 * {{PROJECT_NAME}} — Typed Service Clients
 */

import { ProtoBusClient } from './grpc-client-base.js';
import type { ModelId, ChatViewMode, TimelineFilter } from '{{PACKAGE_SCOPE}}/core/shared/types.js';

export class ChatServiceClient extends ProtoBusClient {
  async sendMessage(model: ModelId, content: string): Promise<{ status: string }> {
    return this.makeUnaryRequest('ChatService', 'sendMessage', { model, content });
  }

  async setActiveModel(model: ModelId): Promise<{ status: string }> {
    return this.makeUnaryRequest('ChatService', 'setActiveModel', { model });
  }

  async setViewMode(mode: ChatViewMode): Promise<{ status: string }> {
    return this.makeUnaryRequest('ChatService', 'setViewMode', { mode });
  }

  /** click-to-drive: advance the session from a click (parity with a typed message). */
  async driveIntent(intent: { model?: ModelId; content: string; source?: string }): Promise<{ status: string }> {
    return this.makeUnaryRequest('ChatService', 'drive', intent);
  }
}

export class TimelineServiceClient extends ProtoBusClient {
  async setFilter(filter: TimelineFilter): Promise<{ status: string }> {
    return this.makeUnaryRequest('TimelineService', 'setFilter', { filter });
  }
}

export class StateServiceClient extends ProtoBusClient {
  async getState(): Promise<{ state: string }> {
    return this.makeUnaryRequest('StateService', 'getState', {});
  }
}

export const chatService = new ChatServiceClient();
export const timelineService = new TimelineServiceClient();
export const stateService = new StateServiceClient();
