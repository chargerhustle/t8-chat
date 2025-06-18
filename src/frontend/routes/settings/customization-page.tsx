"use client";

import { TabsContent } from "@/components/ui/tabs";
import { SettingsLayout } from "@/components/layout";
import {
  PromptCustomization,
  VisualCustomization,
} from "@/components/settings";

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
