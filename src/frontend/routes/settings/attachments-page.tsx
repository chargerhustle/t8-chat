"use client";

import { TabsContent } from "@/components/ui/tabs";
import { SettingsLayout } from "@/components/layout/settings-layout";

export default function AttachmentsPage() {
  return (
    <SettingsLayout defaultTab="attachments">
      <TabsContent value="attachments" className="space-y-8">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Attachments settings coming soon...
          </p>
        </div>
      </TabsContent>
    </SettingsLayout>
  );
}
