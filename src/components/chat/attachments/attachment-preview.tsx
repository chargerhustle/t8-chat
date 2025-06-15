"use client";

import { Download, ExternalLink, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { truncateFilename } from "@/lib/utils";

export interface AttachmentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl: string;
  mimeType: string;
}

export function AttachmentPreview({
  isOpen,
  onClose,
  fileName,
  fileUrl,
  mimeType,
}: AttachmentPreviewProps) {
  const isImage = mimeType.startsWith("image/");

  const handleDownload = () => {
    // Fetch the file and create a blob URL for proper download
    fetch(fileUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.blob();
      })
      .then((blob) => {
        // Create blob URL
        const blobUrl = window.URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;

        // Add to DOM temporarily for click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up blob URL
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => {
        console.error("Download failed:", error);
        // Fallback: open in new tab if fetch fails
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      });
  };

  const handleOpenInNewTab = () => {
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg flex max-h-[90vh] !max-w-4xl flex-col overflow-hidden !rounded-2xl bg-popover shadow-2xl outline outline-1 outline-chat-border/20 backdrop-blur-md dark:outline-white/5"
      >
        <DialogHeader className="space-y-1.5 text-center sm:text-left !mt-0 flex flex-col items-center justify-between">
          <div className="flex w-full flex-row items-center justify-between">
            <div className="flex flex-col flex-1 min-w-0 mr-4">
              <DialogTitle
                className="tracking-tight text-xl font-medium truncate"
                title={fileName}
              >
                {truncateFilename(fileName, 50)}
              </DialogTitle>
              <div className="text-sm text-muted-foreground">
                {/* You can add file size and other metadata here when available */}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="bg-secondary/50 text-secondary-foreground hover:bg-secondary disabled:hover:bg-secondary/50 h-8 w-8"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="bg-secondary/50 text-secondary-foreground hover:bg-secondary disabled:hover:bg-secondary/50 h-8 w-8"
                onClick={handleOpenInNewTab}
                asChild
              >
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Open in new tab</span>
                </a>
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="bg-secondary/50 text-secondary-foreground hover:bg-secondary disabled:hover:bg-secondary/50 h-8 w-8"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden rounded-md">
          {isImage ? (
            <div className="flex justify-center">
              <img
                alt={fileName}
                className="max-h-[70vh] max-w-full rounded-md object-contain"
                src={fileUrl}
              />
            </div>
          ) : (
            <iframe
              src={fileUrl}
              className="h-[75vh] w-full rounded-md border border-border"
              title={fileName}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
