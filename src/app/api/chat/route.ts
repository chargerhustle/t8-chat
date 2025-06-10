import { streamText, createDataStream } from "ai"
import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"
import { waitUntil } from '@vercel/functions'
import { api } from "@/convex/_generated/api"
import { SERVER_CONVEX_CLIENT } from "@/lib/server-convex-client"
import { generateTitleFromUserMessage } from "@/lib/chat/title-generator"
import { createResumableStreamContext, type ResumableStreamContext } from "resumable-stream"
import { MODEL_CONFIGS, DEFAULT_MODEL } from "@/ai/models-config"
import { AllowedModels } from "@/types"
import { createSystemPrompt, extractUserContextFromHeaders } from "@/ai/prompt"
// import { trackUsage } from "@/lib/analytics"

export const runtime = "nodejs"

// Environment variables
const env = {
  CONVEX_BRIDGE_API_KEY: process.env.CONVEX_BRIDGE_API_KEY || 'dummy-key'
}

// Create optimized O(1) lookup map for model configs
const MODEL_LOOKUP = new Map(
  MODEL_CONFIGS.map(config => [config.model, config])
);

/**
 * Get the appropriate AI provider and model based on the model string
 * Uses graceful fallbacks to ensure the chat always works
 */
function getModelProvider(modelString: AllowedModels) {
  const modelConfig = MODEL_LOOKUP.get(modelString)
  
  if (!modelConfig) {
    console.warn(`[CHAT] Model ${modelString} not found in MODEL_CONFIGS. Falling back to ${DEFAULT_MODEL}. Available models: ${Array.from(MODEL_LOOKUP.keys()).join(', ')}`)
    // Graceful fallback to default model
    const fallbackConfig = MODEL_LOOKUP.get(DEFAULT_MODEL)
    if (!fallbackConfig) {
      console.error(`[CHAT] Critical: Default model ${DEFAULT_MODEL} not found in config!`)
      // Last resort: hardcoded fallback
      return openai(DEFAULT_MODEL)
    }
    return getModelProviderFromConfig(fallbackConfig, DEFAULT_MODEL)
  }

  return getModelProviderFromConfig(modelConfig, modelString)
}

/**
 * Helper function to create provider instance from config
 */
function getModelProviderFromConfig(modelConfig: { provider: string; displayName?: string; description?: string }, modelString: string) {
  console.log(`[CHAT] Provider: ${modelConfig.provider}/${modelString}`)

  switch (modelConfig.provider) {
    case "openai":
      return openai(modelString)
    case "google":
      return google(modelString)
    default:
      console.warn(`[CHAT] Unknown provider: ${modelConfig.provider} for model: ${modelString}. Falling back to ${DEFAULT_MODEL}`)
      // Graceful fallback to OpenAI with default model
      return openai(DEFAULT_MODEL)
  }
}

// Global stream context with error handling (following the reference pattern)
let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('REDIS_URL')) {
        console.log('[CHAT] Resumable streams are disabled due to missing REDIS_URL');
      } else {
        console.error('[CHAT] Error creating stream context:', error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(req: Request) {
  console.log("[CHAT] API route called")

  try {
    const requestData = await req.json()
    console.log(`[CHAT] Processing ${requestData.messages?.length || 0} messages with model: ${requestData.model}`)

    // Validate required fields
    if (!requestData.userId) {
      return new Response(JSON.stringify({ 
        error: { 
          message: "User ID is required", 
          type: "authentication_error" 
        } 
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!requestData.messages || !Array.isArray(requestData.messages)) {
      return new Response(JSON.stringify({ 
        error: { 
          message: "Messages array is required", 
          type: "validation_error" 
        } 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!requestData.model) {
      return new Response(JSON.stringify({ 
        error: { 
          message: "Model is required", 
          type: "validation_error" 
        } 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    
    // Generate a unique stream ID for this conversation
    const streamId = `STREAM:${requestData.responseMessageId}`

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
        })
      })

      // Continue processing while title generates
      waitUntil(titleGenPromise)
    }

    // Set up database updates - Initial update: Set streamId so other devices can find and resume this stream
    const initialUpdate = SERVER_CONVEX_CLIENT.mutation(api.internal.chat.updateMessage, {
      messageId: requestData.responseMessageId,
      userId: requestData.userId,
      status: "streaming",
      streamId: streamId, // Critical: Other devices use this to resume
      apiKey: env.CONVEX_BRIDGE_API_KEY,
    });
    
    initialUpdate.catch((e: Error) => {
      console.error("[CHAT] Error setting initial stream ID", e)
    });

    // Get user context from headers
    const userContext = extractUserContextFromHeaders(req.headers);

    // Get model config and display name
    const modelConfig = MODEL_LOOKUP.get(requestData.model);
    const modelDisplayName = modelConfig?.displayName || requestData.model;
    const modelDescription = modelConfig?.description;

    // Create system prompt
    const systemPrompt = createSystemPrompt({
      model: requestData.model,
      modelDisplayName,
      modelDescription,
      userContext,
    });

    // Get the appropriate model provider
    const modelProvider = getModelProvider(requestData.model)

    // Create data stream using AI SDK's createDataStream
    const stream = createDataStream({
      execute: (dataStream) => {
        dataStream.writeData({
          type: 'stream-metadata',
          streamId: streamId,
        });

        const result = streamText({
          model: modelProvider,
          messages: requestData.messages,
          system: systemPrompt,
          onFinish: async () => {
            // All Convex updates moved to client-side onFinishMessagePart for proper timing
            console.log("[CHAT] Generation on route complete")
          },
        });

        // Consume the stream and merge into data stream
        result.consumeStream();
        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });

    // Get stream context and return resumable stream if available
    const streamContext = getStreamContext();

    if (streamContext) {
      console.log("[CHAT] Creating resumable stream")
      return new Response(
        await streamContext.resumableStream(streamId, () => stream),
        {
          headers: {
            'X-Stream-ID': streamId,
          },
        }
      );
    } else {
      console.log("[CHAT] Returning direct stream (resumable streams disabled)")
      return new Response(stream, {
        headers: {
          'X-Stream-ID': streamId,
        },
      });
    }
  } catch (error) {
    console.error("[CHAT] Error in chat API:", error)
    return new Response(JSON.stringify({ 
      error: { 
        message: "Failed to process chat request", 
        type: "internal_error" 
      } 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
