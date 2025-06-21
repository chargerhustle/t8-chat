"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ClearMemoriesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
  memoryCount: number;
}

/**
 * Displays a confirmation dialog for clearing all saved memories.
 *
 * Renders a modal dialog prompting the user to confirm deletion of all saved memories, showing the total number to be deleted. Provides options to cancel or confirm the action.
 *
 * @param isOpen - Whether the dialog is visible
 * @param onClose - Callback invoked when the dialog is closed
 * @param onConfirmClear - Callback invoked when the user confirms clearing memories
 * @param memoryCount - The number of memories to be cleared, displayed in the dialog message
 */
export function ClearMemoriesDialog({
  isOpen,
  onClose,
  onConfirmClear,
  memoryCount,
}: ClearMemoriesDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear All Memories</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete all {memoryCount} saved memor
            {memoryCount === 1 ? "y" : "ies"}? This action cannot be undone and
            T8 Chat will lose all the important information it has learned about
            you from your conversations.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmClear}>
            Clear All
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
