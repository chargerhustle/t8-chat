import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const baseDeleteMemoryTool = createBaseTool({
  description:
    "ONLY use this tool when the user explicitly asks to delete memories. Delete one or more existing memories by their IDs when specifically requested by the user. Use this ONLY when the user directly requests to remove information that is no longer relevant, has become outdated, or was incorrectly saved. CRITICAL: You must use the EXACT memory IDs from the user's existing memories (e.g., mem_20241215_A3B7K) - do NOT make up or guess IDs. If you don't know the exact ID, check their memory list first. This action cannot be undone, so use it carefully. Only delete memories that are truly no longer needed. Do NOT use this tool proactively.",
  inputSchema: z.object({
    memoryIds: z
      .array(z.string())
      .min(1, "At least one memory ID is required")
      .describe(
        "Array of EXACT memory IDs to delete from the user's existing memories (e.g., ['mem_20241215_A3B7K', 'mem_20241216_X9Y2Z']) - do NOT make up IDs"
      ),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    deletedMemories: z.optional(
      z.array(
        z.object({
          id: z.string(),
          content: z.string(),
          createdAt: z.number(),
        })
      )
    ),
    error: z.optional(z.string()),
  }),
});
