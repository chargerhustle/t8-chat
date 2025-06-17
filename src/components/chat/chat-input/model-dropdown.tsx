import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search } from "lucide-react";
import { ModelConfig } from "@/ai/models-config";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { FeatureIcon, getModelIcon, InfoIcon } from "./model-icons";

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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = models.filter(
    (model) =>
      model.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        className={cn(
          "z-50 min-w-[8rem] bg-popover text-popover-foreground shadow-md",
          "!outline !outline-1 !outline-chat-border/20 dark:!outline-white/5",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "transform-origin relative overflow-hidden rounded-lg !border-none",
          "p-0 pb-11 pt-10 max-w-[calc(100vw-2rem)] transition-[height,width]",
          "ease-snappy max-sm:mx-4 sm:w-[420px] sm:rounded-lg max-h-[calc(100vh-80px)]"
        )}
        style={{ outline: "none" }}
      >
        {/* Search Header */}
        <div className="fixed inset-x-4 top-0 rounded-t-lg bg-popover px-3.5 pt-0.5 sm:inset-x-0">
          <div className="flex items-center">
            <Search className="ml-px mr-3 !size-4 text-muted-foreground/75" />
            <input
              role="searchbox"
              aria-label="Search models"
              placeholder="Search models..."
              className="w-full bg-transparent py-2 text-sm text-foreground placeholder-muted-foreground/50 placeholder:select-none focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="border-b border-chat-border px-3"></div>
        </div>

        {/* Models List */}
        <div
          className="max-h-full overflow-y-scroll px-1.5 scroll-shadow custom-scrollbar"
          data-shadow="false"
        >
          {filteredModels.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onSelect={() => onSelect(model)}
              className={cn(
                "relative cursor-default select-none rounded-sm text-sm outline-none",
                "transition-colors focus:bg-accent/30 focus:text-accent-foreground",
                "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                "[&>svg]:size-4 [&>svg]:shrink-0 group flex flex-col items-start gap-1 p-3",
                "hover:bg-accent/30 cursor-pointer"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 pr-2 font-medium text-muted-foreground transition-colors">
                  {getModelIcon(model.provider, model.id)}
                  <span className="w-fit">{model.displayName}</span>
                  <button
                    className="p-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <InfoIcon />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {model.features.map((feature) => (
                    <FeatureIcon key={feature} feature={feature} />
                  ))}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
