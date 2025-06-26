import { api } from "@/convex/_generated/api";
import { CONVEX_CLIENT } from "@/lib/convex-client";
import { Doc, Id } from "@/convex/_generated/dataModel";
import {
  AllowedModels,
  ChatRequest,
  EffortLevel,
  ModelParams,
  UserCustomization,
} from "@/types";
import { APIErrorResponse } from "@/types/api";
import { processDataStream } from "ai";
import { useTempMessageStore, Tool } from "@/lib/chat/temp-message-store";
import { buildProviderOptions } from "@/lib/chat/provider-options";
import {
  convertConvexMessagesToCoreMessages,
  validateCoreMessage,
  type APIAttachment,
} from "@/lib/chat/message-converter";
import { getUserApiKeys } from "@/lib/ai/byok-providers";
import { CreateMessageHooks } from "@/hooks/use-create-message";
import { getCachedPreferences } from "@/hooks/use-user-preferences";

/**
 * Retrieves user memories, preferring Convex data if available and falling back to localStorage only while Convex is loading.
 *
 * @returns An array of user memory objects, each containing an `id`, `content`, and `createdAt` timestamp.
 */
function getUserMemoriesData(
  convexMemories:
    | Array<{ id: string; content: string; createdAt: number }>
    | null
    | undefined
): Array<{ id: string; content: string; createdAt: number }> {
  const STORAGE_KEY = "t8-chat-memories";

  // If Convex data has loaded (not undefined), use it as authoritative
  if (convexMemories !== undefined) {
    return convexMemories || [];
  }

  // Only use localStorage when Convex is still loading (undefined)
  try {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to parse localStorage memories:", error);
  }

  return [];
}

/**
 * Retrieves user customization data, prioritizing Convex data if available and falling back to localStorage only while Convex is loading.
 *
 * Combines user customization fields with user memories. Returns `null` if no customization or memories are found.
 *
 * @returns The user customization object with optional memories, or `null` if unavailable.
 */
async function getUserCustomizationData(
  convexData: UserCustomization | null | undefined,
  convexMemories:
    | Array<{ id: string; content: string; createdAt: number }>
    | null
    | undefined
): Promise<UserCustomization | null> {
  const STORAGE_KEY = "t8-chat-prompt-customization";

  // Get memories using consistent pattern
  const memories = getUserMemoriesData(convexMemories);

  // If Convex data has loaded (not undefined), use it as authoritative
  if (convexData !== undefined) {
    const hasAnyData =
      convexData?.name ||
      convexData?.occupation ||
      convexData?.traits ||
      convexData?.additionalInfo ||
      memories.length > 0;
    if (hasAnyData) {
      return {
        name: convexData?.name || "",
        occupation: convexData?.occupation || "",
        traits: convexData?.traits || "",
        additionalInfo: convexData?.additionalInfo || "",
        memories: memories.length > 0 ? memories : undefined,
      };
    }
    return null;
  }

  // Only use localStorage when Convex is still loading (undefined)
  try {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (
        parsed.name ||
        parsed.occupation ||
        parsed.traits ||
        parsed.additionalInfo ||
        memories.length > 0
      ) {
        return {
          name: parsed.name || "",
          occupation: parsed.occupation || "",
          traits: parsed.traits || "",
          additionalInfo: parsed.additionalInfo || "",
          memories: memories.length > 0 ? memories : undefined,
        };
      }
    }
  } catch (error) {
    console.error("Failed to parse localStorage customization:", error);
  }

  return null;
}

/**
 * Minimal attachment data returned from Convex (shared type)
 */
type MinimalAttachment = {
  _id: string;
  attachmentType: string;
  attachmentUrl: string;
  mimeType: string;
};

/**
 * Transform attachments for API submission - only send minimal required data
 */
const transformAttachments = (
  attachments: (Doc<"attachments"> | MinimalAttachment)[]
): APIAttachment[] => {
  return attachments
    .filter((a) => !("status" in a) || a.status !== "deleted")
    .map((a) => ({
      type: a.attachmentType as "image" | "pdf" | "text" | "file",
      url: a.attachmentUrl,
      mimeType: a.mimeType,
    }));
};

/**
 * Create user and assistant messages and send to API
 */
export async function createMessage(
  input: {
    newThread: boolean;
    threadId: string;
    userContent: string;
    model: AllowedModels;
    modelParams?: ModelParams & {
      reasoningEffort: EffortLevel;
      includeSearch: boolean;
    };
    abortController?: AbortController;
    attachments: Array<{
      id: string;
      fileName: string;
      fileUrl?: string;
      fileKey?: string;
      mimeType?: string;
      fileSize?: number;
      status: "uploading" | "uploaded";
    }>;
    temporary?: boolean;
  },
  hooks: CreateMessageHooks
) {
  // Get current user from hooks
  const { currentUser } = hooks.queries;
  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  // Create thread if this is a new thread
  if (input.newThread && !input.temporary) {
    try {
      await hooks.mutations.createThread({
        threadId: input.threadId,
        title: "New Thread", // You can make this dynamic later
        model: input.model,
      });
    } catch (error) {
      console.error("Failed to create thread:", error);
      throw new Error("Failed to create thread");
    }
  }

  // Persist uploaded attachments to DB now that we have a threadId
  const persistedAttachments: MinimalAttachment[] = [];

  // Prepare attachments for batch creation - pass the already-built URL
  const attachmentsToCreate = input.attachments
    .filter(
      (attachment) =>
        attachment.status === "uploaded" &&
        attachment.fileKey &&
        attachment.fileUrl
    )
    .map((attachment) => ({
      fileKey: attachment.fileKey!,
      attachmentUrl: attachment.fileUrl!,
      threadId: input.threadId,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType || "application/octet-stream",
      fileSize: attachment.fileSize || 0,
      attachmentType: attachment.mimeType?.startsWith("image/")
        ? "image"
        : "file",
    }));

  // For existing threads, we need to fetch messages using the client
  // Note: This query needs threadId at runtime, so we keep using CONVEX_CLIENT for now
  const allMessages = input.newThread
    ? []
    : input.temporary
      ? // Get messages from temp store for temporary mode
        useTempMessageStore.getState().getMessagesByThreadId(input.threadId)
      : // Get messages from Convex for persistent mode
        (await CONVEX_CLIENT.query(api.messages.getByThreadId, {
          threadId: input.threadId,
        })) || [];

  const userMessageId = crypto.randomUUID();
  const assistantMessageId = crypto.randomUUID();

  // Create all attachments in a single batch operation with messageId
  if (attachmentsToCreate.length > 0) {
    try {
      if (input.temporary) {
        // Same logic but save to temp store instead of Convex
        const createdAttachments = await useTempMessageStore
          .getState()
          .createAttachments({
            attachments: attachmentsToCreate,
            messageId: userMessageId,
          });
        persistedAttachments.push(...createdAttachments);
      } else {
        // Existing Convex logic
        const createdAttachments = await hooks.mutations.createAttachments({
          attachments: attachmentsToCreate,
          messageId: userMessageId, // Pass the user message ID (string UUID)
        });
        persistedAttachments.push(...createdAttachments);
      }
    } catch (error) {
      console.error("Failed to persist attachments:", error);
    }
  }

  // Use consistent timestamps for both database and temp store
  const now = Date.now();

  const userMessage = {
    messageId: userMessageId,
    content: input.userContent,
    role: "user" as const,
    status: "done" as const,
    model: input.model,
    created_at: now,
    updated_at: now,
    attachmentIds: persistedAttachments.map((a) => a._id as Id<"attachments">),
  };

  const assistantMessage = {
    messageId: assistantMessageId,
    content: "",
    role: "assistant" as const,
    status: "waiting" as const,
    model: input.model,
    // +1 to make sure this is "later"
    created_at: now + 1,
    updated_at: now + 1,
    attachmentIds: [] as Id<"attachments">[], // Fix type issue
    modelParams: input.modelParams,
  };

  // Add assistant message to temp store for streaming
  useTempMessageStore.getState().addMessage({
    messageId: assistantMessageId,
    threadId: input.threadId,
    content: "",
    role: "assistant",
    status: "streaming",
    model: input.model, // Include the selected model
    created_at: now + 1,
    updated_at: now + 1,
  });

  if (input.temporary) {
    // Add user message to temp store as well for temporary mode
    useTempMessageStore.getState().addMessage({
      messageId: userMessageId,
      threadId: input.threadId,
      content: input.userContent,
      role: "user",
      status: "done",
      model: input.model,
      created_at: now,
      updated_at: now,
      attachmentIds: persistedAttachments.map((a) => a._id),
    });
  } else {
    // Add messages to database
    await hooks.mutations.addMessagesToThread({
      threadId: input.threadId,
      messages: [userMessage, assistantMessage],
    });
  }

  // Convert to AI SDK's CoreMessage format using optimized single-pass conversion
  const coreMessages = convertConvexMessagesToCoreMessages(
    allMessages, // Convex messages with attachments
    {
      content: input.userContent,
      attachments: transformAttachments(persistedAttachments),
    }
  );

  // Validate messages before sending
  const validMessages = coreMessages.filter(validateCoreMessage);

  if (validMessages.length === 0) {
    throw new Error("No valid messages to send to AI");
  }

  // Call the API with proper authentication data
  await doChatFetchRequest({
    coreMessages: validMessages,
    threadId: input.threadId,
    assistantMessageId,
    model: input.model,
    modelParams: input.modelParams,
    userId: currentUser._id, // Pass the authenticated user ID
    isNewThread: input.newThread,
    temporary: input.temporary,
    hooks,
  });

  return {
    userMessageId,
    assistantMessageId,
  };
}

/**
 * Sends a chat request to the API, processes the streaming response, and updates message and tool states in real time.
 *
 * Handles user authentication, user preferences, and customization data. Updates temporary and persistent message stores with streaming content, reasoning, provider metadata, tool call states, and errors. Supports tool call streaming and result handling, and marks threads as completed upon response finalization.
 *
 * @param input - Contains chat messages, thread and user identifiers, model configuration, and hooks for data mutations and queries.
 */
async function doChatFetchRequest(input: {
  coreMessages: ChatRequest["messages"];
  threadId: string;
  assistantMessageId: string;
  model: AllowedModels;
  modelParams?: ModelParams & {
    reasoningEffort: EffortLevel;
    includeSearch: boolean;
  };
  userId: Id<"users">;
  isNewThread?: boolean;
  temporary?: boolean;
  hooks: CreateMessageHooks;
}) {
  // Get current user from hooks (already authenticated in main function)
  const { currentUser, userCustomization } = input.hooks.queries;
  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  // Get user API keys for BYOK
  const userApiKeys = getUserApiKeys();

  // Get user preferences (fast, synchronous)
  const userPreferences = getCachedPreferences();

  // Get user customization data
  const userCustomizationData = await getUserCustomizationData(
    userCustomization,
    userCustomization?.memories
  );

  const chatRequest: ChatRequest = {
    messages: input.coreMessages,
    threadMetadata: {
      id: input.threadId,
      // Include title information for the route to make proper decisions
      title: input.isNewThread ? "New Thread" : undefined,
    },
    responseMessageId: input.assistantMessageId,
    model: input.model,
    // Add authentication data that the API route expects
    userId: input.userId,
    // BYOK - Include user API keys
    userApiKeys,
    // User customization data
    userCustomization: userCustomizationData || undefined,
    // Temporary mode flag
    temporary: input.temporary,
    // Spread modelParams into individual fields that ChatRequest expects
    ...(input.modelParams && {
      temperature: input.modelParams.temperature,
      topP: input.modelParams.topP,
      topK: input.modelParams.topK,
      maxTokens: input.modelParams.maxTokens,
      presencePenalty: input.modelParams.presencePenalty,
      frequencyPenalty: input.modelParams.frequencyPenalty,
      stopSequences: input.modelParams.stopSequences,
      seed: input.modelParams.seed,
      providerOptions: buildProviderOptions(
        input.model,
        input.modelParams.reasoningEffort,
        input.modelParams.includeSearch
      ),
    }),
    // User preferences for tool enabling/disabling
    preferences: userPreferences,
  };

  const {
    updateMessage,
    removeMessage,
    addTool,
    updateTool,
    updateTextPart,
    addToolPart,
    updateToolPart,
  } = useTempMessageStore.getState();

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chatRequest),
  });

  if (!response.ok) {
    if (!response.body) {
      throw new Error("Failed to get chat response");
    }

    try {
      const errorBody = (await response.json()) as {
        error: APIErrorResponse;
      };

      console.error("Error from server", errorBody);

      // 1. TEMP STORE FIRST (immediate UI feedback)
      updateMessage(input.assistantMessageId, {
        status: "error",
        content: `Error: ${errorBody.error.message}`,
      });

      // 2. CONVEX SECOND (persistence) - only if not temporary
      if (!input.temporary) {
        await input.hooks.mutations.setErrorMessage({
          messageId: input.assistantMessageId,
          errorMessage: errorBody.error.message,
          errorType: errorBody.error.type,
        });
      }
    } catch (error) {
      console.error("Unable to parse error from server", error);
    }

    return;
  }

  // Extract stream ID from headers if available
  const streamId = response.headers.get("X-Stream-ID");

  // Stores client-side message content
  let messageContent = "";
  let reasoning = "";
  let providerMetadata: Record<string, unknown> | null = null;
  const tools = new Map<string, Tool>();
  const parts: Array<{
    type: "text" | "tool";
    text?: string;
    toolCallId?: string;
    toolName?: string;
    args?: Record<string, unknown>;
    result?: unknown;
    state?: "streaming-start" | "streaming-delta" | "call" | "result";
    timestamp: number;
  }> = [];

  // Process the stream data
  await processDataStream({
    stream: response.body!,
    onTextPart: async (text: string) => {
      messageContent += text;

      // Update the last text part or create a new one
      updateTextPart(input.assistantMessageId, messageContent);

      // Also update the parts array for final Convex sync
      const lastPartIndex = parts.findLastIndex((part) => part.type === "text");
      if (lastPartIndex >= 0) {
        parts[lastPartIndex] = {
          ...parts[lastPartIndex],
          text: messageContent,
        };
      } else {
        parts.push({
          type: "text",
          text: messageContent,
          timestamp: Date.now(),
        });
      }

      updateMessage(input.assistantMessageId, {
        content: messageContent,
        status: "streaming",
      });
    },
    onReasoningPart: async (text: string) => {
      reasoning += text;

      updateMessage(input.assistantMessageId, {
        reasoning: reasoning,
        status: "streaming",
      });
    },
    onDataPart: async (data: unknown) => {
      // Extract provider metadata from data stream
      if (data && typeof data === "object" && data !== null) {
        const dataObj = data as Record<string, unknown>;
        if (dataObj.providerMetadata) {
          providerMetadata = dataObj.providerMetadata as Record<
            string,
            unknown
          >;
          console.log("[CHAT] Received provider metadata:", providerMetadata);
        }

        // Handle other data types if needed
        if (
          dataObj.type === "metadata" ||
          dataObj.type === "provider-metadata"
        ) {
          providerMetadata = { ...providerMetadata, ...dataObj };
        }
      }
    },
    onToolCallStreamingStartPart: async (part) => {
      console.log("[TOOLS] Tool streaming start:", part);

      const newTool = {
        toolCallId: part.toolCallId,
        toolName: part.toolName,
        args: {},
        state: "streaming-start" as const,
        timestamp: Date.now(),
      };

      tools.set(part.toolCallId, newTool);
      addTool(input.assistantMessageId, newTool);

      // Add to parts system
      const newToolPart = {
        type: "tool" as const,
        toolCallId: part.toolCallId,
        toolName: part.toolName,
        args: {},
        state: "streaming-start" as const,
        timestamp: Date.now(),
      };

      parts.push(newToolPart);
      addToolPart(input.assistantMessageId, newToolPart);
    },
    onToolCallDeltaPart: async (part) => {
      console.log("[TOOLS] Tool call delta:", part);

      // Update local tools map but don't trigger React state updates
      // to avoid infinite loop during streaming
      const existingTool = tools.get(part.toolCallId);
      if (existingTool) {
        tools.set(part.toolCallId, {
          ...existingTool,
          state: "streaming-delta" as const,
          timestamp: Date.now(),
        });
      }

      // Update parts array
      const partIndex = parts.findIndex(
        (p) => p.type === "tool" && p.toolCallId === part.toolCallId
      );
      if (partIndex >= 0) {
        parts[partIndex] = {
          ...parts[partIndex],
          state: "streaming-delta" as const,
          timestamp: Date.now(),
        };
      }

      // Don't call updateTool here to prevent infinite React state updates
    },
    onToolCallPart: async (part) => {
      console.log("[TOOLS] Tool call complete:", part);

      const toolUpdate = {
        args: part.args,
        state: "call" as const,
        timestamp: Date.now(),
      };

      const existingTool = tools.get(part.toolCallId);
      if (existingTool) {
        tools.set(part.toolCallId, {
          ...existingTool,
          ...toolUpdate,
        });
      }

      updateTool(input.assistantMessageId, part.toolCallId, toolUpdate);

      // Update parts array
      const partIndex = parts.findIndex(
        (p) => p.type === "tool" && p.toolCallId === part.toolCallId
      );
      if (partIndex >= 0) {
        parts[partIndex] = {
          ...parts[partIndex],
          args: part.args,
          state: "call" as const,
          timestamp: Date.now(),
        };
      }

      // Update parts in temp store
      updateToolPart(input.assistantMessageId, part.toolCallId, {
        args: part.args,
        state: "call",
      });
    },
    onToolResultPart: async (result) => {
      console.log("[TOOLS] Tool result received:", result);

      const toolUpdate = {
        result: result.result,
        state: "result" as const,
        timestamp: Date.now(),
      };

      const existingTool = tools.get(result.toolCallId);
      if (existingTool) {
        tools.set(result.toolCallId, {
          ...existingTool,
          ...toolUpdate,
        });
      }

      updateTool(input.assistantMessageId, result.toolCallId, toolUpdate);

      // Update parts array
      const partIndex = parts.findIndex(
        (p) => p.type === "tool" && p.toolCallId === result.toolCallId
      );
      if (partIndex >= 0) {
        parts[partIndex] = {
          ...parts[partIndex],
          result: result.result,
          state: "result" as const,
          timestamp: Date.now(),
        };
      }

      // Update parts in temp store
      updateToolPart(input.assistantMessageId, result.toolCallId, {
        result: result.result,
        state: "result",
      });

      // Handle saveToMemory tool - use local tools map instead of store lookup
      const correspondingTool = tools.get(result.toolCallId);

      if (correspondingTool?.toolName === "saveToMemory") {
        console.log(
          "[MEMORY] saveToMemory tool completed - Memory Management component will handle localStorage sync"
        );
      }
    },
    onFinishMessagePart: async () => {
      // 1. FIRST: Update temp store to "done" status (immediate UI feedback)
      updateMessage(input.assistantMessageId, {
        content: messageContent,
        reasoning: reasoning,
        status: "done",
      });

      // 2. SECOND: Update Convex with final content (this was moved from API route) - only if not temporary
      if (!input.temporary) {
        try {
          // Update message with final content, reasoning, provider metadata, tools, parts, and stream ID
          const toolsArray = Array.from(tools.values());

          // Convert parts array to proper format for Convex
          const partsArray = parts.map((part) => {
            if (part.type === "text") {
              return {
                type: "text" as const,
                text: part.text!,
                timestamp: part.timestamp,
              };
            } else {
              return {
                type: "tool" as const,
                toolCallId: part.toolCallId!,
                toolName: part.toolName!,
                args: part.args || {},
                result: part.result,
                state: part.state!,
                timestamp: part.timestamp,
              };
            }
          });

          const messageUpdate = input.hooks.mutations.updateMessage({
            messageId: input.assistantMessageId,
            content: messageContent,
            reasoning: reasoning,
            ...(providerMetadata && { providerMetadata }),
            ...(streamId && { streamId }),
            ...(toolsArray.length > 0 && { tools: toolsArray }),
            ...(partsArray.length > 0 && { parts: partsArray }),
            status: "done",
          });

          // Update thread status to completed
          const threadUpdate = input.hooks.mutations.updateThread({
            threadId: input.threadId,
            generationStatus: "completed",
          });

          await Promise.all([messageUpdate, threadUpdate]);

          console.log(
            "[CHAT] Client updated Convex with final content, metadata, and thread status"
          );
        } catch (error) {
          console.error(
            "[CHAT] Error updating Convex with final content:",
            error
          );
        }

        // 3. FINALLY: Remove from temp store (UI will now show Convex version)
        removeMessage(input.assistantMessageId);
      }
    },
    onErrorPart: async (error) => {
      // Handle errors
      console.error("Stream error:", error);

      updateMessage(input.assistantMessageId, {
        status: "error",
        content: `Error: ${error || "Unknown error"}`,
      });
    },
  });
}
