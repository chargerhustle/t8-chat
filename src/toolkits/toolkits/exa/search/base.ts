import { z } from "zod";
import { createBaseTool } from "@/toolkits/create-tool";

export const baseSearchTool = createBaseTool({
  description:
    "Search the web for up-to-date information. Always search immediately - don't ask for clarification. Make reasonable assumptions about ambiguous queries. You can specify how many results to fetch (1-10), filter by category, and include/exclude specific domains.",
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .max(200)
      .describe(
        "The search query. Be proactive and make reasonable assumptions. For ambiguous queries, search for the most popular/relevant option. Don't ask for clarification - search and provide results."
      ),
    numResults: z
      .number()
      .min(1)
      .max(10)
      .default(3)
      .describe(
        "Number of search results to return. Use more results (5-10) for comprehensive research, fewer (1-3) for quick answers"
      ),
    category: z
      .enum([
        "company",
        "research paper",
        "news",
        "pdf",
        "github",
        "tweet",
        "personal site",
        "linkedin profile",
        "financial report",
      ])
      .optional()
      .describe(
        "ALWAYS use category when query relates to specific content types: 'github' for GitHub repos/stars/issues, 'news' for current events/breaking news, 'research paper' for academic/scientific content, 'company' for business/corporate info, 'tweet' for social media content, 'pdf' for documents, etc."
      ),
    includeDomains: z
      .array(z.string())
      .optional()
      .describe(
        "Use when user mentions specific websites or when query is about a particular platform. Examples: ['github.com'] for GitHub questions, ['arxiv.org'] for academic papers, ['reuters.com', 'bbc.com'] for news, ['stackoverflow.com'] for coding help. Also use when user provides a URL or asks about a specific site. Note: if specied, the result will be limited to these domains only."
      ),
    excludeDomains: z
      .array(z.string())
      .optional()
      .describe(
        "Use sparingly and only when you have a specific reason to exclude domains. Good cases: exclude ['reddit.com', 'quora.com'] for authoritative factual queries, or exclude competitor sites when researching a specific company. Avoid excluding major sites unless user specifically requests it. Don't exclude domains just because they might have some irrelevant content."
      ),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string().nullable(),
        url: z.string().url(),
        content: z.string(),
        publishedDate: z.string().optional(),
        image: z.string().optional(),
        favicon: z.string().optional(),
        score: z.number().optional(),
        author: z.string().optional(),
      })
    ),
  }),
});
