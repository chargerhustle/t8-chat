"use client";

import { ScrollToBottomButton } from "./scroll-to-bottom-button";
import { ChatTextarea } from "./chat-textarea";
import { ChatInputActions } from "./chat-input-actions";
import { ChatInputForm } from "./chat-input-form";
import { MODEL_CONFIGS, ModelConfig } from "@/ai/models-config";
import { EffortLevel } from "@/types";
import { AttachmentsList } from "@/components/chat/attachments";
import { useAttachments } from "@/hooks/use-attachments";
import {
  useAttachmentsHeight,
  useChatInputHeight,
} from "@/hooks/use-chat-input-height";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { useChatInputState } from "@/hooks/use-chat-input-state";
import { useChatInputValue } from "@/hooks/use-chat-input-value";
import { useChatSubmission } from "@/hooks/use-chat-submission";

interface ChatInputProps {
  onSubmit: (
    message: string,
    model: ModelConfig,
    reasoningEffort: EffortLevel,
    includeSearch: boolean,
    attachments: ReturnType<typeof useAttachments>["attachments"]
  ) => Promise<void>;
  isSubmitting: boolean;
  onInputChange?: (hasText: boolean) => void;
  value?: string;
  onValueChange?: (value: string) => void;
  showScrollToBottom?: boolean;
  onScrollToBottom?: () => void;
  onHeightChange?: (height: number) => void;
}

export function ChatInput({
  onSubmit,
  isSubmitting,
  onInputChange,
  value,
  onValueChange,
  showScrollToBottom,
  onScrollToBottom,
  onHeightChange,
}: ChatInputProps) {
  // Chat input state management
  const {
    selectedModel,
    setSelectedModel,
    reasoningEffort,
    setReasoningEffort,
    includeSearch,
    toggleSearch,
    modelSupportsSearch,
    modelSupportsReasoning,
    acceptMimes,
  } = useChatInputState();

  // Auto-resize textarea
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 200,
  });

  // Input value management
  const { currentValue, isControlled, setInternalValue, handleInputChange } =
    useChatInputValue({
      value,
      onValueChange,
      onInputChange,
      adjustHeight,
    });

  // Attachment hook (no threadId needed - files uploaded to R2 directly)
  const {
    attachments,
    addFiles,
    removeAttachment: handleRemoveAttachment,
    clear: clearAttachments,
    allFilesUploaded,
  } = useAttachments();

  // Chat submission logic
  const { canSend, handleSubmit, handleKeyDown } = useChatSubmission({
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
  });

  // Get ref for measuring attachments height
  const { attachmentsRef } = useAttachmentsHeight();

  // Chat input container height management
  const { chatInputContainerRef } = useChatInputHeight({
    onHeightChange,
    attachmentsLength: attachments.length,
    currentValue,
  });

  return (
    <div
      ref={chatInputContainerRef}
      className="pointer-events-none absolute bottom-0 z-10 w-full px-2"
    >
      <div className="relative mx-auto flex w-full max-w-3xl flex-col text-center">
        <ScrollToBottomButton
          showScrollToBottom={showScrollToBottom}
          onScrollToBottom={onScrollToBottom}
        />
        <ChatInputForm onSubmit={handleSubmit}>
          <AttachmentsList
            ref={attachmentsRef}
            attachments={attachments}
            onRemoveAttachment={handleRemoveAttachment}
          />
          <ChatTextarea
            ref={textareaRef}
            value={currentValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <ChatInputActions
            canSend={canSend}
            models={MODEL_CONFIGS}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            modelSupportsReasoning={modelSupportsReasoning}
            reasoningEffort={reasoningEffort}
            onReasoningEffortChange={setReasoningEffort}
            modelSupportsSearch={modelSupportsSearch}
            includeSearch={includeSearch}
            onToggleSearch={toggleSearch}
            acceptMimes={acceptMimes}
            onFilesSelected={addFiles}
          />
        </ChatInputForm>
      </div>
    </div>
  );
}
