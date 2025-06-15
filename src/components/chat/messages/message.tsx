"use client";

import { memo } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";
import { MessageToolbar } from "./message-toolbar";
import { MessageLoading } from "./message-loading";
import { MessageAttachments } from "../attachments";

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

  return (
    <div className="w-full group">
      <div
        data-message-id={message.messageId}
        className={cn(isUser ? "flex justify-end" : "flex justify-start")}
      >
        {isUser ? (
          // User message with bubble
          <div className="flex flex-col items-end max-w-[80%]">
            <div
              role="article"
              aria-label="Your message"
              className="relative inline-block break-words rounded-xl border border-zinc-800 bg-[#2C2C2C] px-4 py-3 text-left text-base"
            >
              <span className="sr-only">Your message: </span>
              <div className="flex flex-col gap-3">
                <Markdown id={`${message.messageId}-content`}>
                  {message.content}
                </Markdown>
                <MessageAttachments attachments={message.attachments} />
              </div>
            </div>
            {/* User message toolbar - right side */}
            <MessageToolbar messageContent={message.content} align="right" />
          </div>
        ) : (
          // Assistant message
          <div className="flex flex-col items-start w-full max-w-full">
            <div className="relative w-full break-words">
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
            </div>
            {/* Assistant message toolbar - left side */}
            <MessageToolbar messageContent={message.content} align="left" />
          </div>
        )}
      </div>
    </div>
  );
});

MessageComponent.displayName = "MessageComponent";

export default MessageComponent;
