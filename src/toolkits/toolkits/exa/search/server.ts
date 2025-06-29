import { type baseSearchTool } from "./base";
import { Exa } from "exa-js";
import type { ServerToolConfig } from "@/toolkits/types";

/**
 * Smart truncation that respects logical boundaries
 * Tries to truncate at: paragraph > sentence > word boundaries
 */
function smartTruncate(text: string, maxLength: number = 1000): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Try to find a good truncation point within the limit
  const truncateAt = maxLength;

  // First, try to truncate at paragraph boundary (double newline)
  const paragraphEnd = text.lastIndexOf("\n\n", truncateAt);
  if (paragraphEnd > maxLength * 0.7) {
    // At least 70% of desired length
    return text.substring(0, paragraphEnd).trim();
  }

  // Next, try to truncate at sentence boundary
  const sentenceEnders = /[.!?]\s+/g;
  let lastSentenceEnd = -1;
  let match;

  while ((match = sentenceEnders.exec(text)) !== null) {
    if (match.index + match[0].length <= truncateAt) {
      lastSentenceEnd = match.index + match[0].length;
    } else {
      break;
    }
  }

  if (lastSentenceEnd > maxLength * 0.6) {
    // At least 60% of desired length
    return text.substring(0, lastSentenceEnd).trim();
  }

  // Finally, try to truncate at word boundary
  const wordBoundary = text.lastIndexOf(" ", truncateAt);
  if (wordBoundary > maxLength * 0.8) {
    // At least 80% of desired length
    return text.substring(0, wordBoundary).trim() + "...";
  }

  // Fallback: hard truncate but add ellipsis
  return text.substring(0, maxLength - 3).trim() + "...";
}

export const exaSearchToolConfigServer: ServerToolConfig<
  typeof baseSearchTool.inputSchema.shape,
  typeof baseSearchTool.outputSchema.shape
> = {
  callback: async ({
    query,
    numResults,
    category,
    includeDomains,
    excludeDomains,
  }) => {
    if (!process.env.EXA_API_KEY) {
      throw new Error("EXA_API_KEY is not set");
    }

    const exa = new Exa(process.env.EXA_API_KEY);

    // Build search options
    const searchOptions: Record<string, unknown> = {
      livecrawl: "always",
      numResults,
      type: "auto",
    };

    // Add optional parameters if provided
    if (category) {
      searchOptions.category = category;
    }

    const filteredIncludeDomains =
      includeDomains?.filter(
        (domain) =>
          domain !== null &&
          domain !== "null" &&
          domain !== "undefined" &&
          domain !== "" &&
          domain.trim() !== "" &&
          typeof domain === "string" &&
          domain.length > 0
      ) ?? [];

    const filteredExcludeDomains =
      excludeDomains?.filter(
        (domain) =>
          domain !== null &&
          domain !== "null" &&
          domain !== "undefined" &&
          domain !== "" &&
          domain.trim() !== "" &&
          typeof domain === "string" &&
          domain.length > 0
      ) ?? [];

    if (filteredIncludeDomains.length > 0) {
      searchOptions.includeDomains = filteredIncludeDomains;
    }
    if (filteredExcludeDomains.length > 0) {
      searchOptions.excludeDomains = filteredExcludeDomains;
    }

    const { results } = await exa.searchAndContents(query, searchOptions);

    return {
      results: results.map((result) => ({
        title: result.title,
        url: result.url,
        content: smartTruncate(result.text, 1000),
        publishedDate: result.publishedDate,
        image: result.image,
        favicon: result.favicon,
        score: result.score,
        author: result.author,
      })),
    };
  },
  message: (result) =>
    `Search completed successfully. You now have access to ${result.results.length} relevant source${result.results.length === 1 ? "" : "s"} with current information.

IMPORTANT: The user cannot see these search results - only your response. Analyze their question type and respond appropriately:

• **Brief factual questions** → Provide concise, direct answers (1-3 sentences) with key facts
• **Complex or research questions** → Provide comprehensive analysis (200-500+ words) with detailed insights
• **"Tell me about" or explanatory requests** → Give thorough, well-structured responses with multiple sources

Always ensure your response adds value beyond what a simple search would provide. Even brief answers should include relevant context, not just bare facts.`,
};
