import React from "react";
import { type LucideIcon, ChevronDown } from "lucide-react";

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
          <AccordionTrigger className="py-0 hover:no-underline justify-start [&>svg:last-child]:hidden [&[data-state=open]_.chevron]:rotate-180">
            <div className="flex items-center gap-2">
              {React.createElement(icon, { className: "h-4 w-4" })}
              <span className="text-sm text-muted-foreground">
                <strong>{label}:</strong> {memories.length} memor
                {memories.length === 1 ? "y" : "ies"}
              </span>
              <ChevronDown className="chevron text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200" />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col pl-6">
              {memories.map((memory, index) => (
                <div
                  className="border-b py-2 last:border-b-0 last:pb-0"
                  key={index}
                >
                  <p className="text-sm text-muted-foreground">{memory}</p>
                </div>
              ))}
            </div>
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
        <AccordionTrigger className="py-0 hover:no-underline justify-start [&>svg:last-child]:hidden [&[data-state=open]_.chevron]:rotate-180">
          <div className="flex items-center gap-2">
            {React.createElement(icon, { className: "h-4 w-4" })}
            <span className="text-sm font-medium">
              <strong>{title}:</strong> {memories.length} memor
              {memories.length === 1 ? "y" : "ies"}
            </span>
            <ChevronDown className="chevron text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200" />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col pl-6">
            {memories.map((memory, index) => (
              <div
                className="border-b py-2 last:border-b-0 last:pb-0"
                key={index}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 text-sm text-muted-foreground">
                    {memory.content}
                  </p>
                  {memory.metadata && (
                    <div className="text-muted-foreground text-xs">
                      {memory.metadata}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
