import { useState } from "react";
import { ModelConfig, MODEL_CONFIGS, DEFAULT_MODEL } from "@/ai/models-config";
import { EffortLevel } from "@/types";

const CHAT_INPUT_SETTINGS_KEY = "t8-chat-input-settings";

interface ChatInputSettings {
  selectedModelId: string;
  reasoningEffort: EffortLevel;
  includeSearch: boolean;
}

const loadSettings = (): Partial<ChatInputSettings> => {
  if (typeof window === "undefined") return {};

  try {
    const saved = localStorage.getItem(CHAT_INPUT_SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn(
      "Failed to load chat input settings from localStorage:",
      error
    );
  }
  return {};
};

const saveSettings = (settings: Partial<ChatInputSettings>) => {
  try {
    const existing = loadSettings();
    const updated = { ...existing, ...settings };
    localStorage.setItem(CHAT_INPUT_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn("Failed to save chat input settings to localStorage:", error);
  }
};

export function useChatInputState() {
  const savedSettings = loadSettings();

  // Initialize with default, then load from localStorage
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(() => {
    if (savedSettings.selectedModelId) {
      const savedModel = MODEL_CONFIGS.find(
        (m) => m.id === savedSettings.selectedModelId
      );
      if (savedModel) {
        return savedModel;
      }
    }
    // Fallback to default
    return (
      MODEL_CONFIGS.find((m) => m.model === DEFAULT_MODEL) || MODEL_CONFIGS[0]
    );
  });

  const [reasoningEffort, setReasoningEffort] = useState<EffortLevel>(() => {
    if (
      savedSettings.reasoningEffort &&
      ["low", "medium", "high"].includes(savedSettings.reasoningEffort)
    ) {
      return savedSettings.reasoningEffort;
    }
    return "medium";
  });

  const [includeSearch, setIncludeSearch] = useState<boolean>(() => {
    return savedSettings.includeSearch ?? false;
  });

  // Wrapper function to save to localStorage when model changes
  const handleSetSelectedModel = (model: ModelConfig) => {
    setSelectedModel(model);
    saveSettings({ selectedModelId: model.id });
  };

  // Wrapper function to save reasoning effort to localStorage
  const handleSetReasoningEffort = (effort: EffortLevel) => {
    setReasoningEffort(effort);
    saveSettings({ reasoningEffort: effort });
  };

  // Wrapper function to save search setting to localStorage
  const handleSetIncludeSearch = (include: boolean) => {
    setIncludeSearch(include);
    saveSettings({ includeSearch: include });
  };

  // Check if current model supports search
  const modelSupportsSearch = selectedModel.features.includes("search");
  // Check if current model supports reasoning (for models like o1, o3, etc.)
  const modelSupportsReasoning = selectedModel.features.includes("reasoning");

  const toggleSearch = () => {
    handleSetIncludeSearch(!includeSearch);
  };

  // Accept string for file input (comma-separated)
  const acceptMimes = selectedModel.allowedMIMETypes.join(",");

  return {
    selectedModel,
    setSelectedModel: handleSetSelectedModel,
    reasoningEffort,
    setReasoningEffort: handleSetReasoningEffort,
    includeSearch,
    setIncludeSearch: handleSetIncludeSearch,
    toggleSearch,
    modelSupportsSearch,
    modelSupportsReasoning,
    acceptMimes,
  };
}
