import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, Sparkles, Gem } from "lucide-react";
import { ModelConfig } from "@/ai/models-config";
import { cn, parseDisplayName } from "@/lib/utils";
import React, { useState } from "react";
import { FeatureIcon, getModelIcon } from "./model-icons";
import { ModelExpandedDropdown } from "./models/model-expanded-dropdown";
import { ModelFilter } from "./model-filter";
import { useUserModels } from "@/hooks/use-user-models";

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
  const [showAll, setShowAll] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const { userModels } = useUserModels();

  const filteredModels = models.filter((model) => {
    // First filter by search query
    const matchesSearch =
      model.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchQuery.toLowerCase());

    // Then filter by selected features
    const matchesFilters =
      selectedFilters.length === 0 ||
      selectedFilters.every((filter) =>
        model.features.includes(filter as ModelConfig["features"][number])
      );

    return matchesSearch && matchesFilters;
  });

  // For row-based view (showAll = false), only show pinned/favorite models
  // For grid view (showAll = true), show all filtered models
  const displayedModels = showAll
    ? filteredModels
    : filteredModels.filter((model) =>
        userModels.favouriteModels.includes(model.id)
      );

  // Check if there are any new models in the filtered list
  const hasNewModels = filteredModels.some((model) => model.new);

  const handleShowAllToggle = () => {
    setShowAll(!showAll);
  };

  const { mainText, parenText } = parseDisplayName(selectedModel.displayName);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 text-xs gap-2 px-2 py-1.5 -mb-2 text-muted-foreground",
            "hover:bg-muted/40 hover:text-foreground",
            "!focus-visible:outline-none !focus-visible:ring-0 !focus-visible:ring-offset-0 !focus:outline-none !focus:ring-0"
          )}
          id="radix-model-dropdown"
        >
          {/* Show premium gem icon only */}
          {selectedModel.premium && (
            <Gem className="!size-3.5 text-model-muted" />
          )}

          <div className="text-left text-sm font-medium">
            {mainText}
            {parenText && (
              <span className="text-xs font-medium text-muted-foreground/80 max-xs:block xs:pl-1.5 pl-1">
                {parenText}
              </span>
            )}
          </div>
          <ChevronDown className="lucide lucide-chevron-down right-0 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(
          "z-50 min-w-[8rem] bg-popover text-popover-foreground shadow-md",
          "!outline-1 !outline-chat-border/20 dark:!outline-white/5",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "transform-origin relative overflow-hidden rounded-lg !border-none",
          "p-0 pb-11 pt-10 max-w-[calc(100vw-2rem)] transition-[height,width]",
          "ease-snappy max-sm:mx-4 sm:rounded-lg max-h-[calc(100vh-80px)]",
          // Adjust width when showing grid
          showAll ? "sm:w-[640px]" : "sm:w-[420px]"
        )}
        style={
          { outline: "none", "--shadow-height": "10px" } as React.CSSProperties
        }
      >
        {/* Search Header */}
        <div className="fixed inset-x-4 top-0 rounded-t-lg bg-popover px-3.5 pt-0.5 sm:inset-x-0">
          <div className="flex items-center">
            <Search className="ml-px mr-3 !size-4 text-muted-foreground/75" />
            <input
              id="model-search-input"
              name="modelSearch"
              role="searchbox"
              aria-label="Search models"
              placeholder="Search models..."
              className="w-full bg-transparent py-2 text-sm text-foreground placeholder-muted-foreground/50 placeholder:select-none focus:outline-none"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // Auto-switch to expanded view when user starts typing
                if (e.target.value.trim() && !showAll) {
                  setShowAll(true);
                }
              }}
            />
          </div>
          <div className="border-b border-chat-border px-3"></div>
        </div>

        {/* Conditional Content */}
        {showAll ? (
          /* Grid Layout */
          <ModelExpandedDropdown
            selectedModel={selectedModel.id}
            onModelSelect={(modelId: string) => {
              const model = models.find((m) => m.id === modelId);
              if (model) {
                onSelect(model);
                setIsOpen(false); // Close the entire dropdown
              }
            }}
            onClose={() => setShowAll(false)}
            filteredModels={filteredModels}
          />
        ) : (
          /* Row-based List */
          <div
            className="max-h-full overflow-y-scroll px-1.5 pb-3 scrollbar-hide"
            data-shadow="false"
          >
            {displayedModels.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onSelect={() => onSelect(model)}
                className={cn(
                  "relative cursor-default select-none rounded-sm text-sm outline-none",
                  "transition-colors focus:bg-accent/30 focus:text-accent-foreground",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  "[&>svg]:size-4 [&>svg]:shrink-0 group flex flex-col items-start gap-1 p-3"
                )}
                tabIndex={-1}
                data-orientation="vertical"
              >
                <div
                  className="flex w-full items-center justify-between"
                  data-state="closed"
                >
                  <div className="flex items-center gap-2 pr-2 font-medium text-muted-foreground transition-colors">
                    {getModelIcon(model.icon)}
                    <span className="w-fit">{model.displayName}</span>
                    {/* Add premium badges if needed */}
                    {model.premium && (
                      <Gem
                        className="lucide lucide-gem size-3 text-blue-400 dark:text-blue-500"
                        data-state="closed"
                      />
                    )}
                    {/* Add sparkles for new models */}
                    {model.new && (
                      <Sparkles
                        className="lucide lucide-sparkles h-3.5 w-3.5 text-[#ffb525f7] drop-shadow-[0px_3px_8px_#ffae1082] dark:text-amber-200/80 dark:drop-shadow-[0px_3px_8px_rgba(186,130,21,0.62)]"
                        data-state="closed"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {model.features
                      .filter((feature) =>
                        ["vision", "documents", "reasoning"].includes(feature)
                      )
                      .map((feature) => (
                        <FeatureIcon key={feature} feature={feature} />
                      ))}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="fixed inset-x-4 bottom-0 flex items-center justify-between rounded-b-lg bg-popover pb-1 pl-1 pr-2.5 pt-1.5 sm:inset-x-0">
          <div className="absolute inset-x-3 top-0 border-b border-chat-border"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowAllToggle}
            className={cn(
              "h-9 px-4 py-2 gap-2 pl-2 text-sm text-muted-foreground",
              "hover:bg-muted/40 hover:text-foreground",
              // Add chevron rotation animation
              showAll && "[&_.chevron]:rotate-90"
            )}
          >
            <ChevronDown
              className={cn(
                "chevron h-4 w-4 rotate-180 transition-transform duration-200"
              )}
            />
            <span>{showAll ? "Show less" : " Show all"}</span>
            {hasNewModels && (
              <div
                className="h-2 w-2 rounded-full bg-pink-500"
                data-state="closed"
              ></div>
            )}
          </Button>
          <ModelFilter
            selectedFilters={selectedFilters}
            onFiltersChange={setSelectedFilters}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
