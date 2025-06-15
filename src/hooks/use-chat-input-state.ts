import { useState } from "react";
import { ModelConfig, MODEL_CONFIGS, DEFAULT_MODEL } from "@/ai/models-config";
import { EffortLevel } from "@/types";

export function useChatInputState() {
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(
    MODEL_CONFIGS.find((m) => m.model === DEFAULT_MODEL) || MODEL_CONFIGS[0]
  );
  const [reasoningEffort, setReasoningEffort] = useState<EffortLevel>("medium");
  const [includeSearch, setIncludeSearch] = useState(false);

  // Check if current model supports search
  const modelSupportsSearch = selectedModel.features.includes("search");
  // Check if current model supports reasoning (for models like o1, o3, etc.)
  const modelSupportsReasoning = selectedModel.features.includes("reasoning");

  const toggleSearch = () => {
    setIncludeSearch(!includeSearch);
  };

  // Accept string for file input (comma-separated)
  const acceptMimes = selectedModel.allowedMIMETypes.join(",");

  return {
    selectedModel,
    setSelectedModel,
    reasoningEffort,
    setReasoningEffort,
    includeSearch,
    setIncludeSearch,
    toggleSearch,
    modelSupportsSearch,
    modelSupportsReasoning,
    acceptMimes,
  };
}
