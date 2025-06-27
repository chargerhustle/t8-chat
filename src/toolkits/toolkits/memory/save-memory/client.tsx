import React from "react";
import { Plus } from "lucide-react";

import type { baseSaveToMemoryTool } from "./base";
import type { ClientToolConfig } from "@/toolkits/types";
import { MemoryToolCall, MemoryToolResult } from "../components/memory-tool";

export const SaveToMemoryToolConfigClient: ClientToolConfig<
  typeof baseSaveToMemoryTool.inputSchema.shape,
  typeof baseSaveToMemoryTool.outputSchema.shape
> = {
  CallComponent: ({ args, isPartial }) => {
    const memories = (args.memories || []).filter((m): m is string =>
      Boolean(m)
    );

    if (isPartial) {
      return (
        <MemoryToolCall
          icon={Plus}
          label="Receiving"
          value="memory data to save"
          memories={memories}
        />
      );
    }

    return (
      <MemoryToolCall
        icon={Plus}
        label="Saving"
        value={
          memories.length > 0
            ? `${memories.length} ${memories.length === 1 ? "memory" : "memories"}`
            : "0 memories"
        }
        memories={memories}
      />
    );
  },
  ResultComponent: ({ result }) => {
    if (!result.success) {
      return (
        <MemoryToolResult
          icon={Plus}
          title="Failed to Save"
          memories={[]}
          error={{
            message: result.message,
            details: result.error,
          }}
        />
      );
    }

    const savedMemories = result.memories || [];

    if (savedMemories.length === 0) {
      return (
        <MemoryToolResult
          icon={Plus}
          title="Saved"
          memories={[]}
          emptyMessage={result.message}
        />
      );
    }

    const formattedMemories = savedMemories.map((memory) => ({
      content: memory.content,
      metadata: new Date(memory.createdAt).toLocaleDateString(),
    }));

    return (
      <MemoryToolResult
        icon={Plus}
        title="Saved"
        memories={formattedMemories}
      />
    );
  },
};
