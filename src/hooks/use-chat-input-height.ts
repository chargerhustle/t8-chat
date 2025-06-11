import { useRef } from "react";

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
