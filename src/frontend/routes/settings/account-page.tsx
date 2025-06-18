"use client";

import { TabsContent } from "@/components/ui/tabs";
import { SettingsLayout } from "@/components/layout";
import { UserStatsCard, SupportInfoCard } from "@/components/settings";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Rocket, Sparkles, Headset, ArrowRight } from "lucide-react";

export default function AccountPage() {
  const currentUser = useQuery(api.auth.getCurrentUser);

  return (
    <SettingsLayout defaultTab="account">
      <TabsContent value="account" className="space-y-8">
        <div className="space-y-6">
          {/* Pro Plan Benefits Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-center text-2xl font-bold md:text-left">
              Pro Plan Benefits
            </h2>
          </div>

          {/* Benefits Grid */}
          <div className="grid gap-3 md:grid-cols-3">
            {/* Access to All Models */}
            <div className="flex flex-col items-start rounded-lg border border-secondary/40 bg-card/30 px-6 py-4">
              <div className="mb-2 flex items-center">
                <Rocket className="mr-2 h-5 w-5 text-primary" />
                <span className="text-base font-semibold">
                  Access to All Models
                </span>
              </div>
              <p className="text-sm text-muted-foreground/80">
                Get access to our full suite of models including Claude,
                o3-mini-high, and more!
              </p>
            </div>

            {/* Generous Limits */}
            <div className="flex flex-col items-start rounded-lg border border-secondary/40 bg-card/30 px-6 py-4">
              <div className="mb-2 flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                <span className="text-base font-semibold">Generous Limits</span>
              </div>
              <p className="text-sm text-muted-foreground/80">
                Receive <b>1500 standard credits</b> per month, plus{" "}
                <b>100 premium credits</b>* per month.
              </p>
            </div>

            {/* Priority Support */}
            <div className="flex flex-col items-start rounded-lg border border-secondary/40 bg-card/30 px-6 py-4">
              <div className="mb-2 flex items-center">
                <Headset className="mr-2 h-5 w-5 text-primary" />
                <span className="text-base font-semibold">
                  Priority Support
                </span>
              </div>
              <p className="text-sm text-muted-foreground/80">
                Get faster responses and dedicated assistance from the T8 team
                whenever you need help!
              </p>
            </div>
          </div>

          {/* Manage Subscription Button */}
          <div className="flex flex-col gap-4 md:flex-row">
            <Button className="bg-primary text-primary-foreground shadow hover:bg-pink-600/90 w-full md:w-64">
              Manage Subscription
            </Button>
          </div>

          {/* Premium Credits Note */}
          <p className="text-sm text-muted-foreground/60">
            <span className="mx-0.5 text-base font-medium">*</span>
            Premium credits are used for GPT Image Gen, Claude Sonnet, and Grok
            3. Additional Premium credits can be purchased separately.
          </p>
        </div>

        {/* User Stats - Mobile Only */}
        <div className="md:hidden">
          <UserStatsCard showCustomizeButton={false} />
          <div className="mt-4 flex items-center justify-center">
            <Button className="bg-[rgb(162,59,103)] hover:bg-[#d56698] text-primary-foreground px-4 py-2 h-auto justify-center whitespace-normal text-start">
              Buy more premium credits
              <ArrowRight className="-mr-1 !size-3.5" />
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="!mt-20">
          <div className="w-fit space-y-2 border-0 border-muted-foreground/10">
            <h2 className="text-2xl font-bold">Danger Zone</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="px-px py-1.5 text-sm text-muted-foreground/80">
                  Permanently delete your account and all associated data.
                </p>
                <div className="flex flex-row gap-2">
                  <Button
                    variant="destructive"
                    className="border border-red-800/20 bg-red-800/80 hover:bg-red-600 dark:bg-red-800/20 hover:dark:bg-red-800"
                  >
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
      </TabsContent>
    </SettingsLayout>
  );
}
