"use client";

import { memo } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { SidebarMenuButton } from "@/components/ui/sidebar";
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
    <li data-sidebar="menu-item" className="group/menu-item relative">
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={thread.title}
        className="group/link relative flex h-9 w-full items-center overflow-hidden rounded-lg px-2 py-1 text-sm font-normal outline-none text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring hover:focus-visible:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-normal"
      >
        <Link to={`/chat/${thread.threadId}`}>
          <div className="relative flex w-full items-center">
            <div className="w-full">
              <div className="relative w-full">
                <span className="flex h-full w-full rounded bg-transparent px-1 py-1 text-sm font-normal outline-none overflow-hidden truncate leading-tight-sm">
                  {thread.title}
                </span>
              </div>
            </div>

            {/* Buttons container with slide animation */}
            <div className="pointer-events-auto absolute -right-1 bottom-0 top-0 z-50 flex translate-x-full items-center justify-end text-muted-foreground transition-transform group-hover/link:translate-x-0">
              <div className="pointer-events-none absolute bottom-0 right-[100%] top-0 h-12 w-8 bg-gradient-to-l from-sidebar-accent to-transparent opacity-0 group-hover/link:opacity-100"></div>

              {/* Pin/Unpin button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md p-0.5 hover:bg-muted/40"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTogglePin(thread.threadId, thread.pinned);
                }}
                title={thread.pinned ? "Unpin" : "Pin"}
              >
                {thread.pinned ? (
                  <PinOff className="h-3.5 w-3.5" />
                ) : (
                  <Pin className="h-3.5 w-3.5" />
                )}
              </Button>

              {/* Delete button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md p-0.5 hover:bg-muted/40"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(thread.threadId);
                }}
                title="Delete"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Link>
      </SidebarMenuButton>
    </li>
  )
);

ThreadItem.displayName = "ThreadItem";
