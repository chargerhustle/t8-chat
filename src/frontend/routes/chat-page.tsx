"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import MessageComponent from "@/components/chat/messages/message";
import { ChatInput } from "@/components/chat/chat-input/chat-input";
import { createMessage } from "@/lib/chat/create-message";
import { useCreateMessage } from "@/hooks/use-create-message";
import { useTemporaryMode } from "@/hooks/use-temporary-mode";
import { useHybridMessages } from "@/hooks/use-hybrid-messages";
import { useThreadMessages } from "@/lib/chat/temp-message-store";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { ModelConfig } from "@/ai/models-config";
import { EffortLevel } from "@/types";

export default function Chat() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatInputHeight, setChatInputHeight] = useState(141);
  const [chatInputValue, setChatInputValue] = useState("");

  // Hook for creating messages with proper React integration
  const createMessageHooks = useCreateMessage();

  // Use hook to detect temporary mode
  const temporary = useTemporaryMode();

  // Get messages from temp and hybrid stores depending on mode
  const tempMessages = useThreadMessages(threadId || "");
  const hybridMessages = useHybridMessages(threadId || "");

  // Use the appropriate messages based on mode
  const messages = temporary ? tempMessages : hybridMessages;

  // Redirect to home if temporary mode and no messages (e.g., after page refresh)
  // Don't redirect if user is actively submitting to avoid race conditions
  useEffect(() => {
    if (temporary && messages.length === 0 && !isSubmitting) {
      navigate("/", { replace: true });
    }
  }, [temporary, messages.length, isSubmitting, navigate]);

  // Use scroll to bottom hook
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
      if (!threadId || isSubmitting || !message.trim()) return;

      setIsSubmitting(true);

      try {
        console.log(
          `[CHAT] Adding user message to thread ${threadId}: ${message}`
        );

        await createMessage(
          {
            newThread: false, // Thread already exists
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
        );
      } catch (error) {
        console.error("[CHAT] Failed to send message:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [threadId, isSubmitting, temporary, createMessageHooks]
  );

  const handleChatInputHeightChange = useCallback((height: number) => {
    setChatInputHeight(height);
  }, []);

  const handleValueChange = useCallback((value: string) => {
    setChatInputValue(value);
  }, []);

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
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageComponent key={message.messageId} message={message} />
            ))
          ) : (
            // Empty state - no text during loading, just empty space
            <div />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        showScrollToBottom={showScrollToBottom}
        onScrollToBottom={scrollToBottom}
        onHeightChange={handleChatInputHeightChange}
        value={chatInputValue}
        onValueChange={handleValueChange}
      />
    </div>
  );
}
