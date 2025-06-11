import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import React from "react";

interface ApiKeyState {
  value: string;
  isSaved: boolean;
}

type ApiProvider = "anthropic" | "openai" | "google" | "openrouter";

// Mapping for correct display names of API providers
const PROVIDER_DISPLAY_NAMES: Record<ApiProvider, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  openrouter: "OpenRouter",
};

// Validation patterns for each provider
const API_KEY_PATTERNS: Record<
  ApiProvider,
  { pattern: RegExp; example: string }
> = {
  anthropic: {
    pattern: /^sk-ant-/,
    example: "sk-ant-...",
  },
  openai: {
    pattern: /^sk-/,
    example: "sk-...",
  },
  google: {
    pattern: /^AIza/,
    example: "AIza...",
  },
  openrouter: {
    pattern: /^sk-or-/,
    example: "sk-or-...",
  },
};

const validateApiKey = (
  provider: ApiProvider,
  key: string
): { isValid: boolean; error?: string } => {
  if (!key.trim()) {
    return { isValid: false, error: "API key cannot be empty" };
  }

  const { pattern } = API_KEY_PATTERNS[provider];

  if (!pattern.test(key)) {
    return {
      isValid: false,
      error: `Invalid ${provider} API key format`,
    };
  }

  return { isValid: true };
};

export const useApiKey = (provider: ApiProvider) => {
  const [state, setState] = useState<ApiKeyState>({
    value: "",
    isSaved: false,
  });

  const storageKey = `apikey:${provider}`;

  // Load saved key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem(storageKey);
    if (savedKey) {
      const validation = validateApiKey(provider, savedKey);
      if (validation.isValid) {
        setState({
          value: savedKey,
          isSaved: true,
        });
      } else {
        // Remove invalid key from localStorage
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey, provider]);

  const saveKey = useCallback(
    (key: string) => {
      const validation = validateApiKey(provider, key);

      if (!validation.isValid) {
        const displayName = PROVIDER_DISPLAY_NAMES[provider];
        toast.error(validation.error?.replace(provider, displayName), {
          icon: React.createElement(CircleAlert, { className: "h-4 w-4" }),
          position: "bottom-right",
        });
        return false;
      }

      localStorage.setItem(storageKey, key);
      setState({ value: key, isSaved: true });

      toast.success(
        `${PROVIDER_DISPLAY_NAMES[provider]} API key saved successfully`,
        {
          position: "bottom-right",
        }
      );

      return true;
    },
    [storageKey, provider]
  );

  const deleteKey = useCallback(() => {
    localStorage.removeItem(storageKey);
    setState({ value: "", isSaved: false });

    toast.success(`${PROVIDER_DISPLAY_NAMES[provider]} API key removed`, {
      position: "bottom-right",
    });
  }, [storageKey, provider]);

  const updateValue = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      value,
    }));
  }, []);

  return {
    state,
    saveKey,
    deleteKey,
    updateValue,
    getPlaceholder: () => API_KEY_PATTERNS[provider].example,
  };
};
