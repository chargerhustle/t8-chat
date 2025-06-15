"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { AttachmentPreview } from "./attachment-preview";
import { truncateFilename } from "@/lib/utils";

export interface MessageAttachmentsProps {
  attachments: Doc<"attachments">[];
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  const [previewAttachment, setPreviewAttachment] = useState<{
    fileName: string;
    fileUrl: string;
    mimeType: string;
  } | null>(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleAttachmentClick = (attachment: Doc<"attachments">) => {
    setPreviewAttachment({
      fileName: attachment.fileName,
      fileUrl: attachment.attachmentUrl,
      mimeType: attachment.mimeType,
    });
  };

  const handleClosePreview = () => {
    setPreviewAttachment(null);
  };

  return (
    <>
      {attachments.map((attachment) => {
        const isImage = attachment.mimeType.startsWith("image/");

        return (
          <div key={attachment._id} className="group relative">
            {isImage ? (
              // Image preview
              <div>
                <img
                  alt="Attached image"
                  className="max-h-[300px] cursor-pointer rounded-lg object-contain"
                  src={attachment.attachmentUrl}
                  onClick={() => handleAttachmentClick(attachment)}
                />
              </div>
            ) : (
              // File card for non-images
              <a
                href={attachment.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-16 cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/40 px-4 text-sm text-muted-foreground transition-colors hover:bg-primary/70"
                onClick={(e) => {
                  e.preventDefault();
                  handleAttachmentClick(attachment);
                }}
              >
                <FileText className="size-5" />
                <div
                  className="mb-px overflow-hidden text-ellipsis whitespace-nowrap"
                  title={attachment.fileName}
                >
                  {truncateFilename(attachment.fileName, 35)}
                </div>
              </a>
            )}
          </div>
        );
      })}

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <AttachmentPreview
          isOpen={true}
          onClose={handleClosePreview}
          fileName={previewAttachment.fileName}
          fileUrl={previewAttachment.fileUrl}
          mimeType={previewAttachment.mimeType}
        />
      )}
    </>
  );
}
