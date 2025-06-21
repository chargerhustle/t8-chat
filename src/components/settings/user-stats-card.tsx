"use client";

import { Button } from "@/components/ui/button";
import { getModelDisplayName } from "@/ai/models-config";
import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface UserStatsCardProps {
  showCustomizeButton?: boolean;
  userStats?: {
    joinedDate: number;
    totalThreads: number;
    lastActivity?: number;
    favoriteModel?: string;
  } | null;
}

/**
 * Displays a card with user statistics and an optional customization button.
 *
 * Shows information such as the user's join date, total conversations, favorite model, and last activity. Prioritizes cached statistics for immediate display and updates the cache when new data is provided. Optionally renders a button to navigate to the customization settings.
 *
 * @param showCustomizeButton - Whether to display the "Customize your experience" button (defaults to true)
 * @param userStats - User statistics to display; if not provided, only cached data is shown
 */
export function UserStatsCard({
  showCustomizeButton = true,
  userStats,
}: UserStatsCardProps) {
  const navigate = useNavigate();

  const STATS_STORAGE_KEY = "t8-chat-user-stats";

  // Get cached data immediately (synchronous)
  const getCachedStats = () => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const [cachedStats, setCachedStats] = useState(() => getCachedStats());

  // Update cache when Convex data arrives
  useEffect(() => {
    if (
      userStats &&
      (!cachedStats ||
        userStats.joinedDate !== cachedStats.joinedDate ||
        userStats.totalThreads !== cachedStats.totalThreads ||
        userStats.lastActivity !== cachedStats.lastActivity ||
        userStats.favoriteModel !== cachedStats.favoriteModel)
    ) {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(userStats));
      setCachedStats(userStats);
    }
  }, [userStats, cachedStats]);

  // Use cached data first, fallback to Convex, then loading state
  const displayStats = cachedStats || userStats;
  const isLoading = !displayStats;

  return (
    <div className="space-y-6 rounded-lg bg-card p-4">
      <div className="space-y-6">
        {/* Member Since */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Member Since</h3>
            <span className="text-sm text-muted-foreground">
              {isLoading ? (
                <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
              ) : displayStats?.joinedDate ? (
                new Date(displayStats.joinedDate).toLocaleDateString()
              ) : (
                "N/A"
              )}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            When you first joined the platform
          </p>
        </div>

        {/* Total Conversations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Total Conversations</h3>
            <span className="text-sm text-muted-foreground">
              {isLoading ? (
                <div className="h-4 w-8 animate-pulse rounded bg-muted"></div>
              ) : (
                (displayStats?.totalThreads ?? 0)
              )}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Chat threads you&apos;ve created
          </p>
        </div>

        {/* Favorite Model - Always render to maintain height */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Favorite Model</h3>
            <span className="text-sm text-muted-foreground">
              {isLoading ? (
                <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
              ) : displayStats?.favoriteModel ? (
                getModelDisplayName(displayStats.favoriteModel)
              ) : (
                "None yet"
              )}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your most frequently used model
          </p>
        </div>

        {/* Last Activity - Always render to maintain height */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Last Activity</h3>
            <span className="text-sm text-muted-foreground">
              {isLoading ? (
                <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
              ) : displayStats?.lastActivity ? (
                new Date(displayStats.lastActivity).toLocaleDateString()
              ) : (
                "No activity"
              )}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your most recent conversation
          </p>
        </div>
      </div>
      {showCustomizeButton && (
        <div className="flex items-center justify-center">
          <Button
            onClick={() => navigate("/settings/customization")}
            className="inline-flex items-center gap-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-reflect button-reflect rounded-lg bg-[rgb(162,59,103)] p-2 font-semibold text-primary-foreground shadow hover:bg-[#d56698] active:bg-[rgb(162,59,103)] disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] dark:bg-primary/20 dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40 disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20 px-4 py-2 h-auto justify-center whitespace-normal text-start"
          >
            Customize your experience
            <ArrowRight className="-mr-1 !size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
