"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { getUserApiKeys } from "@/lib/ai/byok-providers";

export function ApiKeyWarning() {
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  // Check if user has any API keys configured
  const userApiKeys = getUserApiKeys();
  const hasAnyApiKey = Object.values(userApiKeys).some((key) => !!key);

  // Don't show if user has API keys or if dismissed
  if (hasAnyApiKey || isDismissed) {
    return null;
  }

  const handleConfigureApiKeys = () => {
    navigate("/settings/api-keys");
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="pointer-events-auto mx-auto w-fit">
      <div className="relative mx-auto my-4 rounded-xl border px-5 py-3 shadow-lg backdrop-blur-md blur-fallback:bg-secondary border-yellow-400/20 bg-yellow-300/50 text-yellow-800 dark:border-yellow-800/20 dark:bg-yellow-800/30 dark:text-yellow-100/90">
        <div className="pr-4">
          You don&apos;t have any API keys configured.{" "}
          <button
            onClick={handleConfigureApiKeys}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 underline-offset-4 hover:underline disabled:hover:no-underline h-auto p-0 pb-0.5 text-yellow-600 underline hover:text-yellow-950 dark:text-yellow-300/80 dark:hover:text-yellow-100"
          >
            Configure API keys
          </button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-yellow-800 hover:text-yellow-950 dark:text-yellow-100/90 dark:hover:text-yellow-100 hover:bg-transparent cursor-pointer"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
