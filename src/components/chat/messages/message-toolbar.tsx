"use client";

import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCcw, SquarePen } from "lucide-react";

interface MessageToolbarProps {
  messageContent: string;
  align?: "left" | "right";
  className?: string;
  isUser?: boolean;
}

export function MessageToolbar({
  messageContent,
  align = "left",
  className,
  isUser = false,
}: MessageToolbarProps) {
  const buttonClasses = cn(
    "h-8 w-8 text-xs rounded-lg p-0",
    "hover:bg-muted/40 hover:text-foreground",
    "disabled:hover:bg-transparent disabled:hover:text-foreground/50"
  );

  if (isUser) {
    // User message toolbar: Copy (other buttons hidden for now)
    return (
      <div className="flex items-center gap-1">
        {/* Hidden for now - uncomment to re-enable
        <Button
          variant="ghost"
          size="sm"
          className={buttonClasses}
          aria-label="Retry message"
        >
          <RefreshCcw className="h-4 w-4" />
          <span className="sr-only">Retry</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={buttonClasses}
          aria-label="Edit message"
        >
          <SquarePen className="h-4 w-4" />
        </Button>
        */}
        <CopyButton
          text={messageContent}
          size="md"
          variant="ghost"
          className={buttonClasses}
          aria-label="Copy message"
        />
      </div>
    );
  } else {
    // Assistant message toolbar: Copy (other buttons hidden for now)
    return (
      <div className="flex items-center gap-1">
        <CopyButton
          text={messageContent}
          size="md"
          variant="ghost"
          className={buttonClasses}
          aria-label="Copy response to clipboard"
        />
        {/* Hidden for now - uncomment to re-enable
        <Button
          variant="ghost"
          size="sm"
          className={buttonClasses}
          aria-label="Branch off message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M6.02,5.78m0,15.31V4.55m0,0v-1.91m0,3.14v-1.23m0,1.23c0,1.61,1.21,3.11,3.2,3.94l4.58,1.92c1.98,.83,3.2,2.32,3.2,3.94v3.84"></path>
            <path d="M20.53,17.59l-3.41,3.66-3.66-3.41"></path>
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={buttonClasses}
          aria-label="Retry message"
        >
          <RefreshCcw className="h-4 w-4" />
          <span className="sr-only">Retry</span>
        </Button>
        */}
      </div>
    );
  }
}
