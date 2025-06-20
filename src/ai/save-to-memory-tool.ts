import { tool } from "ai";
import { z } from "zod";
import { SERVER_CONVEX_CLIENT } from "@/lib/server-convex-client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const createSaveToMemoryTool = (userId: string) =>
  tool({
    description:
      "Save NEW and important information from the conversation to the user's memory. Only use this for information that is NOT already saved in existing memories. Avoid duplicating or re-saving information that already exists. Focus on genuinely new facts, preferences, or context that would be helpful to remember in future conversations. Use this tool ONCE per response - if you need to save multiple pieces of information, include them all in a single call.",
    parameters: z.object({
      memories: z
        .array(z.string())
        .describe(
          "Array of important information pieces to remember for future conversations. Each item should be a distinct, valuable piece of information."
        ),
    }),
    execute: async ({ memories }) => {
      try {
        console.log("[MEMORY] Saving memories for user:", userId);
        console.log("[MEMORY] Memories:", memories);

        // Get environment variable for API key
        const apiKey = process.env.CONVEX_BRIDGE_API_KEY || "dummy-key";

        // Create memory objects for each piece of information
        const memoryObjects = memories.map((content) => ({
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
  });

export type SaveToMemoryResult = {
  success: boolean;
  message: string;
  memories?: Array<{
    content: string;
    createdAt: number;
  }>;
  error?: string;
};
