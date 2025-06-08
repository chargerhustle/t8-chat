
interface UserContext {
  city?: string;
  country?: string;
  timezone?: string;
  region?: string;
  name?: string;
  occupation?: string;
}

export function createSystemPrompt({
  model,
  modelDisplayName,
  modelDescription,
  userContext,
}: {
  model: string;
  modelDisplayName: string;
  modelDescription?: string;
  userContext?: UserContext;
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
    `You are Sane Chat, an AI assistant powered by the ${modelDisplayName} model, which is ${modelDescription}. Your role is to assist and engage in conversation while being helpful, respectful, and engaging.`,
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

  // Math formatting section
  parts.push(
    "- Always use LaTeX for mathematical expressions:",
    "  - Inline math must be wrapped in escaped parentheses: \\( content \\)",
    "  - Do not use single dollar signs for inline math",
    "  - Display math must be wrapped in double dollar signs: $$ content $$"
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

  return parts.join("\n");
}

  
  // Helper function to extract user context from Vercel headers
  export function extractUserContextFromHeaders(headers: Headers): UserContext {
    return {
      city: headers.get('x-vercel-ip-city') || undefined,
      country: headers.get('x-vercel-ip-country') || undefined,
      timezone: headers.get('x-vercel-ip-timezone') || undefined,
      region: headers.get('x-vercel-ip-country-region') || undefined,
    };
  }