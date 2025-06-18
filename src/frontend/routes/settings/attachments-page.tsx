"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { TabsContent } from "@/components/ui/tabs";
import { SettingsLayout } from "@/components/layout/settings-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ExternalLink, Trash, FileText, File, Loader2 } from "lucide-react";
import { DeleteAttachmentsDialog } from "@/components/settings";
import { Id } from "@/convex/_generated/dataModel";
import { truncateFilename } from "@/lib/utils";

// Skeleton loading component for attachments
function AttachmentSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-input p-4 last:border-0 animate-pulse">
      <Skeleton className="h-4 w-4 shrink-0" />
      <div className="flex flex-1 items-center justify-between overflow-hidden">
        <div className="flex min-w-0 items-center gap-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded" />
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-9 w-9 rounded" />
      </div>
    </div>
  );
}

export default function AttachmentsPage() {
  const attachments = useQuery(api.attachments.getAttachmentsByUser, {});
  const deleteAttachment = useMutation(api.attachments.deleteAttachment);
  const deleteAttachments = useMutation(api.attachments.deleteAttachments);

  const [selectedAttachments, setSelectedAttachments] = useState<
    Set<Id<"attachments">>
  >(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] =
    useState<Id<"attachments"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const handleSelectAll = () => {
    if (!attachments) return;
    if (selectedAttachments.size === attachments.length) {
      setSelectedAttachments(new Set());
    } else {
      setSelectedAttachments(new Set(attachments.map((a) => a._id)));
    }
  };

  const handleSelectAttachment = (
    attachmentId: Id<"attachments">,
    checked: boolean
  ) => {
    const newSelected = new Set(selectedAttachments);
    if (checked) {
      newSelected.add(attachmentId);
    } else {
      newSelected.delete(attachmentId);
    }
    setSelectedAttachments(newSelected);
  };

  const handleDeleteSingle = (attachmentId: Id<"attachments">) => {
    setAttachmentToDelete(attachmentId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSelected = () => {
    if (selectedAttachments.size === 0) return;
    setIsBulkDelete(true);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (isBulkDelete && selectedAttachments.size === 0) return;
    if (!isBulkDelete && !attachmentToDelete) return;

    setIsDeleting(true);

    try {
      if (isBulkDelete) {
        // Bulk deletion
        const attachmentIds = Array.from(selectedAttachments);
        await deleteAttachments({ attachmentIds });
        const count = attachmentIds.length;
        toast.success(
          `${count} attachment${count > 1 ? "s" : ""} deleted successfully`
        );
        setSelectedAttachments(new Set());
      } else {
        // Single deletion
        await deleteAttachment({ attachmentId: attachmentToDelete! });
        toast.success("Attachment deleted successfully");
        setSelectedAttachments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(attachmentToDelete!);
          return newSet;
        });
      }
    } catch (error) {
      toast.error("Failed to delete attachment(s)");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setAttachmentToDelete(null);
      setIsBulkDelete(false);
    }
  };

  const getFileIcon = (mimeType: string, attachmentUrl: string) => {
    if (mimeType.startsWith("image/")) {
      return (
        <img
          alt="Preview"
          className="h-12 w-12 shrink-0 rounded object-cover"
          src={attachmentUrl}
        />
      );
    } else if (mimeType === "application/pdf" || mimeType.includes("text")) {
      return (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-input text-muted-foreground/80">
          <FileText className="h-6 w-6" />
        </div>
      );
    } else {
      return (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-input text-muted-foreground/80">
          <File className="h-6 w-6" />
        </div>
      );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const allSelected =
    attachments &&
    attachments.length > 0 &&
    selectedAttachments.size === attachments.length;
  const hasSelection = selectedAttachments.size > 0;

  return (
    <SettingsLayout defaultTab="attachments">
      <TabsContent value="attachments" className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Attachments</h2>
            <p className="mt-2 text-sm text-muted-foreground/80 sm:text-base">
              Manage your uploaded files and attachments. Note that deleting
              files here will remove them from the relevant threads, but not
              delete the threads. This may lead to unexpected behavior if you
              delete a file that is still being used in a thread.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="mb-2 flex h-10 items-end justify-between gap-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    onClick={handleSelectAll}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors"
                    style={{
                      pointerEvents:
                        !attachments || attachments.length === 0
                          ? "none"
                          : "auto",
                      opacity:
                        !attachments || attachments.length === 0 ? 0.5 : 1,
                    }}
                  >
                    <Checkbox
                      checked={allSelected}
                      className="h-4 w-4"
                      disabled={!attachments || attachments.length === 0}
                    />
                    <span className="text-sm">
                      <span className="hidden md:inline">Select All</span>
                      <span className="md:hidden">All</span>
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAttachments(new Set())}
                  className={`flex gap-1 whitespace-nowrap text-sm ${
                    hasSelection ? "visible" : "invisible"
                  }`}
                >
                  Clear<span className="hidden md:inline"> Selection</span>
                </Button>
              </div>
              {hasSelection && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="flex gap-2 border border-red-800/20 bg-red-800/80 hover:bg-red-600 dark:bg-red-800/20 hover:dark:bg-red-800"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="h-4 w-4" />
                  )}
                  <div className="flex gap-1 whitespace-nowrap text-sm">
                    <span className="hidden md:inline">
                      {isDeleting ? "Deleting..." : "Delete Selected"}
                    </span>
                    <span className="md:hidden">
                      {isDeleting ? "Deleting..." : "Delete"}
                    </span>
                    {!isDeleting && ` (${selectedAttachments.size})`}
                  </div>
                </Button>
              )}
            </div>

            <div className="relative overflow-x-hidden overflow-y-scroll rounded-lg border border-input">
              <div className="scrollbar-hide h-[250px] overflow-y-auto md:h-[calc(100vh-360px)] md:min-h-[670px]">
                {!attachments ? (
                  // Loading skeleton
                  <div>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <AttachmentSkeleton key={i} />
                    ))}
                  </div>
                ) : attachments.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      No attachments found
                    </p>
                  </div>
                ) : (
                  attachments.map((attachment) => (
                    <div
                      key={attachment._id}
                      className="flex items-center gap-4 border-b border-input p-4 last:border-0"
                      role="button"
                      tabIndex={0}
                    >
                      <Checkbox
                        checked={selectedAttachments.has(attachment._id)}
                        onCheckedChange={(checked) =>
                          handleSelectAttachment(
                            attachment._id,
                            checked as boolean
                          )
                        }
                        className="h-4 w-4 shrink-0"
                      />

                      <div className="flex flex-1 items-center justify-between overflow-hidden">
                        <div className="flex min-w-0 items-center gap-4">
                          {getFileIcon(
                            attachment.mimeType,
                            attachment.attachmentUrl
                          )}

                          <div className="flex min-w-0 flex-col">
                            <div className="flex min-w-0 items-center gap-2">
                              <a
                                href={attachment.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex min-w-0 items-center gap-2"
                              >
                                <span className="text-sm text-foreground group-hover:underline">
                                  {truncateFilename(attachment.fileName, 50)}
                                </span>
                                <ExternalLink className="hidden h-4 w-4 shrink-0 text-muted-foreground/80 group-hover:text-muted-foreground sm:inline-block" />
                              </a>
                            </div>
                            <div className="text-xs text-muted-foreground/80">
                              {attachment.mimeType} •{" "}
                              {formatFileSize(attachment.fileSize)}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSingle(attachment._id)}
                          className="h-9 w-9 border border-red-800/20 bg-red-800/80 hover:bg-red-600 dark:bg-red-800/20 hover:dark:bg-red-800"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <DeleteAttachmentsDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setAttachmentToDelete(null);
            setIsBulkDelete(false);
          }}
          onConfirmDelete={handleConfirmDelete}
          attachmentCount={isBulkDelete ? selectedAttachments.size : 1}
        />
      </TabsContent>
    </SettingsLayout>
  );
}
