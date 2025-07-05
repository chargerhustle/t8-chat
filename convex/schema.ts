import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export const ProviderMetadataValidator = v.optional(
  v.record(v.string(), v.any())
);

export const MessageStatusValidator = v.union(
  v.literal("waiting"),
  v.literal("thinking"),
  v.literal("streaming"),
  v.literal("done"),
  v.literal("error"),
  v.literal("error.rejected"),
  v.literal("deleted")
);

export const AgentCategoryValidator = v.union(
  v.literal("writing"),
  v.literal("research"),
  v.literal("productivity"),
  v.literal("education"),
  v.literal("business"),
  v.literal("entertainment"),
  v.literal("lifestyle"),
  v.literal("health"),
  v.literal("coding"),
  v.literal("other")
);

const applicationTables = {
  threads: defineTable({
    threadId: v.string(),
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessageAt: v.number(),
    generationStatus: v.union(
      v.literal("pending"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    visibility: v.union(v.literal("visible"), v.literal("archived")),
    userSetTitle: v.optional(v.boolean()),
    userId: v.id("users"), // Now references the auth users table
    model: v.string(),
    pinned: v.boolean(),
    branchParentThreadId: v.optional(v.id("threads")),
    branchParentPublicMessageId: v.optional(v.string()),
    backfill: v.optional(v.boolean()),
    agentId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_threadId", ["threadId"])
    .index("by_user_and_threadId", ["userId", "threadId"])
    .index("by_user_visibility_updatedAt", [
      "userId",
      "visibility",
      "updatedAt",
    ])
    .index("by_user_visibility_pinned", ["userId", "visibility", "pinned"])
    .index("by_agentId", ["agentId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId"],
    }),

  messages: defineTable({
    messageId: v.string(),
    threadId: v.string(),
    userId: v.id("users"),
    reasoning: v.optional(v.string()),
    content: v.string(),
    status: MessageStatusValidator,
    updated_at: v.optional(v.number()),
    branches: v.optional(v.array(v.id("threads"))),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    created_at: v.number(),
    serverError: v.optional(
      v.object({
        type: v.string(),
        message: v.string(),
      })
    ),
    model: v.string(),
    attachmentIds: v.array(v.id("attachments")),
    modelParams: v.optional(
      v.object({
        temperature: v.optional(v.number()),
        topP: v.optional(v.number()),
        topK: v.optional(v.number()),
        reasoningEffort: v.optional(
          v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
        ),
        includeSearch: v.optional(v.boolean()),
      })
    ),
    providerMetadata: v.optional(ProviderMetadataValidator),
    resumableStreamId: v.optional(v.string()),
    backfill: v.optional(v.boolean()),
    tools: v.optional(
      v.array(
        v.object({
          toolCallId: v.string(),
          toolName: v.string(),
          args: v.any(), // Tool arguments
          result: v.optional(v.any()), // Tool result
          state: v.union(
            v.literal("streaming-start"), // Tool call started
            v.literal("streaming-delta"), // Tool args streaming
            v.literal("call"), // Tool call complete
            v.literal("result") // Tool result received
          ),
          timestamp: v.number(),
        })
      )
    ),
    parts: v.optional(
      v.array(
        v.union(
          v.object({
            type: v.literal("text"),
            text: v.string(),
            timestamp: v.number(),
          }),
          v.object({
            type: v.literal("tool"),
            toolCallId: v.string(),
            toolName: v.string(),
            args: v.any(), // Tool arguments
            result: v.optional(v.any()), // Tool result
            state: v.union(
              v.literal("streaming-start"), // Tool call started
              v.literal("streaming-delta"), // Tool args streaming
              v.literal("call"), // Tool call complete
              v.literal("result") // Tool result received
            ),
            timestamp: v.number(),
          })
        )
      )
    ),
  })
    .index("by_threadId", ["threadId"])
    .index("by_thread_and_userid", ["threadId", "userId"])
    .index("by_messageId_and_userId", ["messageId", "userId"])
    .index("by_user", ["userId"])
    .index("by_userId_and_streamId", ["userId", "resumableStreamId"])
    .index("by_threadId_and_created_at", ["threadId", "created_at"]),

  attachments: defineTable({
    messageId: v.optional(v.string()), // Store the messageId string UUID
    publicMessageIds: v.optional(v.array(v.id("messages"))), // Keep for backward compatibility during migration
    userId: v.id("users"), // Now references the auth users table
    threadId: v.string(), // Add threadId for efficient querying
    attachmentType: v.string(),
    attachmentUrl: v.string(),
    fileName: v.string(),
    mimeType: v.string(),
    fileSize: v.number(),
    fileKey: v.string(),
    backfill: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("deleted"), v.literal("uploaded"))),
    agentId: v.optional(v.string()),
  })
    .index("by_fileKey", ["fileKey"])
    .index("by_userId", ["userId"])
    .index("by_userId_and_fileKey", ["userId", "fileKey"])
    .index("by_threadId", ["threadId"])
    .index("by_messageId", ["messageId"])
    .index("by_agentId", ["agentId"]),

  userConfiguration: defineTable({
    userId: v.id("users"), // Now references the auth users table
    hasMigrated: v.optional(v.boolean()),
    customization: v.optional(
      v.object({
        name: v.string(),
        occupation: v.string(),
        traits: v.string(),
        additionalInfo: v.string(),
      })
    ),
    memories: v.optional(
      v.array(
        v.object({
          id: v.string(),
          content: v.string(),
          createdAt: v.number(),
        })
      )
    ),
    preferences: v.optional(
      v.object({
        memoriesEnabled: v.boolean(),
        hidePersonalInfo: v.boolean(),
        statsForNerds: v.boolean(),
      })
    ),
  }).index("by_userId", ["userId"]),

  agents: defineTable({
    agentId: v.string(),
    name: v.string(),
    description: v.string(),
    systemPrompt: v.string(),
    avatarUrl: v.optional(v.string()),
    avatarFileKey: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.id("users"),
    isPublic: v.boolean(),
    fileIds: v.array(v.id("attachments")),
    tags: v.optional(v.array(v.string())),
    category: AgentCategoryValidator,
    usageCount: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_agentId", ["agentId"])
    .index("by_public", ["isPublic"])
    .index("by_userId_and_agentId", ["userId", "agentId"])
    .index("by_category", ["category"])
    .index("by_public_and_category", ["isPublic", "category"])
    .searchIndex("search_name_description", {
      searchField: "name",
      filterFields: ["isPublic", "category"],
    }),
};

export default defineSchema({
  ...authTables, // Adds users, authSessions, authAccounts tables
  ...applicationTables,
});
