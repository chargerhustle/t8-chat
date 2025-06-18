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

interface DeleteAttachmentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  attachmentCount: number;
}

export function DeleteAttachmentsDialog({
  isOpen,
  onClose,
  onConfirmDelete,
  attachmentCount,
}: DeleteAttachmentsDialogProps) {
  const attachmentText = attachmentCount === 1 ? "attachment" : "attachments";

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {attachmentText}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {attachmentCount} {attachmentText}?
            This action cannot be undone and will permanently remove{" "}
            {attachmentCount === 1 ? "this file" : "these files"} from your
            storage. This may affect threads where{" "}
            {attachmentCount === 1 ? "this file is" : "these files are"}{" "}
            referenced.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmDelete}>
            Delete {attachmentText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
