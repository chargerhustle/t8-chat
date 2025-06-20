"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Eye, EyeOff, Pencil, Check, X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ClearMemoriesDialog } from "./clear-memories-dialog";

interface Memory {
  content: string;
  createdAt: number;
}

export function MemoryManagement() {
  const [memoriesEnabled, setMemoriesEnabled] = useState(true);
  const [showMemories, setShowMemories] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Get data from Convex
  const convexCustomization = useQuery(api.auth.getUserCustomization);

  // Load memories from localStorage first, then fallback to Convex
  useEffect(() => {
    // First, try to load from localStorage
    const savedMemories = localStorage.getItem("user-memories");
    let loadedFromLocalStorage = false;

    if (savedMemories) {
      try {
        const parsedMemories: Memory[] = JSON.parse(savedMemories);
        setMemories(parsedMemories);
        loadedFromLocalStorage = true;
      } catch (error) {
        console.error(
          "Failed to parse saved memories from localStorage:",
          error
        );
      }
    }

    // Only use Convex data as fallback if localStorage didn't provide valid data
    if (!loadedFromLocalStorage && convexCustomization?.memories) {
      setMemories(convexCustomization.memories);
    }
  }, [convexCustomization]);

  const handleDeleteMemory = (index: number) => {
    const updatedMemories = memories.filter((_, i) => i !== index);
    setMemories(updatedMemories);

    // Update localStorage
    localStorage.setItem("user-memories", JSON.stringify(updatedMemories));

    toast.success("Memory deleted");
  };

  const handleEditMemory = (index: number) => {
    setEditingIndex(index);
    setEditingContent(memories[index].content);
  };

  const handleSaveEdit = (index: number) => {
    if (editingContent.trim() === "") {
      toast.error("Memory content cannot be empty");
      return;
    }

    const updatedMemories = memories.map((memory, i) =>
      i === index ? { ...memory, content: editingContent.trim() } : memory
    );

    setMemories(updatedMemories);
    localStorage.setItem("user-memories", JSON.stringify(updatedMemories));

    setEditingIndex(null);
    setEditingContent("");
    toast.success("Memory updated");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingContent("");
  };

  const handleClearAll = () => {
    if (memories.length === 0) return;
    setShowClearDialog(true);
  };

  const handleConfirmClear = () => {
    setMemories([]);
    localStorage.setItem("user-memories", JSON.stringify([]));
    setShowClearDialog(false);
    toast.success("All memories cleared");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Saved Memories</h2>
      <div className="space-y-6 py-2">
        {/* Header with toggle */}
        <div className="flex items-center justify-between gap-x-1">
          <div className="space-y-0.5">
            <Label className="font-medium text-base">
              Enable Memory Saving
            </Label>
            <p className="text-sm text-muted-foreground">
              T8 Chat can save important information from conversations to
              provide more personalized responses in future chats.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={memoriesEnabled}
            data-state={memoriesEnabled ? "checked" : "unchecked"}
            className="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary"
            onClick={() => setMemoriesEnabled(!memoriesEnabled)}
          >
            <span
              data-state={memoriesEnabled ? "checked" : "unchecked"}
              className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
            />
          </button>
        </div>

        {/* Controls - only show if memories are enabled */}
        {memoriesEnabled && (
          <div className="flex items-center gap-3">
            {memories.length > 0 ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMemories(!showMemories)}
                  className="flex items-center gap-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  {showMemories ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Hide Memories
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Show Memories ({memories.length})
                    </>
                  )}
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearAll}
                  className="flex gap-2 border border-red-800/20 bg-red-800/80 hover:bg-red-600 dark:bg-red-800/20 hover:dark:bg-red-800 text-sm font-medium"
                >
                  Clear All
                </Button>
              </>
            ) : (
              <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-4 w-full">
                <p className="text-sm text-muted-foreground">
                  No memories saved yet. T8 Chat will automatically save
                  important information from your conversations.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Memories list - only show if enabled and showMemories is true */}
        {memoriesEnabled && showMemories && (
          <div className="rounded-lg border border-secondary/50 bg-secondary/20 p-4">
            {memories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No memories saved yet. T8 Chat will automatically save important
                information from your conversations.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {memories.map((memory, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-3 p-3 rounded-md bg-background/50 border border-secondary/30"
                  >
                    <div className="flex-1 min-w-0">
                      {editingIndex === index ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="min-h-[60px] custom-scrollbar focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
                            placeholder="Edit memory content..."
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(index)}
                              className="h-7 px-2 text-xs w-20"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="h-7 px-2 text-xs w-20"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-foreground break-words">
                            {memory.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Saved {formatDate(memory.createdAt)}
                          </p>
                        </>
                      )}
                    </div>

                    {editingIndex !== index && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMemory(index)}
                          className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMemory(index)}
                          className="flex-shrink-0 h-8 w-8 p-0 border border-red-800/20 bg-red-800/80 hover:bg-red-600 dark:bg-red-800/20 hover:dark:bg-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Disabled state message */}
        {!memoriesEnabled && (
          <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-4">
            <p className="text-sm text-muted-foreground">
              Memory saving is disabled. T8 Chat will not save information from
              conversations.
            </p>
          </div>
        )}
      </div>

      {/* Clear All Dialog */}
      <ClearMemoriesDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirmClear={handleConfirmClear}
        memoryCount={memories.length}
      />
    </div>
  );
}
