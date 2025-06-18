import { useEffect, useCallback } from "react";

interface ShortcutConfig {
  key: string;
  ctrlOrCmd: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  allowInInputs?: boolean; // Allow this shortcut to work even when focused on inputs
}

export function useGlobalShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true" ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        // Skip if we're in an input field and this shortcut doesn't allow it
        if (isInInput && !shortcut.allowInInputs) {
          continue;
        }

        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlOrCmdMatches = shortcut.ctrlOrCmd && (e.ctrlKey || e.metaKey);
        const shiftMatches = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatches = shortcut.alt ? e.altKey : !e.altKey;

        if (keyMatches && ctrlOrCmdMatches && shiftMatches && altMatches) {
          e.preventDefault();
          e.stopPropagation();
          shortcut.callback();
          break; // Only trigger the first matching shortcut
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    // Use capture phase for better performance and to catch events early
    document.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [handleKeyDown]);
}
