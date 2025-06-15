"use client";

import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define user type based on what we expect from Convex
type User =
  | {
      name?: string;
      image?: string;
    }
  | null
  | undefined;

interface SidebarFooterProps {
  currentUser: User;
}

export function SidebarFooter({ currentUser }: SidebarFooterProps) {
  return (
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
            <span className="text-xs text-muted-foreground">Free</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
