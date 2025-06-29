import type { ToolkitConfig } from "@/toolkits/types";
import { baseSearchTool } from "./search/base";
import { ExaTools } from "./tools";
import { z } from "zod";

export const exaParameters = z.object({});

export const baseExaToolkitConfig: ToolkitConfig<
  ExaTools,
  typeof exaParameters.shape
> = {
  tools: {
    [ExaTools.Search]: baseSearchTool,
  },
  parameters: exaParameters,
};
