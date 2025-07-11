import { v, Infer } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";
import { MessageStatusValidator, ProviderMetadataValidator } from "./schema";

/**
 * Query: Get messages by thread ID
 * Returns all messages for a given thread, ordered by creation time
 */
export const getByThreadId = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx: QueryCtx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Verify thread access (single query)
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      return null;
    }

    if (thread.userId !== userId) {
      throw new Error("Not authorized to access this thread");
    }

    // Get all messages (single query)
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();

    // Check if ANY message has attachments
    const hasAttachments = messages.some(
      (message) => message.attachmentIds && message.attachmentIds.length > 0
    );

    // Early return for text-only threads
    if (!hasAttachments) {
      return messages.map((message) => ({ ...message, attachments: [] }));
    }

    // Fetch ALL attachments for this thread (single query)
    const attachments = await ctx.db
      .query("attachments")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .collect();

    // Create fast lookup map (O(1) access)
    const attachmentMap = new Map();
    attachments.forEach((attachment) => {
      attachmentMap.set(attachment._id, attachment);
    });

    // Combine messages with their attachments
    return messages.map((message) => ({
      ...message,
      attachments: (message.attachmentIds || [])
        .map((id) => attachmentMap.get(id))
        .filter(Boolean),
    }));
  },
});

/**
 * Mutation: Add messages to a thread
 * Adds an array of messages to a specific thread
 */
export const addMessagesToThread = mutation({
  args: {
    threadId: v.string(),
    messages: v.array(
      v.object({
        messageId: v.string(),
        content: v.string(),
        role: v.union(
          v.literal("user"),
          v.literal("assistant"),
          v.literal("system")
        ),
        status: v.union(
          v.literal("waiting"),
          v.literal("thinking"),
          v.literal("streaming"),
          v.literal("done"),
          v.literal("error"),
          v.literal("error.rejected"),
          v.literal("deleted")
        ),
        model: v.string(),
        created_at: v.number(),
        updated_at: v.number(),
        attachmentIds: v.optional(v.array(v.id("attachments"))),
        modelParams: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx: MutationCtx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify the thread exists and user has access
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      throw new Error("Thread not found");
    }

    if (thread.userId !== userId) {
      throw new Error("Not authorized to access this thread");
    }

    // Insert all messages in parallel
    const insertPromises = args.messages.map((message) =>
      ctx.db.insert("messages", {
        userId,
        threadId: args.threadId,
        messageId: message.messageId,
        content: message.content,
        role: message.role,
        status: message.status,
        model: message.model,
        created_at: message.created_at,
        updated_at: message.updated_at,
        attachmentIds: message.attachmentIds || [],
        modelParams: message.modelParams || {},
      })
    );

    // Wait for all inserts to complete
    await Promise.all(insertPromises);

    // Update the thread's updatedAt timestamp
    await ctx.db.patch(thread._id, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateMessage = mutation({
  args: {
    messageId: v.string(),
    content: v.optional(v.string()),
    reasoning: v.optional(v.string()),
    providerMetadata: v.optional(ProviderMetadataValidator),
    status: v.optional(MessageStatusValidator),
    streamId: v.optional(v.string()),
    tools: v.optional(
      v.array(
        v.object({
          toolCallId: v.string(),
          toolName: v.string(),
          args: v.any(),
          result: v.optional(v.any()),
          state: v.union(
            v.literal("streaming-start"),
            v.literal("streaming-delta"),
            v.literal("call"),
            v.literal("result")
          ),
          timestamp: v.number(),
        })
      )
    ),
    parts: v.optional(
      v.array(
        v.union(
          v.object({
            type: v.literal("text"),
            text: v.string(),
            timestamp: v.number(),
          }),
          v.object({
            type: v.literal("tool"),
            toolCallId: v.string(),
            toolName: v.string(),
            args: v.any(),
            result: v.optional(v.any()),
            state: v.union(
              v.literal("streaming-start"),
              v.literal("streaming-delta"),
              v.literal("call"),
              v.literal("result")
            ),
            timestamp: v.number(),
          })
        )
      )
    ),
  },
  handler: async (ctx: MutationCtx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db
      .query("messages")
      .withIndex("by_messageId_and_userId", (q) =>
        q.eq("messageId", args.messageId).eq("userId", userId)
      )
      .first();

    if (!message) throw new Error("Message not found");

    // Simplified logging - only log key identifiers
    console.log(
      `[CHAT] Updating ${args.messageId.slice(-8)} -> status: ${args.status || "no change"}`
    );

    // Do NOT update message if it has already been marked as done
    // (handles update race conditions)
    if (message.status === "done" || message.status === "error") {
      console.error(
        `[CHAT] Message ${args.messageId.slice(-8)} already ${message.status}, skipping`
      );
      // Don't throw because it might break server side on /api/chat
      return;
    }

    const insert: {
      content?: string;
      reasoning?: string;
      status?: Infer<typeof MessageStatusValidator>;
      providerMetadata?: Infer<typeof ProviderMetadataValidator>;
      resumableStreamId?: string;
      tools?: Array<{
        toolCallId: string;
        toolName: string;
        args: any;
        result?: any;
        state: "streaming-start" | "streaming-delta" | "call" | "result";
        timestamp: number;
      }>;
      parts?: Array<
        | {
            type: "text";
            text: string;
            timestamp: number;
          }
        | {
            type: "tool";
            toolCallId: string;
            toolName: string;
            args: any;
            result?: any;
            state: "streaming-start" | "streaming-delta" | "call" | "result";
            timestamp: number;
          }
      >;
    } = {};

    if (args.content) insert.content = args.content;
    if (args.reasoning) insert.reasoning = args.reasoning;
    if (args.providerMetadata) insert.providerMetadata = args.providerMetadata;
    if (args.status) insert.status = args.status;
    if (args.streamId) insert.resumableStreamId = args.streamId;
    if (args.tools) insert.tools = args.tools;
    if (args.parts) insert.parts = args.parts;

    await ctx.db.patch(message._id, insert);

    return { success: true };
  },
});

/**
 * Mutation: Update message content
 * Updates a message's content and reasoning (typically after streaming)
 */
export const updateMessageContent = mutation({
  args: {
    messageId: v.string(),
    content: v.string(),
    reasoning: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Find the message
    const message = await ctx.db
      .query("messages")
      .withIndex("by_messageId_and_userId", (q) =>
        q.eq("messageId", args.messageId).eq("userId", userId)
      )
      .first();

    if (!message) {
      throw new Error("Message not found");
    }

    // Do NOT update message if it has already been marked as done/error
    // (handles update race conditions)
    if (message.status === "error") {
      return;
    }

    const update: any = {
      content: args.content,
      status: "done" as const,
      updated_at: Date.now(),
    };

    if (args.reasoning !== undefined) {
      update.reasoning = args.reasoning;
    }

    await ctx.db.patch(message._id, update);

    return { success: true };
  },
});

/**
 * Mutation: Set error message
 * Updates a message with error information
 */
export const setErrorMessage = mutation({
  args: {
    messageId: v.string(),
    errorMessage: v.string(),
    errorType: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Find the message
    const message = await ctx.db
      .query("messages")
      .withIndex("by_messageId_and_userId", (q) =>
        q.eq("messageId", args.messageId).eq("userId", userId)
      )
      .first();

    if (!message) {
      throw new Error("Message not found");
    }

    await ctx.db.patch(message._id, {
      status: "error" as const,
      serverError: {
        type: args.errorType,
        message: args.errorMessage,
      },
      updated_at: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Query: Get user statistics
 * Returns basic user stats without heavy queries
 */
export const getUserStats = query({
  args: {},
  returns: v.object({
    joinedDate: v.number(),
    totalThreads: v.number(),
    lastActivity: v.optional(v.number()),
    favoriteModel: v.optional(v.string()),
  }),
  handler: async (ctx: QueryCtx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        joinedDate: 0,
        totalThreads: 0,
        lastActivity: undefined,
        favoriteModel: undefined,
      };
    }

    // Get user creation time (single document lookup)
    const user = await ctx.db.get(userId);
    const joinedDate = user?._creationTime || 0;

    // Count threads (much lighter than messages)
    const threads = await ctx.db
      .query("threads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalThreads = threads.length;

    // Get last activity from most recent thread
    const lastActivity =
      threads.length > 0
        ? Math.max(...threads.map((t) => t.updatedAt))
        : undefined;

    // Find favorite model (most frequently used) - efficient counting
    const modelCounts: Record<string, number> = {};
    let favoriteModel: string | undefined;
    let maxCount = 0;

    for (let i = 0; i < threads.length; i++) {
      const model = threads[i].model;
      const count = (modelCounts[model] || 0) + 1;
      modelCounts[model] = count;

      // Track the most frequent model as we go
      if (count > maxCount) {
        maxCount = count;
        favoriteModel = model;
      }
    }

    return {
      joinedDate,
      totalThreads,
      lastActivity,
      favoriteModel,
    };
  },
});
