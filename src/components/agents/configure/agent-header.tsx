"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

interface AgentHeaderProps {
  mode: "create" | "edit";
  onSubmit?: () => void;
}

export function AgentHeader({ mode, onSubmit }: AgentHeaderProps) {
  const navigate = useNavigate();
  const isEditing = mode === "edit";
  const buttonText = isEditing ? "Update Agent" : "Create Agent";

  return (
    <header className="flex items-center justify-between pb-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="flex items-center gap-2 hover:bg-muted/40"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Chat
      </Button>

      <Button
        onClick={onSubmit}
        className="inline-flex items-center gap-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-reflect button-reflect rounded-lg bg-[rgb(162,59,103)] p-2 font-semibold text-primary-foreground shadow hover:bg-[#d56698] active:bg-[rgb(162,59,103)] disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] dark:bg-primary/20 dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40 disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20 px-4 py-2 h-auto justify-center whitespace-normal text-start"
      >
        {buttonText}
      </Button>
    </header>
  );
}
