"use client";

import { memo, useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { X, Pin, PinOff } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Thread = Doc<"threads">;

interface ThreadItemProps {
  thread: Thread;
  isActive: boolean;
  onTogglePin: (threadId: string, isPinned: boolean) => void;
  onDelete: (threadId: string) => void;
}

// Memoized ThreadItem component to prevent unnecessary re-renders
export const ThreadItem = memo(
  ({ thread, isActive, onTogglePin, onDelete }: ThreadItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(thread.title);
    const inputRef = useRef<HTMLInputElement>(null);
    const updateThreadTitle = useMutation(api.threads.updateThreadTitle);

    // Focus input when entering edit mode
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    const handleDoubleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(true);
      setEditValue(thread.title);
    };

    const handleButtonClick = (e: React.MouseEvent) => {
      // Prevent all single clicks from bubbling up to the Link
      e.preventDefault();
      e.stopPropagation();
    };

    const handleSave = async () => {
      if (editValue.trim() && editValue.trim() !== thread.title) {
        try {
          await updateThreadTitle({
            threadId: thread.threadId,
            title: editValue.trim(),
          });
        } catch (error) {
          console.error("Failed to update thread title:", error);
          setEditValue(thread.title);
        }
      }
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditValue(thread.title);
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    };

    const handleBlur = () => {
      handleSave();
    };

    return (
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
              <button
                data-state="closed"
                className="w-full"
                onClick={handleButtonClick}
                onDoubleClick={handleDoubleClick}
              >
                <div className="relative w-full">
                  {isEditing ? (
                    <input
                      id={`thread-edit-${thread.threadId}`}
                      name={`threadEdit-${thread.threadId}`}
                      ref={inputRef}
                      aria-label="Edit thread title"
                      className="h-full w-full rounded bg-transparent px-1 py-1 text-sm text-sidebar-accent-foreground outline-none border-none focus:ring-0 focus:outline-none"
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleBlur}
                      onClick={handleButtonClick}
                    />
                  ) : (
                    <input
                      id={`thread-title-${thread.threadId}`}
                      name={`threadTitle-${thread.threadId}`}
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
                  )}
                </div>
              </button>

              {/* Buttons container with slide animation - hide during editing */}
              {!isEditing && (
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
              )}
            </div>
          </Link>
        </li>
      </span>
    );
  }
);

ThreadItem.displayName = "ThreadItem";
