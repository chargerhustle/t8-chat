import { query, mutation, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * Get a single thread by threadId
 */
export const getByThreadId = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get the thread
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      return null;
    }

    // Check if user has access to this thread
    if (thread.userId !== userId) {
      return null;
    }

    return thread;
  },
});

/**
 * Create a new thread
 */
export const createThread = mutation({
  args: {
    threadId: v.string(),
    title: v.optional(v.string()),
    model: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const now = Date.now();

    // Check if thread already exists
    const existingThread = await ctx.db
      .query("threads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (existingThread) {
      // Thread already exists, just return success
      return { threadId: args.threadId, existed: true };
    }

    // Create new thread
    await ctx.db.insert("threads", {
      threadId: args.threadId,
      title: args.title || "New Thread",
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      generationStatus: "pending",
      visibility: "visible",
      userSetTitle: false,
      userId: userId,
      model: args.model,
      pinned: false,
    });

    console.log("[THREADS] Created new thread", {
      threadId: args.threadId,
      userId: userId,
    });

    return { threadId: args.threadId, existed: false };
  },
});

// Get user's threads with proper authentication
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Fetch regular threads - limited to 200 most recent
    const threads = await ctx.db
      .query("threads")
      .withIndex("by_user_visibility_updatedAt", (q) =>
        q.eq("userId", userId).eq("visibility", "visible")
      )
      .order("desc")
      .take(200); // Only show top 200 most recent threads

    // Fetch pinned threads separately
    const pinnedThreads = await ctx.db
      .query("threads")
      .withIndex("by_user_visibility_pinned", (q) =>
        q.eq("userId", userId).eq("visibility", "visible").eq("pinned", true)
      )
      .order("desc")
      .take(200);

    // Combine and deduplicate pinned vs regular threads
    const dedupedCombined = [...pinnedThreads, ...threads]
      .filter(
        (t, index, self) =>
          index === self.findIndex((t2) => t2.threadId === t.threadId)
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);

    // Return threads directly without attaching parents (will be revised, when thread branching feature will be implemented)
    return dedupedCombined;
  },
});

/**
 * Soft delete a thread by setting visibility to archived
 */
export const deleteThread = mutation({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get the thread
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      throw new Error("Thread not found");
    }

    // Check if user owns this thread
    if (thread.userId !== userId) {
      throw new Error("Not authorized to delete this thread");
    }

    // Soft delete by setting visibility to archived
    await ctx.db.patch(thread._id, {
      visibility: "archived",
      updatedAt: Date.now(),
    });

    console.log("[THREADS] Deleted thread", {
      threadId: args.threadId,
      userId,
    });

    return { success: true };
  },
});

/**
 * Batch delete multiple threads by setting visibility to archived
 */
export const batchDeleteThreads = mutation({
  args: {
    threadIds: v.array(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    deletedCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    if (args.threadIds.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    let deletedCount = 0;

    // Process each thread
    for (const threadId of args.threadIds) {
      try {
        // Get the thread
        const thread = await ctx.db
          .query("threads")
          .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
          .first();

        if (!thread) {
          console.warn(`[THREADS] Thread not found: ${threadId}`);
          continue;
        }

        // Check if user owns this thread
        if (thread.userId !== userId) {
          console.warn(
            `[THREADS] Not authorized to delete thread: ${threadId}`
          );
          continue;
        }

        // Soft delete by setting visibility to archived
        await ctx.db.patch(thread._id, {
          visibility: "archived",
          updatedAt: Date.now(),
        });

        deletedCount++;
      } catch (error) {
        console.error(`[THREADS] Error deleting thread ${threadId}:`, error);
        // Continue with other threads even if one fails
      }
    }

    console.log("[THREADS] Batch deleted threads", {
      requestedCount: args.threadIds.length,
      deletedCount,
      userId,
    });

    return { success: true, deletedCount };
  },
});

/**
 * Toggle pin status of a thread
 */
export const togglePin = mutation({
  args: {
    threadId: v.string(),
    pinned: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get the thread
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      throw new Error("Thread not found");
    }

    // Check if user owns this thread
    if (thread.userId !== userId) {
      throw new Error("Not authorized to modify this thread");
    }

    // Update pin status
    await ctx.db.patch(thread._id, {
      pinned: args.pinned,
      updatedAt: Date.now(),
    });

    console.log("[THREADS] Toggled pin status", {
      threadId: args.threadId,
      pinned: args.pinned,
      userId,
    });

    return { success: true };
  },
});

/**
 * Update thread title specifically
 */
export const updateThreadTitle = mutation({
  args: {
    threadId: v.string(),
    title: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const thread = await ctx.db
      .query("threads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      throw new Error("Thread not found");
    }

    if (thread.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(thread._id, {
      title: args.title,
      userSetTitle: true,
      updatedAt: Date.now(),
    });

    console.log("[THREADS] Updated thread title", {
      threadId: args.threadId,
      title: args.title,
      userId,
    });

    return { success: true };
  },
});

/**
 * Update thread metadata
 */
export const updateThread = mutation({
  args: {
    threadId: v.string(),
    title: v.optional(v.string()),
    generationStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("generating"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
  },
  handler: async (ctx: MutationCtx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const thread = await ctx.db
      .query("threads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      throw new Error("Thread not found");
    }

    if (thread.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      updates.title = args.title;
      updates.userSetTitle = true;
    }

    if (args.generationStatus !== undefined) {
      updates.generationStatus = args.generationStatus;
    }

    await ctx.db.patch(thread._id, updates);

    console.log("[THREADS] Updated thread", {
      threadId: args.threadId,
      updates,
    });

    return { success: true };
  },
});

/**
 * Search threads by title
 */
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // If query is empty, return empty results
    if (!args.query.trim()) {
      return [];
    }

    // Search threads by title for the current user
    const results = await ctx.db
      .query("threads")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.query).eq("userId", userId)
      )
      .filter((q) => q.eq(q.field("visibility"), "visible"))
      .take(args.limit || 10);

    return results;
  },
});

/**
 * Export threads with full message history for selected thread IDs
 */
export const exportThreads = query({
  args: {
    threadIds: v.array(v.string()),
  },
  returns: v.object({
    exportInfo: v.object({
      exportedAt: v.string(),
      exportedBy: v.string(),
      userId: v.string(),
      threadCount: v.number(),
    }),
    threads: v.array(
      v.object({
        threadInfo: v.object({
          threadId: v.string(),
          title: v.string(),
          createdAt: v.string(),
          updatedAt: v.string(),
          lastMessageAt: v.string(),
          generationStatus: v.string(),
          userSetTitle: v.boolean(),
          model: v.string(),
          pinned: v.boolean(),
          messageCount: v.number(),
        }),
        messages: v.array(
          v.object({
            messageId: v.string(),
            reasoning: v.optional(v.string()),
            content: v.string(),
            status: v.string(),
            updatedAt: v.optional(v.string()),
            role: v.union(
              v.literal("user"),
              v.literal("assistant"),
              v.literal("system")
            ),
            createdAt: v.string(),
            model: v.string(),
            modelParams: v.optional(
              v.object({
                reasoningEffort: v.optional(v.string()),
                includeSearch: v.optional(v.boolean()),
              })
            ),
            providerMetadata: v.optional(v.any()),
            attachments: v.array(
              v.object({
                id: v.string(),
                url: v.string(),
                fileName: v.string(),
                mimeType: v.string(),
                fileSize: v.string(),
              })
            ),
          })
        ),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Helper function to format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    const exportData = {
      exportInfo: {
        exportedAt: new Date().toISOString(),
        exportedBy: user.email || user.name || "Unknown User",
        userId: userId,
        threadCount: args.threadIds.length,
      },
      threads: [] as any[],
    };

    // Process each thread
    for (const threadId of args.threadIds) {
      // Get thread
      const thread = await ctx.db
        .query("threads")
        .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
        .first();

      if (!thread || thread.userId !== userId) {
        continue; // Skip threads user doesn't own
      }

      // Get all messages for this thread
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
        .order("asc")
        .collect();

      // Get all attachments for this thread
      const attachments = await ctx.db
        .query("attachments")
        .withIndex("by_threadId", (q) => q.eq("threadId", threadId))
        .collect();

      // Create attachment lookup map with formatted data
      const attachmentMap = new Map();
      attachments.forEach((attachment) => {
        attachmentMap.set(attachment._id, {
          id: attachment._id,
          url: attachment.attachmentUrl,
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          fileSize: formatFileSize(attachment.fileSize),
        });
      });

      // Format messages for export
      const formattedMessages = messages.map((message) => ({
        messageId: message.messageId,
        reasoning: message.reasoning,
        content: message.content,
        status: message.status,
        updatedAt: message.updated_at
          ? new Date(message.updated_at).toISOString()
          : undefined,
        role: message.role,
        createdAt: new Date(message.created_at).toISOString(),
        model: message.model,
        modelParams: message.modelParams
          ? {
              reasoningEffort: message.modelParams.reasoningEffort,
              includeSearch: message.modelParams.includeSearch,
            }
          : undefined,
        providerMetadata: message.providerMetadata,
        attachments: (message.attachmentIds || [])
          .map((id) => attachmentMap.get(id))
          .filter(Boolean),
      }));

      // Add thread to export data with all requested fields
      exportData.threads.push({
        threadInfo: {
          threadId: thread.threadId,
          title: thread.title,
          createdAt: new Date(thread.createdAt).toISOString(),
          updatedAt: new Date(thread.updatedAt).toISOString(),
          lastMessageAt: new Date(thread.lastMessageAt).toISOString(),
          generationStatus: thread.generationStatus,
          userSetTitle: thread.userSetTitle || false,
          model: thread.model,
          pinned: thread.pinned,
          messageCount: messages.length,
        },
        messages: formattedMessages,
      });
    }

    return exportData;
  },
});

/**
 * Create a branch from an existing thread at a specific message
 */
export const createBranch = mutation({
  args: {
    originalThreadId: v.string(),
    branchFromMessageId: v.string(),
    newThreadId: v.string(),
  },
  returns: v.object({
    newThreadId: v.string(),
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get the original thread
    const originalThread = await ctx.db
      .query("threads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.originalThreadId))
      .first();

    if (!originalThread) {
      throw new Error("Original thread not found");
    }

    // Check if user owns this thread
    if (originalThread.userId !== userId) {
      throw new Error("Not authorized to branch this thread");
    }

    // Get the message we're branching from
    const branchFromMessage = await ctx.db
      .query("messages")
      .withIndex("by_messageId_and_userId", (q) =>
        q.eq("messageId", args.branchFromMessageId).eq("userId", userId)
      )
      .first();

    if (!branchFromMessage) {
      throw new Error("Branch message not found");
    }

    // Verify the message belongs to the original thread
    if (branchFromMessage.threadId !== args.originalThreadId) {
      throw new Error("Message does not belong to the specified thread");
    }

    // Use the client-provided thread ID
    const newThreadId = args.newThreadId;
    const now = Date.now();

    // Create new thread with branch metadata - copy all thread data
    const newThreadDbId = await ctx.db.insert("threads", {
      threadId: newThreadId,
      title: originalThread.title, // Copy original title
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now, // Set to current time so branch appears in "Today" group
      generationStatus: "completed", // Branch starts as completed
      visibility: originalThread.visibility, // Copy visibility
      userSetTitle: originalThread.userSetTitle, // Copy title setting
      userId: userId,
      model: originalThread.model, // Copy model
      pinned: originalThread.pinned,
      branchParentThreadId: originalThread._id, // Reference to parent thread
      branchParentPublicMessageId: args.branchFromMessageId, // Reference to branched message
      backfill: originalThread.backfill, // Copy backfill status
    });

    // Get all messages up to and including the branched message
    const messagesToCopy = await ctx.db
      .query("messages")
      .withIndex("by_threadId_and_created_at", (q) =>
        q
          .eq("threadId", args.originalThreadId)
          .lte("created_at", branchFromMessage.created_at)
      )
      .order("asc")
      .collect();

    // Copy all messages to the new thread
    for (const message of messagesToCopy) {
      await ctx.db.insert("messages", {
        messageId: crypto.randomUUID(), // Generate new message ID
        threadId: newThreadId, // Assign to new thread
        userId: message.userId,
        reasoning: message.reasoning,
        content: message.content,
        status: message.status,
        updated_at: message.updated_at,
        branches: undefined, // Reset branches for copied messages
        role: message.role,
        created_at: message.created_at, // Keep original timestamps for proper ordering
        serverError: message.serverError,
        model: message.model,
        attachmentIds: message.attachmentIds, // Keep attachment references
        modelParams: message.modelParams,
        providerMetadata: message.providerMetadata,
        resumableStreamId: undefined, // Reset stream ID
        backfill: message.backfill,
        tools: message.tools,
        parts: message.parts,
      });
    }

    // Update the original branched message to track this new branch
    const existingBranches = branchFromMessage.branches || [];
    await ctx.db.patch(branchFromMessage._id, {
      branches: [...existingBranches, newThreadDbId],
    });

    console.log("[THREADS] Created branch", {
      originalThreadId: args.originalThreadId,
      newThreadId: newThreadId,
      branchFromMessageId: args.branchFromMessageId,
      userId: userId,
      copiedMessages: messagesToCopy.length,
    });

    return {
      newThreadId: newThreadId,
      success: true,
    };
  },
});
