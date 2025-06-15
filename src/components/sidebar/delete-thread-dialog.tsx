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

import { Doc } from "@/convex/_generated/dataModel";

// Use the actual Convex thread type
type Thread = Doc<"threads">;

interface DeleteThreadDialogProps {
  isOpen: boolean;
  threadToDelete: string | null;
  threads: Thread[] | null | undefined;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export function DeleteThreadDialog({
  isOpen,
  threadToDelete,
  threads,
  onClose,
  onConfirmDelete,
}: DeleteThreadDialogProps) {
  const threadTitle = threads?.find(
    (t) => t.threadId === threadToDelete
  )?.title;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Thread</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{threadTitle}&quot;? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
