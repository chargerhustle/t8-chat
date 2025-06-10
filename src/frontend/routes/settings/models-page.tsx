"use client"

import { TabsContent } from "@/components/ui/tabs"
import { SettingsLayout } from "@/components/layout/settings-layout"

export default function ModelsPage() {
	return (
		<SettingsLayout defaultTab="models">
			<TabsContent value="models" className="space-y-8">
				<div className="text-center py-8">
					<p className="text-muted-foreground">Model settings coming soon...</p>
				</div>
			</TabsContent>
		</SettingsLayout>
	)
} 