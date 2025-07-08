"use client";

import { ReactNode } from "react";
import { AgentChatPreview } from "./configure/agent-chat-preview";
import { AgentHeader } from "./configure/agent-header";
import { Agent } from "./types";

interface AgentStudioLayoutProps {
  mode: "create" | "edit";
  agentId?: string;
  agent?: Agent | null;
  children: ReactNode;
}

export function AgentStudioLayout({
  mode,
  agentId,
  agent,
  children,
}: AgentStudioLayoutProps) {
  const handleSubmit = () => {
    console.log(`${mode === "edit" ? "Updating" : "Creating"} agent`, agentId);
    // TODO: Implement actual submit logic
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Side - 40% - Configuration */}
      <div
        className="w-[40%] overflow-y-auto custom-scrollbar"
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="mx-auto flex max-w-full flex-col overflow-y-auto px-4 pb-24 pt-6 md:px-6 lg:px-8">
          <AgentHeader mode={mode} onSubmit={handleSubmit} />
          {children}
        </div>
      </div>

      {/* Right Side - 60% - Preview */}
      <div className="w-[60%] h-screen bg-[#212121]">
        <AgentChatPreview />
      </div>
    </div>
  );
}
