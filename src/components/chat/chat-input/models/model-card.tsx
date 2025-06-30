import React from "react";
import { ModelConfig } from "@/ai/models-config";
import { cn, parseDisplayName } from "@/lib/utils";
import { getModelIcon, FeatureIcon } from "../model-icons";
import { Gem, Pin, PinOff, FlaskConical } from "lucide-react";

interface ModelCardProps {
  model: ModelConfig;
  isSelected?: boolean;
  isPinned?: boolean;
  canUnpin?: boolean;
  onSelect: (model: ModelConfig) => void;
  onPin?: (model: ModelConfig) => void;
}

export function ModelCard({
  model,
  isPinned = false,
  canUnpin = true,
  onSelect,
  onPin,
}: ModelCardProps) {
  const { firstPart, secondPart, parenText } = parseDisplayName(
    model.displayName
  );

  return (
    <div className="group relative" data-state="closed">
      {/* Pin indicator dot */}
      {isPinned && (
        <div className="absolute -left-1.5 -top-1.5 z-10 rounded-full bg-popover p-0.5"></div>
      )}

      {/* Main card button */}
      <button
        onClick={() => onSelect(model)}
        className={cn(
          "group relative flex h-[9.25rem] w-[6.75rem] cursor-pointer flex-col items-start gap-0.5 overflow-hidden rounded-xl border bg-sidebar/20 px-1 py-3 text-color-heading",
          "[--model-muted:hsl(var(--muted-foreground)/0.9)] [--model-primary:hsl(var(--color-heading))]",
          "hover:bg-accent/30 hover:text-color-heading",
          "dark:bg-[hsl(320,20%,2.9%)] dark:[--model-muted:hsl(var(--color-heading))] dark:[--model-primary:hsl(var(--muted-foreground)/0.9)] dark:hover:bg-accent/30",
          // New model glow effect
          model.new && [
            "border-[#ffb525f7] shadow-[0px_3px_8px_#ffae1082,inset_0px_-4px_20px_#ffb52575]",
            "dark:border-amber-200/80 dark:shadow-[0px_3px_8px_rgba(186,130,21,0.32),inset_0px_-4px_20px_rgba(186,130,21,0.43)]",
          ]
        )}
      >
        {/* Main content */}
        <div className="flex w-full flex-col items-center justify-center gap-1 font-medium transition-colors">
          {/* Model icon */}
          <div className="size-7 text-model-primary">
            {getModelIcon(model.icon, "grid")}
          </div>

          {/* Model name */}
          <div className="w-full text-center text-model-primary">
            <div className="text-base font-semibold">{firstPart}</div>
            {secondPart && (
              <div className="-mt-0.5 text-sm font-semibold">{secondPart}</div>
            )}
            {parenText && (
              <div className="-mt-1 text-[11px] text-model-muted">
                {parenText}
              </div>
            )}
          </div>

          {/* NEW badge */}
          {model.new && (
            <div className="absolute right-[7px] top-1 text-[11px] text-model-muted">
              NEW
            </div>
          )}

          {/* Premium badge - takes priority over experimental */}
          {model.premium && (
            <div
              className={cn(
                "absolute right-1.5 text-model-muted opacity-80",
                model.new ? "top-6" : "top-1"
              )}
            >
              <Gem className="size-4 text-blue-400 dark:text-blue-500" />
            </div>
          )}

          {/* Experimental badge - only show if not premium */}
          {model.experimental && !model.premium && (
            <div
              className={cn(
                "absolute right-1.5 text-model-muted opacity-80",
                model.new ? "top-6" : "top-1"
              )}
            >
              <FlaskConical className="size-4" />
            </div>
          )}
        </div>

        {/* Feature icons at bottom */}
        <div className="absolute inset-x-0 bottom-3 flex w-full items-center justify-center gap-2">
          {model.features
            .filter((feature) =>
              ["vision", "documents", "reasoning"].includes(feature)
            )
            .map((feature) => (
              <FeatureIcon key={feature} feature={feature} />
            ))}
        </div>
      </button>

      {/* Hover pin/unpin button */}
      {onPin && (
        <div className="absolute -right-1.5 -top-1.5 left-auto z-50 flex w-auto translate-y-2 scale-95 items-center rounded-[10px] border border-chat-border/40 bg-card p-1 text-xs text-muted-foreground opacity-0 transition-all group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin(model);
            }}
            disabled={isPinned && !canUnpin}
            className="cursor-pointer rounded-md bg-accent/30 p-1.5 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
            tabIndex={-1}
            aria-label={isPinned ? "Unpin model" : "Pin model"}
          >
            {isPinned ? (
              <PinOff className="size-4" />
            ) : (
              <Pin className="size-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
