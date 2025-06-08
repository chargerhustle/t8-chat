// Core TypeScript Types for AI Web Chat Application
// This file defines ONLY our custom types that extend or combine existing types
// Import AI SDK types directly: import { CoreMessage } from "ai"
// Import Convex types directly: import { Doc, Id } from "@/convex/_generated/dataModel"

import type { CoreMessage } from "ai";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { MODEL_CONFIGS } from "@/ai/models-config";

// ============================================================================
// CONVEX DOCUMENT ALIASES (for convenience only)
// ============================================================================

export type ThreadDoc = Doc<"threads">;
export type MessageDoc = Doc<"messages">;
export type AttachmentDoc = Doc<"attachments">;
export type ThreadId = Id<"threads">;
export type MessageId = Id<"messages">;
export type AttachmentId = Id<"attachments">;
export type UserId = Id<"users">;

// ============================================================================
// AI MODEL TYPES (from ai/models-config.ts)
// ============================================================================

// Automatically derive AllowedModels from MODEL_CONFIGS to ensure they're always in sync
export type AllowedModels = typeof MODEL_CONFIGS[number]["model"];

export type EffortLevel = "low" | "medium" | "high";

export interface ModelParams {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  stopSequences?: string[];
  seed?: number;
  // Provider-specific options
  reasoningEffort?: EffortLevel;
  includeSearch?: boolean;
}

// ============================================================================
// CHAT REQUEST TYPES (AI SDK Compatible)
// ============================================================================

export interface ThreadMetadata {
  id: string;
  title?: string;
}

/**
 * Main chat request for /api/chat - compatible with AI SDK streamText()
 */
export interface ChatRequest {
  // AI SDK core parameters
  messages: CoreMessage[];
  model: AllowedModels;
  system?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  stopSequences?: string[];
  seed?: number;
  providerOptions?: Record<string, Record<string, unknown>>;

  // Our application metadata
  threadMetadata: ThreadMetadata;
  responseMessageId: string;
  userId?: UserId;
  userPromptCustomization?: UserPromptCustomization;
}

export interface ResumeChatRequest {
  streamId: string;
  resumeAt?: number;
  messageId: MessageId;
  sessionId?: string;
}

export interface UserPromptCustomization {
  systemPrompt?: string;
  customInstructions?: string;
  responseStyle?: "concise" | "detailed" | "creative";
}

// ============================================================================
// CONVEX FUNCTION ARGUMENTS
// ============================================================================

export interface CreateMessageArgs {
  messageId: string;
  threadId: string;
  userId: UserId;
  content: string;
  role: CoreMessage["role"];
  model: AllowedModels;
  attachmentIds?: AttachmentId[];
  modelParams?: ModelParams;
  resumableStreamId?: string;
}

export interface UpdateMessageContentArgs {
  messageId: string;
  content?: string;
  reasoning?: string;
  status?: MessageDoc["status"];
  providerMetadata?: Record<string, Record<string, unknown>>;
}

export interface CreateThreadArgs {
  threadId: string;
  title: string;
  userId: UserId;
  model: AllowedModels;
  pinned?: boolean;
}

// ============================================================================
// FRONTEND INTEGRATION
// ============================================================================

export interface CreateMessageInput {
  newThread: boolean;
  threadId: string;
  userContent: string;
  model: AllowedModels;
  modelParams?: ModelParams;
  abortController?: AbortController;
  attachments: AttachmentDoc[];
}

/**
 * Message with its associated attachments for frontend display
 */
export interface MessageWithAttachments {
  message: MessageDoc;
  attachments: AttachmentDoc[];
}

/**
 * Result of converting a Convex message to AI SDK format
 */
export interface MessageConversionResult {
  coreMessage: CoreMessage;
  hasAttachments: boolean;
  attachmentCount: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface AuthInfo {
  id: UserId;
  sessionId?: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export type SiteConfig = {
  name: string;
  title: string;
  description: string;
  origin: string;
  og: string;
  keywords: string[];
  creator: {
    name: string;
    url: string;
  }
  socials: {
    github: string;
    //x: string;
  }
}