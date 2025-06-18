import { v } from "convex/values";
import { query, mutation, internalMutation, action } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { R2 } from "@convex-dev/r2";
import { DataModel, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

const r2 = new R2(components.r2);

// Public endpoint for serving R2 files directly (no signed URLs)
const R2_PUBLIC_ENDPOINT = process.env.R2_PUBLIC_ENDPOINT ?? "";

/**
 * Build a permanent, publicly accessible URL for an object in the R2 bucket.
 * Requires the bucket to have public access enabled and the `R2_PUBLIC_ENDPOINT`
 * environment variable set (e.g. "https://my-bucket.r2.dev").
 */
function buildPublicUrl(key: string): string {
  if (!R2_PUBLIC_ENDPOINT) {
    throw new Error(
      "R2_PUBLIC_ENDPOINT env variable must be set to serve public R2 objects"
    );
  }
  // Ensure we don\'t end up with a double slash when concatenating.
  const base = R2_PUBLIC_ENDPOINT.replace(/\/$/, "");
  return `${base}/${key}`;
}

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
 * Create multiple attachment records in the database after successful upload
 * Optimized batch version of createAttachment
 */
export const createAttachments = mutation({
  args: {
    attachments: v.array(
      v.object({
        fileKey: v.string(),
        attachmentUrl: v.string(), // Accept pre-built URL
        threadId: v.string(),
        fileName: v.string(),
        mimeType: v.string(),
        fileSize: v.number(),
        attachmentType: v.string(),
      })
    ),
    messageId: v.optional(v.string()), // Add messageId parameter (string UUID)
  },
  returns: v.array(
    v.object({
      _id: v.id("attachments"),
      attachmentType: v.string(),
      attachmentUrl: v.string(),
      mimeType: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Prepare all documents for insertion
    const docs = args.attachments.map((attachmentData) => ({
      messageId: args.messageId, // Set the messageId if provided
      userId: userId,
      threadId: attachmentData.threadId,
      attachmentType: attachmentData.attachmentType,
      attachmentUrl: attachmentData.attachmentUrl, // Use pre-built URL
      fileName: attachmentData.fileName,
      mimeType: attachmentData.mimeType,
      fileSize: attachmentData.fileSize,
      fileKey: attachmentData.fileKey,
      status: "uploaded" as const,
    }));

    // Parallelize all inserts
    const ids = await Promise.all(
      docs.map((doc) => ctx.db.insert("attachments", doc))
    );

    // Return only the minimal data needed for API calls
    return ids.map((id, i) => ({
      _id: id,
      attachmentType: docs[i].attachmentType,
      attachmentUrl: docs[i].attachmentUrl,
      mimeType: docs[i].mimeType,
    }));
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

    // Build a permanent public URL (no TTL)
    const attachmentUrl = buildPublicUrl(args.fileKey);

    const attachmentId = await ctx.db.insert("attachments", {
      messageId: undefined, // Will be set when attachment is associated with a message
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

    // Return attachment data directly from database fields
    return attachments.map((attachment) => ({
      _id: attachment._id,
      threadId: attachment.threadId,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize,
      attachmentType: attachment.attachmentType,
      attachmentUrl: attachment.attachmentUrl,
      status: attachment.status,
    }));
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
      attachmentUrl: buildPublicUrl(attachment.fileKey),
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

    // Set the message ID for this attachment (one-to-one relationship)
    await ctx.db.patch(args.attachmentId, {
      messageId: args.messageId,
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

    // Remove the message ID from this attachment (set to undefined)
    await ctx.db.patch(args.attachmentId, {
      messageId: undefined,
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

/**
 * Delete multiple attachments in bulk
 */
export const deleteAttachments = mutation({
  args: {
    attachmentIds: v.array(v.id("attachments")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get all attachments to verify ownership and collect file keys
    const attachments = await Promise.all(
      args.attachmentIds.map((id) => ctx.db.get(id))
    );

    // Verify all attachments exist and user owns them
    for (const attachment of attachments) {
      if (!attachment) {
        throw new Error("One or more attachments not found");
      }
      if (attachment.userId !== userId) {
        throw new Error("Not authorized to delete one or more attachments");
      }
    }

    // Delete files from R2 storage
    await Promise.all(
      attachments.map((attachment) =>
        attachment
          ? r2.deleteObject(ctx, attachment.fileKey)
          : Promise.resolve()
      )
    );

    // Remove attachment references from messages using the messageId field
    // Get unique message IDs from the attachments we're deleting
    const messageIds = [
      ...new Set(
        attachments
          .map((att) => att?.messageId)
          .filter(Boolean) as Array<string>
      ),
    ];

    // Update each affected message to remove the deleted attachment IDs
    await Promise.all(
      messageIds.map(async (messageId) => {
        // Find message by messageId string field
        const message = await ctx.db
          .query("messages")
          .withIndex("by_messageId_and_userId", (q) =>
            q.eq("messageId", messageId).eq("userId", userId)
          )
          .first();

        if (!message) return;

        const updatedAttachmentIds =
          message.attachmentIds?.filter(
            (id) => !args.attachmentIds.includes(id)
          ) || [];

        await ctx.db.patch(message._id, {
          attachmentIds: updatedAttachmentIds,
        });
      })
    );

    // Mark attachments as deleted in database
    await Promise.all(
      args.attachmentIds.map((attachmentId) =>
        ctx.db.patch(attachmentId, { status: "deleted" })
      )
    );

    return null;
  },
});
