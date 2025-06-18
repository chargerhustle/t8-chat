"use client";

import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { SettingsLayout } from "@/components/layout/settings-layout";
import { MODEL_CONFIGS, ModelConfig, ModelFeature } from "@/ai/models-config";
import { getModelIcon } from "@/components/chat/chat-input/model-icons";
import { FeatureBadges } from "@/components/settings";
import { Button } from "@/components/ui/button";
import { Sparkles, FlaskConical, Gem, Link } from "lucide-react";

// Use the flags from the model config
const isExperimental = (model: ModelConfig) => model.experimental;
const isPremium = (model: ModelConfig) => model.premium;
const isNewModel = (model: ModelConfig) => model.new;

interface ModelCardProps {
  model: ModelConfig;
  isEnabled: boolean;
  onToggle: (modelId: string) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({
  model,
  isEnabled,
  onToggle,
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Helper function to get the first sentence
  const getFirstSentence = (text: string) => {
    // More robust sentence detection that handles abbreviations and numbers
    const sentenceRegex = /[.!?]+\s+[A-Z]/;
    const match = text.match(sentenceRegex);

    if (match && match.index !== undefined) {
      // Find the position of the sentence-ending punctuation
      const endIndex = match.index + match[0].length - 2; // -2 to exclude the space and next capital letter
      return text.substring(0, endIndex + 1);
    }

    return text;
  };

  const firstSentence = getFirstSentence(model.longDescription);
  const hasMoreContent = model.longDescription.length > firstSentence.length;

  return (
    <div className="relative flex flex-col rounded-lg border border-input p-3 sm:p-4">
      <div className="flex w-full items-start gap-4">
        <div className="relative h-8 w-8 flex-shrink-0 sm:h-10 sm:w-10">
          {getModelIcon(model.icon, "settings")}
          {isNewModel(model) && (
            <div
              className="absolute -right-1 -top-1 rounded-full bg-gradient-noise-top p-0.5"
              data-state="closed"
            >
              <Sparkles className="h-3 w-3 text-[#ffb525f7] drop-shadow-[0px_3px_8px_#ffae1082] sm:h-3.5 sm:w-3.5 dark:text-amber-200/80 dark:drop-shadow-[0px_3px_8px_rgba(186,130,21,0.62)]" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-1">
              <h3 className="font-medium">{model.displayName}</h3>
              {isExperimental(model) && (
                <FlaskConical
                  className="h-3.5 w-3.5"
                  aria-label="Experimental Model"
                  data-state="closed"
                />
              )}
              {isPremium(model) && (
                <Gem
                  className="h-3.5 w-3.5"
                  aria-label="Premium Model"
                  data-state="closed"
                />
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isEnabled}
              data-state={isEnabled ? "checked" : "unchecked"}
              value="on"
              onClick={() => onToggle(model.id)}
              className="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary"
            >
              <span
                data-state={isEnabled ? "checked" : "unchecked"}
                className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                  isEnabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="relative">
            <p className="mr-12 text-xs sm:text-sm">
              {showFullDescription
                ? model.longDescription
                : hasMoreContent
                  ? firstSentence
                  : model.longDescription}
            </p>
            {hasMoreContent && (
              <button
                className="mt-1 text-xs"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? "Show less" : "Show more"}
              </button>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between gap-1 sm:mt-2 sm:gap-2">
            <FeatureBadges features={model.features} />
            <Button
              variant="ghost"
              size="sm"
              className="items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 h-8 rounded-md px-3 text-xs hidden text-muted-foreground sm:flex"
            >
              <Link className="mr-1.5 h-2 w-2" />
              Search URL
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ModelsPage() {
  const [enabledModels, setEnabledModels] = useState<Set<string>>(
    new Set(MODEL_CONFIGS.slice(0, 3).map((m) => m.id)) // Enable first 3 models by default
  );
  const [showNewModelsNotification, setShowNewModelsNotification] =
    useState(true);

  const handleToggleModel = (modelId: string) => {
    setEnabledModels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  const handleSelectRecommended = () => {
    // Select recommended models (first few from each provider)
    const recommended = MODEL_CONFIGS.filter(
      (m) =>
        m.id === "gpt-4.1-2025-04-14" ||
        m.id === "gemini-2.5-pro-exp-03-25" ||
        m.id === "o4-mini-2025-04-16"
    ).map((m) => m.id);
    setEnabledModels(new Set(recommended));
  };

  const handleUnselectAll = () => {
    setEnabledModels(new Set());
  };

  const newModels = MODEL_CONFIGS.filter(isNewModel);

  return (
    <SettingsLayout defaultTab="models">
      <TabsContent value="models" className="mt-2 space-y-8">
        <div className="flex h-full flex-col space-y-6">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Available Models</h2>
            <p className="mt-2 text-sm text-muted-foreground/80 sm:text-base">
              Choose which models appear in your model selector. This won't
              affect existing conversations.
            </p>
          </div>

          {showNewModelsNotification && newModels.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-pink-500/20 bg-pink-500/10 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="hidden h-5 w-5 text-[#ffb525f7] drop-shadow-[0px_3px_8px_#ffae1082] sm:block dark:text-amber-200/80 dark:drop-shadow-[0px_3px_8px_rgba(186,130,21,0.62)]" />
                <div>
                  <h3 className="font-medium text-muted-foreground">
                    {newModels.length} new models added!
                  </h3>
                  <p className="text-start text-sm text-muted-foreground">
                    {newModels.map((m) => m.displayName).join(", ")} are
                    available now!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewModelsNotification(false)}
                  className="border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20"
                >
                  Got it
                </Button>
              </div>
            </div>
          )}

          <div className="flex w-full flex-row items-baseline justify-between gap-3 sm:items-center sm:gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-md px-3 whitespace-nowrap text-xs sm:text-sm"
              >
                Filter by features
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectRecommended}
                className="hidden h-8 rounded-md px-3 text-xs sm:visible sm:flex sm:text-sm"
              >
                Select Recommended Models
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnselectAll}
                className="h-8 rounded-md px-3 text-xs sm:text-sm"
              >
                Unselect All
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full space-y-4 overflow-y-auto custom-scrollbar sm:h-[65vh] sm:min-h-[670px]">
              {MODEL_CONFIGS.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  isEnabled={enabledModels.has(model.id)}
                  onToggle={handleToggleModel}
                />
              ))}
            </div>
          </div>
        </div>
      </TabsContent>
    </SettingsLayout>
  );
}
