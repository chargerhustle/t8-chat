import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { useUploadFile } from "@convex-dev/r2/react";
import { api } from "@/convex/_generated/api";
import type { Attachment } from "@/components/chat/attachments";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import React from "react";
import { truncateFilename } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE_MB = 8;
const MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// The public gateway that serves R2 objects without a TTL. Must match the
// server-side helper in `convex/attachments.ts`.
const PUBLIC_ENDPOINT =
  process.env.NEXT_PUBLIC_R2_PUBLIC_ENDPOINT?.replace(/\/$/, "") ?? "";

if (typeof window !== "undefined" && !PUBLIC_ENDPOINT) {
  // eslint-disable-next-line no-console
  console.error(
    "R2_PUBLIC_ENDPOINT is missing – public attachment URLs will be broken."
  );
}

const buildPublicUrl = (key: string) => `${PUBLIC_ENDPOINT}/${key}`;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

type UploadingAttachment = Omit<Attachment, "status"> & {
  status: "uploading";
};

type UploadedAttachment = Attachment & {
  status: "uploaded";
  fileUrl: string;
};

type AnyAttachment = UploadingAttachment | UploadedAttachment;

/**
 * Hook that manages the complete attachment lifecycle for a given chat thread.
 *
 * Responsibilities:
 * 1. Accept File objects from the browser and validate them.
 * 2. Upload raw bytes directly to Cloudflare R2 via a signed PUT URL
 *    returned by Convex (`generateUploadUrl`).
 * 3. Persist metadata in Convex (`createAttachment` mutation).
 * 4. Return a stable, public URL (no TTL) for immediate use in the UI / AI ctx.
 * 5. Provide deletion with Convex optimistic updates for snappy UX.
 */
export function useAttachments() {
  const [attachments, setAttachments] = useState<AnyAttachment[]>([]);
  const [, setUploadingIds] = useState<Set<string>>(new Set());

  // --- Convex helpers ------------------------------------------------------

  const uploadFile = useUploadFile({
    generateUploadUrl: api.attachments.generateUploadUrl,
    syncMetadata: api.attachments.syncMetadata,
  });

  const deleteFromR2 = useMutation(api.attachments.deleteObject);

  // --- Helpers -------------------------------------------------------------

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_BYTES) {
      return `File exceeds ${MAX_FILE_SIZE_MB} MB limit.`;
    }
    return null;
  };

  // --- Public API ----------------------------------------------------------

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      Array.from(fileList).forEach((file) => {
        // Check for duplicates using current state
        const isDuplicate = attachments.some(
          (att) => att.fileName === file.name
        );
        if (isDuplicate) {
          toast.error(
            `File "${truncateFilename(file.name, 40)}" is already uploaded`,
            {
              icon: React.createElement(AlertCircle, { className: "h-4 w-4" }),
              position: "bottom-right",
              duration: 2000,
              id: `duplicate-${file.name}`,
            }
          );
          return;
        }

        const error = validateFile(file);
        if (error) {
          toast.error(`${truncateFilename(file.name, 30)}: ${error}`, {
            icon: React.createElement(AlertCircle, { className: "h-4 w-4" }),
            position: "bottom-right",
            duration: 2000,
            id: `error-${file.name}`,
          });
          return;
        }

        const tempId = crypto.randomUUID();
        setUploadingIds((prev) => new Set(prev).add(tempId));
        setAttachments((prev) => [
          ...prev,
          {
            id: tempId,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            status: "uploading",
          },
        ]);
        (async () => {
          try {
            // 1) Upload raw bytes
            const key = await uploadFile(file);

            // Check if this upload was cancelled
            setUploadingIds((prev) => {
              const newSet = new Set(prev);
              if (!newSet.has(tempId)) {
                // Upload was cancelled, don't update state
                return prev;
              }
              newSet.delete(tempId);
              return newSet;
            });

            // 2) Replace optimistic entry with final record
            setAttachments((prev) => {
              const attachmentExists = prev.some((a) => a.id === tempId);
              if (!attachmentExists) {
                // Don't update if attachment was removed
                return prev;
              }

              // Show success toast only once
              toast.success(
                `"${truncateFilename(file.name, 40)}" uploaded successfully`,
                {
                  icon: React.createElement(CheckCircle, {
                    className: "h-4 w-4",
                  }),
                  position: "bottom-right",
                  duration: 2000,
                  id: `success-${file.name}`,
                }
              );

              // Update the attachment
              return prev.map((a) =>
                a.id === tempId
                  ? {
                      id: key,
                      fileName: file.name,
                      fileUrl: buildPublicUrl(key),
                      fileKey: key,
                      mimeType: file.type,
                      fileSize: file.size,
                      status: "uploaded",
                    }
                  : a
              );
            });
          } catch {
            setUploadingIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(tempId);
              return newSet;
            });
            toast.error(
              `Failed to upload "${truncateFilename(file.name, 40)}"`,
              {
                icon: React.createElement(AlertCircle, {
                  className: "h-4 w-4",
                }),
                position: "bottom-right",
                duration: 2000,
                id: `upload-error-${file.name}`,
              }
            );
            setAttachments((prev) => prev.filter((a) => a.id !== tempId));
          }
        })();
      });
    },
    [uploadFile, attachments]
  );

  const removeAttachment = useCallback(
    async (id: string) => {
      // Find the attachment to get its R2 key
      const attachment = attachments.find((a) => a.id === id);

      if (!attachment) return;

      const fileName = attachment.fileName;

      // If it's uploading, cancel the upload
      if (attachment.status === "uploading") {
        setUploadingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }

      // Optimistic UI - remove immediately
      setAttachments((prev) => prev.filter((a) => a.id !== id));

      // Delete from R2 if we have the key
      if (attachment.status === "uploaded" && attachment.fileKey) {
        try {
          await deleteFromR2({ key: attachment.fileKey });
          toast.success(
            `"${truncateFilename(fileName, 40)}" deleted successfully`,
            {
              icon: React.createElement(Trash2, { className: "h-4 w-4" }),
              position: "bottom-right",
              duration: 2000,
              id: `delete-success-${fileName}`,
            }
          );
        } catch {
          toast.error(
            `Failed to delete "${truncateFilename(fileName, 40)}" from storage`,
            {
              icon: React.createElement(AlertCircle, { className: "h-4 w-4" }),
              position: "bottom-right",
              duration: 2000,
              id: `delete-error-${fileName}`,
            }
          );
          // Re-add the attachment if deletion failed
          setAttachments((prev) => [...prev, attachment]);
          return;
        }
      } else {
        // For files that are still uploading or don't have fileKey
        toast.success(`"${truncateFilename(fileName, 40)}" removed`, {
          icon: React.createElement(Trash2, { className: "h-4 w-4" }),
          position: "bottom-right",
          duration: 2000,
          id: `remove-${fileName}`,
        });
      }
    },
    [attachments, deleteFromR2]
  );

  const clear = useCallback(() => setAttachments([]), []);

  // Check if all files are uploaded (for send button state)
  const allFilesUploaded = attachments.every(
    (att) => att.status === "uploaded"
  );

  return {
    attachments: attachments as Attachment[],
    addFiles,
    removeAttachment,
    clear,
    allFilesUploaded,
  };
}
