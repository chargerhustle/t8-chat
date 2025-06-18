import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

export const saveUserCustomization = mutation({
  args: {
    name: v.string(),
    occupation: v.string(),
    traits: v.string(),
    additionalInfo: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const customization = {
      name: args.name,
      occupation: args.occupation,
      traits: args.traits,
      additionalInfo: args.additionalInfo,
    };

    // Check if user configuration already exists
    const existingConfig = await ctx.db
      .query("userConfiguration")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingConfig) {
      // Update existing configuration
      await ctx.db.patch(existingConfig._id, { customization });
    } else {
      // Create new configuration
      await ctx.db.insert("userConfiguration", {
        userId,
        customization,
      });
    }

    return null;
  },
});

export const getUserCustomization = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      name: v.string(),
      occupation: v.string(),
      traits: v.string(),
      additionalInfo: v.string(),
    })
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const userConfig = await ctx.db
      .query("userConfiguration")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    return userConfig?.customization || null;
  },
});

export const deleteAccount = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Helper function to delete documents in batches with pagination
    const deleteAllDocuments = async (tableName: string, indexName: string) => {
      let hasMore = true;
      let deletedCount = 0;

      while (hasMore) {
        // Get a batch of documents (up to 1000)
        const batch = await ctx.db
          .query(tableName as any)
          .withIndex(indexName as any, (q: any) => q.eq("userId", userId))
          .take(1000);

        if (batch.length === 0) {
          hasMore = false;
          break;
        }

        // Delete all documents in this batch using Promise.all for parallel execution
        await Promise.all(batch.map((doc) => ctx.db.delete(doc._id)));
        deletedCount += batch.length;

        // If we got less than 1000, we're done
        if (batch.length < 1000) {
          hasMore = false;
        }
      }

      return deletedCount;
    };

    try {
      // Delete all user data in parallel
      const [
        threadsDeleted,
        messagesDeleted,
        attachmentsDeleted,
        userConfigDeleted,
        authSessionsDeleted,
        authAccountsDeleted,
      ] = await Promise.all([
        deleteAllDocuments("threads", "by_user"),
        deleteAllDocuments("messages", "by_user"),
        deleteAllDocuments("attachments", "by_userId"),
        deleteAllDocuments("userConfiguration", "by_userId"),
        // Auth tables don't have indexes, so we'll handle them separately
        (async () => {
          const authSessions = await ctx.db
            .query("authSessions")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();
          await Promise.all(
            authSessions.map((session) => ctx.db.delete(session._id))
          );
          return authSessions.length;
        })(),
        (async () => {
          const authAccounts = await ctx.db
            .query("authAccounts")
            .filter((q) => q.eq(q.field("userId"), userId))
            .collect();
          await Promise.all(
            authAccounts.map((account) => ctx.db.delete(account._id))
          );
          return authAccounts.length;
        })(),
      ]);

      // Finally, delete the user record
      await ctx.db.delete(userId);

      console.log(
        `Account deletion completed: ${threadsDeleted} threads, ${messagesDeleted} messages, ${attachmentsDeleted} attachments, ${userConfigDeleted} configs, ${authSessionsDeleted} sessions, ${authAccountsDeleted} accounts`
      );
    } catch (error) {
      console.error("Error during account deletion:", error);
      throw new Error("Failed to delete account completely");
    }

    return null;
  },
});
