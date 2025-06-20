import { tool } from "ai";
import { z } from "zod";
import { SERVER_CONVEX_CLIENT } from "@/lib/server-convex-client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const createDeleteMemoryTool = (userId: string) =>
  tool({
    description:
      "ONLY use this tool when the user explicitly asks to delete memories. Delete one or more existing memories by their IDs when specifically requested by the user. Use this ONLY when the user directly requests to remove information that is no longer relevant, has become outdated, or was incorrectly saved. CRITICAL: You must use the EXACT memory IDs from the user's existing memories (e.g., mem_20241215_A3B7K) - do NOT make up or guess IDs. If you don't know the exact ID, check their memory list first. This action cannot be undone, so use it carefully. Only delete memories that are truly no longer needed. Do NOT use this tool proactively.",
    parameters: z.object({
      memoryIds: z
        .array(z.string())
        .describe(
          "Array of EXACT memory IDs to delete from the user's existing memories (e.g., ['mem_20241215_A3B7K', 'mem_20241216_X9Y2Z']) - do NOT make up IDs"
        ),
    }),
    execute: async ({ memoryIds }) => {
      try {
        console.log(
          "[MEMORY] Deleting memories for user:",
          userId,
          "| Memory IDs:",
          memoryIds.join(", ")
        );

        // Get environment variable for API key
        const apiKey = process.env.CONVEX_BRIDGE_API_KEY || "dummy-key";

        // Delete the memories using the internal API
        const result = await SERVER_CONVEX_CLIENT.mutation(
          api.internal.memories.deleteMemories,
          {
            userId: userId as Id<"users">,
            memoryIds,
            apiKey,
          }
        );

        console.log("[MEMORY] Successfully deleted memories from Convex");

        return {
          success: result.success,
          message: result.message,
          deletedMemories: result.deletedMemories,
        };
      } catch (error) {
        console.error("[MEMORY] Failed to delete memory:", error);
        return {
          success: false,
          message: "Failed to delete memory",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });

export type DeleteMemoryResult = {
  success: boolean;
  message: string;
  deletedMemories?: Array<{
    id: string;
    content: string;
    createdAt: number;
  }>;
  error?: string;
};
