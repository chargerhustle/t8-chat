"use client";

import React from "react";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { ToastErrorType, CreateErrorOptions } from "@/types/errors";
import { createError } from "@/lib/error-handler";

/**
 * Show a toast error notification
 * Only accepts error types that are configured as toast errors
 * @param errorType - The type of error (must be a toast error type)
 * @param context - Additional context information (optional)
 */
export function ShowToastError(
  errorType: ToastErrorType,
  context?: Partial<CreateErrorOptions["context"]>
): void {
  // Create the error using existing error handler
  const error = createError({
    type: errorType,
    context,
  });

  // Create the toast icon
  const icon = React.createElement(CircleAlert, { className: "h-4 w-4" });

  // Show the toast directly
  toast.error(error.title, {
    description: error.message,
    icon,
    position: "bottom-right",
    duration: error.duration || 4000,
    id: error.id,
  });
}
