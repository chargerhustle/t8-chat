import { internalApiMutation } from "../helpers";
import { v } from "convex/values";
import { MutationCtx } from "../_generated/server";


/**
 * Update thread metadata
 */
export const updateThread = internalApiMutation({
  args: {
    threadId: v.string(),
    title: v.optional(v.string()),
    generationStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    )),
    userId: v.id("users"),
  },
  handler: async (ctx: MutationCtx, args) => {
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_threadId", (q) => q.eq("threadId", args.threadId))
      .first();

    if (!thread) {
      throw new Error("Thread not found");
    }

    if (thread.userId !== args.userId) {
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