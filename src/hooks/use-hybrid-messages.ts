import { useMemo } from "react";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useTempMessage } from "@/lib/chat/temp-message-store";

// Type for message with attachments (as returned by getByThreadId)
type MessageWithAttachments = Doc<"messages"> & {
  attachments: Doc<"attachments">[];
};

// A single shared, immutable empty array
const EMPTY: MessageWithAttachments[] = [];

// temp→DB "convert" helper
const convertTempToFullMessage = (
  tempMsg: ReturnType<typeof useTempMessage>
): MessageWithAttachments => ({
  ...tempMsg!,
  _id: tempMsg!.messageId as Id<"messages">,
  _creationTime: tempMsg!.created_at,
  userId: "temp-user" as Id<"users">,
  model: tempMsg!.model, // Use the actual model from temp message
  attachmentIds: [],
  attachments: [],
  modelParams: undefined,
  providerMetadata: undefined,
  resumableStreamId: undefined,
  serverError: undefined,
  backfill: undefined,
});

/**
 * Merges Convex history + temp placeholder stream,
 * but only while the Convex doc's status === "streaming".
 *
 * This hook uses Convex's status field as the single source of truth:
 * - When assistant status is "streaming": show history + temp placeholder
 * - When assistant status is "done": show full Convex messages
 * - When loading: show nothing (simplified approach)
 */
export function useHybridMessages(threadId: string): MessageWithAttachments[] {
  // 1) Get the live Convex array (undefined | null | array of messages)
  const convexRaw = useQuery(
    api.messages.getByThreadId,
    threadId ? { threadId } : "skip"
  );

  const convexMessages = useMemo(() => {
    if (convexRaw === undefined) return undefined;
    if (convexRaw === null) return null;
    return convexRaw;
  }, [convexRaw]);

  // 2) Find the streaming assistant in Convex (if any) to get its messageId
  const streamingAssistant = useMemo(() => {
    if (!convexMessages || convexMessages.length === 0) return null;
    return (
      convexMessages.find(
        (m) => m.role === "assistant" && m.status === "streaming"
      ) || null
    );
  }, [convexMessages]);

  // 3) Get the specific temp message by ID
  const tempPlaceholder = useTempMessage(streamingAssistant?.messageId || "");

  return useMemo(() => {
    // If Convex is still "loading" or thread not found, show nothing
    if (convexMessages === undefined || convexMessages === null) {
      return EMPTY;
    }

    //  → If Convex's assistant.doc is in "streaming" status, show history+temp
    if (streamingAssistant && tempPlaceholder) {
      // History = all convex except that streaming placeholder
      const out: MessageWithAttachments[] = [];
      out.push(
        ...convexMessages.filter(
          (m) => m.messageId !== streamingAssistant.messageId
        )
      );
      // Add the temp placeholder with growing content
      out.push(convertTempToFullMessage(tempPlaceholder));
      return out;
    }

    //  → Otherwise, Convex is either
    //     • "empty array" (no messages at all), or
    //     • it has a final assistant (status !== "streaming", likely "done").
    // In both cases we just return convexMessages as-is.
    return convexMessages;
  }, [convexMessages, streamingAssistant, tempPlaceholder]);
}
