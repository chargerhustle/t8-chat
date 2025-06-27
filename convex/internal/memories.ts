import { internalApiMutation } from "../helpers";
import { v } from "convex/values";
import { MutationCtx } from "../_generated/server";

/**
 * Internal API: Update multiple memories by ID for a given user
 * Used by tools and internal functions
 */
export const updateMemories = internalApiMutation({
  args: {
    userId: v.id("users"),
    updates: v.array(
      v.object({
        memoryId: v.string(),
        newContent: v.string(),
      })
    ),
  },
  handler: async (ctx: MutationCtx, args) => {
    // Get user configuration
    const userConfig = await ctx.db
      .query("userConfiguration")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!userConfig) {
      throw new Error("User configuration not found");
    }

    const memories = userConfig.memories || [];

    // Validate all updates
    for (const update of args.updates) {
      if (!update.newContent.trim()) {
        throw new Error(
          `Memory content cannot be empty for ID: ${update.memoryId}`
        );
      }
    }

    // Track which memories were updated
    const updatedMemoryIds = new Set<string>();
    const updatedMemories = memories.map((memory) => {
      const updateForThisMemory = args.updates.find(
        (update) => update.memoryId === memory.id
      );

      if (updateForThisMemory) {
        updatedMemoryIds.add(memory.id);
        return {
          ...memory,
          content: updateForThisMemory.newContent.trim(),
        };
      }
      return memory;
    });

    // Check if all requested memories were found
    const notFoundIds = args.updates
      .map((update) => update.memoryId)
      .filter((id) => !updatedMemoryIds.has(id));

    if (notFoundIds.length > 0) {
      throw new Error(`Memories not found: ${notFoundIds.join(", ")}`);
    }

    // Update the user configuration
    await ctx.db.patch(userConfig._id, {
      memories: updatedMemories,
    });

    console.log(
      `[MEMORY] Internal API: Updated ${args.updates.length} ${args.updates.length === 1 ? "memory" : "memories"}`
    );

    return {
      success: true,
      message: `${args.updates.length} ${args.updates.length === 1 ? "memory" : "memories"} updated successfully`,
      updatedMemories: args.updates.map((update) => ({
        id: update.memoryId,
        content: update.newContent.trim(),
      })),
    };
  },
});

/**
 * Internal API: Delete multiple memories by ID for a given user
 * Used by tools and internal functions
 */
export const deleteMemories = internalApiMutation({
  args: {
    userId: v.id("users"),
    memoryIds: v.array(v.string()),
  },
  handler: async (ctx: MutationCtx, args) => {
    // Get user configuration
    const userConfig = await ctx.db
      .query("userConfiguration")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!userConfig) {
      throw new Error("User configuration not found");
    }

    const memories = userConfig.memories || [];

    // Find memories to delete and collect their data
    const memoriesToDelete = memories.filter((memory) =>
      args.memoryIds.includes(memory.id)
    );

    // Check if all requested memories were found
    const foundIds = memoriesToDelete.map((memory) => memory.id);
    const notFoundIds = args.memoryIds.filter((id) => !foundIds.includes(id));

    if (notFoundIds.length > 0) {
      throw new Error(`Memories not found: ${notFoundIds.join(", ")}`);
    }

    // Remove the specified memories
    const updatedMemories = memories.filter(
      (memory) => !args.memoryIds.includes(memory.id)
    );

    // Update the user configuration
    await ctx.db.patch(userConfig._id, {
      memories: updatedMemories,
    });

    console.log(
      `[MEMORY] Internal API: Deleted ${args.memoryIds.length} ${args.memoryIds.length === 1 ? "memory" : "memories"}`
    );

    return {
      success: true,
      message: `${args.memoryIds.length} ${args.memoryIds.length === 1 ? "memory" : "memories"} deleted successfully`,
      deletedMemories: memoriesToDelete,
    };
  },
});
