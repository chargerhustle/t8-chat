"use client";

import { useLocation } from "react-router";

/**
 * Hook to detect if the current session is in temporary chat mode
 * @returns boolean - true if temporary mode is active
 */
export function useTemporaryMode(): boolean {
  const location = useLocation();
  return location.pathname.startsWith("/temporary");
}
