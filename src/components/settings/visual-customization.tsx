"use client";

import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { toast } from "sonner";
import { CodeBlockCode } from "@/components/ui/code-block";

/**
 * Renders the visual customization settings UI, allowing users to toggle personal information visibility, enable detailed message statistics, and preview font selections.
 *
 * Provides interactive controls for user visual preferences, including toggles for hiding personal information and enabling advanced statistics, as well as a preview of main text and code fonts.
 */
export function VisualCustomization() {
  const { preferences, updatePreference } = useUserPreferences();
  const { hidePersonalInfo, statsForNerds } = preferences;

  const handleTogglePreference = async <K extends keyof typeof preferences>(
    key: K,
    value: (typeof preferences)[K]
  ) => {
    try {
      await updatePreference(key, value);
    } catch (error) {
      console.error(`Failed to update ${key} preference:`, error);
      toast.error(`Failed to update preference. Please try again.`);
    }
  };

  const exampleCode = `function greet(name: string) {
	console.log(\`Hello, \${name}!\`);
	return true;
}`;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Visual Options</h2>
      <div className="space-y-6 py-2">
        {/* Toggle Options */}
        <div className="flex items-center justify-between gap-x-1">
          <div className="space-y-0.5">
            <Label className="font-medium text-base">
              Hide Personal Information
            </Label>
            <p className="text-sm text-muted-foreground">
              Hides your name and email from the UI.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={hidePersonalInfo}
            data-state={hidePersonalInfo ? "checked" : "unchecked"}
            className="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary"
            onClick={() =>
              handleTogglePreference("hidePersonalInfo", !hidePersonalInfo)
            }
          >
            <span
              data-state={hidePersonalInfo ? "checked" : "unchecked"}
              className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-x-1">
          <div className="space-y-0.5">
            <Label className="font-medium text-base">Stats for Nerds</Label>
            <p className="text-sm text-muted-foreground">
              Enables more insights into message stats including tokens per
              second, time to first token, and estimated tokens in the message.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={statsForNerds}
            data-state={statsForNerds ? "checked" : "unchecked"}
            className="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary"
            onClick={() =>
              handleTogglePreference("statsForNerds", !statsForNerds)
            }
          >
            <span
              data-state={statsForNerds ? "checked" : "unchecked"}
              className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
            />
          </button>
        </div>

        {/* Font Selection */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="space-y-0.5">
                  <Label className="font-medium text-base">
                    Main Text Font
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Used in general text throughout the app.
                  </p>
                </div>
                <button
                  type="button"
                  role="combobox"
                  aria-controls="main-text-font-options"
                  aria-expanded="false"
                  className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full"
                >
                  <span>Atkinson Hyperlegible</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="space-y-0.5">
                  <Label className="font-medium text-base">Code Font</Label>
                  <p className="text-sm text-muted-foreground">
                    Used in code blocks and inline code in chat messages.
                  </p>
                </div>
                <button
                  type="button"
                  role="combobox"
                  aria-controls="code-font-options"
                  aria-expanded="false"
                  className="flex h-9 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full"
                >
                  <span>
                    Berkeley Mono{" "}
                    <span className="text-xs text-muted-foreground">
                      (default)
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>
              </div>
            </div>
            <div>
              <h1 className="text-base font-medium">Fonts Preview</h1>
              <div className="rounded-lg border border-dashed border-input p-4">
                <div className="prose prose-pink max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 font-atkinson">
                  <div className="flex justify-end">
                    <div className="group relative inline-block max-w-[80%] break-words rounded-xl border border-secondary/50 bg-secondary/50 px-4 py-3 text-left">
                      Can you write me a simple hello world program?
                    </div>
                  </div>
                  <div className="mb-2 mt-4">
                    <div className="max-w-[80%]">Sure, here you go:</div>
                  </div>
                  <CodeBlockCode
                    code={exampleCode}
                    language="typescript"
                    showHeader={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
