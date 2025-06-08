// API-specific types for AI Web Chat Application
// This file contains request/response types for API endpoints only
// Import base types: import { ChatRequest, ResumeChatRequest } from "@/types"

import type {
    ChatRequest,
    UserId,
    TokenUsage
  } from "./index"
  import type { CoreMessage } from "ai"
  
  // ============================================================================
  // API ERROR TYPES
  // ============================================================================
  
  export interface APIErrorResponse {
    type: string
    message: string
    code?: string
    details?: Record<string, unknown>
  }
  
  // ============================================================================
  // CHAT API TYPES (/api/chat)
  // ============================================================================
  
  /**
   * Request body for /api/chat endpoint
   */
  export type ChatAPIRequest = ChatRequest
  
  /**
   * Streaming response events from /api/chat
   */
  export interface ChatAPIStreamResponse {
    type: "text-delta" | "reasoning" | "tool-call" | "tool-result" | "finish" | "error"
    textDelta?: string
    toolCallId?: string
    toolName?: string
    args?: unknown
    result?: unknown
    finishReason?: "stop" | "length" | "content-filter" | "tool-calls" | "error" | "other" | "unknown"
    usage?: TokenUsage
    error?: APIErrorResponse
    providerMetadata?: Record<string, Record<string, unknown>>
  }
  
  /**
   * Final response when stream completes successfully
   */
  export interface ChatAPIFinalResponse {
    success: true
    data: {
      text: string
      reasoning?: string
      usage: TokenUsage
      finishReason: string
      messages: CoreMessage[]
    }
  }
  
  // ============================================================================
  // RESUME API TYPES (/api/chat/resume)
  // ============================================================================
  
  /**
   * Query parameters for /api/chat/resume endpoint
   */
  export interface ResumeAPIQueryParams {
    streamId: string
    resumeAt?: string
    messageId?: string
    sessionId?: string
  }
  
  /**
   * Response from resume API (extends chat stream response)
   */
  export interface ResumeAPIResponse extends ChatAPIStreamResponse {
    resumedAt?: number
  }
  
  // ============================================================================
  // INTERNAL API TYPES (for Convex functions)
  // ============================================================================
  
  export interface InternalAPIRequest {
    apiKey: string
    userId?: UserId
    sessionId?: string
  }
  
  export interface InternalChatMutationRequest extends InternalAPIRequest {
    messageId: string
    content?: string
    reasoning?: string
    status?: string
    streamId?: string
    providerMetadata?: Record<string, Record<string, unknown>>
  }
  
  export interface InternalThreadMutationRequest extends InternalAPIRequest {
    threadId: string
    title?: string
    generationStatus?: string
  }
  
  // ============================================================================
  // STANDARD API RESPONSE WRAPPERS
  // ============================================================================
  
  export interface APISuccessResponse<T = unknown> {
    success: true
    data: T
    meta?: {
      timestamp: number
      requestId?: string
      model?: string
      usage?: TokenUsage
    }
  }
  
  export interface APIErrorWrapper {
    success: false
    error: APIErrorResponse
    meta?: {
      timestamp: number
      requestId?: string
    }
  }
  
  export type APIResponse<T = unknown> = APISuccessResponse<T> | APIErrorWrapper
  
  // ============================================================================
  // HTTP UTILITIES
  // ============================================================================
  
  export enum HTTPStatus {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503
  }
  
  export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" 