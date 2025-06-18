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

interface DeleteThreadsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  threadCount: number;
}

export function DeleteThreadsDialog({
  isOpen,
  onClose,
  onConfirmDelete,
  threadCount,
}: DeleteThreadsDialogProps) {
  const threadText = threadCount === 1 ? "thread" : "threads";

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {threadText}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {threadCount} {threadText}? This
            action cannot be undone and will permanently remove{" "}
            {threadCount === 1 ? "this conversation" : "these conversations"}{" "}
            from your history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmDelete}>
            Delete {threadText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
