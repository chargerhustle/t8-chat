"use client"

import { ReactNode } from "react"
import { useNavigate, useLocation } from "react-router"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SettingsTabsProps {
	children: ReactNode
	defaultValue?: string
}

export function SettingsTabs({ children, defaultValue = "account" }: SettingsTabsProps) {
	const navigate = useNavigate()
	const location = useLocation()
	
	// Extract current tab from URL path
	const currentTab = location.pathname.split('/settings/')[1] || defaultValue

	const handleTabChange = (value: string) => {
		navigate(`/settings/${value}`)
	}

	return (
		<div className="md:w-3/4 md:pl-12">
			<Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
				<TabsList className="!inline-flex !h-9 !items-center !gap-1 !rounded-lg !bg-secondary/80 !p-1 !text-secondary-foreground no-scrollbar -mx-0.5 w-full !justify-start !overflow-auto md:w-fit">
					<TabsTrigger 
						value="account"
						className="!inline-flex !items-center !justify-center !whitespace-nowrap !rounded-md !px-2.5 !py-1 !text-sm !font-medium !ring-offset-background !transition-all hover:!bg-sidebar-accent/40 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!pointer-events-none disabled:!opacity-50 data-[state=active]:!bg-background data-[state=active]:!text-foreground data-[state=active]:!shadow !border-transparent !h-7 !flex-none !min-h-0"
					>
						Account
					</TabsTrigger>
					<TabsTrigger 
						value="customization"
						className="!inline-flex !items-center !justify-center !whitespace-nowrap !rounded-md !px-2.5 !py-1 !text-sm !font-medium !ring-offset-background !transition-all hover:!bg-sidebar-accent/40 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!pointer-events-none disabled:!opacity-50 data-[state=active]:!bg-background data-[state=active]:!text-foreground data-[state=active]:!shadow !border-transparent !h-7 !flex-none !min-h-0"
					>
						Customization
					</TabsTrigger>
					<TabsTrigger 
						value="history"
						className="!inline-flex !items-center !justify-center !whitespace-nowrap !rounded-md !px-2.5 !py-1 !text-sm !font-medium !ring-offset-background !transition-all hover:!bg-sidebar-accent/40 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!pointer-events-none disabled:!opacity-50 data-[state=active]:!bg-background data-[state=active]:!text-foreground data-[state=active]:!shadow !border-transparent !h-7 !flex-none !min-h-0"
					>
						History & Sync
					</TabsTrigger>
					<TabsTrigger 
						value="models"
						className="!inline-flex !items-center !justify-center !whitespace-nowrap !rounded-md !px-2.5 !py-1 !text-sm !font-medium !ring-offset-background !transition-all hover:!bg-sidebar-accent/40 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!pointer-events-none disabled:!opacity-50 data-[state=active]:!bg-background data-[state=active]:!text-foreground data-[state=active]:!shadow !border-transparent !h-7 !flex-none !min-h-0"
					>
						Models
					</TabsTrigger>
					<TabsTrigger 
						value="api-keys"
						className="!inline-flex !items-center !justify-center !whitespace-nowrap !rounded-md !px-2.5 !py-1 !text-sm !font-medium !ring-offset-background !transition-all hover:!bg-sidebar-accent/40 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!pointer-events-none disabled:!opacity-50 data-[state=active]:!bg-background data-[state=active]:!text-foreground data-[state=active]:!shadow !border-transparent !h-7 !flex-none !min-h-0"
					>
						API Keys
					</TabsTrigger>
					<TabsTrigger 
						value="attachments"
						className="!inline-flex !items-center !justify-center !whitespace-nowrap !rounded-md !px-2.5 !py-1 !text-sm !font-medium !ring-offset-background !transition-all hover:!bg-sidebar-accent/40 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!pointer-events-none disabled:!opacity-50 data-[state=active]:!bg-background data-[state=active]:!text-foreground data-[state=active]:!shadow !border-transparent !h-7 !flex-none !min-h-0"
					>
						Attachments
					</TabsTrigger>
					<TabsTrigger 
						value="contact"
						className="!inline-flex !items-center !justify-center !whitespace-nowrap !rounded-md !px-2.5 !py-1 !text-sm !font-medium !ring-offset-background !transition-all hover:!bg-sidebar-accent/40 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!pointer-events-none disabled:!opacity-50 data-[state=active]:!bg-background data-[state=active]:!text-foreground data-[state=active]:!shadow !border-transparent !h-7 !flex-none !min-h-0"
					>
						Contact Us
					</TabsTrigger>
				</TabsList>
				{children}
			</Tabs>
		</div>
	)
} 