"use client";

import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTemporaryMode } from "@/hooks/use-temporary-mode";

interface MessageToolbarProps {
  messageContent: string;
  isUser?: boolean;
  model?: string;
  threadId?: string;
  messageId?: string;
}

export function MessageToolbar({
  messageContent,
  isUser = false,
  model,
  threadId,
  messageId,
}: MessageToolbarProps) {
  const isTemporary = useTemporaryMode();

  const buttonClasses = cn(
    "h-8 w-8 text-xs rounded-lg p-0",
    "hover:bg-muted/40 hover:text-foreground",
    "disabled:hover:bg-transparent disabled:hover:text-foreground/50"
  );

  // Branch mutation for assistant messages
  const branchMutation = useMutation(
    api.threads.createBranch
  ).withOptimisticUpdate((localStore, args) => {
    const threads = localStore.getQuery(api.threads.get, {});
    if (!threads) return;
    // Find the parent thread
    const parentThread = threads.find(
      (t) => t.threadId === args.originalThreadId
    );
    if (!parentThread) return;
    const now = Date.now();
    // Create proper fake ID for optimistic thread
    const fakeId = crypto.randomUUID() as Id<"threads">;
    const optimisticThread = {
      ...parentThread,
      threadId: args.newThreadId,
      _id: fakeId,
      _creationTime: now,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      branchParentThreadId: parentThread._id,
      branchParentPublicMessageId: args.branchFromMessageId,
      pinned: parentThread.pinned,
    };
    localStore.setQuery(api.threads.get, {}, [optimisticThread, ...threads]);
  });

  const handleBranch = async () => {
    // Check if in temporary mode and show error toast
    if (isTemporary) {
      toast.error("Cannot branch temporary chat", {
        description:
          "Temporary chats aren't saved and can't be branched. Start a regular chat to use branching.",
        duration: 3000,
      });
      return;
    }

    if (!threadId || !messageId) return;
    const newThreadId = crypto.randomUUID();
    try {
      await branchMutation({
        originalThreadId: threadId,
        branchFromMessageId: messageId,
        newThreadId,
      });
    } catch (err) {
      toast.error(
        "Failed to create branch" +
          (err instanceof Error ? ": " + err.message : "")
      );
    }
  };

  if (isUser) {
    // User message toolbar: Copy (other buttons hidden for now)
    return (
      <div className="flex items-center gap-1">
        {/* Hidden for now - uncomment to re-enable
        <Button
          variant="ghost"
          size="sm"
          className={buttonClasses}
          aria-label="Retry message"
        >
          <RefreshCcw className="h-4 w-4" />
          <span className="sr-only">Retry</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={buttonClasses}
          aria-label="Edit message"
        >
          <SquarePen className="h-4 w-4" />
        </Button>
        */}
        <CopyButton
          text={messageContent}
          size="md"
          variant="ghost"
          className={buttonClasses}
          aria-label="Copy message"
        />
      </div>
    );
  } else {
    // Assistant message toolbar: Copy and model display (other buttons hidden for now)
    return (
      <div className="flex w-full flex-row justify-between gap-1 sm:w-auto">
        <div className="flex items-center gap-1">
          <CopyButton
            text={messageContent}
            size="md"
            variant="ghost"
            className={buttonClasses}
            aria-label="Copy response to clipboard"
          />
          {/* Branch button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBranch}
            disabled={!threadId || !messageId}
            className={buttonClasses}
            aria-label="Branch off message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M6.02,5.78m0,15.31V4.55m0,0v-1.91m0,3.14v-1.23m0,1.23c0,1.61,1.21,3.11,3.2,3.94l4.58,1.92c1.98,.83,3.2,2.32,3.2,3.94v3.84"></path>
              <path d="M20.53,17.59l-3.41,3.66-3.66-3.41"></path>
            </svg>
            <span className="sr-only">Branch message</span>
          </Button>
          {/* Refresh button (UI only, not wired up)
          <Button
            variant="ghost"
            size="sm"
            className={buttonClasses}
            aria-label="Retry message"
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="sr-only">Retry</span>
          </Button>
          */}

          {/* Model display for mobile - only show if model is provided */}
          {model && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground sm:hidden">
              <span>{model}</span>
            </div>
          )}
        </div>
        {/* Model display for desktop - only show if model is provided */}
        {model && (
          <div className="hidden flex-row gap-2 sm:flex">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{model}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
