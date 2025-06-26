import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseMemoryToolkitConfig } from "./base";
import { saveToMemoryToolConfigServer } from "./save-memory/server";
import { MemoryTools } from "./tools";

export const memoryToolkitServer = createServerToolkit(
  baseMemoryToolkitConfig,
  `You have access to the Memory toolkit for persistent information storage. This toolkit provides:

- **Save Memory**: Store important information, facts, preferences, or context for future reference

**Tool Sequencing Workflows:**
1. **Information Capture**: Use Save Memory to store important details, user preferences, or key facts from conversations
2. **Continuous Learning**: Save Memory for new insights or corrections to build upon previous knowledge

**Best Practices:**
- Store specific, actionable information rather than generic facts
- Include context and metadata when adding memories to improve searchability
- Use descriptive, searchable terms when storing information
- Store user preferences, important dates, ongoing projects, and frequently referenced information
- Update memories when information changes rather than storing duplicate or conflicting data

This toolkit enables persistent, personalized interactions by maintaining a knowledge base specific to each user.`,
  async (params) => {
    if (!params.userId) {
      throw new Error("User ID is required");
    }

    return {
      [MemoryTools.SaveToMemory]: saveToMemoryToolConfigServer(params.userId),
    };
  }
);
