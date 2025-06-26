import { Brain } from "lucide-react";

import { MemoryTools } from "./tools";
import { createClientToolkit } from "@/toolkits/create-toolkit";
import { SaveToMemoryToolConfigClient } from "./save-memory/client";
import { baseMemoryToolkitConfig } from "./base";
import { ToolkitGroups } from "@/toolkits/types";

export const memoryClientToolkit = createClientToolkit(
  baseMemoryToolkitConfig,
  {
    name: "Memory",
    description: "Personalize your experience with each conversation.",
    icon: ({ className }) => <Brain className={className} />,
    form: null,
    type: ToolkitGroups.Native,
  },
  {
    [MemoryTools.SaveToMemory]: SaveToMemoryToolConfigClient,
  }
);
