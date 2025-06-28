import { Search } from "lucide-react";

import { ExaTools } from "./tools";
import { createClientToolkit } from "@/toolkits/create-toolkit";
import { exaSearchToolConfigClient } from "./search/client";
import { baseExaToolkitConfig } from "./base";
import { ToolkitGroups } from "@/toolkits/types";

export const exaClientToolkit = createClientToolkit(
  baseExaToolkitConfig,
  {
    name: "Web Search",
    description: "Find articles, research papers, companies, and more",
    icon: Search,
    form: null,
    type: ToolkitGroups.DataSource,
  },
  {
    [ExaTools.Search]: exaSearchToolConfigClient,
  }
);
