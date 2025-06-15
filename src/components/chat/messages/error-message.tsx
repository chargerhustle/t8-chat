"use client";

import { memo } from "react";

interface ErrorMessageProps {
  messageId: string;
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

const ErrorMessage = memo(
  ({
    messageId,
    title,
    description,
    actionText,
    actionHref,
    className,
  }: ErrorMessageProps) => {
    return (
      <div data-message-id={messageId} className="flex justify-start">
        <div className="group relative w-full max-w-full break-words">
          <div
            className="mt-4 flex items-start gap-3 rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-900 dark:text-red-400"
            role="alert"
          >
            <div className="leading-relaxed">
              <span>{title}</span>
              {description && (
                <>
                  {" "}
                  <span>{description}</span>
                </>
              )}
              {actionText && actionHref && (
                <>
                  {" "}
                  <a
                    className="inline-flex items-center gap-1 text-red-700 underline hover:text-red-800 dark:text-red-200 dark:decoration-red-200 dark:hover:text-red-50"
                    href={actionHref}
                    data-discover="true"
                  >
                    {actionText}
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ErrorMessage.displayName = "ErrorMessage";

export { ErrorMessage };
export type { ErrorMessageProps };
