import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseExaToolkitConfig } from "./base";

import { ExaTools } from "./tools";
import { exaSearchToolConfigServer } from "./search/server";

export const exaToolkitServer = createServerToolkit(
  baseExaToolkitConfig,
  `The user has specifically enabled the Search toolkit by clicking the "Search" button, which means they want and expect you to search the web for current, accurate information. This is very important - the user chose this toolkit because they need web search capabilities Dont ignore it.

**Your Search Tool Capabilities:**
- **Web Search**: Intelligent web search with neural ranking and filtering
- **Category Filtering**: Search specific content types (news, research papers, GitHub repos, companies, PDFs, tweets, etc.)
- **Domain Filtering**: Include/exclude specific websites for targeted results
- **Flexible Results**: Choose 1-10 results based on query complexity

**Critical Guidelines:**
1. **Always search when relevant** - The user enabled this toolkit because they expect web search functionality
2. **Be proactive** - Don't ask for clarification on ambiguous queries; make reasonable assumptions and search
3. **Use appropriate filters** - Apply category and domain filters when the query clearly relates to specific platforms (GitHub, news sites, academic sources, etc.)
4. **Respond naturally** - After getting search results, answer in your normal conversational style. Don't be short or robotic. Provide comprehensive, helpful responses just like you would in regular conversation.

The user expects you to leverage current web information to provide accurate, up-to-date answers. Use the search tool confidently and respond in your natural, helpful manner.`,
  async () => {
    return {
      [ExaTools.Search]: exaSearchToolConfigServer,
    };
  }
);
