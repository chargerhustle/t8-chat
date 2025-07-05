import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { AgentCategoryValidator } from "./schema";

export const createAgent = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    systemPrompt: v.string(),
    avatarUrl: v.optional(v.string()),
    avatarFileKey: v.optional(v.string()),
    isPublic: v.boolean(),
    tags: v.optional(v.array(v.string())),
    category: AgentCategoryValidator,
    files: v.optional(
      v.array(
        v.object({
          fileKey: v.string(),
          attachmentUrl: v.string(),
          fileName: v.string(),
          mimeType: v.string(),
          fileSize: v.number(),
          attachmentType: v.string(),
        })
      )
    ),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (!args.name.trim()) {
      throw new Error("Agent name is required");
    }

    if (!args.description.trim()) {
      throw new Error("Agent description is required");
    }

    if (!args.systemPrompt.trim()) {
      throw new Error("System prompt is required");
    }

    const agentId = crypto.randomUUID();
    const now = Date.now();

    // Create agent record
    const _id = await ctx.db.insert("agents", {
      agentId,
      name: args.name.trim(),
      description: args.description.trim(),
      systemPrompt: args.systemPrompt.trim(),
      avatarUrl: args.avatarUrl,
      avatarFileKey: args.avatarFileKey,
      createdAt: now,
      updatedAt: now,
      userId,
      isPublic: args.isPublic,
      fileIds: [], // Will be updated after creating attachments
      tags: args.tags,
      category: args.category,
      usageCount: 0,
    });

    // Create attachments if files provided
    const attachmentIds: Id<"attachments">[] = [];
    if (args.files && args.files.length > 0) {
      for (const fileData of args.files) {
        const attachmentId = await ctx.db.insert("attachments", {
          userId: userId,
          threadId: "", // Agent files don't belong to any thread
          attachmentType: fileData.attachmentType,
          attachmentUrl: fileData.attachmentUrl,
          fileName: fileData.fileName,
          mimeType: fileData.mimeType,
          fileSize: fileData.fileSize,
          fileKey: fileData.fileKey,
          status: "uploaded" as const,
          agentId: agentId,
        });
        attachmentIds.push(attachmentId);
      }

      // Update agent with attachment IDs
      await ctx.db.patch(_id, {
        fileIds: attachmentIds,
      });
    }

    return agentId;
  },
});

export const updateAgent = mutation({
  args: {
    agentId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    avatarFileKey: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    fileIds: v.optional(v.array(v.id("attachments"))),
    tags: v.optional(v.array(v.string())),
    category: v.optional(AgentCategoryValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const agent = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();

    if (!agent) {
      throw new Error("Agent not found");
    }

    if (agent.userId !== userId) {
      throw new Error("Not authorized to update this agent");
    }

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      if (!args.name.trim()) {
        throw new Error("Agent name cannot be empty");
      }
      updates.name = args.name.trim();
    }

    if (args.description !== undefined) {
      if (!args.description.trim()) {
        throw new Error("Agent description cannot be empty");
      }
      updates.description = args.description.trim();
    }

    if (args.systemPrompt !== undefined) {
      if (!args.systemPrompt.trim()) {
        throw new Error("System prompt cannot be empty");
      }
      updates.systemPrompt = args.systemPrompt.trim();
    }

    if (args.avatarUrl !== undefined) {
      updates.avatarUrl = args.avatarUrl;
    }

    if (args.avatarFileKey !== undefined) {
      updates.avatarFileKey = args.avatarFileKey;
    }

    if (args.isPublic !== undefined) {
      updates.isPublic = args.isPublic;
    }

    if (args.fileIds !== undefined) {
      updates.fileIds = args.fileIds;
    }

    if (args.tags !== undefined) {
      updates.tags = args.tags;
    }

    if (args.category !== undefined) {
      updates.category = args.category;
    }

    await ctx.db.patch(agent._id, updates);

    return null;
  },
});

export const deleteAgent = mutation({
  args: {
    agentId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const agent = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();

    if (!agent) {
      throw new Error("Agent not found");
    }

    if (agent.userId !== userId) {
      throw new Error("Not authorized to delete this agent");
    }

    // Get all files associated with this agent
    const agentFiles = await ctx.db
      .query("attachments")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .collect();

    // Delete each file from R2 and mark as deleted in database
    for (const file of agentFiles) {
      try {
        // Use existing deleteAttachment mutation for proper cleanup
        await ctx.runMutation(api.attachments.deleteAttachment, {
          attachmentId: file._id,
        });
      } catch (error) {
        console.error(`Failed to delete file ${file.fileName}:`, error);
        // Continue with other files even if one fails
      }
    }

    // Delete the agent record
    await ctx.db.delete(agent._id);

    return null;
  },
});

/**
 * Get a single agent by agentId with all its files
 */
export const getAgentById = query({
  args: {
    agentId: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
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
      tags: v.optional(v.array(v.string())),
      category: AgentCategoryValidator,
      usageCount: v.number(),
      files: v.array(
        v.object({
          _id: v.id("attachments"),
          fileName: v.string(),
          mimeType: v.string(),
          fileSize: v.number(),
          attachmentUrl: v.string(),
          fileKey: v.string(),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get the agent
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();

    if (!agent) {
      return null;
    }

    // Check access: user can see their own agents or public agents
    if (agent.userId !== userId && !agent.isPublic) {
      return null;
    }

    // Get all files for this agent
    const files = await ctx.db
      .query("attachments")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .collect();

    return {
      agentId: agent.agentId,
      name: agent.name,
      description: agent.description,
      systemPrompt: agent.systemPrompt,
      avatarUrl: agent.avatarUrl,
      avatarFileKey: agent.avatarFileKey,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      userId: agent.userId,
      isPublic: agent.isPublic,
      tags: agent.tags,
      category: agent.category,
      usageCount: agent.usageCount,
      files: files.map((file) => ({
        _id: file._id,
        fileName: file.fileName,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
        attachmentUrl: file.attachmentUrl,
        fileKey: file.fileKey,
      })),
    };
  },
});

/**
 * Get all agents owned by a user
 */
export const getAgentsByUser = query({
  args: {},
  returns: v.array(
    v.object({
      agentId: v.string(),
      name: v.string(),
      description: v.string(),
      avatarUrl: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      isPublic: v.boolean(),
      tags: v.optional(v.array(v.string())),
      category: AgentCategoryValidator,
      usageCount: v.number(),
      fileCount: v.number(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get all agents owned by the user
    const agents = await ctx.db
      .query("agents")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return agents.map((agent) => ({
      agentId: agent.agentId,
      name: agent.name,
      description: agent.description,
      avatarUrl: agent.avatarUrl,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      isPublic: agent.isPublic,
      tags: agent.tags,
      category: agent.category,
      usageCount: agent.usageCount,
      fileCount: agent.fileIds.length,
    }));
  },
});

/**
 * Get all public agents (marketplace)
 */
export const getPublicAgents = query({
  args: {
    limit: v.optional(v.number()),
    sortBy: v.optional(v.union(v.literal("recent"), v.literal("popular"))),
    category: v.optional(AgentCategoryValidator),
  },
  returns: v.array(
    v.object({
      agentId: v.string(),
      name: v.string(),
      description: v.string(),
      avatarUrl: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      userId: v.id("users"),
      tags: v.optional(v.array(v.string())),
      category: AgentCategoryValidator,
      usageCount: v.number(),
      fileCount: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Use category-specific index if category filter is provided
    const agents = args.category
      ? await ctx.db
          .query("agents")
          .withIndex("by_public_and_category", (q) =>
            q.eq("isPublic", true).eq("category", args.category!)
          )
          .order("desc")
          .take(args.limit || 50)
      : await ctx.db
          .query("agents")
          .withIndex("by_public", (q) => q.eq("isPublic", true))
          .order("desc")
          .take(args.limit || 50);

    // Sort by usage count if requested
    const sortedAgents =
      args.sortBy === "popular"
        ? agents.sort((a, b) => b.usageCount - a.usageCount)
        : agents; // Default is recent (already sorted by creation time desc)

    return sortedAgents.map((agent) => ({
      agentId: agent.agentId,
      name: agent.name,
      description: agent.description,
      avatarUrl: agent.avatarUrl,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      userId: agent.userId,
      tags: agent.tags,
      category: agent.category,
      usageCount: agent.usageCount,
      fileCount: agent.fileIds.length,
    }));
  },
});

/**
 * Search agents by name/description
 */
export const searchAgents = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      agentId: v.string(),
      name: v.string(),
      description: v.string(),
      avatarUrl: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
      userId: v.id("users"),
      tags: v.optional(v.array(v.string())),
      category: AgentCategoryValidator,
      usageCount: v.number(),
      fileCount: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // If query is empty, return empty results
    if (!args.query.trim()) {
      return [];
    }

    // Search public agents by name
    const results = await ctx.db
      .query("agents")
      .withSearchIndex("search_name_description", (q) =>
        q.search("name", args.query).eq("isPublic", true)
      )
      .take(args.limit || 10);

    return results.map((agent) => ({
      agentId: agent.agentId,
      name: agent.name,
      description: agent.description,
      avatarUrl: agent.avatarUrl,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      userId: agent.userId,
      tags: agent.tags,
      category: agent.category,
      usageCount: agent.usageCount,
      fileCount: agent.fileIds.length,
    }));
  },
});
