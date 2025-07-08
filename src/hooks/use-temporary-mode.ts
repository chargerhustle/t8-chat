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

/**
 * Hook to detect if branching should be disabled
 * This includes both temporary chats and agent preview modes
 * @returns boolean - true if branching should be disabled
 */
export function useBranchingDisabled(): boolean {
  const location = useLocation();

  // Check for explicit temporary chat paths
  const isExplicitTemporary = location.pathname.startsWith("/temporary");

  // Check for agent creation/editing paths where chat preview is used
  const isAgentPreview =
    location.pathname.startsWith("/agents/create") ||
    location.pathname.startsWith("/agents/edit");

  return isExplicitTemporary || isAgentPreview;
}
