import React from "react";
import { type LucideIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ToolCallDisplay } from "./tool-call-display";

interface MemoryToolCallProps {
  icon: LucideIcon;
  label: string;
  value: string;
  memories?: string[];
  children?: React.ReactNode;
}

interface MemoryToolResultProps {
  icon: LucideIcon;
  title: string;
  memories: Array<{
    content: string;
    metadata?: React.ReactNode;
  }>;
  emptyMessage?: string;
  error?: {
    message: string;
    details?: string;
  };
  children?: React.ReactNode;
}

export function MemoryToolCall({
  icon,
  label,
  value,
  memories,
  children,
}: MemoryToolCallProps) {
  // If memories array is provided and has items, show accordion
  if (memories && memories.length > 0) {
    return (
      <Accordion type="single" collapsible>
        <AccordionItem value="tool-call">
          <AccordionTrigger className="cursor-pointer p-0 hover:no-underline">
            <h3 className="text-primary flex items-center gap-2 text-sm font-medium">
              {React.createElement(icon, { className: "h-4 w-4" })}
              {label} {memories.length} Memor
              {memories.length === 1 ? "y" : "ies"}
            </h3>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            {memories.map((memory, index) => (
              <div
                className="border-b py-2 last:border-b-0 last:pb-0"
                key={index}
              >
                <p className="text-sm">{memory}</p>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  // If children provided, render them
  if (children) {
    return <>{children}</>;
  }

  // Default simple display
  return <ToolCallDisplay icon={icon} label={label} value={value} />;
}

export function MemoryToolResult({
  icon,
  title,
  memories,
  emptyMessage = "No memories found",
  error,
  children,
}: MemoryToolResultProps) {
  // If error, show error state
  if (error) {
    return (
      <div className="text-destructive flex items-center gap-2">
        {React.createElement(icon, { className: "h-4 w-4" })}
        <div className="flex flex-col items-start gap-0">
          <span className="text-xs font-medium">{error.message}</span>
          {error.details && (
            <span className="text-muted-foreground text-sm">
              {error.details}
            </span>
          )}
        </div>
      </div>
    );
  }

  // If no memories, show empty state
  if (memories.length === 0) {
    return <div className="text-muted-foreground">{emptyMessage}</div>;
  }

  // If children provided, render them
  if (children) {
    return <>{children}</>;
  }

  // Default accordion display
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="memories">
        <AccordionTrigger className="cursor-pointer p-0 hover:no-underline">
          <h3 className="text-primary flex items-center gap-2 text-sm font-medium">
            {React.createElement(icon, { className: "h-4 w-4" })}
            {title} {memories.length} Memor{memories.length === 1 ? "y" : "ies"}
          </h3>
        </AccordionTrigger>
        <AccordionContent className="p-0">
          {memories.map((memory, index) => (
            <div
              className="border-b py-2 last:border-b-0 last:pb-0"
              key={index}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1 text-sm">{memory.content}</p>
                {memory.metadata && (
                  <div className="text-muted-foreground text-xs">
                    {memory.metadata}
                  </div>
                )}
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
