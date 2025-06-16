"use client";

import React from "react";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { ToastError } from "@/types/errors";

export function showErrorToast(error: ToastError) {
  const icon = React.createElement(CircleAlert, { className: "h-4 w-4" });

  toast.error(error.title, {
    description: error.message,
    icon,
    position: "bottom-right",
    duration: error.duration || 4000,
    id: error.id,
  });
}
