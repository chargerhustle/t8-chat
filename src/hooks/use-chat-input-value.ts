import { useState, useCallback } from "react";

interface UseChatInputValueProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onInputChange?: (hasText: boolean) => void;
  adjustHeight: () => void;
}

export function useChatInputValue({
  value,
  onValueChange,
  onInputChange,
  adjustHeight,
}: UseChatInputValueProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (isControlled) {
        onValueChange?.(newValue);
      } else {
        setInternalValue(newValue);
      }
      adjustHeight();

      // Notify parent about input state change
      onInputChange?.(newValue.trim().length > 0);
    },
    [isControlled, onValueChange, adjustHeight, onInputChange]
  );

  return {
    currentValue,
    isControlled,
    internalValue,
    setInternalValue,
    handleInputChange,
  };
}
