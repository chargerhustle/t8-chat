import { cn } from "@/lib/utils";
import { Paperclip, Globe } from "lucide-react";
import { ModelDropdown } from "./model-dropdown";
import { ReasoningEffortDropdown } from "./reasoning-effort-dropdown";
import type { ModelConfig } from "@/ai/models-config";
import type { EffortLevel } from "@/types";

interface ChatInputToolbarProps {
  // Model selection
  models: ModelConfig[];
  selectedModel: ModelConfig;
  onSelectModel: (model: ModelConfig) => void;

  // Reasoning effort
  modelSupportsReasoning: boolean;
  reasoningEffort: EffortLevel;
  onReasoningEffortChange: (effort: EffortLevel) => void;

  // Search toggle
  modelSupportsSearch: boolean;
  includeSearch: boolean;
  onToggleSearch: () => void;

  // File attachments
  acceptMimes: string;
  onFilesSelected: (files: FileList) => void;
}

export function ChatInputToolbar({
  models,
  selectedModel,
  onSelectModel,
  modelSupportsReasoning,
  reasoningEffort,
  onReasoningEffortChange,
  modelSupportsSearch,
  includeSearch,
  onToggleSearch,
  acceptMimes,
  onFilesSelected,
}: ChatInputToolbarProps) {
  return (
    <div className="flex flex-col gap-2 pr-2 sm:flex-row sm:items-center">
      <div className="ml-[-7px] flex items-center gap-1">
        <ModelDropdown
          models={models}
          selectedModel={selectedModel}
          onSelect={onSelectModel}
        />
        {modelSupportsReasoning && (
          <ReasoningEffortDropdown
            value={reasoningEffort}
            onValueChange={onReasoningEffortChange}
          />
        )}
        {modelSupportsSearch && (
          <button
            type="button"
            onClick={onToggleSearch}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
              "hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50",
              "px-3 text-xs -mb-1.5 h-auto gap-2",
              "rounded-full border border-solid border-secondary-foreground/10",
              "py-1.5 pl-2 pr-2.5 text-muted-foreground max-sm:p-2",
              includeSearch
                ? "bg-pink-500/15 hover:text-foreground"
                : "hover:bg-muted/40"
            )}
            aria-label={includeSearch ? "Disable search" : "Enable search"}
            data-state="closed"
          >
            <Globe className="lucide lucide-globe h-4 w-4 scale-x-[-1]" />
            <span className="max-sm:hidden">Search</span>
          </button>
        )}
        <label
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
            "hover:bg-muted/40 hover:text-foreground",
            "disabled:hover:bg-transparent disabled:hover:text-foreground/50",
            "text-xs cursor-pointer -mb-1.5 h-auto gap-2",
            "rounded-full border border-solid border-secondary-foreground/10",
            "px-2 py-1.5 pr-2.5 text-muted-foreground max-sm:p-2"
          )}
          aria-label="Attach a file"
          data-state="closed"
        >
          <input
            multiple
            className="sr-only"
            type="file"
            accept={acceptMimes}
            onChange={(e) => {
              const files = e.target.files;
              if (files) onFilesSelected(files);
              // reset value so same file can be selected again
              e.currentTarget.value = "";
            }}
          />
          <div className="flex gap-1">
            <Paperclip className="lucide lucide-paperclip size-4" />
            <span className="max-sm:hidden sm:ml-0.5">Attach</span>
          </div>
        </label>
      </div>
    </div>
  );
}
