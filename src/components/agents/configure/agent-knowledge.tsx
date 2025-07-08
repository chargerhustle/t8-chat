"use client";

import { Label } from "@/components/ui/label";
import { AttachmentsList } from "@/components/chat/attachments";
import { useAttachments } from "@/hooks/use-attachments";
import { Upload } from "lucide-react";

interface AgentKnowledgeProps {
  mode: "create" | "edit";
  agentId?: string;
}

export function AgentKnowledge({ mode, agentId }: AgentKnowledgeProps) {
  const { attachments, addFiles, removeAttachment } = useAttachments();
  const isEditing = mode === "edit";

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      addFiles(files);
    }
    // Reset the input
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files) {
      addFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-medium">Knowledge Base</Label>
        <p className="text-sm text-muted-foreground">
          Upload documents and files that the agent can use as reference
          material. Supports PDFs, text files, images, and more.
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.heic"
        />
        <div className="text-center">
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, PNG, JPG, JPEG, WEBP, HEIC up to 10MB each
          </p>
        </div>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Uploaded Files</Label>
          <AttachmentsList
            attachments={attachments}
            onRemoveAttachment={removeAttachment}
          />
        </div>
      )}
    </div>
  );
}
