import { type baseSaveToMemoryTool } from "./base";
import { SERVER_CONVEX_CLIENT } from "@/lib/server-convex-client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import type { ServerToolConfig } from "@/toolkits/types";

/**
 * Generates a unique, human-readable memory ID string in the format `mem_YYYYMMDD_XXXXX`.
 *
 * The ID consists of the current date (YYYYMMDD) and a random 5-character uppercase alphanumeric suffix.
 *
 * @returns A memory ID string such as `mem_20241215_A3B7K`
 */
function generateMemoryId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  // Generate 5 random alphanumeric characters (uppercase)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomStr = "";
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `mem_${dateStr}_${randomStr}`;
}

export const saveToMemoryToolConfigServer = (
  userId: string
): ServerToolConfig<
  typeof baseSaveToMemoryTool.inputSchema.shape,
  typeof baseSaveToMemoryTool.outputSchema.shape
> => ({
  callback: async ({ memories }) => {
    try {
      console.log("[MEMORY] Saving memories for user:", userId);
      console.log("[MEMORY] Memories:", memories);

      // Get environment variable for API key
      const apiKey = process.env.CONVEX_BRIDGE_API_KEY;
      if (!apiKey) {
        throw new Error(
          "CONVEX_BRIDGE_API_KEY environment variable is not set"
        );
      }

      // Create memory objects for each piece of information
      const memoryObjects = memories.map((content) => ({
        id: generateMemoryId(),
        content,
        createdAt: Date.now(),
      }));

      // Save all memories to Convex using the server client in a single batch
      await SERVER_CONVEX_CLIENT.mutation(api.internal.chat.saveMemories, {
        userId: userId as Id<"users">,
        memories: memoryObjects,
        apiKey,
      });

      console.log("[MEMORY] Successfully saved memories to Convex");

      return {
        success: true,
        message: `${memories.length} ${memories.length === 1 ? "memory" : "memories"} saved successfully`,
        memories: memoryObjects,
      };
    } catch (error) {
      console.error("[MEMORY] Failed to save memories:", error);
      return {
        success: false,
        message: "Failed to save memories",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
  message:
    "Memory has been successfully stored and will be used to provide more personalized responses in future conversations.",
});
