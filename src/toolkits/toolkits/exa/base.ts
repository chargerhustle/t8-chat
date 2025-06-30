import type { ToolkitConfig } from "@/toolkits/types";
import { baseSearchTool } from "./search/base";
import { baseSearchTool as baseSearchToolOpenAI } from "./search/base-openai";
import { ExaTools } from "./tools";
import { z } from "zod";
import { MODEL_CONFIGS } from "@/ai/models-config";

export const exaParameters = z.object({});

/**
 * Determines if a model needs OpenAI-specific schema
 * Returns true for OpenAI o-series models (o3, o4, etc.)
 */
function needsOpenAISchema(model: string): boolean {
  const modelConfig = MODEL_CONFIGS.find((config) => config.model === model);
  if (!modelConfig) {
    return false;
  }

  // Check if it's an OpenAI provider and an o-series model
  return (
    modelConfig.provider === "openai" &&
    (model.startsWith("o3-") ||
      model.startsWith("o4-") ||
      model.startsWith("o3") ||
      model.startsWith("o4"))
  );
}

/**
 * Creates the appropriate toolkit configuration based on the model
 * Uses OpenAI-specific schema for o-series models, regular schema for others
 */
export function createExaToolkitConfig(
  model?: string
): ToolkitConfig<ExaTools, typeof exaParameters.shape> {
  const shouldUseOpenAISchema = model && needsOpenAISchema(model);

  return {
    tools: {
      [ExaTools.Search]: shouldUseOpenAISchema
        ? baseSearchToolOpenAI
        : baseSearchTool,
    },
    parameters: exaParameters,
  };
}

// Default export for backward compatibility (uses regular schema)
export const baseExaToolkitConfig: ToolkitConfig<
  ExaTools,
  typeof exaParameters.shape
> = createExaToolkitConfig();
