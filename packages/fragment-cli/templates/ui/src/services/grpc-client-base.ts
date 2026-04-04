/**
 * {{PROJECT_NAME}} — ProtoBusClient
 *
 * gRPC-over-postMessage client. Sends requests with UUID correlation,
 * listens for matching responses.
 */

import { getTransport } from '../transport/types.js';

let _requestId = 0;
function nextRequestId(): string {
  return `req-${Date.now()}-${++_requestId}`;
}

export interface StreamCallbacks<T> {
  onData(data: T): void;
  onEnd(): void;
  onError?(error: string): void;
}

export abstract class ProtoBusClient {
  makeUnaryRequest<TReq, TRes>(
    service: string,
    method: string,
    message: TReq,
  ): Promise<TRes> {
    const transport = getTransport();
    const requestId = nextRequestId();

    return new Promise((resolve, reject) => {
      const cleanup = transport.onMessage((raw: unknown) => {
        const msg = raw as {
          type: string;
          grpc_response?: {
            request_id: string;
            message: unknown;
            error?: string;
            is_streaming: boolean;
          };
        };

        if (
          msg.type === 'grpc_response' &&
          msg.grpc_response?.request_id === requestId
        ) {
          cleanup();
          if (msg.grpc_response.error) {
            reject(new Error(msg.grpc_response.error));
          } else {
            resolve(msg.grpc_response.message as TRes);
          }
        }
      });

      transport.postMessage({
        type: 'grpc_request',
        grpc_request: {
          service,
          method,
          message,
          request_id: requestId,
          is_streaming: false,
        },
      });
    });
  }

  makeStreamingRequest<TReq, TRes>(
    service: string,
    method: string,
    message: TReq,
    callbacks: StreamCallbacks<TRes>,
  ): () => void {
    const transport = getTransport();
    const requestId = nextRequestId();

    const cleanup = transport.onMessage((raw: unknown) => {
      const msg = raw as {
        type: string;
        grpc_response?: {
          request_id: string;
          message: unknown;
          error?: string;
          is_streaming: boolean;
        };
      };

      if (
        msg.type === 'grpc_response' &&
        msg.grpc_response?.request_id === requestId
      ) {
        if (msg.grpc_response.error) {
          callbacks.onError?.(msg.grpc_response.error);
          cleanup();
        } else if (msg.grpc_response.is_streaming) {
          callbacks.onData(msg.grpc_response.message as TRes);
        } else {
          callbacks.onEnd();
          cleanup();
        }
      }
    });

    transport.postMessage({
      type: 'grpc_request',
      grpc_request: {
        service,
        method,
        message,
        request_id: requestId,
        is_streaming: true,
      },
    });

    return cleanup;
  }
}
