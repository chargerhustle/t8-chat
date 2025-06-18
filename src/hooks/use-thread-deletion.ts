import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function useThreadDeletion() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingThreadIds, setPendingThreadIds] = useState<string[]>([]);
  const batchDeleteThreads = useMutation(api.threads.batchDeleteThreads);

  const deleteThreads = async (threadIds: string[]) => {
    if (threadIds.length === 0) {
      toast.error("Please select at least one thread to delete", {
        duration: 3000,
      });
      return;
    }

    // Store thread IDs and show dialog
    setPendingThreadIds(threadIds);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setShowDeleteDialog(false);
    setIsDeleting(true);

    try {
      const threadText = pendingThreadIds.length === 1 ? "thread" : "threads";

      // Show immediate feedback
      toast.info(`Deleting ${pendingThreadIds.length} ${threadText}...`, {
        duration: 3000,
      });

      const result = await batchDeleteThreads({ threadIds: pendingThreadIds });

      if (result.success) {
        const deletedText = result.deletedCount === 1 ? "thread" : "threads";
        toast.success(
          `Successfully deleted ${result.deletedCount} ${deletedText}`,
          {
            duration: 3000,
          }
        );

        if (result.deletedCount < pendingThreadIds.length) {
          const skippedCount = pendingThreadIds.length - result.deletedCount;
          toast.warning(
            `${skippedCount} ${skippedCount === 1 ? "thread was" : "threads were"} skipped (not found or unauthorized)`,
            {
              duration: 3000,
            }
          );
        }
      } else {
        toast.error("Failed to delete threads", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Delete operation failed:", error);
      toast.error("Failed to delete threads. Please try again.", {
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
      setPendingThreadIds([]);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setPendingThreadIds([]);
  };

  return {
    deleteThreads,
    confirmDelete,
    cancelDelete,
    isDeleting,
    showDeleteDialog,
    pendingThreadCount: pendingThreadIds.length,
  };
}
