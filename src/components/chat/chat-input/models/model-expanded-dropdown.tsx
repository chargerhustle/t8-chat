"use client";

import { Pin } from "lucide-react";
import { ModelCard } from "./model-card";
import { ModelConfig } from "@/ai/models-config";
import { useUserModels } from "@/hooks/use-user-models";

interface ModelExpandedDropdownProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  onClose: () => void;
  filteredModels: ModelConfig[];
}

export function ModelExpandedDropdown({
  selectedModel,
  onModelSelect,
  onClose,
  filteredModels,
}: ModelExpandedDropdownProps) {
  const { userModels, toggleModelFavourite } = useUserModels();
  // Use the pre-filtered models from parent (includes both search and feature filtering)

  // Separate pinned and unpinned models
  const pinnedModelsList = filteredModels.filter((model: ModelConfig) =>
    userModels.favouriteModels.includes(model.id)
  );
  const unpinnedModels = filteredModels.filter(
    (model: ModelConfig) => !userModels.favouriteModels.includes(model.id)
  );

  const handleModelSelect = (model: ModelConfig) => {
    onModelSelect(model.id);
    onClose();
  };

  const handleTogglePin = (model: ModelConfig) => {
    toggleModelFavourite(model.id);
  };

  return (
    <div
      className="max-h-full overflow-y-scroll px-1.5 sm:w-[640px] custom-scrollbar"
      data-shadow="true"
    >
      <div className="flex w-full flex-wrap justify-start gap-3.5 pb-4 pl-3 pr-2 pt-2.5">
        {/* Favorites Section - Only show if there are pinned models */}
        {pinnedModelsList.length > 0 && (
          <>
            {/* Favorites Section Header */}
            <div className="-mb-2 ml-0 flex w-full select-none items-center justify-start gap-1.5 text-color-heading">
              <Pin className="mt-px size-4" />
              Favorites
            </div>

            {/* Pinned Models */}
            {pinnedModelsList.map((model) => (
              <div
                key={model.id}
                className="group relative"
                data-state="closed"
              >
                <div className="absolute -left-1.5 -top-1.5 z-10 rounded-full bg-popover p-0.5"></div>
                <ModelCard
                  model={model}
                  isSelected={selectedModel === model.id}
                  isPinned={true}
                  canUnpin={userModels.favouriteModels.length > 1}
                  onSelect={handleModelSelect}
                  onPin={handleTogglePin}
                />
              </div>
            ))}
          </>
        )}

        {/* Others Section Header */}
        {unpinnedModels.length > 0 && (
          <div className="-mb-2 ml-2 mt-1 w-full select-none text-color-heading">
            Others
          </div>
        )}

        {/* Show unpinned models if no search or if there are results */}
        {unpinnedModels.map((model) => (
          <div key={model.id} className="group relative" data-state="closed">
            <div className="absolute -left-1.5 -top-1.5 z-10 rounded-full bg-popover p-0.5"></div>
            <ModelCard
              model={model}
              isSelected={selectedModel === model.id}
              isPinned={false}
              onSelect={handleModelSelect}
              onPin={handleTogglePin}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
