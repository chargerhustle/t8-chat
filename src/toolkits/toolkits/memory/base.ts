import type { ToolkitConfig } from "@/toolkits/types";
import { baseSaveToMemoryTool } from "./save-memory/base";
import { baseUpdateMemoryTool } from "./update-memory/base";
import { baseDeleteMemoryTool } from "./delete-memory/base";
import { MemoryTools } from "./tools";
import { z } from "zod";

export const memoryParameters = z.object({
  userId: z.string(),
});

export const baseMemoryToolkitConfig: ToolkitConfig<
  MemoryTools,
  typeof memoryParameters.shape
> = {
  tools: {
    [MemoryTools.SaveToMemory]: baseSaveToMemoryTool,
    [MemoryTools.UpdateMemory]: baseUpdateMemoryTool,
    [MemoryTools.DeleteMemory]: baseDeleteMemoryTool,
  },
  parameters: memoryParameters,
};
