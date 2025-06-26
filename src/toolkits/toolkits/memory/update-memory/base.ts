import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const baseUpdateMemoryTool = createBaseTool({
  description:
    "ONLY use this tool when the user explicitly asks to update specific memories. Update one or more existing memories by their IDs. Use this ONLY when the user directly requests to modify, correct, or enhance information that was previously saved to memory. CRITICAL: You must use the EXACT memory IDs from the user's existing memories (e.g., mem_20241215_A3B7K) - do NOT make up or guess IDs. If you don't know the exact ID, check their memory list first. Do NOT use this tool proactively.",
  inputSchema: z.object({
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
            .min(1, "Memory content cannot be empty")
            .describe(
              "The new content that will replace the existing memory content"
            ),
        })
      )
      .min(1, "At least one memory update is required")
      .describe(
        "Array of memory updates to perform. Each update contains a memory ID and new content."
      ),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    updatedMemories: z.optional(
      z.array(
        z.object({
          id: z.string(),
          content: z.string(),
        })
      )
    ),
    error: z.optional(z.string()),
  }),
});
