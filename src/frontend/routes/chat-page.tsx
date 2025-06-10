"use client";

import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import MessageComponent from "@/components/chat/messages/message";
import { ChatInput } from "@/components/chat/chat-input/chat-input";
import { createMessage } from "@/lib/chat/create-message";
import { useHybridMessages } from "@/hooks/use-hybrid-messages";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { ModelConfig } from "@/ai/models-config";
import { EffortLevel } from "@/types";

export default function Chat() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch thread using Convex reactive query
  const thread = useQuery(
    api.threads.getByThreadId,
    threadId ? { threadId } : "skip"
  );

  // Use hybrid messages hook for real-time streaming + Convex data
  const messages = useHybridMessages(threadId || "");

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
    [updateScrollPosition, messages.length]
  ); // Re-run when messages change

  const handleSubmit = async (
    message: string,
    model: ModelConfig,
    reasoningEffort?: EffortLevel,
    includeSearch?: boolean
  ) => {
    if (!threadId || isSubmitting || !message.trim()) return;

    setIsSubmitting(true);

    try {
      console.log(
        `[CHAT] Adding user message to thread ${threadId}: ${message}`
      );

      await createMessage({
        newThread: false, // Thread already exists
        threadId,
        userContent: message,
        model: model.model, // Use the selected model from dropdown
        modelParams: {
          reasoningEffort,
          includeSearch,
        },
        attachments: [],
      });
    } catch (error) {
      console.error("[CHAT] Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show error when we're certain thread doesn't exist
  if (threadId && thread === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Thread not found</h2>
          <p className="text-muted-foreground mb-4">
            The thread you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <Button onClick={() => navigate("/")}>Go back home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div className="absolute bottom-0 top-0 w-full overflow-hidden border-l border-t border-chat-border bg-chat-background bg-fixed pb-[140px] transition-all ease-snappy max-sm:border-none sm:translate-y-3.5 sm:rounded-tl-xl !translate-y-0 !rounded-none border-none">
        <div className="bg-noise absolute inset-0 -top-3.5 bg-fixed transition-transform ease-snappy [background-position:right_bottom] translate-y-3.5"></div>
      </div>

      <div
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-scroll sm:pt-3.5 custom-scrollbar"
        style={{ paddingBottom: "141px", scrollbarGutter: "stable both-edges" }}
      >
        <div
          ref={messagesContainerRef}
          role="log"
          aria-label="Chat messages"
          className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-6 pt-2"
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
      />
    </div>
  );
}
