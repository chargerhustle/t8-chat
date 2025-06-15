import { useCallback } from "react";
import { ModelConfig } from "@/ai/models-config";
import { EffortLevel } from "@/types";
import { useAttachments } from "@/hooks/use-attachments";

interface UseChatSubmissionProps {
  onSubmit: (
    message: string,
    model: ModelConfig,
    reasoningEffort: EffortLevel,
    includeSearch: boolean,
    attachments: ReturnType<typeof useAttachments>["attachments"]
  ) => Promise<void>;
  isSubmitting: boolean;
  currentValue: string;
  isControlled: boolean;
  onValueChange?: (value: string) => void;
  setInternalValue: (value: string) => void;
  adjustHeight: (reset?: boolean) => void;
  clearAttachments: () => void;
  onInputChange?: (hasText: boolean) => void;
  selectedModel: ModelConfig;
  reasoningEffort: EffortLevel;
  includeSearch: boolean;
  attachments: ReturnType<typeof useAttachments>["attachments"];
  allFilesUploaded: boolean;
}

export function useChatSubmission({
  onSubmit,
  isSubmitting,
  currentValue,
  isControlled,
  onValueChange,
  setInternalValue,
  adjustHeight,
  clearAttachments,
  onInputChange,
  selectedModel,
  reasoningEffort,
  includeSearch,
  attachments,
  allFilesUploaded,
}: UseChatSubmissionProps) {
  const canSend =
    currentValue.trim().length > 0 && allFilesUploaded && !isSubmitting;

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (!currentValue.trim() || isSubmitting) return;

      const messageToSend = currentValue.trim();

      if (isControlled) {
        onValueChange?.("");
      } else {
        setInternalValue("");
      }

      adjustHeight(true);

      // Clear attachments once message sent
      clearAttachments();

      // Notify parent that input is now empty
      onInputChange?.(false);

      try {
        await onSubmit(
          messageToSend,
          selectedModel,
          reasoningEffort,
          includeSearch,
          attachments
        );
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [
      currentValue,
      isSubmitting,
      isControlled,
      onValueChange,
      setInternalValue,
      adjustHeight,
      clearAttachments,
      onInputChange,
      onSubmit,
      selectedModel,
      reasoningEffort,
      includeSearch,
      attachments,
    ]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return {
    canSend,
    handleSubmit,
    handleKeyDown,
  };
}
