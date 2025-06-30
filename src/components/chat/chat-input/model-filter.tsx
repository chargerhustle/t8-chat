"use client";

import React, { useState } from "react";
import { Filter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ModelFeature } from "@/ai/models-config";
import { FEATURE_CONFIG } from "./models";

// Filter options using shared configuration (excluding 'search' which is not shown in filter)
const filterOptions = (
  [
    "fast",
    "vision",
    "documents",
    "reasoning",
    "effort",
    "tools",
    "image",
  ] as ModelFeature[]
).map((featureId) => ({
  id: featureId,
  label: FEATURE_CONFIG[featureId].label,
  icon: FEATURE_CONFIG[featureId].icon,
  colors: FEATURE_CONFIG[featureId].colors,
}));

interface ModelFilterProps {
  selectedFilters: string[];
  onFiltersChange: (filters: string[]) => void;
}

export function ModelFilter({
  selectedFilters,
  onFiltersChange,
}: ModelFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFilter = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter((id) => id !== filterId)
      : [...selectedFilters, filterId];
    onFiltersChange(newFilters);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 text-muted-foreground",
            "hover:bg-muted/40 hover:text-foreground"
          )}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "z-50 min-w-[8rem] bg-popover p-1 text-popover-foreground shadow-md",
          "!outline-1 !outline-chat-border/20 dark:!outline-white/5",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "w-48 rounded-lg"
        )}
        align="end"
        side="right"
        sideOffset={4}
      >
        {filterOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedFilters.includes(option.id);

          return (
            <div
              key={option.id}
              role="menuitemcheckbox"
              aria-checked={isSelected}
              className={cn(
                "relative cursor-default select-none rounded-sm px-2 py-1.5 text-sm outline-none",
                "transition-colors focus:bg-accent/30 focus:text-accent-foreground",
                "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                "flex items-center justify-between hover:bg-accent/30"
              )}
              onClick={() => toggleFilter(option.id)}
            >
              <div className="-ml-0.5 flex items-center gap-2">
                <div
                  className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-md"
                  style={
                    {
                      color: option.colors.dark,
                    } as React.CSSProperties
                  }
                >
                  <div
                    className="absolute inset-0 opacity-20 dark:opacity-15"
                    style={
                      {
                        backgroundColor: option.colors.dark,
                      } as React.CSSProperties
                    }
                  ></div>
                  <IconComponent
                    className="h-4 w-4 relative z-10"
                    style={
                      {
                        color: option.colors.dark,
                        stroke: option.colors.dark,
                      } as React.CSSProperties
                    }
                  />
                </div>
                <span>{option.label}</span>
              </div>
              <span className="flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </span>
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
