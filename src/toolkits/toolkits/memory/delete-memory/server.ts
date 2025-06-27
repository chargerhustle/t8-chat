import { type baseDeleteMemoryTool } from "./base";
import { SERVER_CONVEX_CLIENT } from "@/lib/server-convex-client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import type { ServerToolConfig } from "@/toolkits/types";

export const deleteMemoryToolConfigServer = (
  userId: string
): ServerToolConfig<
  typeof baseDeleteMemoryTool.inputSchema.shape,
  typeof baseDeleteMemoryTool.outputSchema.shape
> => ({
  callback: async ({ memoryIds }) => {
    try {
      console.log(
        `[MEMORY] Deleting ${memoryIds.length} ${memoryIds.length === 1 ? "memory" : "memories"}`
      );

      // Get environment variable for API key
      const apiKey = process.env.CONVEX_BRIDGE_API_KEY;
      if (!apiKey) {
        throw new Error(
          "CONVEX_BRIDGE_API_KEY environment variable is not set"
        );
      }

      // Delete the memories using the internal API
      const result = await SERVER_CONVEX_CLIENT.mutation(
        api.internal.memories.deleteMemories,
        {
          userId: userId as Id<"users">,
          memoryIds,
          apiKey,
        }
      );

      console.log(
        `[MEMORY] Successfully deleted ${memoryIds.length} ${memoryIds.length === 1 ? "memory" : "memories"}`
      );

      return {
        success: result.success,
        message: result.message,
        deletedMemories: result.deletedMemories,
      };
    } catch (error) {
      console.error("[MEMORY] Failed to delete memories:", error);
      return {
        success: false,
        message: "Failed to delete memories",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
  message:
    "Memory has been successfully deleted and will no longer be used in future conversations.",
});
