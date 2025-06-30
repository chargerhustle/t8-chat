import React from "react";
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
import { ModelFeature } from "@/ai/models-config";
import { Badge } from "@/components/ui/badge";

// Feature icon mapping
const featureIcons: Record<
  ModelFeature,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  vision: Eye,
  search: Globe,
  documents: FileText,
  reasoning: Brain,
  fast: Zap,
  effort: Settings2,
  tools: Wrench,
  image: ImagePlus,
};

// Feature colors (HSL values) - exactly as in the reference
const featureColors: Record<ModelFeature, { light: string; dark: string }> = {
  vision: { light: "hsl(168 54% 52%)", dark: "hsl(168 54% 74%)" },
  search: { light: "hsl(208 56% 52%)", dark: "hsl(208 56% 74%)" },
  documents: { light: "hsl(237 55% 57%)", dark: "hsl(237 75% 77%)" },
  reasoning: { light: "hsl(263 58% 53%)", dark: "hsl(263 58% 75%)" },
  fast: { light: "hsl(45 93% 47%)", dark: "hsl(45 93% 67%)" },
  effort: { light: "hsl(314 60% 51%)", dark: "hsl(314 60% 71%)" },
  tools: { light: "hsl(0 72% 51%)", dark: "hsl(0 72% 71%)" },
  image: { light: "hsl(0 72% 51%)", dark: "hsl(0 72% 71%)" },
};

// Feature display names mapping
const featureDisplayNames: Record<ModelFeature, string> = {
  vision: "Vision",
  search: "Search",
  documents: "PDFs",
  reasoning: "Reasoning",
  fast: "Fast",
  effort: "Effort Control",
  tools: "Tool Calling",
  image: "Image Generation",
};

interface FeatureBadgeProps {
  feature: ModelFeature;
}

export const FeatureBadge: React.FC<FeatureBadgeProps> = ({ feature }) => {
  const IconComponent = featureIcons[feature];
  const colors = featureColors[feature];
  const displayName = featureDisplayNames[feature];

  return (
    <Badge
      variant="outline"
      className="relative overflow-hidden rounded-full px-1.5 py-0.5 text-[10px] sm:gap-1.5 sm:px-2 sm:text-xs border-transparent"
      data-state="closed"
      style={
        {
          "--color-dark": colors.dark,
          "--color": colors.light,
          color: colors.dark,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 opacity-20 dark:opacity-15"
        style={{ backgroundColor: colors.dark }}
      ></div>
      <IconComponent
        className="lucide h-2.5 w-2.5 brightness-75 sm:h-3 sm:w-3 dark:filter-none relative z-10"
        style={{ color: colors.dark }}
      />
      <span
        className="whitespace-nowrap brightness-75 dark:filter-none relative z-10"
        style={{ color: colors.dark }}
      >
        {displayName}
      </span>
    </Badge>
  );
};

interface FeatureBadgesProps {
  features: ModelFeature[];
}

export const FeatureBadges: React.FC<FeatureBadgesProps> = ({ features }) => {
  return (
    <div className="flex flex-wrap gap-1 sm:gap-2">
      {features
        .filter((feature) => feature !== "search")
        .map((feature) => (
          <FeatureBadge key={feature} feature={feature} />
        ))}
    </div>
  );
};
