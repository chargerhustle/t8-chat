import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ModelConfig } from "@/ai/models-config";
import { cn } from "@/lib/utils";
import React from "react";

interface ModelDropdownProps {
  models: ModelConfig[];
  selectedModel: ModelConfig;
  onSelect: (model: ModelConfig) => void;
}

export function ModelDropdown({
  models,
  selectedModel,
  onSelect,
}: ModelDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
            "hover:bg-muted/40 hover:text-foreground",
            "disabled:hover:bg-transparent disabled:hover:text-foreground/50",
            "h-8 rounded-md text-xs relative gap-2 px-2 py-1.5 -mb-2 text-muted-foreground"
          )}
          id="radix-model-dropdown"
          aria-haspopup="menu"
          aria-expanded="false"
          data-state="closed"
        >
          <div className="text-left text-sm font-medium">
            {selectedModel.displayName}
          </div>
          <ChevronDown className="lucide lucide-chevron-down right-0 size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-[#0D0D0D] border-neutral-700"
      >
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onSelect={() => onSelect(model)}
            className="text-white hover:bg-neutral-800 focus:bg-neutral-800 cursor-pointer"
          >
            {model.displayName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
