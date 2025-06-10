"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useThreadData } from "@/hooks/use-thread-data";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { X, Pin, PinOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define date group types
type DateGroup =
  | "Today"
  | "Yesterday"
  | "Last 7 Days"
  | "Last 30 Days"
  | "Older";

// Define thread type based on Convex schema
type Thread = {
  _id: string;
  threadId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lastMessageAt: number;
  pinned: boolean;
  userId: string;
  model: string;
  visibility: string;
};

// Memoized ThreadItem component to prevent unnecessary re-renders
const ThreadItem = memo(
  ({
    thread,
    isActive,
    onTogglePin,
    onDelete,
  }: {
    thread: Thread;
    isActive: boolean;
    onTogglePin: (threadId: string, isPinned: boolean) => void;
    onDelete: (threadId: string) => void;
  }) => (
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
  ),
);

ThreadItem.displayName = "ThreadItem";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentThreadId = location.pathname.startsWith("/chat/")
    ? location.pathname.split("/chat/")[1]
    : null;
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);

  // Use Convex hook for reactive thread data
  const threads = useThreadData();
  
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

  // Group non-pinned threads by date
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
    [togglePinMutation],
  );

  const handleSetThreadToDelete = useCallback((threadId: string) => {
    setThreadToDelete(threadId);
  }, []);

  return (
    <Sidebar className="bg-[#151515] border-r border-[#292929]">
      <SidebarHeader>
        <SidebarMenu className="px-3">
          <SidebarMenuItem>
            <Button
              onClick={() => navigate("/")}
              className="w-full justify-center py-5"
              variant="default"
            >
              New Chat
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="border-b border-chat-border mx-2 pb-3">
        </div>
      </SidebarHeader>

      <SidebarContent className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden scrollbar-hide scroll-shadow relative pb-2">
        <SidebarMenu className="px-3">
          {/* Pinned threads section */}
          {pinnedThreads.length > 0 && (
            <div
              data-sidebar="group"
              className="relative flex w-full min-w-0 flex-col p-2"
            >
              <div
                data-sidebar="group-label"
                className="flex h-8 shrink-0 select-none items-center rounded-md text-xs font-medium outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-snappy focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 px-1.5 text-heading leading-tight-xs"
              >
                <Pin className="-ml-0.5 mr-1 mt-px !size-3" />
                <span>Pinned</span>
              </div>

              <div data-sidebar="group-content" className="w-full text-sm">
                <ul
                  data-sidebar="menu"
                  className="flex w-full min-w-0 flex-col gap-1"
                >
                  {pinnedThreads.map((thread) => (
                    <ThreadItem
                      key={thread.threadId}
                      thread={thread}
                      isActive={currentThreadId === thread.threadId}
                      onTogglePin={handleTogglePin}
                      onDelete={handleSetThreadToDelete}
                    />
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Empty state message */}
          {!threads?.length && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No threads yet. Create a new chat to get started.
            </div>
          )}

          {/* Date-grouped threads */}
          {groupedThreads.map((group) => (
            <div
              key={group.group}
              data-sidebar="group"
              className="relative flex w-full min-w-0 flex-col p-2"
            >
              <div
                data-sidebar="group-label"
                className="flex h-8 shrink-0 select-none items-center rounded-md text-xs font-medium outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-snappy focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 px-1.5 text-heading leading-tight-xs"
              >
                <span>{group.group}</span>
              </div>

              <div data-sidebar="group-content" className="w-full text-sm">
                <ul
                  data-sidebar="menu"
                  className="flex w-full min-w-0 flex-col gap-1"
                >
                  {group.threads.map((thread) => (
                    <ThreadItem
                      key={thread.threadId}
                      thread={thread}
                      isActive={currentThreadId === thread.threadId}
                      onTogglePin={handleTogglePin}
                      onDelete={handleSetThreadToDelete}
                    />
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div data-sidebar="footer" className="flex flex-col gap-2 m-0 p-2 pt-0">
          <Link
            to="/settings"
            aria-label="Go to settings"
            role="button"
            className="flex select-none flex-row items-center justify-between gap-3 rounded-lg px-3 py-3 hover:bg-sidebar-accent focus:bg-sidebar-accent focus:outline-2"
            data-discover="true"
          >
            <div className="flex w-full min-w-0 flex-row items-center gap-3">
              <Avatar className="h-8 w-8 rounded-full ring-1 ring-muted-foreground/20">
                <AvatarImage 
                  src={currentUser?.image || ""} 
                  alt={currentUser?.name || "User"} 
                />
                <AvatarFallback className="text-sm">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col text-foreground">
                <span className="truncate text-sm font-medium">
                  {currentUser?.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Free
                </span>
              </div>
            </div>
          </Link>
        </div>
      </SidebarFooter>

      <SidebarRail />

      {/* Delete Thread Alert Dialog */}
      <AlertDialog
        open={!!threadToDelete}
        onOpenChange={(open) => !open && setThreadToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Thread</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;
              {threads?.find((t) => t.threadId === threadToDelete)?.title}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteThread}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
