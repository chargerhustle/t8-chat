"use client";

import { ReactNode, createContext, useContext } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SettingsHeader } from "./settings-header";
import { SettingsSidebar } from "./settings-sidebar";
import { SettingsTabs } from "./settings-tabs";
import type { Doc } from "@/convex/_generated/dataModel";
import type { UserCustomization } from "@/types";

interface SettingsLayoutProps {
  children: ReactNode;
  defaultTab?: string;
}

interface SettingsDataContextType {
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
  userCustomization: UserCustomization | null | undefined;
}

const SettingsDataContext = createContext<SettingsDataContextType | undefined>(
  undefined
);

/**
 * Provides access to user-related settings data from the SettingsDataContext.
 *
 * Must be called within a component rendered inside a SettingsLayout. Throws an error if used outside the context provider.
 * @returns The current settings data context, including user information, statistics, and customization.
 */
export function useSettingsData() {
  const context = useContext(SettingsDataContext);
  if (context === undefined) {
    throw new Error("useSettingsData must be used within a SettingsLayout");
  }
  return context;
}

/**
 * Provides a layout for the user settings page, fetching user data and sharing it via context to descendant components.
 *
 * Fetches the current user, user statistics, and customization data, then supplies them through a context provider. Renders the settings header, sidebar, and tabbed content area.
 *
 * @param children - The content to display within the settings tabs
 * @param defaultTab - The tab to display by default, if specified
 */
export function SettingsLayout({ children, defaultTab }: SettingsLayoutProps) {
  // Lift all queries to this level to avoid duplication
  const currentUser = useQuery(api.auth.getCurrentUser);
  const userStats = useQuery(api.messages.getUserStats);
  const userCustomization = useQuery(api.auth.getUserCustomization);

  const contextValue: SettingsDataContextType = {
    currentUser,
    userStats,
    userCustomization,
  };

  return (
    <SettingsDataContext.Provider value={contextValue}>
      <div
        className="max-h-screen w-full overflow-y-auto custom-scrollbar"
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="mx-auto flex max-w-[1200px] flex-col overflow-y-auto px-4 pb-24 pt-6 md:px-6 lg:px-8">
          <SettingsHeader />
          <div className="flex flex-grow flex-col gap-4 md:flex-row">
            <SettingsSidebar currentUser={currentUser} userStats={userStats} />
            <SettingsTabs defaultValue={defaultTab}>{children}</SettingsTabs>
          </div>
        </div>
      </div>
    </SettingsDataContext.Provider>
  );
}
