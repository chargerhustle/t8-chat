"use client"

import { CopyButton } from "@/components/copy-button"
import { cn } from "@/lib/utils"

interface MessageToolbarProps {
  messageContent: string
  align?: "left" | "right"
  className?: string
}

export function MessageToolbar({ 
  messageContent, 
  align = "left", 
  className 
}: MessageToolbarProps) {
  return (
    <div className={cn(
      "flex items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
      align === "right" ? "justify-end" : "justify-start",
      className
    )}>
      <CopyButton 
        text={messageContent}
        size="md"
        variant="ghost"
        className="h-8 w-8 text-[color:var(--tw-prose-body)]"
      />
      {/* Future buttons can be added here */}
    </div>
  )
} 