"use client";

import { TabsContent } from "@/components/ui/tabs";
import { SettingsLayout } from "@/components/layout/settings-layout";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  Sparkles,
  Headset,
  Info,
  ArrowRight,
  Copy,
} from "lucide-react";

export default function AccountPage() {
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

        {/* Message Usage - Mobile Only */}
        <div className="space-y-6 rounded-lg bg-card p-4 md:hidden">
          <div className="flex flex-row justify-between sm:flex-col sm:justify-between lg:flex-row lg:items-center">
            <span className="text-sm font-semibold">Message Usage</span>
            <div className="text-xs text-muted-foreground">
              <p>Resets 06/21/2025</p>
            </div>
          </div>
          <div className="space-y-6">
            {/* Standard Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Standard</h3>
                <span className="text-sm text-muted-foreground">169/1500</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: "11.2667%" }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                1331 messages remaining
              </p>
            </div>

            {/* Premium Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <h3 className="text-sm font-medium">Premium</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    aria-label="Premium credits info"
                  >
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">48/100</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: "48%" }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                52 messages remaining
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
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
          <div className="w-fit space-y-2">
            <h2 className="text-2xl font-bold">Support Information</h2>
            <div className="space-y-2">
              <p className="px-px py-1.5 text-sm text-muted-foreground/80">
                Your user ID may be requested by our support team to help
                resolve issues.
              </p>
              <Button
                variant="outline"
                className="flex items-center gap-2 hover:bg-input/60"
              >
                <span>Copy User ID</span>
                <Copy className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </SettingsLayout>
  );
}
