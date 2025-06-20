"use client";

import { TabsContent } from "@/components/ui/tabs";
import { SettingsLayout } from "@/components/layout";
import {
  PromptCustomization,
  VisualCustomization,
  MemoryManagement,
} from "@/components/settings";

export default function CustomizationPage() {
  return (
    <SettingsLayout defaultTab="customization">
      <TabsContent value="customization" className="space-y-8">
        <PromptCustomization />
        <MemoryManagement />
        <VisualCustomization />
      </TabsContent>
    </SettingsLayout>
  );
}
