"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
import { ChatInput } from "@/components/chat/chat-input/chat-input";
import { createMessage } from "@/lib/chat/create-message";
import { useCreateMessage } from "@/hooks/use-create-message";
import { useTemporaryMode } from "@/hooks/use-temporary-mode";
import { ModelConfig } from "@/ai/models-config";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { EffortLevel } from "@/types";

export default function LaunchChat() {
  const navigate = useNavigate();
  const [hasInputText, setHasInputText] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Hook for creating messages with proper React integration
  const createMessageHooks = useCreateMessage();

  // Use hook to detect temporary mode
  const temporary = useTemporaryMode();

  const handleSubmit = async (
    message: string,
    model: ModelConfig,
    reasoningEffort: EffortLevel,
    includeSearch: boolean,
    attachments: ReturnType<
      typeof import("@/hooks/use-attachments").useAttachments
    >["attachments"]
  ) => {
    if (!message.trim()) return;

    const threadId = crypto.randomUUID();

    // Set navigating state to prevent welcome message from showing
    setIsNavigating(true);

    // 1. Navigate FIRST (instant feedback)
    navigate(temporary ? `/temporary/chat/${threadId}` : `/chat/${threadId}`);

    // 2. Call createMessage with everything (it handles thread creation)
    createMessage(
      {
        newThread: true, // createMessage will create the thread
        threadId,
        userContent: message,
        model: model.model, // Use the selected model from dropdown
        modelParams: {
          reasoningEffort,
          includeSearch,
        },
        attachments,
        temporary, // Pass temporary mode
      },
      createMessageHooks
    ).catch((error) => {
      console.error("Failed to create thread:", error);
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setHasInputText(true);

    // Auto-focus the chat input
    setTimeout(() => {
      const textarea = document.getElementById(
        "chat-input"
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(
          textarea.value.length,
          textarea.value.length
        );
      }
    }, 100);
  };

  const handleInputChange = (hasText: boolean) => {
    setHasInputText(hasText);
  };

  const handleValueChange = (value: string) => {
    setInputValue(value);
  };

  return (
    <div className="relative h-full">
      <div className="absolute bottom-0 top-0 w-full overflow-hidden border-l border-t border-chat-border bg-chat-background bg-fixed pb-[140px] transition-all ease-snappy max-sm:border-none sm:translate-y-3.5 sm:rounded-tl-xl !translate-y-0 !rounded-none border-none">
        <div className="bg-noise absolute inset-0 -top-3.5 bg-fixed transition-transform ease-snappy [background-position:right_bottom] translate-y-3.5"></div>
      </div>

      <div className="absolute inset-0 custom-scrollbar">
        <div
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
          className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pt-safe-offset-10 pb-16"
        >
          {!hasInputText && !isNavigating && (
            <ChatWelcome onSuggestionClick={handleSuggestionClick} />
          )}
        </div>
      </div>

      <ChatInput
        onSubmit={handleSubmit}
        isSubmitting={false}
        onInputChange={handleInputChange}
        value={inputValue}
        onValueChange={handleValueChange}
      />
    </div>
  );
}
