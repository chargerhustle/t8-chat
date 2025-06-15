"use client";

import { useNavigate } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThreadGroup } from "@/components/sidebar/thread-group";
import { PinnedThreadsSection } from "@/components/sidebar/pinned-threads-section";
import { SidebarFooter as CustomSidebarFooter } from "@/components/sidebar/sidebar-footer";
import { DeleteThreadDialog } from "@/components/sidebar/delete-thread-dialog";
import { useSidebarLogic } from "@/hooks/use-sidebar-logic";

export function AppSidebar() {
  const navigate = useNavigate();

  const {
    threads,
    currentUser,
    currentThreadId,
    pinnedThreads,
    groupedThreads,
    threadToDelete,
    handleTogglePin,
    handleSetThreadToDelete,
    handleDeleteThread,
    handleCloseDeleteDialog,
  } = useSidebarLogic();

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
        <div className="border-b border-chat-border mx-2 pb-3"></div>
      </SidebarHeader>

      <SidebarContent className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden scrollbar-hide scroll-shadow relative pb-2">
        <SidebarMenu className="px-3">
          {/* Pinned threads section */}
          <PinnedThreadsSection
            threads={pinnedThreads}
            currentThreadId={currentThreadId}
            onTogglePin={handleTogglePin}
            onDelete={handleSetThreadToDelete}
          />

          {/* Empty state message */}
          {!threads?.length && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No threads yet. Create a new chat to get started.
            </div>
          )}

          {/* Date-grouped threads */}
          {groupedThreads.map((group) => (
            <ThreadGroup
              key={group.group}
              group={group.group}
              threads={group.threads}
              currentThreadId={currentThreadId}
              onTogglePin={handleTogglePin}
              onDelete={handleSetThreadToDelete}
            />
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <CustomSidebarFooter currentUser={currentUser} />
      </SidebarFooter>

      <SidebarRail />

      {/* Delete Thread Alert Dialog */}
      <DeleteThreadDialog
        isOpen={!!threadToDelete}
        threadToDelete={threadToDelete}
        threads={threads}
        onClose={handleCloseDeleteDialog}
        onConfirmDelete={handleDeleteThread}
      />
    </Sidebar>
  );
}
