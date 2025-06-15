import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface ScrollToBottomButtonProps {
  showScrollToBottom?: boolean;
  onScrollToBottom?: () => void;
}

export function ScrollToBottomButton({
  showScrollToBottom,
  onScrollToBottom,
}: ScrollToBottomButtonProps) {
  if (!showScrollToBottom) {
    return null;
  }

  return (
    <div className="flex justify-center pb-4">
      <button
        onClick={onScrollToBottom}
        className={cn(
          "justify-center whitespace-nowrap font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          "disabled:hover:bg-secondary/50 h-8 px-3 text-xs pointer-events-auto",
          "flex items-center gap-2 rounded-full border border-secondary/40",
          "bg-chat-overlay text-secondary-foreground/70 backdrop-blur-xl hover:bg-secondary"
        )}
      >
        <span className="pb-0.5">Scroll to bottom</span>
        <ChevronDown className="-mr-1 h-4 w-4" />
      </button>
    </div>
  );
}
