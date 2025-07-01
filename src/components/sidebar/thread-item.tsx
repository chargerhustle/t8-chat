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
  onDelete: (threadId: string, immediate?: boolean) => void;
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
      // Only prevent propagation when editing
      if (isEditing) {
        e.preventDefault();
        e.stopPropagation();
      }
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
                onDoubleClick={handleDoubleClick}
              >
                <div className="relative w-full flex items-center">
                  {thread.branchParentThreadId && (
                    <div className="inline-flex" data-state="closed">
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
                        className="lucide mr-1 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground"
                      >
                        <path d="M6.02,5.78m0,15.31V4.55m0,0v-1.91m0,3.14v-1.23m0,1.23c0,1.61,1.21,3.11,3.2,3.94l4.58,1.92c1.98,.83,3.2,2.32,3.2,3.94v3.84"></path>
                        <path d="M20.53,17.59l-3.41,3.66-3.66-3.41"></path>
                      </svg>
                      <span className="sr-only">Go to parent thread</span>
                    </div>
                  )}
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
                      if (e.shiftKey) {
                        onDelete(thread.threadId, true);
                      } else {
                        onDelete(thread.threadId);
                      }
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
