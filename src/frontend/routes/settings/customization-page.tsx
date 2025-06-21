"use client";

import { TabsContent } from "@/components/ui/tabs";
import { SettingsLayout, useSettingsData } from "@/components/layout";
import {
  PromptCustomization,
  VisualCustomization,
  MemoryManagement,
} from "@/components/settings";

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

export default function CustomizationPage() {
  return (
    <SettingsLayout defaultTab="customization">
      <CustomizationPageContent />
    </SettingsLayout>
  );
}
