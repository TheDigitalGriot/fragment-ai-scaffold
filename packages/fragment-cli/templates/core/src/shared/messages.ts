/**
 * {{PROJECT_NAME}} — IPC Message Protocol
 *
 * gRPC-over-postMessage message types for webview ↔ host communication.
 * UUID-correlated request/response pattern.
 */

export interface GrpcRequest {
  type: 'grpc_request';
  grpc_request: {
    service: string;
    method: string;
    message: unknown;
    request_id: string;
    is_streaming: boolean;
  };
}

export interface GrpcResponse {
  type: 'grpc_response';
  grpc_response: {
    request_id: string;
    message: unknown;
    is_streaming: boolean;
    error?: string;
  };
}

export type IpcMessage = GrpcRequest | GrpcResponse;

export function isGrpcRequest(msg: unknown): msg is GrpcRequest {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as GrpcRequest).type === 'grpc_request'
  );
}

export function isGrpcResponse(msg: unknown): msg is GrpcResponse {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as GrpcResponse).type === 'grpc_response'
  );
}
