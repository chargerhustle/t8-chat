"use client";

import { TabsContent } from "@/components/ui/tabs";
import { SettingsLayout } from "@/components/layout/settings-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <SettingsLayout defaultTab="api-keys">
      <TabsContent value="api-keys" className="space-y-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold">API Keys</h2>
            <p className="text-sm text-muted-foreground">
              Bring your own API keys for select models. Messages sent using
              your API keys will not count towards your monthly limits.
            </p>
          </div>

          <div className="space-y-6">
            {/* Anthropic API Key */}
            <div className="space-y-4 rounded-lg border border-input p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <h3 className="font-semibold">Anthropic API Key</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Used for the following models:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    Claude 3.5 Sonnet
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    Claude 3.7 Sonnet
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    Claude 3.7 Sonnet (Reasoning)
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    Claude 4 Opus
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    Claude 4 Sonnet
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    Claude 4 Sonnet (Reasoning)
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="sk-ant-..."
                    className="bg-background focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
                  />
                  <p className="prose prose-pink text-xs text-muted-foreground">
                    Get your API key from{" "}
                    <a
                      href="https://console.anthropic.com/account/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline hover:underline"
                    >
                      Anthropic's Console
                    </a>
                  </p>
                </div>
                <div className="flex w-full justify-end gap-2">
                  <Button className="bg-primary text-primary-foreground shadow hover:bg-pink-600/90">
                    Save
                  </Button>
                </div>
              </div>
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-4 rounded-lg border border-input p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <h3 className="font-semibold">OpenAI API Key</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Used for the following models:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    GPT-4.5
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    o3
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    className="bg-background focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
                  />
                  <p className="prose prose-pink text-xs text-muted-foreground">
                    Get your API key from{" "}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline hover:underline"
                    >
                      OpenAI's Dashboard
                    </a>
                  </p>
                </div>
                <div className="flex w-full justify-end gap-2">
                  <Button className="bg-primary text-primary-foreground shadow hover:bg-pink-600/90">
                    Save
                  </Button>
                </div>
              </div>
            </div>

            {/* Google API Key */}
            <div className="space-y-4 rounded-lg border border-input p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <h3 className="font-semibold">Google API Key</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Used for the following models:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    Gemini 2.0 Flash
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    Gemini 2.0 Flash Lite
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    Gemini 2.5 Flash
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    Gemini 2.5 Flash (Thinking)
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    Gemini 2.5 Pro
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="AIza..."
                    className="bg-background focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
                  />
                  <p className="prose prose-pink text-xs text-muted-foreground">
                    Get your API key from{" "}
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline hover:underline"
                    >
                      Google Cloud Console
                    </a>
                  </p>
                </div>
                <div className="flex w-full justify-end gap-2">
                  <Button className="bg-primary text-primary-foreground shadow hover:bg-pink-600/90">
                    Save
                  </Button>
                </div>
              </div>
            </div>

            {/* OpenRouter API Key */}
            <div className="space-y-4 rounded-lg border border-input p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    <h3 className="font-semibold">OpenRouter API Key</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Used for the models of the following providers:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    OpenAI
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    Anthropic
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    Google Gemini
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    Llama
                  </span>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                    All other models
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="sk-or-..."
                    className="bg-background focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
                  />
                  <p className="prose prose-pink text-xs text-muted-foreground">
                    Get your API key from{" "}
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline hover:underline"
                    >
                      OpenRouter Dashboard
                    </a>
                  </p>
                </div>
                <div className="flex w-full justify-end gap-2">
                  <Button className="bg-primary text-primary-foreground shadow hover:bg-pink-600/90">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </SettingsLayout>
  );
}
