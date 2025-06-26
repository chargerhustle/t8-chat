import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const baseSaveToMemoryTool = createBaseTool({
  description:
    "Save NEW and important information from the conversation to the user's memory. Only use this for information that is NOT already saved in existing memories. Avoid duplicating or re-saving information that already exists. Focus on genuinely new facts, preferences, or context that would be helpful to remember in future conversations. Use this tool ONCE per response - if you need to save multiple pieces of information, include them all in a single call.",
  inputSchema: z.object({
    memories: z
      .array(z.string())
      .min(1, "At least one memory is required")
      .describe(
        "Array of important information pieces to remember for future conversations. Each item should be a distinct, valuable piece of information."
      ),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    memories: z.optional(
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
