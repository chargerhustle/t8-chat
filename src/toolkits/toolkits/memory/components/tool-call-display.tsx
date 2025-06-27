import React from "react";
import { type LucideIcon } from "lucide-react";
import { HStack } from "@/components/ui/stack";

interface ToolCallDisplayProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function ToolCallDisplay({
  icon: Icon,
  label,
  value,
}: ToolCallDisplayProps) {
  return (
    <HStack className="text-muted-foreground flex items-center">
      <Icon className="size-4 shrink-0" />
      <span className="text-sm">
        <strong>{label}:</strong> {value}
      </span>
    </HStack>
  );
}
