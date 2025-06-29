import React from "react";
import { HStack, VStack } from "@/components/ui/stack";

interface ToolCallDisplayProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

export const ToolCallDisplay: React.FC<ToolCallDisplayProps> = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <HStack className="gap-2">
      <Icon className="text-muted-foreground size-4" />
      <VStack className="items-start gap-0">
        <span className="text-muted-foreground/80 text-xs font-medium">
          {label}
        </span>
        <span className="text-sm">&quot;{value}&quot;</span>
      </VStack>
    </HStack>
  );
};
