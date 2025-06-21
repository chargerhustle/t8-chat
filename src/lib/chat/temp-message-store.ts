import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useMemo } from "react";

export type Tool = {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  state: "streaming-start" | "streaming-delta" | "call" | "result";
  timestamp: number;
};

export type TempMessage = {
  messageId: string;
  threadId: string;
  content: string;
  role: "assistant";
  status: "streaming" | "done" | "error";
  reasoning?: string;
  model: string; // Add model field to track which model is being used
  created_at: number;
  updated_at: number;
  tools?: Tool[];
};

// Internal store type
type InternalTempMessageStore = {
  messages: TempMessage[];

  // Actions
  addMessage: (message: TempMessage) => void;
  addMessages: (messages: TempMessage[]) => void;
  updateMessage: (messageId: string, updates: Partial<TempMessage>) => void;
  removeMessage: (messageId: string) => void;
  clearThread: (threadId: string) => void;
  clearAllMessages: () => void;

  // Tool-specific actions
  addTool: (messageId: string, tool: Tool) => void;
  updateTool: (
    messageId: string,
    toolCallId: string,
    updates: Partial<Tool>
  ) => void;
};

// Public interface
export type TempMessageStore = {
  messages: TempMessage[];
  addMessage: (message: TempMessage) => void;
  addMessages: (messages: TempMessage[]) => void;
  updateMessage: (messageId: string, updates: Partial<TempMessage>) => void;
  removeMessage: (messageId: string) => void;
  clearThread: (threadId: string) => void;
  clearAllMessages: () => void;

  // Tool-specific actions
  addTool: (messageId: string, tool: Tool) => void;
  updateTool: (
    messageId: string,
    toolCallId: string,
    updates: Partial<Tool>
  ) => void;
};

export const useTempMessageStore = create<InternalTempMessageStore>()(
  subscribeWithSelector((set) => ({
    messages: [],

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
      })),

    clearAllMessages: () => set({ messages: [] }),

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

// Optimized hook that returns stable references
export const useThreadMessages = (threadId: string) => {
  const messages = useTempMessageStore((state) => state.messages);

  return useMemo(
    () =>
      messages
        .filter((msg) => msg.threadId === threadId)
        .sort((a, b) => a.created_at - b.created_at),
    [messages, threadId]
  );
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
