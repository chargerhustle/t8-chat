import React from "react";
import { Search } from "lucide-react";

import type { baseSearchTool } from "./base";
import type { ClientToolConfig } from "@/toolkits/types";
import { ToolCallDisplay, ResultsList } from "../components";

export const exaSearchToolConfigClient: ClientToolConfig<
  typeof baseSearchTool.inputSchema.shape,
  typeof baseSearchTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <ToolCallDisplay
        icon={Search}
        label="Search Query"
        value={args.query ?? "..."}
      />
    );
  },
  ResultComponent: ({ result }) => {
    return (
      <ResultsList
        results={result.results}
        title="Search Results"
        emptyMessage="No results found"
        linkText="Read full article →"
      />
    );
  },
};
