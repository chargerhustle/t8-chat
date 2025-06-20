import { MessageStatusValidator, ProviderMetadataValidator } from "../schema";
import { internalApiMutation } from "../helpers";
import { v, Infer } from "convex/values";
import { MutationCtx } from "../_generated/server";

export const updateMessage = internalApiMutation({
  args: {
    messageId: v.string(),
    content: v.optional(v.string()),
    reasoning: v.optional(v.string()),
    userId: v.id("users"),
    providerMetadata: v.optional(ProviderMetadataValidator),
    status: v.optional(MessageStatusValidator),
    streamId: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const message = await ctx.db
      .query("messages")
      .withIndex("by_messageId_and_userId", (q) =>
        q.eq("messageId", args.messageId).eq("userId", args.userId)
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
    } = {};

    if (args.content) insert.content = args.content;
    if (args.reasoning) insert.reasoning = args.reasoning;
    if (args.providerMetadata) insert.providerMetadata = args.providerMetadata;
    if (args.status) insert.status = args.status;
    if (args.streamId) insert.resumableStreamId = args.streamId;

    await ctx.db.patch(message._id, insert);
  },
});

export const updateTitleForThread = internalApiMutation({
  args: {
    threadId: v.string(),
    userId: v.id("users"),
    title: v.string(),
    userSetTitle: v.optional(v.boolean()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) throw new Error("Thread not found");

    // Check if this user has access to this thread
    if (thread.userId !== args.userId) throw new Error("Unauthorized");

    console.log(
      `[CHAT] Title update: ${args.threadId.slice(-8)} -> "${args.title.slice(0, 30)}${args.title.length > 30 ? "..." : ""}"`
    );

    await ctx.db.patch(thread._id, {
      title: args.title,
      userSetTitle: args.userSetTitle ?? false, // Default to false if not specified
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getMessageByStreamId = internalApiMutation({
  args: {
    streamId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx: MutationCtx, args) => {
    const message = await ctx.db
      .query("messages")
      .withIndex("by_userId_and_streamId", (q) =>
        q.eq("userId", args.userId).eq("resumableStreamId", args.streamId)
      )
      .first();

    if (!message) {
      return null;
    }

    // Verify user has access to this thread
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_threadId", (q) => q.eq("threadId", message.threadId))
      .first();

    if (!thread || thread.userId !== args.userId) {
      return null;
    }

    return {
      messageId: message.messageId,
      threadId: message.threadId,
      content: message.content,
      reasoning: message.reasoning,
      status: message.status,
    };
  },
});

export const saveMemory = internalApiMutation({
  args: {
    userId: v.id("users"),
    memory: v.object({
      content: v.string(),
      createdAt: v.number(),
    }),
  },
  handler: async (ctx: MutationCtx, args) => {
    console.log(`[MEMORY] Saving memory for user: ${args.userId}`);

    // Get or create user configuration
    let userConfig = await ctx.db
      .query("userConfiguration")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!userConfig) {
      // Create new user configuration with the memory
      await ctx.db.insert("userConfiguration", {
        userId: args.userId,
        memories: [args.memory],
      });
      console.log(`[MEMORY] Created new user config with memory`);
    } else {
      // Update existing user configuration by adding the memory
      const existingMemories = userConfig.memories || [];
      await ctx.db.patch(userConfig._id, {
        memories: [...existingMemories, args.memory],
      });
      console.log(`[MEMORY] Added memory to existing user config`);
    }

    return { success: true };
  },
});

export const saveMemories = internalApiMutation({
  args: {
    userId: v.id("users"),
    memories: v.array(
      v.object({
        content: v.string(),
        createdAt: v.number(),
      })
    ),
  },
  handler: async (ctx: MutationCtx, args) => {
    console.log(
      `[MEMORY] Saving ${args.memories.length} memories for user: ${args.userId}`
    );

    // Get or create user configuration
    let userConfig = await ctx.db
      .query("userConfiguration")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!userConfig) {
      // Create new user configuration with the memories
      await ctx.db.insert("userConfiguration", {
        userId: args.userId,
        memories: args.memories,
      });
      console.log(
        `[MEMORY] Created new user config with ${args.memories.length} memories`
      );
    } else {
      // Update existing user configuration by adding all memories
      const existingMemories = userConfig.memories || [];
      await ctx.db.patch(userConfig._id, {
        memories: [...existingMemories, ...args.memories],
      });
      console.log(
        `[MEMORY] Added ${args.memories.length} memories to existing user config`
      );
    }

    return { success: true };
  },
});
