"use client";

import { useState, useEffect } from "react";

// Helper component for keyboard shortcuts
function KeyboardShortcut({ keys }: { keys: string[] }) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    // Detect Mac using userAgent (reliable and widely supported)
    const detectMac = () => {
      return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
    };

    setIsMac(detectMac());
  }, []);

  const getKeyDisplay = (key: string) => {
    if (key.toLowerCase() === "ctrl") {
      return isMac ? "⌘" : "Ctrl";
    }
    if (key.toLowerCase() === "shift") {
      return isMac ? "⇧" : "Shift";
    }
    return key;
  };

  return (
    <div className="flex gap-1">
      {keys.map((key, index) => (
        <kbd
          key={index}
          className="rounded bg-background px-2 py-1 font-sans text-sm"
        >
          {getKeyDisplay(key)}
        </kbd>
      ))}
    </div>
  );
}

export function KeyboardShortcutsCard() {
  return (
    <div className="space-y-6 rounded-lg bg-card p-4">
      <span className="text-sm font-semibold">Keyboard Shortcuts</span>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Search</span>
          <KeyboardShortcut keys={["Ctrl", "K"]} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">New Chat</span>
          <KeyboardShortcut keys={["Ctrl", "Shift", "O"]} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Toggle Sidebar</span>
          <KeyboardShortcut keys={["Ctrl", "B"]} />
        </div>
      </div>
    </div>
  );
}
