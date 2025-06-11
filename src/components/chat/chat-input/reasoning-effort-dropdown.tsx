"use client";

import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EffortLevel } from "@/types";

interface ReasoningEffortDropdownProps {
  value: EffortLevel;
  onValueChange: (value: EffortLevel) => void;
}

const EFFORT_LEVELS: Array<{
  value: EffortLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: "high",
    label: "High",
    description: "Maximum reasoning depth",
    icon: (
      <Brain className="h-4 w-4">
        <path d="M12,4.69c0-1.66-1.33-3-2.99-3.01-1.66,0-3,1.33-3.01,2.99,0,.05,0,.1,0,.14-2.14,.55-3.43,2.73-2.88,4.87,.08,.31,.2,.62,.35,.9-1.71,1.39-1.98,3.91-.58,5.63,.32,.39,.7,.71,1.14,.96-.28,2.19,1.26,4.2,3.45,4.48,2.19,.28,4.2-1.26,4.48-3.45,.02-.17,.03-.34,.03-.51V4.69Z" />
        <path d="M6,4.81c.02,.48,.32,2.19,2.42,2.76" />
        <path d="M3.48,10.58c.93-.61,1.8-.83,2.88-.7" />
        <path d="M7.85,17.43c-1.49,.47-3.22,.08-3.82-.26" />
        <path d="M12,17.69c0,.17,.01,.34,.03,.51,.28,2.19,2.29,3.74,4.48,3.45,2.19-.28,3.74-2.29,3.45-4.48,.44-.25,.82-.57,1.14-.96,1.39-1.71,1.13-4.23-.58-5.63,.15-.28,.27-.59,.35-.9,.55-2.14-.74-4.32-2.88-4.87,0-.05,0-.1,0-.14,0-1.66-1.35-3-3.01-2.99-1.66,0-3,1.35-2.99,3.01v13Z" />
        <path d="M15.58,7.57c2.1-.57,2.4-2.28,2.42-2.76" />
        <path d="M17.64,9.88c1.08-.13,1.95,.1,2.88,.7" />
        <path d="M19.97,17.17c-.6,.34-2.33,.73-3.82,.26" />
        <path d="M17.22,13.44c-3.72,1.79-5.31-1.79-5.21-4.66" />
        <path d="M11.94,8.78c.1,2.87-1.49,6.45-5.21,4.66" />
      </Brain>
    ),
  },
  {
    value: "medium",
    label: "Medium",
    description: "Balanced reasoning",
    icon: <Brain className="size-4" />,
  },
  {
    value: "low",
    label: "Low",
    description: "Quick reasoning",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-brain h-4 w-4"
      >
        <path d="M12,4.69c0-1.66,1.33-3,2.99-3.01,1.18,0,1.94,.82,2.65,1.65,.94,1.09,1.84,2.27,2.51,3.55,.82,1.55,1.08,3.17,1.27,4.89,.1,.94,.12,1.9-.02,2.84s-.5,1.7-.92,2.56c-.45,.94-.7,2.03-1.26,2.89-.57,.88-1.68,1.46-2.7,1.59-2.19,.28-4.2-1.26-4.48-3.45-.02-.17-.03-.34-.03-.51V4.69Z" />
        <path d="M12,17.69c0,.17-.01,.34-.03,.51-.28,2.19-2.29,3.74-4.48,3.45-1.02-.13-2.13-.71-2.7-1.59-.56-.86-.81-1.96-1.26-2.89-.42-.87-.78-1.59-.92-2.56s-.12-1.9-.02-2.84c.19-1.72,.45-3.34,1.27-4.89,.67-1.28,1.57-2.46,2.51-3.55,.71-.83,1.47-1.66,2.65-1.65,1.66,0,3,1.35,2.99,3.01v13Z" />
        <path d="M13.32,12.24c-.76-.27-1.28-.96-1.32-1.76-.04,.8-.57,1.5-1.32,1.76" />
      </svg>
    ),
  },
];

export function ReasoningEffortDropdown({
  value,
  onValueChange,
}: ReasoningEffortDropdownProps) {
  const currentLevel = EFFORT_LEVELS.find((level) => level.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs cursor-pointer -mb-1.5 h-auto gap-2 rounded-full border border-solid border-secondary-foreground/10 px-2 py-1.5 pr-2.5 text-muted-foreground max-sm:hidden"
        >
          {currentLevel?.icon}
          <span>{currentLevel?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top">
        {EFFORT_LEVELS.map((level) => (
          <DropdownMenuItem
            key={level.value}
            onClick={() => onValueChange(level.value)}
            className="flex items-center gap-2"
          >
            {level.icon}
            <div className="flex flex-col">
              <span className="font-medium">{level.label}</span>
              <span className="text-xs text-muted-foreground">
                {level.description}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
