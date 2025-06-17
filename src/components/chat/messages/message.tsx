"use client";

import { memo } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";
import { MessageToolbar } from "./message-toolbar";
import { MessageLoading } from "./message-loading";
import { MessageAttachments } from "../attachments";
import { getModelDisplayName } from "@/ai/models-config";

interface MessageProps {
  message: Doc<"messages"> & {
    attachments: Doc<"attachments">[];
  };
}

// Use memo to prevent re-renders when other messages are added
const MessageComponent = memo(({ message }: MessageProps) => {
  const isUser = message.role === "user";

  // Check if we should show loading animation for assistant messages
  const isAssistantLoading =
    !isUser &&
    (message.status === "streaming" || message.status === "waiting") &&
    (!message.content ||
      message.content.trim().length === 0 ||
      message.content === "...");

  // Get model display name for assistant messages
  const modelDisplayName = !isUser
    ? getModelDisplayName(message.model)
    : undefined;

  return (
    <div
      data-message-id={message.messageId}
      className={cn(isUser ? "flex justify-end" : "flex justify-start")}
    >
      {isUser ? (
        // User message with bubble
        <div
          role="article"
          aria-label="Your message"
          className="group relative inline-block max-w-[80%] break-words rounded-xl border border-secondary/50 bg-secondary/50 px-4 py-3 text-left"
        >
          <span className="sr-only">Your message: </span>
          <div className="flex flex-col gap-3">
            <div className="prose prose-pink user-message max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
              <Markdown id={`${message.messageId}-content`}>
                {message.content}
              </Markdown>
            </div>
            <MessageAttachments attachments={message.attachments} />
          </div>
          {/* User message toolbar - positioned absolutely to the right */}
          <div className="absolute right-0 mt-5 flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
            <MessageToolbar
              messageContent={message.content}
              align="right"
              isUser={true}
            />
          </div>
        </div>
      ) : (
        // Assistant message
        <div className="group relative w-full max-w-full break-words">
          <div
            role="article"
            aria-label="Assistant message"
            className="prose prose-pink max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0"
          >
            <span className="sr-only">Assistant Reply: </span>
            {isAssistantLoading ? (
              // Show loading animation when assistant is thinking
              <div className="flex items-center py-2">
                <MessageLoading />
              </div>
            ) : (
              // Show actual content when available
              <Markdown id={`${message.messageId}-content`}>
                {message.content}
              </Markdown>
            )}
          </div>
          {/* Assistant message toolbar - positioned absolutely to the left */}
          <div className="absolute left-0 -ml-0.5 mt-2 flex w-full flex-row justify-start gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
            <MessageToolbar
              messageContent={message.content}
              align="left"
              isUser={false}
              model={modelDisplayName}
            />
          </div>
        </div>
      )}
    </div>
  );
});

MessageComponent.displayName = "MessageComponent";

export default MessageComponent;
