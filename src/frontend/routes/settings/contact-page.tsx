"use client"

import { TabsContent } from "@/components/ui/tabs"
import { SettingsLayout } from "@/components/layout/settings-layout"

export default function ContactPage() {
	return (
		<SettingsLayout defaultTab="contact">
			<TabsContent value="contact" className="space-y-8">
				<div className="text-center py-8">
					<p className="text-muted-foreground">Contact settings coming soon...</p>
				</div>
			</TabsContent>
		</SettingsLayout>
	)
} 