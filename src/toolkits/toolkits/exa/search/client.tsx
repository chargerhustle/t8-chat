import React from "react";
import { Globe } from "lucide-react";

import type { baseSearchTool } from "./base";
import type { ClientToolConfig } from "@/toolkits/types";
import { ToolCallDisplay, ResultsList } from "../components";

// Category display names
const getCategoryDisplayName = (category: string) => {
  switch (category) {
    case "research paper":
      return "Research Papers";
    case "pdf":
      return "PDFs";
    case "github":
      return "GitHub";
    case "tweet":
      return "Tweets";
    case "personal site":
      return "Personal Sites";
    case "linkedin profile":
      return "LinkedIn Profiles";
    case "financial report":
      return "Financial Reports";
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
};

export const exaSearchToolConfigClient: ClientToolConfig<
  typeof baseSearchTool.inputSchema.shape,
  typeof baseSearchTool.outputSchema.shape
> = {
  CallComponent: ({ args }) => {
    return (
      <div className="space-y-2">
        <ToolCallDisplay
          icon={Globe}
          label="Search Query"
          value={args.query ?? "..."}
        />
        {args.category && (
          <div className="text-sm text-muted-foreground pl-6">
            <strong>Scope:</strong> {getCategoryDisplayName(args.category)}
          </div>
        )}
      </div>
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
