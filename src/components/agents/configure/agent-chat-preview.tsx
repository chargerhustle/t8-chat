"use client";

import { useState, useCallback } from "react";
import { ChatInput } from "@/components/chat/chat-input/chat-input";
import { createMessage } from "@/lib/chat/create-message";
import { useCreateMessage } from "@/hooks/use-create-message";
import { useThreadMessages } from "@/lib/chat/temp-message-store";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { ModelConfig } from "@/ai/models-config";
import { ChatWelcome } from "@/components/chat/chat-welcome";
import { EffortLevel } from "@/types";
import MessageComponent from "@/components/chat/messages/message";

export function AgentChatPreview() {
  const [hasInputText, setHasInputText] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatInputHeight, setChatInputHeight] = useState(141);
  const [isNavigating, setIsNavigating] = useState(false);

  // Hook for creating messages with proper React integration
  const createMessageHooks = useCreateMessage();

  // Get messages from temp store for the current thread
  const messages = useThreadMessages(currentThreadId || "");

  // Use scroll to bottom hook (same as ChatPage)
  const {
    showScrollToBottom,
    scrollToBottom,
    scrollContainerRef,
    messagesEndRef,
    updateScrollPosition,
  } = useScrollToBottom();

  // Create a ref callback for the messages container that updates scroll position
  const messagesContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        // Use requestAnimationFrame to ensure DOM has updated after messages render
        requestAnimationFrame(updateScrollPosition);
      }
    },
    [updateScrollPosition]
  );

  const handleSubmit = useCallback(
    async (
      message: string,
      model: ModelConfig,
      reasoningEffort: EffortLevel,
      includeSearch: boolean,
      attachments: ReturnType<
        typeof import("@/hooks/use-attachments").useAttachments
      >["attachments"]
    ) => {
      if (!message.trim() || isSubmitting) return;

      setIsSubmitting(true);

      // Create a new thread ID if we don't have one (first message)
      const threadId = currentThreadId || crypto.randomUUID();

      if (!currentThreadId) {
        setCurrentThreadId(threadId);
        // Set navigating state to hide welcome message (like LaunchChat)
        setIsNavigating(true);
      }

      try {
        console.log(
          `[AGENT_PREVIEW] Adding user message to thread ${threadId}: ${message}`
        );

        // Call createMessage with temporary mode enabled
        await createMessage(
          {
            newThread: !currentThreadId, // First message creates the thread
            threadId,
            userContent: message,
            model: model.model,
            modelParams: {
              reasoningEffort,
              includeSearch,
            },
            attachments,
            temporary: true, // Always use temporary mode for preview
          },
          createMessageHooks
        );
      } catch (error) {
        console.error("Failed to create message:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentThreadId, isSubmitting, createMessageHooks]
  );

  const handleSuggestionClick = useCallback((suggestion: string) => {
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
  }, []);

  const handleInputChange = useCallback((hasText: boolean) => {
    setHasInputText(hasText);
  }, []);

  const handleValueChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleChatInputHeightChange = useCallback((height: number) => {
    setChatInputHeight(height);
  }, []);

  // Show LaunchChat-style welcome when no messages, ChatPage-style when messages exist
  const showWelcome = messages.length === 0 && !hasInputText && !isNavigating;
  const showMessages = messages.length > 0;

  return (
    <div className="relative h-full">
      <div className="absolute bottom-0 top-0 w-full overflow-hidden border-l border-t border-chat-border bg-chat-background bg-fixed pb-[140px] transition-all ease-snappy max-sm:border-none sm:translate-y-3.5 sm:rounded-tl-xl !translate-y-0 !rounded-none border-none">
        <div className="bg-noise absolute inset-0 -top-3.5 bg-fixed transition-transform ease-snappy [background-position:right_bottom] translate-y-3.5"></div>
      </div>

      <div
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-scroll sm:pt-3.5 custom-scrollbar"
        style={{
          paddingBottom: `${chatInputHeight}px`,
          scrollbarGutter: "stable both-edges",
        }}
      >
        <div
          ref={messagesContainerRef}
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
          className="mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pt-safe-offset-10 pb-6"
        >
          {showWelcome && (
            <ChatWelcome onSuggestionClick={handleSuggestionClick} />
          )}

          {showMessages ? (
            messages.map((message) => (
              <MessageComponent key={message.messageId} message={message} />
            ))
          ) : showMessages === false && !showWelcome ? (
            // Empty state during loading (like ChatPage)
            <div />
          ) : null}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        showScrollToBottom={showScrollToBottom}
        onScrollToBottom={scrollToBottom}
        onHeightChange={handleChatInputHeightChange}
        onInputChange={handleInputChange}
        value={inputValue}
        onValueChange={handleValueChange}
      />
    </div>
  );
}
