import { tool } from "ai";
import { z } from "zod";
import { SERVER_CONVEX_CLIENT } from "@/lib/server-convex-client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const createUpdateMemoryTool = (userId: string) =>
  tool({
    description:
      "ONLY use this tool when the user explicitly asks to update specific memories. Update one or more existing memories by their IDs. Use this ONLY when the user directly requests to modify, correct, or enhance information that was previously saved to memory. CRITICAL: You must use the EXACT memory IDs from the user's existing memories (e.g., mem_20241215_A3B7K) - do NOT make up or guess IDs. If you don't know the exact ID, check their memory list first. Do NOT use this tool proactively.",
    parameters: z.object({
      updates: z
        .array(
          z.object({
            memoryId: z
              .string()
              .describe(
                "The EXACT ID of the memory to update from the user's existing memories (e.g., mem_20241215_A3B7K) - do NOT make up IDs"
              ),
            newContent: z
              .string()
              .describe(
                "The new content that will replace the existing memory content"
              ),
          })
        )
        .describe(
          "Array of memory updates to perform. Each update contains a memory ID and new content."
        ),
    }),
    execute: async ({ updates }) => {
      try {
        console.log(
          "[MEMORY] Updating memories for user:",
          userId,
          "| Updates:",
          updates
            .map((u) => `${u.memoryId}: ${u.newContent.slice(0, 50)}...`)
            .join(", ")
        );

        // Get environment variable for API key
        const apiKey = process.env.CONVEX_BRIDGE_API_KEY;
        if (!apiKey) {
          throw new Error(
            "CONVEX_BRIDGE_API_KEY environment variable is not set"
          );
        }

        // Update the memories using the internal API
        const result = await SERVER_CONVEX_CLIENT.mutation(
          api.internal.memories.updateMemories,
          {
            userId: userId as Id<"users">,
            updates,
            apiKey,
          }
        );

        console.log("[MEMORY] Successfully updated memories in Convex");

        return {
          success: result.success,
          message: result.message,
          updatedMemories: result.updatedMemories,
        };
      } catch (error) {
        console.error("[MEMORY] Failed to update memory:", error);
        return {
          success: false,
          message: "Failed to update memory",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });

export type UpdateMemoryResult = {
  success: boolean;
  message: string;
  updatedMemories?: Array<{
    id: string;
    content: string;
  }>;
  error?: string;
};
