import { EffortLevel, AllowedModels } from "@/types";
import { MODEL_CONFIGS } from "@/ai/models-config";

/**
 * Provider options compatible with AI SDK's streamText providerOptions
 * Format: Record<string, Record<string, JSONValue>>
 */
export type ProviderOptions = Record<string, Record<string, unknown>>;

/**
 * Google thinking budget mapping for effort levels
 * Based on Google's thinkingConfig.thinkingBudget parameter
 * Budgets from 1 to 1024 tokens will be set to 1024 by Google
 */
const GOOGLE_THINKING_BUDGETS: Record<EffortLevel, number> = {
  low: 1024, // Minimum effective budget (Google sets <1024 to 1024)
  medium: 8192, // Balanced reasoning
  high: 24576, // Maximum reasoning depth (Google's max limit)
};

/**
 * Anthropic thinking budget mapping for effort levels
 * Based on Anthropic's thinking.budgetTokens parameter
 */
const ANTHROPIC_THINKING_BUDGETS: Record<EffortLevel, number> = {
  low: 4000, // Quick reasoning
  medium: 8192, // Balanced reasoning (from example)
  high: 16384, // Maximum reasoning depth
};

/**
 * Maps effort level to provider-specific reasoning options
 * Returns properly formatted provider options for AI SDK
 */
export function buildProviderOptions(
  model: AllowedModels,
  reasoningEffort?: EffortLevel,
  includeSearch?: boolean
): ProviderOptions | undefined {
  if (!reasoningEffort && !includeSearch) {
    return undefined;
  }

  // Get provider from MODEL_CONFIGS
  const modelConfig = MODEL_CONFIGS.find((config) => config.model === model);
  if (!modelConfig) {
    console.warn(
      `[PROVIDER_OPTIONS] Model ${model} not found in MODEL_CONFIGS`
    );
    return undefined;
  }

  const provider = modelConfig.provider;
  const providerOptions: ProviderOptions = {};

  switch (provider) {
    case "openai":
      // OpenAI format: { openai: { reasoningEffort: "low" | "medium" | "high" } }
      if (reasoningEffort) {
        providerOptions.openai = {
          reasoningEffort: reasoningEffort,
        };
      }
      // OpenAI doesn't support search grounding as a provider option
      if (includeSearch) {
        console.log(
          `[PROVIDER_OPTIONS] Search requested for OpenAI model: ${model} - not supported as provider option`
        );
      }
      break;

    case "google":
      // Google format: { google: { thinkingConfig: { thinkingBudget: number }, useSearchGrounding: boolean } }
      const googleOptions: Record<string, unknown> = {};

      if (reasoningEffort) {
        googleOptions.thinkingConfig = {
          thinkingBudget: GOOGLE_THINKING_BUDGETS[reasoningEffort],
        };
      }

      if (includeSearch) {
        googleOptions.useSearchGrounding = true;
      }

      if (Object.keys(googleOptions).length > 0) {
        providerOptions.google = googleOptions;
      }
      break;

    case "anthropic":
      // Anthropic format: { anthropic: { thinking: { type: 'enabled', budgetTokens: number } } }
      const anthropicOptions: Record<string, unknown> = {};

      if (reasoningEffort) {
        anthropicOptions.thinking = {
          type: "enabled",
          budgetTokens: ANTHROPIC_THINKING_BUDGETS[reasoningEffort],
        };
      }

      if (includeSearch) {
        console.log(
          `[PROVIDER_OPTIONS] Search requested for Anthropic model: ${model} - not supported as provider option`
        );
      }

      if (Object.keys(anthropicOptions).length > 0) {
        providerOptions.anthropic = anthropicOptions;
      }
      break;

    default:
      console.warn(
        `[PROVIDER_OPTIONS] Unknown provider: ${provider} for model: ${model}`
      );
      break;
  }

  return Object.keys(providerOptions).length > 0 ? providerOptions : undefined;
}
