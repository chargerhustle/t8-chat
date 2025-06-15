"use client";

import { Pin } from "lucide-react";
import { ThreadItem } from "./thread-item";
import { Doc } from "@/convex/_generated/dataModel";

type Thread = Doc<"threads">;

interface PinnedThreadsSectionProps {
  threads: Thread[];
  currentThreadId: string | null;
  onTogglePin: (threadId: string, isPinned: boolean) => void;
  onDelete: (threadId: string) => void;
}

export function PinnedThreadsSection({
  threads,
  currentThreadId,
  onTogglePin,
  onDelete,
}: PinnedThreadsSectionProps) {
  // Don't render if no pinned threads
  if (threads.length === 0) {
    return null;
  }

  return (
    <div
      data-sidebar="group"
      className="relative flex w-full min-w-0 flex-col py-2"
    >
      <div
        data-sidebar="group-label"
        className="flex h-8 shrink-0 select-none items-center rounded-md text-xs font-medium outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-snappy focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 px-1.5 text-heading leading-tight-xs"
      >
        <Pin className="-ml-0.5 mr-1 mt-px !size-3" />
        <span>Pinned</span>
      </div>

      <div data-sidebar="group-content" className="w-full text-sm">
        <ul data-sidebar="menu" className="flex w-full min-w-0 flex-col gap-1">
          {threads.map((thread) => (
            <ThreadItem
              key={thread.threadId}
              thread={thread}
              isActive={currentThreadId === thread.threadId}
              onTogglePin={onTogglePin}
              onDelete={onDelete}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
