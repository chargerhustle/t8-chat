import React from "react";
import { Pencil } from "lucide-react";

import type { baseUpdateMemoryTool } from "./base";
import type { ClientToolConfig } from "@/toolkits/types";
import { MemoryToolCall, MemoryToolResult } from "../components/memory-tool";

export const UpdateMemoryToolConfigClient: ClientToolConfig<
  typeof baseUpdateMemoryTool.inputSchema.shape,
  typeof baseUpdateMemoryTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    const updates = args.updates || [];
    const memories = updates
      .map((update) => update?.newContent || "")
      .filter(Boolean);

    return (
      <MemoryToolCall
        icon={Pencil}
        label="Updating"
        value={updates.length > 0 ? `${updates.length} memories` : "..."}
        memories={memories}
      />
    );
  },
  ResultComponent: ({ result }) => {
    if (!result.success) {
      return (
        <MemoryToolResult
          icon={Pencil}
          title="Failed to Update"
          memories={[]}
          error={{
            message: result.message,
            details: result.error,
          }}
        />
      );
    }

    const updatedMemories = result.updatedMemories || [];

    if (updatedMemories.length === 0) {
      return (
        <MemoryToolResult
          icon={Pencil}
          title="Updated"
          memories={[]}
          emptyMessage={result.message}
        />
      );
    }

    const formattedMemories = updatedMemories.map((memory) => ({
      content: memory.content,
      metadata: memory.id,
    }));

    return (
      <MemoryToolResult
        icon={Pencil}
        title="Updated"
        memories={formattedMemories}
      />
    );
  },
};
