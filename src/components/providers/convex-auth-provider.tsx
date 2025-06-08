"use client";

import { ConvexAuthProvider as ConvexAuthProviderBase } from "@convex-dev/auth/react";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache";
import { CONVEX_CLIENT } from "@/lib/convex-client";

interface ConvexAuthProviderProps {
  children: React.ReactNode;
}

export function ConvexAuthProvider({ children }: ConvexAuthProviderProps) {
  return (
    <ConvexAuthProviderBase client={CONVEX_CLIENT}>
      <ConvexQueryCacheProvider>
        {children}
      </ConvexQueryCacheProvider>
    </ConvexAuthProviderBase>
  );
} 