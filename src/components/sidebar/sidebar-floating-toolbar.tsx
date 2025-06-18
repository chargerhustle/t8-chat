"use client";

import { Search, Plus, PanelLeft } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

interface SidebarFloatingToolbarProps {
  onSearchOpen: () => void;
}

export function SidebarFloatingToolbar({
  onSearchOpen,
}: SidebarFloatingToolbarProps) {
  const { state, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";

  const handleNewThread = () => {
    navigate("/");
  };

  return (
    <>
      <div className="pointer-events-auto fixed left-2 z-50 flex flex-row gap-0.5 p-1 top-safe-offset-2">
        {/* Background blur effect */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 right-auto -z-10 rounded-md backdrop-blur-sm transition-[background-color,width] max-sm:delay-125 max-sm:duration-125 max-sm:w-[6.75rem] max-sm:bg-sidebar/50",
            isCollapsed
              ? "delay-125 duration-125 w-[6.75rem] bg-sidebar/50"
              : "delay-0 duration-250 w-10 bg-transparent"
          )}
        />

        {/* Sidebar Toggle Button - Always visible */}
        <Button
          variant="ghost"
          size="icon"
          className="z-10 h-8 w-8 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          onClick={toggleSidebar}
          data-sidebar="trigger"
        >
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        {/* Search Button - Visible when collapsed, hidden when expanded */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-8 text-muted-foreground transition-[transform,opacity] delay-150 hover:bg-muted/40 hover:text-foreground",
            isCollapsed
              ? "translate-x-0 opacity-100 duration-250"
              : "sm:pointer-events-none sm:-translate-x-[2.125rem] sm:opacity-0 sm:delay-0 sm:duration-150"
          )}
          onClick={onSearchOpen}
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>

        {/* New Thread Button - Visible when collapsed, hidden when expanded */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-8 text-muted-foreground transition-[transform,opacity] delay-150 duration-150 hover:bg-muted/40 hover:text-foreground",
            isCollapsed
              ? "translate-x-0 opacity-100 pointer-events-auto"
              : "sm:pointer-events-none sm:-translate-x-[2.125rem] sm:opacity-0 sm:delay-0 sm:duration-150"
          )}
          onClick={handleNewThread}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">New Thread</span>
        </Button>
      </div>
    </>
  );
}
