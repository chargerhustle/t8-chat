// Core TypeScript Types for AI Web Chat Application
// This file defines ONLY our custom types that extend or combine existing types
// Import AI SDK types directly: import { CoreMessage } from "ai"
// Import Convex types directly: import { Doc, Id } from "@/convex/_generated/dataModel"

import type { CoreMessage } from "ai";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { MODEL_CONFIGS } from "@/ai/models-config";
import type { UserPreferences } from "@/hooks/use-user-preferences";
import type { Toolkits } from "@/toolkits/toolkits/shared";
import type { memoryParameters } from "@/toolkits/toolkits/memory/base";
import type { exaParameters } from "@/toolkits/toolkits/exa/base";
import { z } from "zod";

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
export type AllowedModels = (typeof MODEL_CONFIGS)[number]["model"];

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
// TOOLKIT TYPES (based on existing shared types)
// ============================================================================

/**
 * Inferred toolkit parameters (actual TypeScript types from Zod schemas)
 */
export type ToolkitParameters = {
  [Toolkits.Memory]: z.infer<typeof memoryParameters>;
  [Toolkits.Exa]: z.infer<typeof exaParameters>;
  // Add new toolkits here when they're created
};

/**
 * Toolkit configuration for requests
 */
export interface ToolkitConfig<T extends Toolkits = Toolkits> {
  id: T;
  parameters: ToolkitParameters[T];
}

/**
 * Union type of all possible toolkit configurations
 */
export type AnyToolkitConfig = {
  [K in Toolkits]: ToolkitConfig<K>;
}[Toolkits];

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
  userCustomization?: UserCustomization;
  preferences?: UserPreferences;
  temporary?: boolean;

  // Toolkits configuration - properly typed
  toolkits?: AnyToolkitConfig[];

  // BYOK - User API keys
  userApiKeys?: {
    anthropic?: string;
    openai?: string;
    google?: string;
    openrouter?: string;
  };
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
  };
  socials: {
    github: string;
    //x: string;
  };
};

export interface Memory {
  id: string;
  content: string;
  createdAt: number;
}

export interface UserCustomization {
  name: string;
  occupation: string;
  traits: string;
  additionalInfo: string;
  memories?: Memory[];
  preferences?: UserPreferences;
}
