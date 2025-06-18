import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Hook that provides all Convex mutations and queries needed for creating messages
 * This replaces direct CONVEX_CLIENT calls with proper React hooks for better
 * integration, optimistic updates, loading states, and error handling
 */
export function useCreateMessage() {
  // Convex mutations with optimistic updates for instant UI feedback
  const createThread = useMutation(
    api.threads.createThread
  ).withOptimisticUpdate((localStore, args) => {
    // Optimistically add the new thread to the threads list
    const existingThreads = localStore.getQuery(api.threads.get);
    if (existingThreads !== undefined) {
      const now = Date.now();
      const newThread = {
        _id: crypto.randomUUID() as Id<"threads">,
        _creationTime: now,
        threadId: args.threadId,
        title: args.title || "New Thread",
        createdAt: now,
        updatedAt: now,
        lastMessageAt: now,
        generationStatus: "pending" as const,
        visibility: "visible" as const,
        userSetTitle: false,
        userId: "temp-user" as Id<"users">, // Will be replaced with real user ID
        model: args.model,
        pinned: false,
      };

      // Handle both null (first time user) and existing threads
      const currentThreads = existingThreads || [];
      localStore.setQuery(api.threads.get, {}, [newThread, ...currentThreads]);
    }
  });

  const createAttachments = useMutation(api.attachments.createAttachments);

  const addMessagesToThread = useMutation(
    api.messages.addMessagesToThread
  ).withOptimisticUpdate((localStore, args) => {
    // Optimistically add the messages to the thread's message list
    const existingMessages = localStore.getQuery(api.messages.getByThreadId, {
      threadId: args.threadId,
    });

    if (existingMessages !== undefined) {
      // Convert the new messages to the expected format
      const newMessages = args.messages.map((message) => ({
        _id: message.messageId as Id<"messages">,
        _creationTime: message.created_at,
        userId: "temp-user" as Id<"users">, // Will be replaced with real user ID
        threadId: args.threadId,
        messageId: message.messageId,
        content: message.content,
        role: message.role,
        status: message.status,
        model: message.model,
        created_at: message.created_at,
        updated_at: message.updated_at,
        attachmentIds: message.attachmentIds || [],
        attachments: [], // Empty for optimistic update
        modelParams: message.modelParams || {},
        providerMetadata: undefined,
        resumableStreamId: undefined,
        serverError: undefined,
        backfill: undefined,
        reasoning: undefined,
      }));

      // Add the new messages to the existing list, maintaining order
      const currentMessages = existingMessages || [];
      localStore.setQuery(
        api.messages.getByThreadId,
        { threadId: args.threadId },
        [...currentMessages, ...newMessages]
      );
    }
  });

  const updateMessage = useMutation(api.messages.updateMessage);

  const updateThread = useMutation(api.threads.updateThread);
  const setErrorMessage = useMutation(api.messages.setErrorMessage);

  // Convex queries - these are reactive and cached
  const currentUser = useQuery(api.auth.getCurrentUser);
  const userCustomization = useQuery(api.auth.getUserCustomization);

  return {
    // Mutations for database operations
    mutations: {
      createThread,
      createAttachments,
      addMessagesToThread,
      updateMessage,
      updateThread,
      setErrorMessage,
    },
    // Queries for data fetching
    queries: {
      currentUser,
      userCustomization,
    },
    // Computed states
    isLoading: currentUser === undefined,
    isAuthenticated: !!currentUser,
  };
}

// Type helper for the hook return value
export type CreateMessageHooks = ReturnType<typeof useCreateMessage>;
