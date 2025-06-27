import { type baseUpdateMemoryTool } from "./base";
import { SERVER_CONVEX_CLIENT } from "@/lib/server-convex-client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import type { ServerToolConfig } from "@/toolkits/types";

export const updateMemoryToolConfigServer = (
  userId: string
): ServerToolConfig<
  typeof baseUpdateMemoryTool.inputSchema.shape,
  typeof baseUpdateMemoryTool.outputSchema.shape
> => ({
  callback: async ({ updates }) => {
    try {
      console.log(
        `[MEMORY] Updating ${updates.length} ${updates.length === 1 ? "memory" : "memories"}`
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

      console.log(
        `[MEMORY] Successfully updated ${updates.length} ${updates.length === 1 ? "memory" : "memories"}`
      );

      return {
        success: result.success,
        message: result.message,
        updatedMemories: result.updatedMemories,
      };
    } catch (error) {
      console.error("[MEMORY] Failed to update memories:", error);
      return {
        success: false,
        message: "Failed to update memories",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
  message:
    "Memory has been successfully updated and will be used to provide more personalized responses in future conversations.",
});
