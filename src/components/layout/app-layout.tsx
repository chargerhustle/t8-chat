"use client"

import { Outlet } from "react-router"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/chat/app-sidebar"

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#212121] h-screen">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
} 