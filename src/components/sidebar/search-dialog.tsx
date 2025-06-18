"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Search, Slash, Plus, Clock, CornerDownLeft } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import TextareaAutosize from "react-textarea-autosize";
import { createMessage } from "@/lib/chat/create-message";
import { useCreateMessage } from "@/hooks/use-create-message";
import { DEFAULT_MODEL } from "@/ai/models-config";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Thread = Doc<"threads">;

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hook for creating messages with proper React integration
  const createMessageHooks = useCreateMessage();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get recent threads for initial display
  const recentThreads = useQuery(api.threads.get);

  // Get search results when there's a query
  const searchResults = useQuery(
    api.threads.search,
    debouncedSearchQuery.trim()
      ? { query: debouncedSearchQuery, limit: 10 }
      : "skip"
  );

  // Determine which threads to show - if search returns no results, show recent threads
  const threadsToShow =
    debouncedSearchQuery.trim() && searchResults && searchResults.length > 0
      ? searchResults
      : recentThreads?.slice(0, 10);

  // Focus textarea when dialog opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (searchQuery.trim()) {
          // If there's a search query, go to first result or create new chat
          if (threadsToShow && threadsToShow.length > 0) {
            navigate(`/chat/${threadsToShow[0].threadId}`);
          } else {
            navigate("/");
          }
        } else {
          // If no search query, start new chat
          navigate("/");
        }
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, searchQuery, threadsToShow, navigate, onClose]);

  const handleThreadClick = (threadId: string) => {
    navigate(`/chat/${threadId}`);
    onClose();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const query = searchQuery.trim();

      // Check if query is at least 5 characters
      if (query.length < 5) {
        return; // Don't submit if less than 5 characters
      }

      // Create new thread with the search query as first message
      const threadId = crypto.randomUUID();

      // Navigate first for instant feedback
      navigate(`/chat/${threadId}`);
      onClose();

      // Create message with the search query
      try {
        await createMessage(
          {
            newThread: true,
            threadId,
            userContent: query,
            model: DEFAULT_MODEL,
            modelParams: {
              reasoningEffort: "medium",
              includeSearch: false,
            },
            attachments: [],
          },
          createMessageHooks
        );
      } catch (error) {
        console.error("Failed to create message:", error);
      }
    }
  };

  // Determine what to show in the header - use immediate searchQuery for UI consistency
  const isSearching = searchQuery.trim();
  const hasSearchResults = searchResults && searchResults.length > 0;
  const headerText = isSearching
    ? hasSearchResults
      ? `Threads (${searchResults.length})`
      : "Threads (0)"
    : "Recent Chats";

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={false}>
      <DialogContent className="left-1/2 top-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 border-none bg-transparent shadow-none outline-none p-0 [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Threads</DialogTitle>
        </DialogHeader>

        {/* Dialog Content */}
        <div className="pointer-events-auto flex h-fit w-full flex-col gap-1 rounded-xl bg-popover p-3.5 pt-2.5 text-secondary-foreground outline outline-1 outline-chat-border/20 max-sm:inset-x-4 max-sm:w-auto dark:outline-white/5">
          {/* Search Input Section */}
          <div className="relative">
            <div className="w-full rounded-t-lg bg-popover">
              <div className="mr-px flex items-start justify-start pb-2">
                <div className="mt-0.5 flex items-center text-muted-foreground/75">
                  <Search className="ml-px !size-4" />
                  <Slash className="ml-[3px] !size-4 skew-x-[30deg] opacity-20" />
                  <Plus className="mr-3 !size-4" />
                </div>
                <TextareaAutosize
                  id="search-dialog-textarea"
                  name="searchDialogQuery"
                  ref={textareaRef}
                  className="w-full resize-none bg-transparent text-sm placeholder:select-none placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 custom-scrollbar"
                  role="searchbox"
                  aria-label="Search threads and messages"
                  placeholder="Search or press Enter to start new chat..."
                  minRows={1}
                  maxRows={5}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="border-b border-chat-border px-3"></div>
            </div>
            {/* Enter icon - show when there's at least 5 characters */}
            {searchQuery.trim().length >= 5 && (
              <div className="absolute right-3 mt-1 text-xs text-muted-foreground/75 flex items-center gap-1">
                <CornerDownLeft className="size-3" />
                to start new chat
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="mt-2.5 max-h-[50vh] space-y-2 overflow-y-auto">
            <div className="flex flex-col gap-1">
              <div className="flex w-full items-center justify-start gap-1.5 pl-[3px] text-sm text-color-heading">
                {!isSearching && <Clock className="size-3" />}
                {headerText}
              </div>
              <ul className="flex flex-col gap-0 text-sm text-muted-foreground">
                {threadsToShow?.map((thread: Thread) => (
                  <li key={thread._id}>
                    <button
                      className={cn(
                        "block w-full text-left rounded-md px-2.5 py-2 hover:bg-accent/30 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                      )}
                      onClick={() => handleThreadClick(thread.threadId)}
                      data-discover="true"
                    >
                      {thread.title || "Untitled Chat"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
