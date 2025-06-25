"use client";

import { cn } from "@/lib/utils";
import { ArrowUpIcon } from "lucide-react";
import { ChatInputToolbar } from "./chat-input-toolbar";
import { ModelConfig } from "@/ai/models-config";
import { EffortLevel } from "@/types";
import { memo } from "react";

interface SendButtonProps {
  canSend: boolean;
}

const SendButton = memo(function SendButton({ canSend }: SendButtonProps) {
  return (
    <button
      type="submit"
      disabled={!canSend}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        "border-reflect",
        "bg-[rgb(162,59,103)] font-semibold shadow hover:bg-[#d56698] active:bg-[rgb(162,59,103)]",
        "disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)]",
        "dark:bg-primary/20 dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40",
        "disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20",
        "h-9 w-9 relative rounded-lg p-2 text-pink-50"
      )}
      aria-label={canSend ? "Send message" : "Message requires text"}
      data-state="closed"
    >
      <ArrowUpIcon className="lucide lucide-arrow-up !size-5" />
    </button>
  );
});

interface ToolbarProps {
  models: ModelConfig[];
  selectedModel: ModelConfig;
  onSelectModel: (model: ModelConfig) => void;
  modelSupportsReasoning: boolean;
  reasoningEffort: EffortLevel;
  onReasoningEffortChange: (effort: EffortLevel) => void;
  modelSupportsSearch: boolean;
  includeSearch: boolean;
  onToggleSearch: () => void;
  acceptMimes: string;
  onFilesSelected: (files: FileList) => void;
}

const MemoizedToolbar = memo(function MemoizedToolbar({
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
}: ToolbarProps) {
  return (
    <ChatInputToolbar
      models={models}
      selectedModel={selectedModel}
      onSelectModel={onSelectModel}
      modelSupportsReasoning={modelSupportsReasoning}
      reasoningEffort={reasoningEffort}
      onReasoningEffortChange={onReasoningEffortChange}
      modelSupportsSearch={modelSupportsSearch}
      includeSearch={includeSearch}
      onToggleSearch={onToggleSearch}
      acceptMimes={acceptMimes}
      onFilesSelected={onFilesSelected}
    />
  );
});

interface ChatInputActionsProps {
  canSend: boolean;
  models: ModelConfig[];
  selectedModel: ModelConfig;
  onSelectModel: (model: ModelConfig) => void;
  modelSupportsReasoning: boolean;
  reasoningEffort: EffortLevel;
  onReasoningEffortChange: (effort: EffortLevel) => void;
  modelSupportsSearch: boolean;
  includeSearch: boolean;
  onToggleSearch: () => void;
  acceptMimes: string;
  onFilesSelected: (files: FileList) => void;
}

function ChatInputActionsComponent({
  canSend,
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
}: ChatInputActionsProps) {
  return (
    <div className="-mb-px mt-2 flex w-full flex-row-reverse justify-between">
      <div
        className="-mr-0.5 -mt-0.5 flex items-center justify-center gap-2"
        aria-label="Message actions"
      >
        <SendButton canSend={canSend} />
      </div>
      <MemoizedToolbar
        models={models}
        selectedModel={selectedModel}
        onSelectModel={onSelectModel}
        modelSupportsReasoning={modelSupportsReasoning}
        reasoningEffort={reasoningEffort}
        onReasoningEffortChange={onReasoningEffortChange}
        modelSupportsSearch={modelSupportsSearch}
        includeSearch={includeSearch}
        onToggleSearch={onToggleSearch}
        acceptMimes={acceptMimes}
        onFilesSelected={onFilesSelected}
      />
    </div>
  );
}

export const ChatInputActions = memo(ChatInputActionsComponent);
