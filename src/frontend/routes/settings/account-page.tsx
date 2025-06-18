"use client";

import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { SettingsLayout } from "@/components/layout";
import { UserStatsCard, SupportInfoCard } from "@/components/settings";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, Zap, Trash2 } from "lucide-react";
import { DeleteAccountDialog } from "@/components/auth/delete-account-dialog";

export default function AccountPage() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <SettingsLayout defaultTab="account">
      <TabsContent value="account" className="space-y-8">
        <div className="space-y-6">
          {/* Account Overview Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-center text-2xl font-bold md:text-left">
                Your Account
              </h2>
              <p className="mt-1 text-center text-sm text-muted-foreground md:text-left">
                Here&apos;s what you&apos;ve got going on
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid gap-3 md:grid-cols-3">
            {/* Chat Features */}
            <div className="flex flex-col items-start rounded-lg border border-secondary/40 bg-card/30 px-6 py-4">
              <div className="mb-2 flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                <span className="text-base font-semibold">
                  Chat & Conversations
                </span>
              </div>
              <p className="text-sm text-muted-foreground/80">
                Create unlimited threads, organize your chats, and keep your
                conversations flowing.
              </p>
            </div>

            {/* File Attachments */}
            <div className="flex flex-col items-start rounded-lg border border-secondary/40 bg-card/30 px-6 py-4">
              <div className="mb-2 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                <span className="text-base font-semibold">
                  File Attachments
                </span>
              </div>
              <p className="text-sm text-muted-foreground/80">
                Upload images, documents, and other files to enhance your
                conversations.
              </p>
            </div>

            {/* AI Models */}
            <div className="flex flex-col items-start rounded-lg border border-secondary/40 bg-card/30 px-6 py-4">
              <div className="mb-2 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-primary" />
                <span className="text-base font-semibold">AI Models</span>
              </div>
              <p className="text-sm text-muted-foreground/80">
                Chat with different AI models and find the one that works best
                for you.
              </p>
            </div>
          </div>
        </div>

        {/* User Stats - Mobile Only */}
        <div className="md:hidden">
          <UserStatsCard showCustomizeButton={false} />
        </div>

        {/* Account Management */}
        <div className="!mt-20">
          <div className="w-fit space-y-2 border-0 border-muted-foreground/10">
            <h2 className="text-2xl font-bold">Account Management</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="px-px py-1.5 text-sm text-muted-foreground/80">
                  Need to clean house? This will permanently delete your account
                  and all your data.
                </p>
                <div className="flex flex-row gap-2">
                  <Button
                    variant="destructive"
                    className="border border-red-800/20 bg-red-800/80 hover:bg-red-600 dark:bg-red-800/20 hover:dark:bg-red-800"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Information - Mobile Only */}
        <div className="mt-8 block md:hidden">
          <SupportInfoCard />
        </div>

        {/* Delete Account Dialog */}
        <DeleteAccountDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        />
      </TabsContent>
    </SettingsLayout>
  );
}
