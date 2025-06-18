import { api } from "@/convex/_generated/api";
import { CONVEX_CLIENT } from "@/lib/convex-client";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { AllowedModels, ChatRequest, EffortLevel, ModelParams } from "@/types";
import { APIErrorResponse } from "@/types/api";
import { processDataStream } from "ai";
import { useTempMessageStore } from "@/lib/chat/temp-message-store";
import { buildProviderOptions } from "@/lib/chat/provider-options";
import {
  convertConvexMessagesToCoreMessages,
  validateCoreMessage,
  type APIAttachment,
} from "@/lib/chat/message-converter";
import { getUserApiKeys } from "@/lib/ai/byok-providers";
import { UserCustomization } from "@/ai/prompt";

/**
 * Get user customization data - localStorage first, then Convex fallback
 */
async function getUserCustomization(): Promise<UserCustomization | null> {
  const STORAGE_KEY = "t8-chat-prompt-customization";

  try {
    // Try localStorage first for immediate response
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      if (
        parsed.name ||
        parsed.occupation ||
        parsed.traits ||
        parsed.additionalInfo
      ) {
        return {
          name: parsed.name || "",
          occupation: parsed.occupation || "",
          traits: parsed.traits || "",
          additionalInfo: parsed.additionalInfo || "",
        };
      }
    }
  } catch (error) {
    console.error("Failed to parse localStorage customization:", error);
  }

  try {
    // Fallback to Convex if localStorage is empty or invalid
    const convexData = await CONVEX_CLIENT.query(api.auth.getUserCustomization);
    if (convexData) {
      return convexData;
    }
  } catch (error) {
    console.error("Failed to fetch Convex customization:", error);
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
export async function createMessage(input: {
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
}) {
  // Get current user from Convex Auth
  const currentUser = await CONVEX_CLIENT.query(api.auth.getCurrentUser);
  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  // Create thread if this is a new thread
  if (input.newThread) {
    try {
      await CONVEX_CLIENT.mutation(api.threads.createThread, {
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

  // Create all attachments in a single batch operation
  if (attachmentsToCreate.length > 0) {
    try {
      const createdAttachments = await CONVEX_CLIENT.mutation(
        api.attachments.createAttachments,
        { attachments: attachmentsToCreate }
      );
      persistedAttachments.push(...createdAttachments);
    } catch (error) {
      console.error("Failed to persist attachments:", error);
    }
  }

  const allMessages = input.newThread
    ? []
    : (await CONVEX_CLIENT.query(api.messages.getByThreadId, {
        threadId: input.threadId,
      })) || []; // Handle null case

  const userMessageId = crypto.randomUUID();
  const assistantMessageId = crypto.randomUUID();

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

  // Add ONLY assistant message to temp store (user is already in Convex)
  useTempMessageStore.getState().addMessage({
    messageId: assistantMessageId,
    threadId: input.threadId,
    content: "",
    role: "assistant",
    status: "streaming",
    created_at: now + 1,
    updated_at: now + 1,
  });

  // Add messages to database
  await CONVEX_CLIENT.mutation(api.messages.addMessagesToThread, {
    threadId: input.threadId,
    messages: [userMessage, assistantMessage],
  });

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
  });

  return {
    userMessageId,
    assistantMessageId,
  };
}

/**
 * Process chat request and handle streaming response
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
}) {
  // Get current user from Convex Auth
  const currentUser = await CONVEX_CLIENT.query(api.auth.getCurrentUser);
  if (!currentUser) {
    throw new Error("User not authenticated");
  }

  // Get user API keys for BYOK
  const userApiKeys = getUserApiKeys();

  // Get user customization data
  const userCustomization = await getUserCustomization();

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
    userCustomization: userCustomization || undefined,
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
    // preferences: input.preferences ?? {},
  };

  const { updateMessage, removeMessage } = useTempMessageStore.getState();

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

      // 2. CONVEX SECOND (persistence)
      await CONVEX_CLIENT.mutation(api.messages.setErrorMessage, {
        messageId: input.assistantMessageId,
        errorMessage: errorBody.error.message,
        errorType: errorBody.error.type,
      });
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

  // Process the stream data
  await processDataStream({
    stream: response.body!,
    onTextPart: async (text: string) => {
      messageContent += text;

      updateMessage(input.assistantMessageId, {
        content: messageContent,
        status: "streaming",
      });
    },
    onReasoningPart: async (text: string) => {
      reasoning += text;

      // OPTIMAL: Direct method call, no repeated getState()
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
    onFinishMessagePart: async () => {
      // 1. FIRST: Update temp store to "done" status (immediate UI feedback)
      updateMessage(input.assistantMessageId, {
        content: messageContent,
        reasoning: reasoning,
        status: "done",
      });

      // 2. SECOND: Update Convex with final content (this was moved from API route)
      try {
        // Update message with final content, reasoning, provider metadata, and stream ID
        const messageUpdate = CONVEX_CLIENT.mutation(
          api.messages.updateMessage,
          {
            messageId: input.assistantMessageId,
            content: messageContent,
            reasoning: reasoning,
            ...(providerMetadata && { providerMetadata }),
            ...(streamId && { streamId }),
            status: "done",
          }
        );

        // Update thread status to completed
        const threadUpdate = CONVEX_CLIENT.mutation(api.threads.updateThread, {
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
    },
    onErrorPart: async (error) => {
      // Handle errors
      console.error("Stream error:", error);

      // OPTIMAL: Direct method call, no repeated getState()
      updateMessage(input.assistantMessageId, {
        status: "error",
        content: `Error: ${error || "Unknown error"}`,
      });
    },
  });
}
