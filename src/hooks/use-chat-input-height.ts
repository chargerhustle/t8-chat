import { useRef, useCallback, useLayoutEffect } from "react";

// Original hook for attachments height measurement
export function useAttachmentsHeight() {
  const attachmentsRef = useRef<HTMLDivElement>(null);

  const getAttachmentsHeight = () => {
    return attachmentsRef.current?.offsetHeight || 0;
  };

  return {
    attachmentsRef,
    getAttachmentsHeight,
  };
}

// New hook for chat input container height calculation and reporting
interface UseChatInputHeightProps {
  onHeightChange?: (height: number) => void;
  attachmentsLength: number;
  currentValue: string;
  // Add attachment status tracking to trigger height recalculation
  attachments?: Array<{ status: "uploading" | "uploaded" }>;
}

export function useChatInputHeight({
  onHeightChange,
  attachmentsLength,
  currentValue,
  attachments = [],
}: UseChatInputHeightProps) {
  // Simple ref for the container
  const chatInputContainerRef = useRef<HTMLDivElement>(null);

  // Calculate and report total height when content changes
  const calculateAndReportHeight = useCallback(() => {
    if (chatInputContainerRef.current && onHeightChange) {
      const totalHeight = chatInputContainerRef.current.offsetHeight;
      onHeightChange(totalHeight);
    }
  }, [onHeightChange]);

  // Create a status signature to detect when attachment statuses change
  const attachmentStatusSignature = attachments.map((a) => a.status).join(",");

  // Measure height after DOM updates
  useLayoutEffect(() => {
    calculateAndReportHeight();
  }, [
    calculateAndReportHeight,
    attachmentsLength,
    currentValue,
    attachmentStatusSignature,
  ]);

  return {
    chatInputContainerRef,
    calculateAndReportHeight,
  };
}
