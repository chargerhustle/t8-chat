import {
  Eye,
  Globe,
  FileText,
  Brain,
  Zap,
  Settings2,
  Wrench,
  ImagePlus,
} from "lucide-react";
import type { ModelFeature } from "@/ai/models-config";

// Shared feature configuration used by both ModelFilter and model-icons
export const FEATURE_CONFIG: Record<
  ModelFeature,
  {
    icon: React.ComponentType<{
      className?: string;
      style?: React.CSSProperties;
    }>;
    colors: { light: string; dark: string };
    label: string;
  }
> = {
  vision: {
    icon: Eye,
    colors: { light: "hsl(168 54% 52%)", dark: "hsl(168 54% 74%)" },
    label: "Vision",
  },
  search: {
    icon: Globe,
    colors: { light: "hsl(208 56% 52%)", dark: "hsl(208 56% 74%)" },
    label: "Search",
  },
  documents: {
    icon: FileText,
    colors: { light: "hsl(237 55% 57%)", dark: "hsl(237 75% 77%)" },
    label: "PDFs",
  },
  reasoning: {
    icon: Brain,
    colors: { light: "hsl(263 58% 53%)", dark: "hsl(263 58% 75%)" },
    label: "Reasoning",
  },
  fast: {
    icon: Zap,
    colors: { light: "hsl(46 77% 52%)", dark: "hsl(46 77% 79%)" },
    label: "Fast",
  },
  effort: {
    icon: Settings2,
    colors: { light: "hsl(304 44% 51%)", dark: "hsl(304 44% 72%)" },
    label: "Effort Control",
  },
  tools: {
    icon: Wrench,
    colors: { light: "hsl(10 54% 54%)", dark: "hsl(10 74% 74%)" },
    label: "Tool Calling",
  },
  image: {
    icon: ImagePlus,
    colors: { light: "hsl(12 60% 45%)", dark: "hsl(12 60% 60%)" },
    label: "Image Generation",
  },
};
