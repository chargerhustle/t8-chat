"use client";

import {
  PenTool,
  Search,
  Briefcase,
  GraduationCap,
  Building,
  Gamepad2,
  Heart,
  Stethoscope,
  Code,
  MoreHorizontal,
} from "lucide-react";

export const agentCategories = [
  {
    id: "writing",
    label: "Writing",
    icon: PenTool,
    colors: { light: "hsl(168 54% 52%)", dark: "hsl(168 54% 74%)" },
  },
  {
    id: "research",
    label: "Research",
    icon: Search,
    colors: { light: "hsl(208 56% 52%)", dark: "hsl(208 56% 74%)" },
  },
  {
    id: "productivity",
    label: "Productivity",
    icon: Briefcase,
    colors: { light: "hsl(237 55% 57%)", dark: "hsl(237 75% 77%)" },
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    colors: { light: "hsl(263 58% 53%)", dark: "hsl(263 58% 75%)" },
  },
  {
    id: "business",
    label: "Business",
    icon: Building,
    colors: { light: "hsl(46 77% 52%)", dark: "hsl(46 77% 79%)" },
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: Gamepad2,
    colors: { light: "hsl(304 44% 51%)", dark: "hsl(304 44% 72%)" },
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    icon: Heart,
    colors: { light: "hsl(10 54% 54%)", dark: "hsl(10 74% 74%)" },
  },
  {
    id: "health",
    label: "Health",
    icon: Stethoscope,
    colors: { light: "hsl(12 60% 45%)", dark: "hsl(12 60% 60%)" },
  },
  {
    id: "coding",
    label: "Coding",
    icon: Code,
    colors: { light: "hsl(142 54% 52%)", dark: "hsl(142 54% 74%)" },
  },
  {
    id: "other",
    label: "Other",
    icon: MoreHorizontal,
    colors: { light: "hsl(220 14% 46%)", dark: "hsl(220 14% 66%)" },
  },
];

export type AgentCategory = (typeof agentCategories)[number];
