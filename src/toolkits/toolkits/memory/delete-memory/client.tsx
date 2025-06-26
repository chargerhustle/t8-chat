import React from "react";
import { Trash2 } from "lucide-react";

import type { baseDeleteMemoryTool } from "./base";
import type { ClientToolConfig } from "@/toolkits/types";
import { MemoryToolCall, MemoryToolResult } from "../components/memory-tool";

export const DeleteMemoryToolConfigClient: ClientToolConfig<
  typeof baseDeleteMemoryTool.inputSchema.shape,
  typeof baseDeleteMemoryTool.outputSchema.shape
> = {
  CallComponent: ({ args, isPartial }) => {
    const memoryIds = (args.memoryIds || []).filter((id): id is string =>
      Boolean(id)
    );

    if (isPartial) {
      return (
        <MemoryToolCall
          icon={Trash2}
          label="Receiving"
          value={
            memoryIds.length > 0
              ? `${memoryIds.length} ${memoryIds.length === 1 ? "ID" : "IDs"}...`
              : "Streaming..."
          }
          memories={memoryIds}
        />
      );
    }

    return (
      <MemoryToolCall
        icon={Trash2}
        label="Deleting"
        value={
          memoryIds.length > 0
            ? `${memoryIds.length} ${memoryIds.length === 1 ? "memory" : "memories"}`
            : "0 memories"
        }
        memories={memoryIds}
      />
    );
  },
  ResultComponent: ({ result }) => {
    if (!result.success) {
      return (
        <MemoryToolResult
          icon={Trash2}
          title="Failed to Delete"
          memories={[]}
          error={{
            message: result.message,
            details: result.error,
          }}
        />
      );
    }

    const deletedMemories = result.deletedMemories || [];

    if (deletedMemories.length === 0) {
      return (
        <MemoryToolResult
          icon={Trash2}
          title="Deleted"
          memories={[]}
          emptyMessage={result.message}
        />
      );
    }

    const formattedMemories = deletedMemories.map((memory) => ({
      content: memory.content,
      metadata: new Date(memory.createdAt).toLocaleDateString(),
    }));

    return (
      <MemoryToolResult
        icon={Trash2}
        title="Deleted"
        memories={formattedMemories}
      />
    );
  },
};
