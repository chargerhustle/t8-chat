"use client";

import { memo } from "react";
import { Link } from "react-router";
import { X, Pin, PinOff } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

type Thread = Doc<"threads">;

interface ThreadItemProps {
  thread: Thread;
  isActive: boolean;
  onTogglePin: (threadId: string, isPinned: boolean) => void;
  onDelete: (threadId: string) => void;
}

// Memoized ThreadItem component to prevent unnecessary re-renders
export const ThreadItem = memo(
  ({ thread, isActive, onTogglePin, onDelete }: ThreadItemProps) => (
    <span data-state="closed" style={{ userSelect: "none" }}>
      <li data-sidebar="menu-item" className="group/menu-item relative">
        <Link
          to={`/chat/${thread.threadId}`}
          className={`group/link relative flex h-9 w-full items-center overflow-hidden rounded-lg px-2 py-1 text-sm outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring hover:focus-visible:bg-sidebar-accent ${
            isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
          }`}
          data-discover="true"
        >
          <div className="relative flex w-full items-center">
            <button data-state="closed" className="w-full">
              <div className="relative w-full">
                <input
                  aria-label="Thread title"
                  aria-describedby="thread-title-hint"
                  aria-readonly="true"
                  readOnly
                  tabIndex={-1}
                  className="hover:truncate-none h-full w-full rounded bg-transparent px-1 py-1 text-sm text-muted-foreground outline-none pointer-events-none cursor-pointer overflow-hidden truncate"
                  title={thread.title}
                  type="text"
                  value={thread.title}
                />
              </div>
            </button>

            {/* Buttons container with slide animation */}
            <div className="pointer-events-auto absolute -right-1 bottom-0 top-0 z-50 flex translate-x-full items-center justify-end text-muted-foreground transition-transform group-hover/link:translate-x-0 group-hover/link:bg-sidebar-accent">
              <div className="pointer-events-none absolute bottom-0 right-[100%] top-0 h-12 w-8 bg-gradient-to-l from-sidebar-accent to-transparent opacity-0 group-hover/link:opacity-100"></div>

              {/* Pin/Unpin button */}
              <button
                className="rounded-md p-1.5 hover:bg-muted/40"
                tabIndex={-1}
                data-action="pin-thread"
                aria-label={thread.pinned ? "Unpin thread" : "Pin thread"}
                data-state="closed"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTogglePin(thread.threadId, thread.pinned);
                }}
              >
                {thread.pinned ? (
                  <PinOff className="size-4" />
                ) : (
                  <Pin className="size-4" />
                )}
              </button>

              {/* Delete button */}
              <button
                className="rounded-md p-1.5 hover:bg-destructive/50 hover:text-destructive-foreground"
                tabIndex={-1}
                data-action="thread-delete"
                aria-label="Delete thread"
                data-state="closed"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(thread.threadId);
                }}
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </Link>
      </li>
    </span>
  )
);

ThreadItem.displayName = "ThreadItem";
