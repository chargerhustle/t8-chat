import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseMemoryToolkitConfig } from "./base";
import { saveToMemoryToolConfigServer } from "./save-memory/server";
import { updateMemoryToolConfigServer } from "./update-memory/server";
import { deleteMemoryToolConfigServer } from "./delete-memory/server";
import { MemoryTools } from "./tools";

export const memoryToolkitServer = createServerToolkit(
  baseMemoryToolkitConfig,
  `You have access to the Memory toolkit for persistent information storage. This toolkit provides ADDITIONAL capabilities beyond your core conversational abilities:

- **Save Memory**: Store important information, facts, preferences, or context for future reference
- **Update Memory**: Modify existing memories when information changes or needs correction
- **Delete Memory**: Remove memories that are no longer relevant or accurate

**Available Memory Tools (ADDITIONAL CAPABILITIES):**
• memory_save-to-memory: Save NEW important information from conversations (supports multiple memories)
• memory_update-memory: Update one or more existing memories when explicitly requested by user
• memory_delete-memory: Delete one or more memories when explicitly requested by user

**Memory Management Guidelines:**
• ONLY use memory_update-memory/memory_delete-memory tools when the user explicitly asks
• These tools support batch operations - you can update/delete multiple memories in one call
• When using memory_save-to-memory, check existing memories first to avoid duplicates
• Only save genuinely NEW information that isn't already captured
• Reference existing memories naturally when relevant to the conversation
• Save genuinely useful information that would be helpful in future conversations
• Focus on user preferences, important facts, and contextual information
• Don't save temporary or trivial information

**Tool Sequencing Workflows:**
1. **Information Capture**: Use memory_save-to-memory to store important details, user preferences, or key facts from conversations
2. **Information Maintenance**: Use memory_update-memory to correct or enhance existing information
3. **Information Cleanup**: Use memory_delete-memory to remove outdated or incorrect information
4. **Continuous Learning**: Use memory_save-to-memory for new insights or corrections to build upon previous knowledge

**Best Practices:**
- Store specific, actionable information rather than generic facts
- Include context and metadata when adding memories to improve searchability
- Use descriptive, searchable terms when storing information
- Store user preferences, important dates, ongoing projects, and frequently referenced information
- Update memories when information changes rather than storing duplicate or conflicting data
- Only delete memories when explicitly requested by the user or when information is clearly outdated
- Always use exact memory IDs when updating or deleting - never guess or make up IDs

**IMPORTANT**: These memory tools are supplementary to your core conversational abilities. You should continue to answer all types of questions and provide helpful assistance as normal. The memory tools are simply an additional feature to enhance personalization when appropriate.

This toolkit enables persistent, personalized interactions by maintaining a knowledge base specific to each user.`,
  async (params) => {
    if (!params.userId) {
      throw new Error("User ID is required");
    }

    return {
      [MemoryTools.SaveToMemory]: saveToMemoryToolConfigServer(params.userId),
      [MemoryTools.UpdateMemory]: updateMemoryToolConfigServer(params.userId),
      [MemoryTools.DeleteMemory]: deleteMemoryToolConfigServer(params.userId),
    };
  }
);
