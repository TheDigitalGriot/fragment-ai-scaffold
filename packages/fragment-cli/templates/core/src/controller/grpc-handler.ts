/**
 * {{PROJECT_NAME}} — gRPC-over-postMessage Handler Registry
 *
 * Registers unary and streaming handlers keyed by "service.method".
 * Dispatches incoming requests to the correct handler.
 */

export type UnaryHandlerFn = (message: unknown) => Promise<unknown>;

export type StreamHandlerFn = (
  message: unknown,
  push: (response: unknown) => void,
) => Promise<void>;

const _unaryRegistry = new Map<string, UnaryHandlerFn>();
const _streamRegistry = new Map<string, StreamHandlerFn>();

export function registerUnary(
  service: string,
  method: string,
  fn: UnaryHandlerFn,
): void {
  _unaryRegistry.set(`${service}.${method}`, fn);
}

export function registerStream(
  service: string,
  method: string,
  fn: StreamHandlerFn,
): void {
  _streamRegistry.set(`${service}.${method}`, fn);
}

export async function handleGrpcRequest(
  postMessage: (msg: unknown) => Promise<void>,
  request: {
    service: string;
    method: string;
    message: unknown;
    request_id: string;
    is_streaming: boolean;
  },
): Promise<void> {
  const key = `${request.service}.${request.method}`;

  if (request.is_streaming) {
    const handler = _streamRegistry.get(key);
    if (!handler) {
      await postMessage({
        type: 'grpc_response',
        grpc_response: {
          request_id: request.request_id,
          error: `No streaming handler for ${key}`,
          is_streaming: false,
        },
      });
      return;
    }

    await handler(request.message, async (response) => {
      await postMessage({
        type: 'grpc_response',
        grpc_response: {
          request_id: request.request_id,
          message: response,
          is_streaming: true,
        },
      });
    });

    // Signal stream end
    await postMessage({
      type: 'grpc_response',
      grpc_response: {
        request_id: request.request_id,
        message: null,
        is_streaming: false,
      },
    });
  } else {
    const handler = _unaryRegistry.get(key);
    if (!handler) {
      await postMessage({
        type: 'grpc_response',
        grpc_response: {
          request_id: request.request_id,
          error: `No unary handler for ${key}`,
          is_streaming: false,
        },
      });
      return;
    }

    const result = await handler(request.message);
    await postMessage({
      type: 'grpc_response',
      grpc_response: {
        request_id: request.request_id,
        message: result,
        is_streaming: false,
      },
    });
  }
}
