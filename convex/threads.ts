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

    console.log("[THREADS] Created new thread", { threadId: args.threadId, userId: userId });

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
          index === self.findIndex((t2) => t2.threadId === t.threadId),
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

    console.log("[THREADS] Deleted thread", { threadId: args.threadId, userId });

    return { success: true };
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
      userId 
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
    generationStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    )),
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

    console.log("[THREADS] Updated thread", { threadId: args.threadId, updates });

    return { success: true };
  },
});