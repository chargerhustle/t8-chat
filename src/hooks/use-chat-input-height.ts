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
}

export function useChatInputHeight({
  onHeightChange,
  attachmentsLength,
  currentValue,
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

  // Measure height after DOM updates
  useLayoutEffect(() => {
    calculateAndReportHeight();
  }, [calculateAndReportHeight, attachmentsLength, currentValue]);

  return {
    chatInputContainerRef,
    calculateAndReportHeight,
  };
}
