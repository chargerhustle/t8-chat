"use client";

import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarFloatingToolbar } from "@/components/sidebar/sidebar-floating-toolbar";
import { SearchDialog } from "@/components/sidebar/search-dialog";
import { useGlobalShortcuts } from "@/hooks/use-global-shortcuts";
import { SettingsToolbar } from "@/components/layout/settings-toolbar";

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keyboard shortcuts using custom hook
  useGlobalShortcuts([
    {
      key: "k",
      ctrlOrCmd: true,
      allowInInputs: true, // Allow closing search dialog even when textarea is focused
      callback: () => setIsSearchOpen((prev) => !prev),
    },
    {
      key: "o",
      ctrlOrCmd: true,
      shift: true,
      callback: () => navigate("/"),
    },
    {
      key: "j",
      ctrlOrCmd: true,
      shift: true,
      callback: () => {
        // Toggle between temporary mode and home
        if (location.pathname.startsWith("/temporary")) {
          navigate("/");
        } else {
          navigate("/temporary");
        }
      },
    },
  ]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarFloatingToolbar onSearchOpen={() => setIsSearchOpen(true)} />
      <SidebarInset className="bg-[#212121] h-screen">
        <Outlet />
      </SidebarInset>

      {/* Global Search Dialog */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Settings Toolbar */}
      <SettingsToolbar />
    </SidebarProvider>
  );
}
