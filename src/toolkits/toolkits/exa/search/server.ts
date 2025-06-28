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
  callback: async ({ query }) => {
    if (!process.env.EXA_API_KEY) {
      throw new Error("EXA_API_KEY is not set");
    }

    const exa = new Exa(process.env.EXA_API_KEY);

    const { results } = await exa.searchAndContents(query, {
      livecrawl: "always",
      numResults: 3,
    });

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
  message:
    "The user is shown the article in three cards. Do not list the sources again. Just give a 1-2 sentence summary response to their question and ask what else they would like to know.",
};
