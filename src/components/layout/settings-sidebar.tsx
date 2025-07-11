"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CopyButton } from "@/components/copy-button";
import { UserStatsCard, KeyboardShortcutsCard } from "@/components/settings";
import type { Doc } from "@/convex/_generated/dataModel";

interface SettingsSidebarProps {
  currentUser: Doc<"users"> | null | undefined;
  userStats:
    | {
        joinedDate: number;
        totalThreads: number;
        lastActivity?: number;
        favoriteModel?: string;
      }
    | null
    | undefined;
}

/**
 * Renders a sidebar displaying the current user's profile, user statistics, and keyboard shortcuts.
 *
 * The sidebar includes the user's avatar, name, email (with a flip animation to reveal a copyable user ID), a "Pro Plan" badge, user statistics, and a keyboard shortcuts card. It is visible only on medium and larger screens.
 *
 * @param currentUser - The current user object or null/undefined if not available.
 * @param userStats - An object containing user statistics or null/undefined if not available.
 */
export function SettingsSidebar({
  currentUser,
  userStats,
}: SettingsSidebarProps) {
  return (
    <div className="hidden space-y-8 md:block md:w-1/4">
      {/* Profile Section */}
      <div className="relative text-center">
        <Avatar className="mx-auto h-40 w-40">
          <AvatarImage src={currentUser?.image || ""} alt="Profile picture" />
          <AvatarFallback>
            {currentUser?.name
              ? currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "U"}
          </AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-2xl font-bold">
          {currentUser?.name || "Loading..."}
        </h1>
        <div className="relative flex items-center justify-center">
          <p className="break-all text-muted-foreground"></p>
        </div>
        <div className="perspective-1000 group relative h-6 break-all text-muted-foreground">
          <span className="absolute inset-0 transition-transform duration-300 [backface-visibility:hidden] [transform-style:preserve-3d] truncate group-hover:[transform:rotateX(180deg)]">
            {currentUser?.email || "Loading..."}
          </span>
          <span className="absolute inset-0 transition-transform duration-300 [backface-visibility:hidden] [transform-style:preserve-3d] [transform:rotateX(180deg)] group-hover:[transform:rotateX(0deg)]">
            <span className="flex h-6 items-center justify-center gap-2 text-sm">
              <span className="flex items-center gap-2">
                Copy User ID
                <CopyButton
                  text={currentUser?._id || ""}
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  showToast={true}
                  ariaLabel="Copy user ID to clipboard"
                />
              </span>
            </span>
          </span>
        </div>
        <span className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary text-primary-foreground">
          Pro Plan
        </span>
      </div>

      {/* User Stats */}
      <UserStatsCard userStats={userStats} />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcutsCard />
    </div>
  );
}
