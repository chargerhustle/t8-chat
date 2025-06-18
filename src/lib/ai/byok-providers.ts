import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { LanguageModelV1 } from "ai";
import { MODEL_CONFIGS } from "@/ai/models-config";

export type ApiProvider = "anthropic" | "openai" | "google" | "openrouter";

export interface UserApiKeys {
  anthropic?: string;
  openai?: string;
  google?: string;
  openrouter?: string;
}

export interface BYOKProviderResult {
  provider: LanguageModelV1;
  usingUserKey: boolean;
  keyProvider: ApiProvider;
}

export interface BYOKError {
  type: "missing_key" | "invalid_key" | "unsupported_provider";
  message: string;
  provider: string;
  setupUrl?: string;
}

/**
 * Setup URLs for each provider's API key management
 */
const PROVIDER_SETUP_URLS: Record<ApiProvider, string> = {
  anthropic: "https://console.anthropic.com/account/keys",
  openai: "https://platform.openai.com/api-keys",
  google: "https://console.cloud.google.com/apis/credentials",
  openrouter: "https://openrouter.ai/keys",
};

/**
 * Get API keys from localStorage
 */
export function getUserApiKeys(): UserApiKeys {
  if (typeof window === "undefined") {
    return {}; // Server-side, no localStorage
  }

  return {
    anthropic: localStorage.getItem("apikey:anthropic") || undefined,
    openai: localStorage.getItem("apikey:openai") || undefined,
    google: localStorage.getItem("apikey:google") || undefined,
    openrouter: localStorage.getItem("apikey:openrouter") || undefined,
  };
}

/**
 * Check if user has API key for a specific provider
 */
export function hasApiKeyForProvider(provider: ApiProvider): boolean {
  const keys = getUserApiKeys();
  return !!keys[provider];
}

// Create optimized O(1) lookup map for model configs (same as in API route)
const MODEL_LOOKUP = new Map(
  MODEL_CONFIGS.map((config) => [config.model, config])
);

/**
 * Get the provider type needed for a specific model
 * Uses the same MODEL_CONFIGS approach as the API route
 */
export function getProviderForModel(modelId: string): ApiProvider | null {
  const modelConfig = MODEL_LOOKUP.get(modelId);
  if (!modelConfig) {
    console.warn(`[BYOK] Model ${modelId} not found in MODEL_CONFIGS`);
    return null;
  }

  return modelConfig.provider as ApiProvider;
}

/**
 * Get the appropriate BYOK provider for a model (orchestrator function)
 * Similar to getModelProvider but requires user API keys
 */
export function getBYOKProvider(
  modelString: string,
  userApiKeys: UserApiKeys,
  providerOptions?: Record<string, Record<string, unknown>>
): BYOKProviderResult | BYOKError {
  const modelConfig = MODEL_LOOKUP.get(modelString);

  if (!modelConfig) {
    return {
      type: "unsupported_provider",
      message: `Model ${modelString} not found in configuration. Available models: ${Array.from(MODEL_LOOKUP.keys()).join(", ")}`,
      provider: modelString,
    };
  }

  return createBYOKProviderFromConfig(
    modelConfig,
    modelString,
    userApiKeys,
    providerOptions
  );
}

/**
 * Create a provider instance from config using user's API key
 * Similar to getModelProviderFromConfig but requires user API keys
 */
export function createBYOKProviderFromConfig(
  modelConfig: { provider: string; displayName?: string; description?: string },
  modelString: string,
  userApiKeys: UserApiKeys,
  providerOptions?: Record<string, Record<string, unknown>>
): BYOKProviderResult | BYOKError {
  const provider = modelConfig.provider as ApiProvider;
  const userKey = userApiKeys[provider];

  console.log(`[BYOK] Provider: ${provider}/${modelString}`);

  // Require user API key - NO fallback to environment variables
  if (!userKey) {
    return {
      type: "missing_key",
      message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} API key required. Please add your API key in Settings.`,
      provider,
      setupUrl: PROVIDER_SETUP_URLS[provider],
    };
  }

  // Extract provider-specific options (same as original)
  const providerSpecificOptions = providerOptions?.[provider] || {};

  console.log(
    `[BYOK] Provider-specific options for ${provider}:`,
    providerSpecificOptions
  );

  try {
    let providerInstance: LanguageModelV1;

    switch (provider) {
      case "openai":
        const openaiProvider = createOpenAI({
          apiKey: userKey,
        });
        providerInstance = openaiProvider(modelString, providerSpecificOptions);
        break;

      case "google":
        const googleProvider = createGoogleGenerativeAI({
          apiKey: userKey,
        });
        providerInstance = googleProvider(modelString, providerSpecificOptions);
        break;

      case "anthropic":
        const anthropicProvider = createAnthropic({
          apiKey: userKey,
        });
        providerInstance = anthropicProvider(
          modelString,
          providerSpecificOptions
        );
        break;

      case "openrouter":
        const openrouterProvider = createOpenRouter({
          apiKey: userKey,
        });
        providerInstance = openrouterProvider.chat(
          modelString,
          providerSpecificOptions
        );
        break;

      default:
        return {
          type: "unsupported_provider",
          message: `Provider "${provider}" is not supported`,
          provider,
        };
    }

    return {
      provider: providerInstance,
      usingUserKey: true,
      keyProvider: provider,
    };
  } catch {
    return {
      type: "invalid_key",
      message: `Invalid ${provider} API key. Please check your key in Settings.`,
      provider,
      setupUrl: PROVIDER_SETUP_URLS[provider],
    };
  }
}

/**
 * Check if user can use a specific model (has required API key)
 */
export function canUseModel(modelId: string): boolean {
  const requiredProvider = getProviderForModel(modelId);
  if (!requiredProvider) return false;
  return hasApiKeyForProvider(requiredProvider);
}

/**
 * Get all available models based on user's API keys
 */
export function getAvailableModels(
  allModels: Array<{ id: string; provider: string }>
): Array<{ id: string; provider: string }> {
  const userKeys = getUserApiKeys();

  return allModels.filter((model) => {
    const provider = model.provider as ApiProvider;
    return userKeys[provider];
  });
}

/**
 * Get setup instructions for a specific model
 */
export function getModelSetupInstructions(modelId: string): {
  provider: ApiProvider;
  setupUrl: string;
  keyName: string;
} | null {
  const provider = getProviderForModel(modelId);
  if (!provider) return null;

  const keyNames: Record<ApiProvider, string> = {
    openai: "OpenAI API Key",
    google: "Google API Key",
    anthropic: "Anthropic API Key",
    openrouter: "OpenRouter API Key",
  };

  return {
    provider,
    setupUrl: PROVIDER_SETUP_URLS[provider],
    keyName: keyNames[provider],
  };
}
