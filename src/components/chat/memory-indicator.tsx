import { BookCheck, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router";
import { useIsMobile } from "@/hooks/use-mobile";

interface MemoryIndicatorProps {
  memoriesSaved: Array<{ id: string; content: string; createdAt: number }>;
}

export function MemoryIndicator({ memoriesSaved }: MemoryIndicatorProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!memoriesSaved || memoriesSaved.length === 0) {
    return null;
  }

  const handleManageClick = () => {
    setOpen(false);
    navigate("/settings/customization");
  };

  // On mobile, just show the indicator without popover
  if (isMobile) {
    return (
      <div className="inline-flex items-center gap-2 text-muted-foreground">
        <BookCheck className="h-4 w-4" />
        <span className="text-sm">
          {memoriesSaved.length === 1
            ? "Memory saved"
            : `${memoriesSaved.length} memories saved`}
        </span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="inline-flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors py-1 pr-2"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <BookCheck className="h-4 w-4" />
          <span className="text-sm">
            {memoriesSaved.length === 1
              ? "Memory saved"
              : `${memoriesSaved.length} memories saved`}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-2 border border-secondary/50 bg-popover"
        align="start"
        side="bottom"
        sideOffset={0}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="space-y-2">
          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {memoriesSaved.map((memory, index) => (
              <div
                key={index}
                className="text-sm text-foreground bg-transparent p-2 rounded-md"
              >
                {memory.content.length > 200
                  ? `${memory.content.slice(0, 200)}...`
                  : memory.content}
              </div>
            ))}
          </div>
          <div className="pt-1 border-t border-border/50">
            <div
              className="w-full flex items-center justify-between text-muted-foreground hover:text-foreground cursor-pointer h-8 px-2 rounded-md hover:bg-secondary/50 transition-colors"
              onClick={handleManageClick}
            >
              <span className="text-sm">Manage</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
