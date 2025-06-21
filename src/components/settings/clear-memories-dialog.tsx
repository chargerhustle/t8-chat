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
