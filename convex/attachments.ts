import { v } from "convex/values";
import { query, mutation, internalMutation, action } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { R2 } from "@convex-dev/r2";
import { DataModel, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

const r2 = new R2(components.r2);

export const {
  generateUploadUrl,
  syncMetadata,
  getMetadata,
  listMetadata,
  deleteObject,
  onSyncMetadata,
} = r2.clientApi<DataModel>({
  // Check if user can upload files
  checkUpload: async (ctx, bucket) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
  },

  // Check if user can read a specific file
  checkReadKey: async (ctx, bucket, key) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user owns this attachment
    const attachment = await ctx.db
      .query("attachments")
      .withIndex("by_fileKey", (q) => q.eq("fileKey", key))
      .first();

    if (attachment && attachment.userId !== userId) {
      throw new Error("Not authorized to access this file");
    }
  },

  // Check if user can read bucket contents
  checkReadBucket: async (ctx, bucket) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
  },

  // Check if user can delete a file
  checkDelete: async (ctx, bucket, key) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user owns this attachment
    const attachment = await ctx.db
      .query("attachments")
      .withIndex("by_fileKey", (q) => q.eq("fileKey", key))
      .first();

    if (attachment && attachment.userId !== userId) {
      throw new Error("Not authorized to delete this file");
    }
  },

  // Called after successful upload
  onUpload: async (ctx, bucket, key) => {
    // This will be handled in the createAttachment mutation
    // since we need additional metadata like threadId, fileName, etc.
  },

  // Called after successful deletion
  onDelete: async (ctx, bucket, key) => {
    // Mark attachment as deleted in database
    const attachment = await ctx.db
      .query("attachments")
      .withIndex("by_fileKey", (q) => q.eq("fileKey", key))
      .first();

    if (attachment) {
      await ctx.db.patch(attachment._id, {
        status: "deleted",
      });
    }
  },

  // Called after metadata sync
  onSyncMetadata: async (ctx, args) => {
    console.log("Attachment metadata synced:", args);
  },
});

/**
 * Create an attachment record in the database after successful upload
 */
export const createAttachment = mutation({
  args: {
    fileKey: v.string(),
    threadId: v.string(),
    fileName: v.string(),
    mimeType: v.string(),
    fileSize: v.number(),
    attachmentType: v.string(),
  },
  returns: v.id("attachments"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the file URL from R2
    const attachmentUrl = await r2.getUrl(args.fileKey);

    const attachmentId = await ctx.db.insert("attachments", {
      publicMessageIds: [],
      userId: userId,
      threadId: args.threadId,
      attachmentType: args.attachmentType,
      attachmentUrl,
      fileName: args.fileName,
      mimeType: args.mimeType,
      fileSize: args.fileSize,
      fileKey: args.fileKey,
      status: "uploaded",
    });

    return attachmentId;
  },
});

/**
 * Get attachments for a specific user
 */
export const getAttachmentsByUser = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("attachments"),
      threadId: v.string(),
      fileName: v.string(),
      mimeType: v.string(),
      fileSize: v.number(),
      attachmentType: v.string(),
      attachmentUrl: v.string(),
      status: v.optional(v.union(v.literal("deleted"), v.literal("uploaded"))),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const query = ctx.db
      .query("attachments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("status"), "deleted"))
      .order("desc");

    const attachments = args.limit
      ? await query.take(args.limit)
      : await query.collect();

    // Generate fresh URLs for each attachment
    return Promise.all(
      attachments.map(async (attachment) => ({
        _id: attachment._id,
        threadId: attachment.threadId,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        fileSize: attachment.fileSize,
        attachmentType: attachment.attachmentType,
        attachmentUrl: await r2.getUrl(attachment.fileKey),
        status: attachment.status,
      }))
    );
  },
});

/**
 * Get a specific attachment by ID
 */
export const getAttachment = query({
  args: {
    attachmentId: v.id("attachments"),
  },
  returns: v.union(
    v.object({
      _id: v.id("attachments"),
      threadId: v.string(),
      fileName: v.string(),
      mimeType: v.string(),
      fileSize: v.number(),
      attachmentType: v.string(),
      attachmentUrl: v.string(),
      status: v.optional(v.union(v.literal("deleted"), v.literal("uploaded"))),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const attachment = await ctx.db.get(args.attachmentId);
    if (!attachment) {
      return null;
    }

    // Check if user owns this attachment
    if (attachment.userId !== userId) {
      throw new Error("Not authorized to access this attachment");
    }

    if (attachment.status === "deleted") {
      return null;
    }

    return {
      _id: attachment._id,
      threadId: attachment.threadId,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize,
      attachmentType: attachment.attachmentType,
      attachmentUrl: await r2.getUrl(attachment.fileKey),
      status: attachment.status,
    };
  },
});

/**
 * Delete an attachment
 */
export const deleteAttachment = mutation({
  args: {
    attachmentId: v.id("attachments"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const attachment = await ctx.db.get(args.attachmentId);
    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // Check if user owns this attachment
    if (attachment.userId !== userId) {
      throw new Error("Not authorized to delete this attachment");
    }

    // Delete from R2 using the r2 instance method
    await r2.deleteObject(ctx, attachment.fileKey);

    // Mark as deleted in database
    await ctx.db.patch(attachment._id, {
      status: "deleted",
    });

    return null;
  },
});

/**
 * Associate an attachment with a message
 */
export const addAttachmentToMessage = mutation({
  args: {
    attachmentId: v.id("attachments"),
    messageId: v.id("messages"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const attachment = await ctx.db.get(args.attachmentId);
    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // Check if user owns this attachment
    if (attachment.userId !== userId) {
      throw new Error("Not authorized to modify this attachment");
    }

    // Add message ID to the attachment's publicMessageIds array
    const updatedMessageIds = [...attachment.publicMessageIds];
    if (!updatedMessageIds.includes(args.messageId)) {
      updatedMessageIds.push(args.messageId);
    }

    await ctx.db.patch(args.attachmentId, {
      publicMessageIds: updatedMessageIds,
    });

    return null;
  },
});

/**
 * Remove an attachment from a message
 */
export const removeAttachmentFromMessage = mutation({
  args: {
    attachmentId: v.id("attachments"),
    messageId: v.id("messages"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const attachment = await ctx.db.get(args.attachmentId);
    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // Check if user owns this attachment
    if (attachment.userId !== userId) {
      throw new Error("Not authorized to modify this attachment");
    }

    // Remove message ID from the attachment's publicMessageIds array
    const updatedMessageIds = attachment.publicMessageIds.filter(
      (id) => id !== args.messageId
    );

    await ctx.db.patch(args.attachmentId, {
      publicMessageIds: updatedMessageIds,
    });

    return null;
  },
});

/**
 * Get file metadata from R2
 */
export const getFileMetadata = query({
  args: {
    fileKey: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user owns this file
    const attachment = await ctx.db
      .query("attachments")
      .withIndex("by_fileKey", (q) => q.eq("fileKey", args.fileKey))
      .first();

    if (!attachment || attachment.userId !== userId) {
      throw new Error("Not authorized to access this file");
    }

    return await r2.getMetadata(ctx, args.fileKey);
  },
});
