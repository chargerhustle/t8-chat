import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useMemo, useCallback } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";

export type Tool = {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  state: "streaming-start" | "streaming-delta" | "call" | "result";
  timestamp: number;
};

// Same structure as Convex attachments
export type TempAttachment = {
  _id: string;
  messageId?: string;
  userId: string;
  threadId: string;
  attachmentType: string;
  attachmentUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  fileKey: string;
  status?: "deleted" | "uploaded";
};

export type TempMessage = {
  messageId: string;
  threadId: string;
  content: string;
  role: "assistant" | "user";
  status: "streaming" | "done" | "error";
  reasoning?: string;
  model: string; // Add model field to track which model is being used
  created_at: number;
  updated_at: number;
  tools?: Tool[];
  attachmentIds?: string[]; // Array of attachment IDs
};

// Internal store type
type InternalTempMessageStore = {
  messages: TempMessage[];
  attachments: TempAttachment[];

  // Message actions
  addMessage: (message: TempMessage) => void;
  addMessages: (messages: TempMessage[]) => void;
  updateMessage: (messageId: string, updates: Partial<TempMessage>) => void;
  removeMessage: (messageId: string) => void;
  clearThread: (threadId: string) => void;
  clearAllMessages: () => void;

  // Attachment actions
  addAttachment: (attachment: TempAttachment) => void;
  addAttachments: (attachments: TempAttachment[]) => void;
  removeAttachment: (attachmentId: string) => void;
  clearThreadAttachments: (threadId: string) => void;

  // Tool-specific actions
  addTool: (messageId: string, tool: Tool) => void;
  updateTool: (
    messageId: string,
    toolCallId: string,
    updates: Partial<Tool>
  ) => void;

  // Convex-compatible attachment creation
  createAttachments: (args: {
    attachments: Array<{
      fileKey: string;
      attachmentUrl: string;
      threadId: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
      attachmentType: string;
    }>;
    messageId?: string;
  }) => Promise<
    Array<{
      _id: string;
      attachmentType: string;
      attachmentUrl: string;
      mimeType: string;
    }>
  >;

  // Convex-compatible message query with attachments
  getMessagesByThreadId: (threadId: string) => Array<{
    messageId: string;
    content: string;
    role: "assistant" | "user";
    attachmentIds: string[];
    attachments: TempAttachment[];
  }>;
};

// Public interface
export type TempMessageStore = {
  messages: TempMessage[];
  attachments: TempAttachment[];
  addMessage: (message: TempMessage) => void;
  addMessages: (messages: TempMessage[]) => void;
  updateMessage: (messageId: string, updates: Partial<TempMessage>) => void;
  removeMessage: (messageId: string) => void;
  clearThread: (threadId: string) => void;
  clearAllMessages: () => void;

  // Attachment actions
  addAttachment: (attachment: TempAttachment) => void;
  addAttachments: (attachments: TempAttachment[]) => void;
  removeAttachment: (attachmentId: string) => void;
  clearThreadAttachments: (threadId: string) => void;

  // Tool-specific actions
  addTool: (messageId: string, tool: Tool) => void;
  updateTool: (
    messageId: string,
    toolCallId: string,
    updates: Partial<Tool>
  ) => void;

  // Convex-compatible attachment creation
  createAttachments: (args: {
    attachments: Array<{
      fileKey: string;
      attachmentUrl: string;
      threadId: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
      attachmentType: string;
    }>;
    messageId?: string;
  }) => Promise<
    Array<{
      _id: string;
      attachmentType: string;
      attachmentUrl: string;
      mimeType: string;
    }>
  >;
};

export const useTempMessageStore = create<InternalTempMessageStore>()(
  subscribeWithSelector((set, get) => ({
    messages: [],
    attachments: [],

    addMessage: (message) =>
      set((state) => ({
        messages: [...state.messages, message],
      })),

    addMessages: (messages) =>
      set((state) => ({
        messages: [...state.messages, ...messages],
      })),

    updateMessage: (messageId, updates) =>
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.messageId === messageId
            ? { ...msg, ...updates, updated_at: Date.now() }
            : msg
        ),
      })),

    removeMessage: (messageId) =>
      set((state) => ({
        messages: state.messages.filter((msg) => msg.messageId !== messageId),
      })),

    clearThread: (threadId) =>
      set((state) => ({
        messages: state.messages.filter((msg) => msg.threadId !== threadId),
        attachments: state.attachments.filter(
          (att) => att.threadId !== threadId
        ),
      })),

    clearAllMessages: () => set({ messages: [], attachments: [] }),

    // Attachment actions
    addAttachment: (attachment) =>
      set((state) => ({
        attachments: [...state.attachments, attachment],
      })),

    addAttachments: (attachments) =>
      set((state) => ({
        attachments: [...state.attachments, ...attachments],
      })),

    removeAttachment: (attachmentId) =>
      set((state) => ({
        attachments: state.attachments.filter(
          (att) => att._id !== attachmentId
        ),
      })),

    clearThreadAttachments: (threadId) =>
      set((state) => ({
        attachments: state.attachments.filter(
          (att) => att.threadId !== threadId
        ),
      })),

    // Convex-compatible attachment creation - same signature as hooks.mutations.createAttachments
    createAttachments: async (args) => {
      const attachmentsToAdd: TempAttachment[] = args.attachments.map(
        (attachmentData) => ({
          _id: crypto.randomUUID(),
          messageId: args.messageId,
          userId: "temp-user", // Will be set properly in createMessage
          threadId: attachmentData.threadId,
          attachmentType: attachmentData.attachmentType,
          attachmentUrl: attachmentData.attachmentUrl,
          fileName: attachmentData.fileName,
          mimeType: attachmentData.mimeType,
          fileSize: attachmentData.fileSize,
          fileKey: attachmentData.fileKey,
          status: "uploaded",
        })
      );

      // Add to store
      get().addAttachments(attachmentsToAdd);

      // Return same format as Convex mutation
      return attachmentsToAdd.map((att) => ({
        _id: att._id,
        attachmentType: att.attachmentType,
        attachmentUrl: att.attachmentUrl,
        mimeType: att.mimeType,
      }));
    },

    // Convex-compatible message query with attachments - same as api.messages.getByThreadId
    getMessagesByThreadId: (threadId) => {
      const state = get();

      // Get all messages for this thread
      const messages = state.messages
        .filter((msg) => msg.threadId === threadId)
        .sort((a, b) => a.created_at - b.created_at);

      // Check if ANY message has attachments
      const hasAttachments = messages.some(
        (message) => message.attachmentIds && message.attachmentIds.length > 0
      );

      // Early return for text-only threads
      if (!hasAttachments) {
        return messages.map((message) => ({
          messageId: message.messageId,
          content: message.content,
          role: message.role,
          attachmentIds: message.attachmentIds || [],
          attachments: [],
        }));
      }

      // Get all attachments for this thread
      const attachments = state.attachments.filter(
        (att) => att.threadId === threadId
      );

      // Create fast lookup map
      const attachmentMap = new Map();
      attachments.forEach((attachment) => {
        attachmentMap.set(attachment._id, attachment);
      });

      // Combine messages with their attachments
      return messages.map((message) => ({
        messageId: message.messageId,
        content: message.content,
        role: message.role,
        attachmentIds: message.attachmentIds || [],
        attachments: (message.attachmentIds || [])
          .map((id) => attachmentMap.get(id))
          .filter(Boolean),
      }));
    },

    addTool: (messageId, tool) =>
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.messageId === messageId
            ? { ...msg, tools: [...(msg.tools || []), tool] }
            : msg
        ),
      })),

    updateTool: (messageId, toolCallId, updates) =>
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.messageId === messageId
            ? {
                ...msg,
                tools: msg.tools?.map((tool) =>
                  tool.toolCallId === toolCallId
                    ? { ...tool, ...updates }
                    : tool
                ),
              }
            : msg
        ),
      })),
  }))
);

// A single shared, immutable empty array
const EMPTY: (Doc<"messages"> & { attachments: Doc<"attachments">[] })[] = [];

// Message conversion cache to maintain stable references for converted messages
const convertedMessageCache = new Map<
  string,
  {
    converted: Doc<"messages"> & { attachments: Doc<"attachments">[] };
    sourceHash: string;
  }
>();

// Helper to create a hash of the message content for change detection
const createMessageHash = (
  tempMsg: TempMessage,
  attachments: TempAttachment[]
): string => {
  const attachmentIds = (tempMsg.attachmentIds || []).join(",");
  const relevantAttachments = attachments
    .filter((att) => tempMsg.attachmentIds?.includes(att._id))
    .map((att) => `${att._id}:${att.fileName}`)
    .join("|");

  return `${tempMsg.content}:${tempMsg.status}:${tempMsg.updated_at}:${attachmentIds}:${relevantAttachments}`;
};

// temp→temp "convert" helper for streaming messages with caching
const convertTempToFullMessage = (
  tempMsg: TempMessage,
  attachments: TempAttachment[]
): Doc<"messages"> & { attachments: Doc<"attachments">[] } => {
  const messageHash = createMessageHash(tempMsg, attachments);
  const cacheKey = tempMsg.messageId;

  // Check if we have a cached version with the same content
  const cached = convertedMessageCache.get(cacheKey);
  if (cached && cached.sourceHash === messageHash) {
    return cached.converted;
  }

  // Create stable attachment array for this message
  const messageAttachments = (tempMsg.attachmentIds || [])
    .map((id) => attachments.find((att) => att._id === id))
    .filter((att): att is TempAttachment => att !== undefined)
    .map((att) => ({
      _id: att._id as Id<"attachments">,
      _creationTime: 0,
      messageId: att.messageId,
      publicMessageIds: undefined,
      userId: att.userId as Id<"users">,
      threadId: att.threadId,
      attachmentType: att.attachmentType,
      attachmentUrl: att.attachmentUrl,
      fileName: att.fileName,
      mimeType: att.mimeType,
      fileSize: att.fileSize,
      fileKey: att.fileKey,
      backfill: undefined,
      status: att.status,
    }));

  const converted = {
    _id: tempMsg.messageId as Id<"messages">,
    _creationTime: tempMsg.created_at,
    messageId: tempMsg.messageId,
    threadId: tempMsg.threadId,
    userId: "temp-user" as Id<"users">,
    role: tempMsg.role,
    content: tempMsg.content,
    status: tempMsg.status,
    reasoning: tempMsg.reasoning,
    model: tempMsg.model,
    created_at: tempMsg.created_at,
    updated_at: tempMsg.updated_at,
    tools: tempMsg.tools,
    attachmentIds: (tempMsg.attachmentIds || []) as Id<"attachments">[],
    attachments: messageAttachments,
    modelParams: undefined,
    providerMetadata: undefined,
    resumableStreamId: undefined,
    serverError: undefined,
    backfill: undefined,
  };

  // Cache the converted message
  convertedMessageCache.set(cacheKey, {
    converted,
    sourceHash: messageHash,
  });

  return converted;
};

// Selector caches to prevent infinite loops
const threadMessagesCache = new Map<
  string,
  { messages: TempMessage[]; lastUpdate: number }
>();
const threadAttachmentsCache = new Map<
  string,
  { attachments: TempAttachment[]; lastUpdate: number }
>();

// Stable selector for thread messages
const selectThreadMessages =
  (threadId: string) => (state: InternalTempMessageStore) => {
    const cacheKey = threadId;
    const cached = threadMessagesCache.get(cacheKey);

    // Get current messages for this thread
    const currentMessages = state.messages.filter(
      (msg) => msg.threadId === threadId
    );

    // If cache exists and messages haven't changed, return cached version
    if (cached && cached.messages.length === currentMessages.length) {
      // Quick check if messages are the same (by reference and length)
      const sameMessages = cached.messages.every(
        (cachedMsg, index) => cachedMsg === currentMessages[index]
      );
      if (sameMessages) {
        return cached.messages;
      }
    }

    // Update cache with new messages
    threadMessagesCache.set(cacheKey, {
      messages: currentMessages,
      lastUpdate: Date.now(),
    });

    return currentMessages;
  };

// Stable selector for thread attachments
const selectThreadAttachments =
  (threadId: string) => (state: InternalTempMessageStore) => {
    const cacheKey = threadId;
    const cached = threadAttachmentsCache.get(cacheKey);

    // Get current attachments for this thread
    const currentAttachments = state.attachments.filter(
      (att) => att.threadId === threadId
    );

    // If cache exists and attachments haven't changed, return cached version
    if (cached && cached.attachments.length === currentAttachments.length) {
      // Quick check if attachments are the same (by reference and length)
      const sameAttachments = cached.attachments.every(
        (cachedAtt, index) => cachedAtt === currentAttachments[index]
      );
      if (sameAttachments) {
        return cached.attachments;
      }
    }

    // Update cache with new attachments
    threadAttachmentsCache.set(cacheKey, {
      attachments: currentAttachments,
      lastUpdate: Date.now(),
    });

    return currentAttachments;
  };

/**
 * Manages temp messages with streaming optimization,
 * following the same pattern as useHybridMessages.
 *
 * This hook uses temp message status as the single source of truth:
 * - When assistant status is "streaming": show stable history + streaming temp message
 * - When assistant status is "done": show all temp messages as-is
 * - When loading: show nothing (simplified approach)
 */
export const useThreadMessages = (threadId: string) => {
  // Create stable selectors using useCallback
  const messagesSelector = useCallback(
    (state: InternalTempMessageStore) => selectThreadMessages(threadId)(state),
    [threadId]
  );
  const attachmentsSelector = useCallback(
    (state: InternalTempMessageStore) =>
      selectThreadAttachments(threadId)(state),
    [threadId]
  );

  // 1) Get all temp messages for this thread (with stable selector)
  const allTempMessages = useTempMessageStore(messagesSelector);

  // 2) Get all temp attachments for this thread (with stable selector)
  const allTempAttachments = useTempMessageStore(attachmentsSelector);

  // 3) Create stable sorted messages array
  const tempMessages = useMemo(() => {
    if (!allTempMessages || allTempMessages.length === 0) return [];
    return [...allTempMessages].sort((a, b) => a.created_at - b.created_at);
  }, [allTempMessages]);

  // 4) Find the streaming assistant in temp messages (if any) to get its messageId
  const streamingAssistant = useMemo(() => {
    if (!tempMessages || tempMessages.length === 0) return null;
    return (
      tempMessages.find(
        (m) => m.role === "assistant" && m.status === "streaming"
      ) || null
    );
  }, [tempMessages]);

  // 5) Get the specific streaming temp message by ID (this updates frequently)
  const streamingTempMessage = useTempMessage(
    streamingAssistant?.messageId || ""
  );

  // 6) Create stable history (non-streaming messages) - these should have stable references
  const stableHistory = useMemo(() => {
    if (!tempMessages || tempMessages.length === 0) return [];

    const historyMessages = streamingAssistant
      ? tempMessages.filter((m) => m.messageId !== streamingAssistant.messageId)
      : tempMessages;

    // Convert history messages - these will be cached and stable
    return historyMessages.map((tempMsg) =>
      convertTempToFullMessage(tempMsg, allTempAttachments)
    );
  }, [tempMessages, streamingAssistant, allTempAttachments]);

  return useMemo(() => {
    // If no messages, show empty
    if (!allTempMessages || allTempMessages.length === 0) {
      return EMPTY;
    }

    // → If temp assistant is in "streaming" status, show stable history + streaming temp
    if (streamingAssistant && streamingTempMessage) {
      // Add the streaming temp message (this is the only one that updates frequently)
      const streamingConverted = convertTempToFullMessage(
        streamingTempMessage,
        allTempAttachments
      );

      // Combine stable history + streaming message
      return [...stableHistory, streamingConverted];
    }

    // → Otherwise, no streaming messages, return the stable history
    return stableHistory;
  }, [
    allTempMessages,
    stableHistory,
    streamingAssistant,
    streamingTempMessage,
    allTempAttachments,
  ]);
};

// Get single message by ID - much more efficient than filtering
export const useTempMessage = (messageId: string) =>
  useTempMessageStore((state) =>
    state.messages.find((msg) => msg.messageId === messageId)
  );

// Individual action hooks for better performance
export const useAddMessage = () =>
  useTempMessageStore((state) => state.addMessage);

export const useAddMessages = () =>
  useTempMessageStore((state) => state.addMessages);

export const useUpdateMessage = () =>
  useTempMessageStore((state) => state.updateMessage);

export const useRemoveMessage = () =>
  useTempMessageStore((state) => state.removeMessage);

export const useClearThread = () =>
  useTempMessageStore((state) => state.clearThread);

// Tool-specific action hooks
export const useAddTool = () => useTempMessageStore((state) => state.addTool);

export const useUpdateTool = () =>
  useTempMessageStore((state) => state.updateTool);

// Attachment hooks
export const useThreadAttachments = (threadId: string) => {
  const attachments = useTempMessageStore((state) => state.attachments);

  return useMemo(
    () => attachments.filter((att) => att.threadId === threadId),
    [attachments, threadId]
  );
};
