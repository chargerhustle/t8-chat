"use client";

import { LoaderCircle, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AttachmentItemProps {
  id: string;
  fileName: string;
  fileUrl?: string;
  mimeType?: string;
  status: "uploading" | "uploaded";
  onRemove: (id: string) => void;
  onClick?: (id: string) => void;
}

export function AttachmentItem({
  id,
  fileName,
  fileUrl,
  mimeType,
  status,
  onRemove,
  onClick,
}: AttachmentItemProps) {
  const isImage = mimeType?.startsWith("image/");
  const isUploading = status === "uploading";

  const handleClick = () => {
    if (!isUploading && onClick) {
      onClick(id);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(id);
  };

  // Base button classes
  const baseClasses = cn(
    "group relative flex h-12 max-w-full shrink-0 items-center gap-2 rounded-xl border border-solid border-secondary-foreground/[0.08] bg-secondary-foreground/[0.02] transition-[width,height] duration-500",
    isUploading ? "cursor-default" : "hover:bg-secondary-foreground/10"
  );

  // Image variant (uploaded, compact)
  if (!isUploading && isImage && fileUrl) {
    return (
      <button
        type="button"
        className={cn(baseClasses, "w-12 justify-center p-0")}
        onClick={handleClick}
        data-state="closed"
      >
        <img
          className="size-10 rounded-lg object-cover transition-opacity opacity-100"
          aria-hidden="true"
          role="presentation"
          alt=""
          src={fileUrl}
        />
        <div
          className="absolute -right-1 -top-1 cursor-pointer rounded-full bg-secondary p-1 opacity-0 transition hover:bg-muted group-hover:opacity-100"
          aria-label="Remove upload"
          onClick={handleRemove}
        >
          <X className="!size-3" />
        </div>
      </button>
    );
  }

  // File variant (uploaded or uploading, with text)
  return (
    <button
      type="button"
      className={cn(baseClasses, "px-3.5")}
      onClick={handleClick}
      data-state="closed"
    >
      {isUploading ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <Paperclip className="size-4" />
      )}
      <span className="flex-1 truncate pr-1 text-sm">{fileName}</span>
      <div
        className="absolute -right-1 -top-1 cursor-pointer rounded-full bg-secondary p-1 opacity-0 transition hover:bg-muted group-hover:opacity-100"
        aria-label="Remove upload"
        onClick={handleRemove}
      >
        <X className="!size-3" />
      </div>
    </button>
  );
}
