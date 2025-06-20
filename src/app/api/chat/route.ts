import { streamText, createDataStream, smoothStream, type Tool } from "ai";
import { waitUntil } from "@vercel/functions";
import { api } from "@/convex/_generated/api";
import { SERVER_CONVEX_CLIENT } from "@/lib/server-convex-client";
import { generateTitleFromUserMessage } from "@/lib/chat/title-generator";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import { MODEL_CONFIGS, getModelStreamingType } from "@/ai/models-config";
import { createSystemPrompt, extractUserContextFromHeaders } from "@/ai/prompt";
import { getBYOKProvider, type BYOKError } from "@/lib/ai/byok-providers";
import { createSaveToMemoryTool } from "@/ai/save-to-memory-tool";
import { createUpdateMemoryTool } from "@/ai/update-memory-tool";
import { createDeleteMemoryTool } from "@/ai/delete-memory-tool";
// import { trackUsage } from "@/lib/analytics"

export const runtime = "nodejs";
export const maxDuration = 59;

// Environment variables
const env = {
  CONVEX_BRIDGE_API_KEY: process.env.CONVEX_BRIDGE_API_KEY || "dummy-key",
};

// Create optimized O(1) lookup map for model configs
const MODEL_LOOKUP = new Map(
  MODEL_CONFIGS.map((config) => [config.model, config])
);

/**
 * Helper function to create error response for BYOK errors
 */
function createBYOKErrorResponse(error: BYOKError): Response {
  const statusCode =
    error.type === "missing_key"
      ? 400
      : error.type === "invalid_key"
        ? 401
        : 400;

  return new Response(
    JSON.stringify({
      error: {
        message: error.message,
        type: error.type,
        provider: error.provider,
        setupUrl: error.setupUrl,
      },
    }),
    {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Global stream context with error handling
let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("REDIS_URL")) {
        console.log(
          "[CHAT] Resumable streams are disabled due to missing REDIS_URL"
        );
      } else {
        console.error("[CHAT] Error creating stream context:", error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(req: Request) {
  console.log("[CHAT] API route called");

  try {
    const requestData = await req.json();
    console.log(
      `[CHAT] Processing ${requestData.messages?.length || 0} messages with model: ${requestData.model}`
    );
    console.log("[CHAT] Request data keys:", Object.keys(requestData));
    console.log(
      "[CHAT] Provider options in request:",
      requestData.providerOptions
    );

    // Validate required fields
    if (!requestData.userId) {
      return new Response(
        JSON.stringify({
          error: {
            message: "User ID is required",
            type: "authentication_error",
          },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!requestData.messages || !Array.isArray(requestData.messages)) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Messages array is required",
            type: "validation_error",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!requestData.model) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Model is required",
            type: "validation_error",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate user API keys are provided (BYOK requirement)
    if (!requestData.userApiKeys) {
      return new Response(
        JSON.stringify({
          error: {
            message:
              "API keys are required. Please configure your API keys in Settings.",
            type: "missing_api_keys",
            setupUrl: "/settings/api-keys",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate a unique stream ID for this conversation
    const streamId = `STREAM:${requestData.responseMessageId}`;

    // Auto-generate thread title from first message if it's a new thread
    // Only generate title if explicitly set to "New Thread" (not just missing)
    if (requestData.threadMetadata?.title === "New Thread") {
      const titleGenPromise = generateTitleFromUserMessage({
        messageContent: requestData.messages[0].content,
        uniqueIdentifier: requestData.responseMessageId,
      }).then((title: string) => {
        // Update in convex
        SERVER_CONVEX_CLIENT.mutation(api.internal.chat.updateTitleForThread, {
          threadId: requestData.threadMetadata!.id!,
          userId: requestData.userId,
          title: title,
          apiKey: env.CONVEX_BRIDGE_API_KEY,
        });
      });

      // Continue processing while title generates
      waitUntil(titleGenPromise);
    }

    // Set up database updates - Initial update: Set streamId so other devices can find and resume this stream
    const initialUpdate = SERVER_CONVEX_CLIENT.mutation(
      api.internal.chat.updateMessage,
      {
        messageId: requestData.responseMessageId,
        userId: requestData.userId,
        status: "streaming",
        streamId: streamId, // Critical: Other devices use this to resume
        apiKey: env.CONVEX_BRIDGE_API_KEY,
      }
    );

    initialUpdate.catch((e: Error) => {
      console.error("[CHAT] Error setting initial stream ID", e);
    });

    // Get user context from headers
    const userContext = extractUserContextFromHeaders(req.headers);

    // Get model config and display name
    const modelConfig = MODEL_LOOKUP.get(requestData.model);
    const modelDisplayName = modelConfig?.displayName || requestData.model;
    const modelDescription = modelConfig?.description;
    const streamingType = getModelStreamingType(requestData.model);

    // Create system prompt
    const systemPrompt = createSystemPrompt({
      model: requestData.model,
      modelDisplayName,
      modelDescription,
      userContext,
      userCustomization: requestData.userCustomization,
      memoriesEnabled: requestData.preferences?.memoriesEnabled,
    });

    // Debug log provider options
    if (requestData.providerOptions) {
      console.log(
        "[CHAT] Provider options:",
        JSON.stringify(requestData.providerOptions, null, 2)
      );
    }

    // Get the appropriate model provider using BYOK system
    const providerResult = getBYOKProvider(
      requestData.model,
      requestData.userApiKeys,
      requestData.providerOptions
    );

    // Handle BYOK errors
    if ("type" in providerResult) {
      console.error(`[CHAT] BYOK Error: ${providerResult.message}`);
      return createBYOKErrorResponse(providerResult);
    }

    const modelProvider = providerResult.provider;
    console.log(`[CHAT] Using BYOK provider: ${providerResult.keyProvider}`);

    // Create data stream using AI SDK's createDataStream
    const stream = createDataStream({
      execute: (dataStream) => {
        dataStream.writeData({
          type: "stream-metadata",
          streamId: streamId,
        });

        // Conditionally add tools based on user preferences
        const tools: Record<string, Tool> = {};

        // Only add memory tools if memories are enabled
        if (requestData.preferences?.memoriesEnabled !== false) {
          tools.saveToMemory = createSaveToMemoryTool(requestData.userId);
          tools.updateMemory = createUpdateMemoryTool(requestData.userId);
          tools.deleteMemory = createDeleteMemoryTool(requestData.userId);
        }

        const result = streamText({
          model: modelProvider,
          messages: requestData.messages,
          system: systemPrompt,
          tools,
          maxSteps: 5,
          toolCallStreaming: true,
          experimental_continueSteps: true,
          experimental_transform: smoothStream({
            delayInMs: 20,
            chunking: streamingType,
          }),
          onFinish: async () => {
            // All Convex updates moved to client-side onFinishMessagePart for proper timing
            console.log("[CHAT] Generation on route complete");
          },
        });

        // Consume the stream and merge into data stream
        result.consumeStream();
        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });

    // Get stream context and return resumable stream if available
    const streamContext = getStreamContext();

    if (streamContext) {
      console.log("[CHAT] Creating resumable stream");
      return new Response(
        await streamContext.resumableStream(streamId, () => stream),
        {
          headers: {
            "X-Stream-ID": streamId,
          },
        }
      );
    } else {
      console.log(
        "[CHAT] Returning direct stream (resumable streams disabled)"
      );
      return new Response(stream, {
        headers: {
          "X-Stream-ID": streamId,
        },
      });
    }
  } catch (error) {
    console.error("[CHAT] Error in chat API:", error);
    return new Response(
      JSON.stringify({
        error: {
          message: "Failed to process chat request",
          type: "internal_error",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
