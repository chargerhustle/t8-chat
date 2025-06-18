"use client";

import { CopyButton } from "@/components/copy-button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function SupportInfoCard() {
  const currentUser = useQuery(api.auth.getCurrentUser);

  return (
    <div className="w-fit space-y-2">
      <h2 className="text-2xl font-bold">Support Information</h2>
      <div className="space-y-2">
        <p className="px-px py-1.5 text-sm text-muted-foreground/80">
          Your user ID may be requested by our support team to help resolve
          issues.
        </p>
        <CopyButton
          text={currentUser?._id || ""}
          size="md"
          variant="outline"
          className="flex items-center gap-2 hover:bg-input/60"
          showToast={true}
          ariaLabel="Copy user ID to clipboard"
        />
      </div>
    </div>
  );
}
