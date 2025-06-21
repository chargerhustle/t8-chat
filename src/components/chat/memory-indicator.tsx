import { LibraryBig, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router";
import { useIsMobile } from "@/hooks/use-mobile";

interface MemoryIndicatorProps {
  memoriesSaved?: Array<{ id: string; content: string }>;
  memoriesUpdated?: Array<{ id: string; content: string }>;
  memoriesDeleted?: Array<{ id: string; content: string }>;
}

export function MemoryIndicator({
  memoriesSaved,
  memoriesUpdated,
  memoriesDeleted,
}: MemoryIndicatorProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Determine which type of memory action occurred
  const hasSaved = memoriesSaved && memoriesSaved.length > 0;
  const hasUpdated = memoriesUpdated && memoriesUpdated.length > 0;
  const hasDeleted = memoriesDeleted && memoriesDeleted.length > 0;

  // If no memory actions, don't show indicator
  if (!hasSaved && !hasUpdated && !hasDeleted) {
    return null;
  }

  // Use LibraryBig icon for all memory operations
  const icon = <LibraryBig className="h-4 w-4" />;
  let message: string;
  let memories: Array<{ id: string; content: string }>;

  if (hasDeleted) {
    const deletedMemories = memoriesDeleted || [];
    message =
      deletedMemories.length === 1
        ? "Memory deleted"
        : `${deletedMemories.length} memories deleted`;
    memories = deletedMemories;
  } else if (hasUpdated) {
    const updatedMemories = memoriesUpdated || [];
    message =
      updatedMemories.length === 1
        ? "Memory updated"
        : `${updatedMemories.length} memories updated`;
    memories = updatedMemories;
  } else {
    const savedMemories = memoriesSaved || [];
    message =
      savedMemories.length === 1
        ? "Memory saved"
        : `${savedMemories.length} memories saved`;
    memories = savedMemories;
  }

  const handleManageClick = () => {
    setOpen(false);
    navigate("/settings/customization");
  };

  // On mobile, just show the indicator without popover
  if (isMobile) {
    return (
      <div className="inline-flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{message}</span>
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
          {icon}
          <span className="text-sm">{message}</span>
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
            {memories.map((memory) => (
              <div
                key={memory.id}
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
