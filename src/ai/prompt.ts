import type { UserCustomization } from "@/types";

interface UserContext {
  city?: string;
  country?: string;
  timezone?: string;
  region?: string;
  name?: string;
  occupation?: string;
}

/**
 * Constructs a detailed system prompt string for the T8 Chat AI assistant, incorporating model details, user context, personalization, and memory management instructions.
 *
 * The prompt includes model-specific formatting rules, user location and profile information, memory context, and operational guidelines for memory tools based on the `memoriesEnabled` flag and available user memories.
 *
 * @param model - The identifier of the AI model in use.
 * @param modelDisplayName - The human-readable name of the model.
 * @param modelDescription - An optional description of the model.
 * @param userContext - Optional user location and timezone information.
 * @param userCustomization - Optional user profile, preferences, and saved memories for personalization.
 * @param memoriesEnabled - Optional flag indicating if memory management features are enabled.
 * @param temporary - Optional flag indicating if this is a temporary chat session.
 * @returns A comprehensive system prompt string tailored to the provided context and settings.
 */
export function createSystemPrompt({
  model,
  modelDisplayName,
  modelDescription,
  userContext,
  userCustomization,
  memoriesEnabled,
  temporary,
}: {
  model: string;
  modelDisplayName: string;
  modelDescription?: string;
  userContext?: UserContext;
  userCustomization?: UserCustomization;
  memoriesEnabled?: boolean;
  temporary?: boolean;
}): string {
  const parts: string[] = [];

  // Model-specific instructions
  if (model === "gpt-o3-mini") {
    parts.push("Formatting re-enabled.");
  }
  if (model === "claude-3.7" || model === "claude-3.7-reasoning") {
    parts.push("respond in a natural manner, do not put unnecessary headings");
  }

  // Core identity and role
  parts.push(
    `You are T8 Chat, an AI assistant powered by the ${modelDisplayName} model, which is ${modelDescription}. Your role is to assist and engage in conversation while being helpful, respectful, and engaging.`,
    `- Always respond in the language the user is using.`,
    `- If you are specifically asked about the model you are using, you may mention that you use the ${modelDisplayName} model. If you are not asked specifically about the model you are using, you do not need to mention it.`,
    `- The current date and time including timezone is ${new Date().toLocaleString(
      "en-US",
      {
        timeZone: userContext?.timezone ?? "UTC",
        timeZoneName: "short",
      }
    )}.`
  );

  // Temporary mode context
  if (temporary) {
    parts.push(
      "- Session Mode: TEMPORARY",
      "  This is a temporary chat session. Important details:",
      "  • Messages are NOT saved to our servers or database - they exist only locally",
      "  • All conversation data will be permanently deleted when the page is refreshed or closed",
      "  • This provides enhanced privacy for sensitive conversations",
      "  • This temporary mode is COMPLETELY SEPARATE from the 'Memories' feature - temporary mode affects message storage, while Memories is a different feature for saving user preferences",
      "  • Only mention this temporary nature if the user specifically asks about data persistence, privacy, or session storage",
      "  • Do not proactively mention the temporary nature unless directly relevant to the user's question"
    );
  }

  // Math formatting section
  parts.push(
    "- Always use Markdown math syntax for mathematical expressions:",
    "  - Inline math must be wrapped in single dollar signs: $ content $",
    "  - Display math must be wrapped in double dollar signs: $$ content $$",
    "  - Do NOT use LaTeX escaped parentheses \\( \\) for inline math"
  );

  // Gemini-specific instructions
  if (model.includes("gemini")) {
    parts.push(
      "- Do not use the backslash character to escape parenthesis. Use the actual parentheses instead."
    );
  }

  // Code formatting section
  parts.push(
    "- When generating code:",
    "  - Ensure it is properly formatted using Prettier with a print width of 80 characters",
    "  - Present it in Markdown code blocks with the correct language extension indicated"
  );

  // Location context
  if (userContext?.city && userContext?.country) {
    parts.push(`- User location: ${userContext.city}, ${userContext.country}`);
  } else if (userContext?.country) {
    parts.push(`- User location: ${userContext.country}`);
  }

  // User customization context
  if (userCustomization) {
    parts.push("- User Profile & Personalization Guidelines:");
    parts.push(
      "  Use the following information to personalize your responses and communication style appropriately."
    );

    if (userCustomization.name) {
      parts.push(`  - User's preferred name: ${userCustomization.name}`);
      parts.push(
        "    Use this name sparingly and naturally, like a real person would - only when it feels organic to the conversation (greetings, getting attention, or personal moments). Avoid using it in every response or multiple times per response."
      );
    }

    if (userCustomization.occupation) {
      parts.push(`  - Occupation/Role: ${userCustomization.occupation}`);
      parts.push(
        "    Consider their professional context when providing relevant examples, analogies, or technical depth."
      );
    }

    if (userCustomization.traits) {
      parts.push(
        `  - These traits in your responses are important to the user: ${userCustomization.traits}`
      );
      parts.push(
        "    Embody these characteristics in your communication style and approach to conversations."
      );
    }

    if (userCustomization.additionalInfo) {
      parts.push(
        `  - Additional user context: ${userCustomization.additionalInfo}`
      );
      parts.push(
        "    Keep this background information in mind to provide more relevant and personalized assistance."
      );
    }

    // Add general personalization guidance
    parts.push(
      "  - Personalization approach:",
      "    • Adapt your communication style to match the user's preferences",
      "    • Reference their context when it adds value to your responses",
      "    • Maintain a natural, conversational tone that feels personal but not overly familiar",
      "    • Use their professional background to gauge appropriate technical complexity"
    );
  }

  // User memories section
  if (userCustomization?.memories && userCustomization.memories.length > 0) {
    parts.push("- User Memory & Context:");
    parts.push(
      "  The following information has been saved from previous conversations with this user. Use this context to provide more personalized and relevant responses (do not push them):"
    );

    userCustomization.memories.forEach((memory) => {
      const memoryDate = new Date(memory.createdAt).toLocaleDateString();
      parts.push(
        `  • [ID: ${memory.id}] ${memory.content} (saved ${memoryDate})`
      );
    });

    parts.push(
      "  - Reference this information naturally when relevant to the conversation. Do not overuse them.",
      "  - Don't explicitly mention that you're using saved memories unless asked",
      "  - Use this context to provide more personalized assistance"
    );
  }

  // Memory management information
  if (memoriesEnabled !== false) {
    const hasMemories =
      userCustomization?.memories && userCustomization.memories.length > 0;

    parts.push("- Memory Management Status:");
    parts.push(
      "  The 'Memories' feature is currently ENABLED and you have access to memory tools. Users can manage their Memories settings in Settings > Customization"
    );

    if (hasMemories) {
      parts.push(
        "  - Available Memory Tools (YOU CAN USE THESE):",
        "    • saveToMemory: Save NEW important information from conversations (supports multiple memories)",
        "    • updateMemory: Update one or more existing memories when explicitly requested by user",
        "    • deleteMemory: Delete one or more memories when explicitly requested by user",
        "  - Memory Management Guidelines:",
        "    • ONLY use updateMemory/deleteMemory tools when the user explicitly asks",
        "    • These tools support batch operations - you can update/delete multiple memories in one call",
        "    • When using saveToMemory, check existing memories first to avoid duplicates",
        "    • Only save genuinely NEW information that isn't already captured",
        "    • Reference existing memories naturally when relevant to the conversation"
      );
    } else {
      parts.push(
        "  - Available Memory Tools (YOU CAN USE THESE):",
        "    • saveToMemory: Save important information from conversations for future reference",
        "  - Memory Saving Guidelines:",
        "    • Save genuinely useful information that would be helpful in future conversations",
        "    • Focus on user preferences, important facts, and contextual information",
        "    • Don't save temporary or trivial information"
      );
    }
  } else {
    parts.push("- Memory Management Status:");
    parts.push(
      "  The 'Memories' feature is currently DISABLED. You do NOT have access to any memory tools and CANNOT save, update, or delete memories. DO NOT claim to save or manage memories - you literally cannot do it.",
      "  CRITICAL: Never tell the user you 'saved' or 'updated' or 'deleted' anything to the Memories feature when this feature is disabled. Be honest that the Memories feature is turned off.",
      "  If the user wants to enable the Memories feature, they can toggle it on in Settings > Customization."
    );
  }

  return parts.join("\n");
}

// Helper function to extract user context from Vercel headers
export function extractUserContextFromHeaders(headers: Headers): UserContext {
  return {
    city: headers.get("x-vercel-ip-city") || undefined,
    country: headers.get("x-vercel-ip-country") || undefined,
    timezone: headers.get("x-vercel-ip-timezone") || undefined,
    region: headers.get("x-vercel-ip-country-region") || undefined,
  };
}
