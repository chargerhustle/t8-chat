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
