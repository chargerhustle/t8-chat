"use client";

import { TabsContent } from "@/components/ui/tabs";
import { SettingsLayout } from "@/components/layout/settings-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Key, Trash, Check } from "lucide-react";
import { useApiKey } from "@/hooks/use-api-key";

export default function ApiKeysPage() {
  const anthropicKey = useApiKey("anthropic");
  const openaiKey = useApiKey("openai");
  const googleKey = useApiKey("google");
  const openrouterKey = useApiKey("openrouter");

  const renderApiKeySection = (
    title: string,
    models: string[],
    linkUrl: string,
    linkText: string,
    keyManager: ReturnType<typeof useApiKey>,
    provider: string
  ) => (
    <div className="space-y-4 rounded-lg border border-input p-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <h3 className="font-semibold">{title}</h3>
          </div>
          {keyManager.state.isSaved && (
            <div className="flex gap-2">
              <CopyButton
                text={keyManager.state.value}
                size="md"
                variant="ghost"
                className="h-9 w-9 hover:bg-muted/40 hover:text-foreground"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={keyManager.deleteKey}
                className="h-9 w-9 hover:bg-muted/40 hover:text-foreground"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Used for the following models:
        </p>
        <div className="flex flex-wrap gap-2">
          {models.map((model) => (
            <span
              key={model}
              className="rounded-full bg-secondary px-2 py-1 text-xs"
            >
              {model}
            </span>
          ))}
        </div>
      </div>

      {keyManager.state.isSaved ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-green-500" />
          API key configured
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              id={`${provider}-api-key-input`}
              name={`${provider}ApiKey`}
              type="password"
              placeholder={keyManager.getPlaceholder()}
              value={keyManager.state.value}
              onChange={(e) => keyManager.updateValue(e.target.value)}
              className="bg-background focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
            />
            <p className="prose prose-pink text-xs text-muted-foreground">
              Get your API key from{" "}
              <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline hover:underline"
              >
                {linkText}
              </a>
            </p>
          </div>
          <div className="flex w-full justify-end gap-2">
            <Button
              onClick={() => keyManager.saveKey(keyManager.state.value)}
              disabled={!keyManager.state.value.trim()}
              className="bg-primary text-primary-foreground shadow hover:bg-pink-600/90"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <SettingsLayout defaultTab="api-keys">
      <TabsContent value="api-keys" className="space-y-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold">API Keys</h2>
            <p className="text-sm text-muted-foreground">
              Bring your own API keys for select models. Messages sent using
              your API keys will not count towards your monthly limits. Keys are
              stored on your device and never sent to our servers.
            </p>
          </div>

          <div className="space-y-6">
            {/* Anthropic API Key */}
            {renderApiKeySection(
              "Anthropic API Key",
              [
                "Claude 3.5 Sonnet",
                "Claude 3.7 Sonnet",
                "Claude 3.7 Sonnet (Reasoning)",
                "Claude 4 Opus",
                "Claude 4 Sonnet",
                "Claude 4 Sonnet (Reasoning)",
              ],
              "https://console.anthropic.com/account/keys",
              "Anthropic's Console",
              anthropicKey,
              "anthropic"
            )}

            {/* OpenAI API Key */}
            {renderApiKeySection(
              "OpenAI API Key",
              ["GPT-4.5", "o3"],
              "https://platform.openai.com/api-keys",
              "OpenAI's Dashboard",
              openaiKey,
              "openai"
            )}

            {/* Google API Key */}
            {renderApiKeySection(
              "Google API Key",
              [
                "Gemini 2.0 Flash",
                "Gemini 2.0 Flash Lite",
                "Gemini 2.5 Flash",
                "Gemini 2.5 Flash (Thinking)",
                "Gemini 2.5 Pro",
              ],
              "https://console.cloud.google.com/apis/credentials",
              "Google Cloud Console",
              googleKey,
              "google"
            )}

            {/* OpenRouter API Key */}
            {renderApiKeySection(
              "OpenRouter API Key",
              [
                "OpenAI",
                "Anthropic",
                "Google Gemini",
                "Llama",
                "All other models",
              ],
              "https://openrouter.ai/keys",
              "OpenRouter Dashboard",
              openrouterKey,
              "openrouter"
            )}
          </div>
        </div>
      </TabsContent>
    </SettingsLayout>
  );
}
