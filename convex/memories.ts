import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Update a specific memory by ID
 */
export const updateMemory = mutation({
  args: {
    memoryId: v.string(),
    newContent: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user configuration
    const userConfig = await ctx.db
      .query("userConfiguration")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!userConfig) {
      throw new Error("User configuration not found");
    }

    const memories = userConfig.memories || [];

    // Validate content
    if (!args.newContent.trim()) {
      throw new Error("Memory content cannot be empty");
    }

    // Update the memory with the specified ID
    let memoryFound = false;
    const updatedMemories = memories.map((memory) => {
      if (memory.id === args.memoryId) {
        memoryFound = true;
        return {
          ...memory,
          content: args.newContent.trim(),
        };
      }
      return memory;
    });

    if (!memoryFound) {
      throw new Error("Memory not found");
    }

    // Update the user configuration
    await ctx.db.patch(userConfig._id, {
      memories: updatedMemories,
    });

    console.log(
      `[MEMORY] Updated memory with ID ${args.memoryId} for user: ${userId}`
    );

    return {
      success: true,
      message: "Memory updated successfully",
    };
  },
});

/**
 * Delete a specific memory by ID
 */
export const deleteMemory = mutation({
  args: {
    memoryId: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user configuration
    const userConfig = await ctx.db
      .query("userConfiguration")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!userConfig) {
      throw new Error("User configuration not found");
    }

    const memories = userConfig.memories || [];

    // Find and remove memory by ID
    const updatedMemories = memories.filter(
      (memory) => memory.id !== args.memoryId
    );

    if (updatedMemories.length === memories.length) {
      throw new Error("Memory not found");
    }

    // Update the user configuration
    await ctx.db.patch(userConfig._id, {
      memories: updatedMemories,
    });

    console.log(
      `[MEMORY] Deleted memory with ID ${args.memoryId} for user: ${userId}`
    );

    return {
      success: true,
      message: "Memory deleted successfully",
    };
  },
});

/**
 * Clear all memories for the authenticated user
 */
export const clearAllMemories = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    deletedCount: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get user configuration
    const userConfig = await ctx.db
      .query("userConfiguration")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!userConfig) {
      throw new Error("User configuration not found");
    }

    const memories = userConfig.memories || [];
    const deletedCount = memories.length;

    // Clear all memories
    await ctx.db.patch(userConfig._id, {
      memories: [],
    });

    console.log(
      `[MEMORY] Cleared ${deletedCount} memories for user: ${userId}`
    );

    return {
      success: true,
      message: `${deletedCount} memories cleared successfully`,
      deletedCount,
    };
  },
});
