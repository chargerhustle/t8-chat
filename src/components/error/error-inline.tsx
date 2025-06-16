"use client";

import { InlineError } from "@/types/errors";

interface ErrorInlineProps {
  error: InlineError;
}

export function ErrorInline({ error }: ErrorInlineProps) {
  const handleAction = (action: () => void | Promise<void>) => {
    try {
      const result = action();
      if (result instanceof Promise) {
        result.catch(console.error);
      }
    } catch (err) {
      console.error("Action failed:", err);
    }
  };

  return (
    <div
      className="flex items-start gap-3 rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-900 dark:text-red-400"
      role="alert"
    >
      <div className="leading-relaxed">
        <span>{error.message}</span>
        {error.actions?.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.action)}
            className="ml-1 inline-flex items-center gap-1 text-red-700 underline hover:text-red-800 dark:text-red-200 dark:decoration-red-200 dark:hover:text-red-50"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
