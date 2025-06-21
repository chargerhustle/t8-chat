"use client";

import { TabsContent } from "@/components/ui/tabs";
import { SettingsLayout, useSettingsData } from "@/components/layout";
import {
  PromptCustomization,
  VisualCustomization,
  MemoryManagement,
} from "@/components/settings";

/**
 * Renders the content for the customization settings tab, including prompt, memory, and visual customization sections.
 */
function CustomizationPageContent() {
  const { userCustomization } = useSettingsData();

  return (
    <TabsContent value="customization" className="space-y-8">
      <PromptCustomization customization={userCustomization} />
      <MemoryManagement customization={userCustomization} />
      <VisualCustomization />
    </TabsContent>
  );
}

/**
 * Renders the customization settings page within the settings layout, displaying user customization options in the "customization" tab.
 */
export default function CustomizationPage() {
  return (
    <SettingsLayout defaultTab="customization">
      <CustomizationPageContent />
    </SettingsLayout>
  );
}
