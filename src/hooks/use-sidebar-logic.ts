import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useThreadData } from "@/hooks/use-thread-data";
import { Doc } from "@/convex/_generated/dataModel";

type Thread = Doc<"threads">;

// Define date group types
type DateGroup =
  | "Today"
  | "Yesterday"
  | "Last 7 Days"
  | "Last 30 Days"
  | "Older";

// Define the return type for the hook
interface UseSidebarLogicReturn {
  // Data
  threads: Thread[] | null | undefined;
  currentUser: any;
  currentThreadId: string | null;
  pinnedThreads: Thread[];
  groupedThreads: { group: DateGroup; threads: Thread[] }[];

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;

  // Dialog state
  threadToDelete: string | null;

  // Handlers
  handleTogglePin: (threadId: string, isPinned: boolean) => Promise<void>;
  handleSetThreadToDelete: (threadId: string) => void;
  handleDeleteThread: () => Promise<void>;
  handleCloseDeleteDialog: () => void;
}

export function useSidebarLogic(): UseSidebarLogicReturn {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract current thread ID from URL
  const currentThreadId = location.pathname.startsWith("/chat/")
    ? location.pathname.split("/chat/")[1]
    : null;

  // Dialog state
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Use Convex hook for reactive thread data
  const allThreads = useThreadData();

  // Search results when there's a search query
  const searchResults = useQuery(
    api.threads.search,
    debouncedSearchQuery.trim()
      ? { query: debouncedSearchQuery, limit: 50 }
      : "skip"
  );

  // Determine which threads to use - only switch to search results when debounced query exists
  const threads = debouncedSearchQuery.trim() ? searchResults : allThreads;
  const isSearching = searchQuery.trim().length > 0; // Based on immediate search query, not debounced

  // Get current user data
  const currentUser = useQuery(api.auth.getCurrentUser);

  // Convex mutations
  const deleteThreadMutation = useMutation(api.threads.deleteThread);
  const togglePinMutation = useMutation(api.threads.togglePin);

  // Memoize date boundaries to avoid recalculating on every render
  const dateBoundaries = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    return { today, yesterday, last7Days, last30Days };
  }, []); // Only recalculate when component mounts (dates don't change during session)

  // Separate pinned threads
  const pinnedThreads = useMemo(() => {
    if (!threads) return [];
    return threads.filter((thread) => thread.pinned);
  }, [threads]);

  // Group non-pinned threads by date (same logic for both regular and search results)
  const groupedThreads = useMemo(() => {
    if (!threads) return [];

    // Filter out pinned threads first
    const nonPinnedThreads = threads.filter((thread) => !thread.pinned);
    const { today, yesterday, last7Days, last30Days } = dateBoundaries;

    // Initialize groups
    const groups: { group: DateGroup; threads: Thread[] }[] = [
      { group: "Today", threads: [] },
      { group: "Yesterday", threads: [] },
      { group: "Last 7 Days", threads: [] },
      { group: "Last 30 Days", threads: [] },
      { group: "Older", threads: [] },
    ];

    // Distribute threads into groups
    nonPinnedThreads.forEach((thread) => {
      const lastMessageDate = new Date(thread.lastMessageAt);

      if (lastMessageDate >= today) {
        groups[0].threads.push(thread);
      } else if (lastMessageDate >= yesterday) {
        groups[1].threads.push(thread);
      } else if (lastMessageDate >= last7Days) {
        groups[2].threads.push(thread);
      } else if (lastMessageDate >= last30Days) {
        groups[3].threads.push(thread);
      } else {
        groups[4].threads.push(thread);
      }
    });

    // Filter out empty groups
    return groups.filter((group) => group.threads.length > 0);
  }, [threads, dateBoundaries]);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleDeleteThread = useCallback(async () => {
    if (threadToDelete) {
      try {
        await deleteThreadMutation({ threadId: threadToDelete });

        // If the deleted thread was the active one, navigate to home
        if (currentThreadId === threadToDelete) {
          navigate("/");
        }

        setThreadToDelete(null);
      } catch (error) {
        console.error("Failed to delete thread:", error);
      }
    }
  }, [threadToDelete, deleteThreadMutation, currentThreadId, navigate]);

  const handleTogglePin = useCallback(
    async (threadId: string, isPinned: boolean) => {
      try {
        await togglePinMutation({ threadId, pinned: !isPinned });
      } catch (error) {
        console.error("Failed to toggle pin:", error);
      }
    },
    [togglePinMutation]
  );

  const handleSetThreadToDelete = useCallback((threadId: string) => {
    setThreadToDelete(threadId);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setThreadToDelete(null);
  }, []);

  return {
    // Data
    threads,
    currentUser,
    currentThreadId,
    pinnedThreads,
    groupedThreads,

    // Search
    searchQuery,
    setSearchQuery,
    isSearching,

    // Dialog state
    threadToDelete,

    // Handlers
    handleTogglePin,
    handleSetThreadToDelete,
    handleDeleteThread,
    handleCloseDeleteDialog,
  };
}
