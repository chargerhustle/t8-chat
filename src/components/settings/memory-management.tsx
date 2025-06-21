"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Eye, EyeOff, Pencil, Check, X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ClearMemoriesDialog } from "./clear-memories-dialog";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { CopyButton } from "@/components/copy-button";
import type { UserCustomization, Memory } from "@/types";

const STORAGE_KEY = "t8-chat-memories";

interface MemoryManagementProps {
  customization?: UserCustomization | null;
}

export function MemoryManagement({
  customization: convexCustomization,
}: MemoryManagementProps) {
  const [showMemories, setShowMemories] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Get preferences from context
  const { preferences, updatePreference } = useUserPreferences();
  const memoriesEnabled = preferences.memoriesEnabled;

  // Mutations
  const updateMemoryMutation = useMutation(api.memories.updateMemory);
  const deleteMemoryMutation = useMutation(api.memories.deleteMemory);
  const clearAllMemoriesMutation = useMutation(api.memories.clearAllMemories);

  // Load memories from localStorage first, then sync with Convex
  useEffect(() => {
    // First, try to load from localStorage for immediate UI update
    const savedMemories = localStorage.getItem(STORAGE_KEY);

    if (savedMemories) {
      try {
        const parsedMemories: Memory[] = JSON.parse(savedMemories);
        setMemories(parsedMemories);
      } catch (error) {
        console.error(
          "Failed to parse saved memories from localStorage:",
          error
        );
      }
    }

    // When Convex data is available, use it as the authoritative source
    if (convexCustomization !== undefined) {
      if (convexCustomization?.memories) {
        const convexMemories: Memory[] = convexCustomization.memories;

        // Update state with Convex data
        setMemories(convexMemories);

        // Update localStorage with authoritative Convex data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(convexMemories));
      } else {
        // No Convex memories data - clear everything (user deleted data)
        setMemories([]);

        // Clear localStorage cache since Convex has no data
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [convexCustomization]);

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      // Optimistic update - update UI immediately
      const updatedMemories = memories.filter(
        (memory) => memory.id !== memoryId
      );
      setMemories(updatedMemories);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMemories));

      // Update Convex in the background
      await deleteMemoryMutation({ memoryId });

      toast.success("Memory deleted");
    } catch (error) {
      // Revert optimistic update on error
      setMemories(memories);
      const savedMemories = localStorage.getItem(STORAGE_KEY);
      if (savedMemories) {
        try {
          const parsedMemories = JSON.parse(savedMemories);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedMemories));
        } catch {
          // If parsing fails, restore original memories
          localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
        }
      }
      console.error("Failed to delete memory:", error);
      toast.error("Failed to delete memory");
    }
  };

  const handleEditMemory = (memoryId: string) => {
    const memory = memories.find((m) => m.id === memoryId);
    if (memory) {
      setEditingMemoryId(memoryId);
      setEditingContent(memory.content);
    }
  };

  const handleSaveEdit = async () => {
    if (editingContent.trim() === "" || !editingMemoryId) {
      toast.error("Memory content cannot be empty");
      return;
    }

    try {
      // Optimistic update - update UI immediately
      const updatedMemories = memories.map((memory) =>
        memory.id === editingMemoryId
          ? { ...memory, content: editingContent.trim() }
          : memory
      );

      setMemories(updatedMemories);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMemories));

      // Update Convex in the background
      await updateMemoryMutation({
        memoryId: editingMemoryId,
        newContent: editingContent.trim(),
      });

      setEditingMemoryId(null);
      setEditingContent("");
      toast.success("Memory updated");
    } catch (error) {
      // Revert optimistic update on error
      setMemories(memories);
      const savedMemories = localStorage.getItem(STORAGE_KEY);
      if (savedMemories) {
        try {
          const parsedMemories = JSON.parse(savedMemories);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedMemories));
        } catch {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
        }
      }
      console.error("Failed to update memory:", error);
      toast.error("Failed to update memory");
    }
  };

  const handleCancelEdit = () => {
    setEditingMemoryId(null);
    setEditingContent("");
  };

  const handleClearAll = () => {
    if (memories.length === 0) return;
    setShowClearDialog(true);
  };

  const handleConfirmClear = async () => {
    try {
      // Optimistic update - update UI immediately
      setMemories([]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      setShowMemories(false); // Hide memories list when cleared
      setShowClearDialog(false);

      // Update Convex in the background
      const result = await clearAllMemoriesMutation();

      toast.success(`All ${result.deletedCount} memories cleared`);
    } catch (error) {
      // Revert optimistic update on error
      const savedMemories = localStorage.getItem(STORAGE_KEY);
      if (savedMemories) {
        try {
          const parsedMemories = JSON.parse(savedMemories);
          setMemories(parsedMemories);
        } catch {
          setMemories([]);
        }
      }

      console.error("Failed to clear memories:", error);
      toast.error("Failed to clear memories");
      setShowClearDialog(false);
    }
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
            onClick={() =>
              updatePreference("memoriesEnabled", !memoriesEnabled)
            }
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
                      Hide Memories ({memories.length})
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

        {/* Memories list - only show if enabled and showMemories is true and we have memories */}
        {memoriesEnabled && showMemories && memories.length > 0 && (
          <div className="rounded-lg border border-secondary/50 bg-secondary/20 p-4">
            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {memories.map((memory, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-3 p-3 rounded-md bg-background/50 border border-secondary/30"
                >
                  <div className="flex-1 min-w-0">
                    {editingMemoryId === memory.id ? (
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
                            onClick={() => handleSaveEdit()}
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

                  {editingMemoryId !== memory.id && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMemory(memory.id)}
                        className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <CopyButton
                        text={memory.content}
                        size="md"
                        variant="ghost"
                        className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                        ariaLabel="Copy memory content"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteMemory(memory.id)}
                        className="flex-shrink-0 h-8 w-8 p-0 border border-red-800/20 bg-red-800/80 hover:bg-red-600 dark:bg-red-800/20 hover:dark:bg-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
