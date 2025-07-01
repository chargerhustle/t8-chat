"use client";

import { memo } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";
import { MessageToolbar } from "./message-toolbar";
import { MessageLoading } from "./message-loading";
import { MessageAttachments } from "../attachments";
import { getModelDisplayName } from "@/ai/models-config";
import { ApiKeyError } from "@/components/error/api-key-error";
import { MemoryIndicator } from "../memory-indicator";
import { MessageTool } from "./message-tool";

interface MessageProps {
  message: Doc<"messages"> & {
    attachments: Doc<"attachments">[];
  };
}

// Helper function to extract memory tool results
const extractMemoryToolResults = (
  tools: Doc<"messages">["tools"],
  toolName: string,
  resultKey: string
) => {
  if (!tools) return [];

  return tools
    .filter(
      (tool) =>
        tool.toolName === toolName &&
        tool.state === "result" &&
        tool.result?.success &&
        tool.result?.[resultKey]
    )
    .flatMap((tool) => tool.result[resultKey]);
};

// Use memo to prevent re-renders when other messages are added
const MessageComponent = memo(({ message }: MessageProps) => {
  const isUser = message.role === "user";

  // Check if we should show loading animation for assistant messages
  // Only show loading if there's no content AND no parts (tools)
  const isAssistantLoading =
    !isUser &&
    (message.status === "streaming" || message.status === "waiting") &&
    (!message.content ||
      message.content.trim().length === 0 ||
      message.content === "...") &&
    (!message.parts || message.parts.length === 0);

  // Get model display name for assistant messages
  const modelDisplayName = !isUser
    ? getModelDisplayName(message.model)
    : undefined;

  // Extract completed memory tool invocations for memory indicator
  const memoriesSaved = !isUser
    ? extractMemoryToolResults(message.tools, "saveToMemory", "memories")
    : [];

  const memoriesUpdated = !isUser
    ? extractMemoryToolResults(message.tools, "updateMemory", "updatedMemories")
    : [];

  const memoriesDeleted = !isUser
    ? extractMemoryToolResults(message.tools, "deleteMemory", "deletedMemories")
    : [];

  // Check if this is an API key related error (missing or invalid)
  const isApiKeyError =
    !isUser &&
    message.status === "error" &&
    (message.serverError?.type === "missing_api_keys" ||
      message.serverError?.type === "missing_key" ||
      message.serverError?.type === "invalid_key");

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
            <MessageToolbar messageContent={message.content} isUser={true} />
          </div>
        </div>
      ) : (
        // Assistant message
        <div className="group relative w-full max-w-full break-words">
          {/* Memory indicator for assistant messages with memory actions */}
          <MemoryIndicator
            memoriesSaved={memoriesSaved}
            memoriesUpdated={memoriesUpdated}
            memoriesDeleted={memoriesDeleted}
          />

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
            ) : isApiKeyError ? (
              // Show API key error component
              <ApiKeyError />
            ) : (
              // Show actual content when available
              <div className="flex flex-col gap-4">
                {/* Render parts array */}
                {message.parts && message.parts.length > 0
                  ? message.parts.map((part, index) => {
                      const key = `${message.messageId}-part-${index}`;

                      if (part.type === "text") {
                        return (
                          <Markdown
                            key={key}
                            id={`${message.messageId}-content-${index}`}
                          >
                            {part.text}
                          </Markdown>
                        );
                      }

                      if (part.type === "tool") {
                        return (
                          <MessageTool
                            key={key}
                            toolInvocation={{
                              toolCallId: part.toolCallId,
                              toolName: part.toolName,
                              args: part.args,
                              state: part.state,
                              result: part.result,
                            }}
                          />
                        );
                      }

                      return null;
                    })
                  : // Fallback to message.content if no parts
                    message.content && (
                      <Markdown id={`${message.messageId}-content`}>
                        {message.content}
                      </Markdown>
                    )}
              </div>
            )}
          </div>

          {/* Assistant message toolbar - positioned absolutely to the left */}
          <div className="absolute left-0 -ml-0.5 mt-2 flex w-full flex-row justify-start gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100">
            <MessageToolbar
              messageContent={message.content}
              isUser={false}
              model={modelDisplayName}
              threadId={message.threadId}
              messageId={message.messageId}
            />
          </div>
        </div>
      )}
    </div>
  );
});

MessageComponent.displayName = "MessageComponent";

export default MessageComponent;
