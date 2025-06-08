import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { customMutation } from "convex-helpers/server/customFunctions";

/**
 * Custom mutation builder for internal API calls with server-side authentication
 * Secured by API key rather than user authentication
 * Used for server-to-server communication (AI streaming, webhooks, etc.)
 */
export const internalApiMutation = customMutation(mutation, {
  args: { apiKey: v.string() },
  input: async (ctx, args) => {
      // Verify API key matches environment variable
      const expectedApiKey = process.env.CONVEX_BRIDGE_API_KEY;
      if (!expectedApiKey) {
        throw new Error("CONVEX_BRIDGE_API_KEY not configured");
      }
      if (args.apiKey !== expectedApiKey) {
        throw new Error("Unauthorized: Invalid API key");
      }

    // Return clean context (no apiKey in args)
    return { ctx, args: {} };
    },
  });