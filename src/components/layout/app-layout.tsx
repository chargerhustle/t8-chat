"use client";

import { Outlet } from "react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarFloatingToolbar } from "@/components/sidebar/sidebar-floating-toolbar";

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarFloatingToolbar />
      <SidebarInset className="bg-[#212121] h-screen">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
