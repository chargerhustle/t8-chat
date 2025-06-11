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
    backfill: v.optional(v.boolean()),
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
  })
    .index("by_threadId", ["threadId"])
    .index("by_thread_and_userid", ["threadId", "userId"])
    .index("by_messageId_and_userId", ["messageId", "userId"])
    .index("by_user", ["userId"])
    .index("by_userId_and_streamId", ["userId", "resumableStreamId"]),

  attachments: defineTable({
    publicMessageIds: v.array(v.id("messages")),
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
  })
    .index("by_fileKey", ["fileKey"])
    .index("by_userId", ["userId"])
    .index("by_userId_and_fileKey", ["userId", "fileKey"])
    .index("by_threadId", ["threadId"]),

  userConfiguration: defineTable({
    userId: v.id("users"), // Now references the auth users table
    hasMigrated: v.optional(v.boolean()),
  }).index("by_userId", ["userId"]),
};

export default defineSchema({
  ...authTables, // Adds users, authSessions, authAccounts tables
  ...applicationTables,
});
