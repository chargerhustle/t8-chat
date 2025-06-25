"use client";

import { useNavigate } from "react-router";
import { Settings2, SunMoon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useTemporaryMode } from "@/hooks/use-temporary-mode";
import { TemporaryChatIcon } from "./temporary-chat-icon";

export function SettingsToolbar() {
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();
  const isTemporary = useTemporaryMode();

  const handleSettingsClick = () => {
    navigate("/settings/account");
  };

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleTemporaryChatClick = () => {
    if (isTemporary) {
      // Exit temporary mode - go to normal launch page
      navigate("/");
    } else {
      // Enter temporary mode
      navigate("/temporary");
    }
  };

  return (
    <div
      className="fixed right-2 top-2 z-20 max-sm:hidden"
      style={{ right: "var(--firefox-scrollbar, 0.5rem)" }}
    >
      <div className="flex flex-row items-center text-muted-foreground gap-0.5 rounded-md p-1 transition-all bg-sidebar/50 backdrop-blur-sm blur-fallback:bg-sidebar">
        {/* Temporary Chat Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleTemporaryChatClick}
          aria-label={
            isTemporary ? "Exit temporary chat" : "Start temporary chat"
          }
          className="size-8 hover:bg-muted/40 hover:text-foreground"
        >
          <TemporaryChatIcon isTemporary={isTemporary} className="size-4" />
        </Button>

        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSettingsClick}
          aria-label="Go to settings"
          className="size-8 hover:bg-muted/40 hover:text-foreground"
        >
          <Settings2 className="size-4" />
        </Button>

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleThemeToggle}
          aria-label="Toggle theme"
          className="size-8 hover:bg-muted/40 hover:text-foreground"
        >
          <SunMoon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
