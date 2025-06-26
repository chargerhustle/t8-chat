import { BookCopy, Database, Wrench } from "lucide-react";
import { ToolkitGroups, type ToolkitGroup } from "./types";

export const toolkitGroups: ToolkitGroup[] = [
  {
    id: ToolkitGroups.Native,
    name: "Native Tools",
    icon: Wrench,
  },
  {
    id: ToolkitGroups.DataSource,
    name: "Data Sources",
    icon: Database,
  },
  {
    id: ToolkitGroups.KnowledgeBase,
    name: "Knowledge Base",
    icon: BookCopy,
  },
];
