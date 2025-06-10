"use client";

import { ReactNode } from "react";
import { SettingsHeader } from "./settings-header";
import { SettingsSidebar } from "./settings-sidebar";
import { SettingsTabs } from "./settings-tabs";

interface SettingsLayoutProps {
  children: ReactNode;
  defaultTab?: string;
}

export function SettingsLayout({ children, defaultTab }: SettingsLayoutProps) {
  return (
    <div
      className="max-h-screen w-full overflow-y-auto custom-scrollbar"
      style={{ scrollbarGutter: "stable" }}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col overflow-y-auto px-4 pb-24 pt-6 md:px-6 lg:px-8">
        <SettingsHeader />
        <div className="flex flex-grow flex-col gap-4 md:flex-row">
          <SettingsSidebar />
          <SettingsTabs defaultValue={defaultTab}>{children}</SettingsTabs>
        </div>
      </div>
    </div>
  );
}
