import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ModelConfig } from "@/ai/models-config";
import React from "react";

interface ModelDropdownProps {
  models: ModelConfig[];
  selectedModel: ModelConfig;
  onSelect: (model: ModelConfig) => void;
}

export function ModelDropdown({ models, selectedModel, onSelect }: ModelDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 p-2 bg-transparent text-white hover:bg-neutral-800 rounded-lg transition-colors focus:outline-none text-sm"
        >
          {selectedModel.displayName}
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="bg-[#0D0D0D] border-neutral-700"
      >
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onSelect={() => onSelect(model)}
            className="text-white hover:bg-neutral-800 focus:bg-neutral-800 cursor-pointer"
          >
            {model.displayName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 