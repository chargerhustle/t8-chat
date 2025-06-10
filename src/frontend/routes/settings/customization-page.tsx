"use client";

import { TabsContent } from "@/components/ui/tabs";
import { SettingsLayout } from "@/components/layout/settings-layout";
import { PromptCustomization } from "@/components/settings/prompt-customization";
import { VisualCustomization } from "@/components/settings/visual-customization";

export default function CustomizationPage() {
  return (
    <SettingsLayout defaultTab="customization">
      <TabsContent value="customization" className="space-y-12">
        <PromptCustomization />
        <VisualCustomization />
      </TabsContent>
    </SettingsLayout>
  );
}
