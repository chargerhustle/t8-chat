"use client";

import { useState, forwardRef } from "react";
import { AttachmentItem, AttachmentItemProps } from "./attachment-item";
import { AttachmentPreview } from "./attachment-preview";

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl?: string;
  mimeType?: string;
  status: "uploading" | "uploaded";
}

export interface AttachmentsListProps {
  attachments: Attachment[];
  onRemoveAttachment: (id: string) => void;
}

export const AttachmentsList = forwardRef<HTMLDivElement, AttachmentsListProps>(
  function AttachmentsList({ attachments, onRemoveAttachment }, ref) {
    const [previewAttachment, setPreviewAttachment] =
      useState<Attachment | null>(null);

    const handleAttachmentClick = (id: string) => {
      const attachment = attachments.find((a) => a.id === id);
      if (
        attachment &&
        attachment.status === "uploaded" &&
        attachment.fileUrl
      ) {
        setPreviewAttachment(attachment);
      }
    };

    const handleClosePreview = () => {
      setPreviewAttachment(null);
    };

    if (attachments.length === 0) {
      return null;
    }

    return (
      <>
        <div ref={ref}>
          <div className="-m-2 flex flex-wrap items-center gap-3 p-2 pb-4">
            {attachments.map((attachment) => (
              <AttachmentItem
                key={attachment.id}
                id={attachment.id}
                fileName={attachment.fileName}
                fileUrl={attachment.fileUrl}
                mimeType={attachment.mimeType}
                status={attachment.status}
                onRemove={onRemoveAttachment}
                onClick={handleAttachmentClick}
              />
            ))}
          </div>
        </div>

        {previewAttachment && previewAttachment.fileUrl && (
          <AttachmentPreview
            isOpen={true}
            onClose={handleClosePreview}
            fileName={previewAttachment.fileName}
            fileUrl={previewAttachment.fileUrl}
            mimeType={previewAttachment.mimeType || ""}
          />
        )}
      </>
    );
  }
);
