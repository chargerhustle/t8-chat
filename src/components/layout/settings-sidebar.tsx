"use client"

import { Copy, Info, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export function SettingsSidebar() {
	const currentUser = useQuery(api.auth.getCurrentUser)
	return (
		<div className="hidden space-y-8 md:block md:w-1/4">
			{/* Profile Section */}
			<div className="relative text-center">
				<Avatar className="mx-auto h-40 w-40">
					<AvatarImage 
						src={currentUser?.image || ""} 
						alt="Profile picture"
					/>
					<AvatarFallback>
						{currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
					</AvatarFallback>
				</Avatar>
				<h1 className="mt-4 text-2xl font-bold">{currentUser?.name || 'Loading...'}</h1>
				<div className="relative flex items-center justify-center">
					<p className="break-all text-muted-foreground"></p>
				</div>
				<p 
					className="perspective-1000 group relative h-6 cursor-pointer break-all text-muted-foreground"
					role="button"
					tabIndex={0}
					aria-label="Copy user ID to clipboard"
				>
					<span className="absolute inset-0 transition-transform duration-300 [backface-visibility:hidden] [transform-style:preserve-3d] truncate group-hover:[transform:rotateX(180deg)]">
						{currentUser?.email || 'Loading...'}
					</span>
					<span className="absolute inset-0 transition-transform duration-300 [backface-visibility:hidden] [transform-style:preserve-3d] [transform:rotateX(180deg)] group-hover:[transform:rotateX(0deg)]">
						<span className="flex h-6 items-center justify-center gap-2 text-sm">
							<span className="flex items-center gap-2">
								Copy User ID
								<Copy className="h-4 w-4 text-muted-foreground" />
							</span>
						</span>
					</span>
				</p>
				<span className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-primary text-primary-foreground">
					Pro Plan
				</span>
			</div>

			{/* Message Usage */}
			<div className="space-y-6 rounded-lg bg-card p-4">
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
							<span className="text-sm text-muted-foreground">164/1500</span>
						</div>
						<div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
							<div className="h-full rounded-full bg-primary" style={{ width: "10.9333%" }}></div>
						</div>
						<p className="text-sm text-muted-foreground">1336 messages remaining</p>
					</div>

					{/* Premium Usage */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-1">
								<h3 className="text-sm font-medium">Premium</h3>
								<Button variant="ghost" size="icon" className="h-4 w-4">
									<Info className="h-4 w-4 text-muted-foreground" />
								</Button>
							</div>
							<span className="text-sm text-muted-foreground">48/100</span>
						</div>
						<div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
							<div className="h-full rounded-full bg-primary" style={{ width: "48%" }}></div>
						</div>
						<p className="text-sm text-muted-foreground">52 messages remaining</p>
					</div>
				</div>
				<div className="flex items-center justify-center">
					<Button className="bg-[rgb(162,59,103)] hover:bg-[#d56698] text-primary-foreground px-4 py-2 h-auto justify-center whitespace-normal text-start">
						Buy more premium credits
						<ArrowRight className="-mr-1 !size-3.5" />
					</Button>
				</div>
			</div>

			{/* Keyboard Shortcuts */}
			<div className="space-y-6 rounded-lg bg-card p-4">
				<span className="text-sm font-semibold">Keyboard Shortcuts</span>
				<div className="grid gap-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">Search</span>
						<div className="flex gap-1">
							<kbd className="rounded bg-background px-2 py-1 font-sans text-sm">Ctrl</kbd>
							<kbd className="rounded bg-background px-2 py-1 font-sans text-sm">K</kbd>
						</div>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">New Chat</span>
						<div className="flex gap-1">
							<kbd className="rounded bg-background px-2 py-1 font-sans text-sm">Ctrl</kbd>
							<kbd className="rounded bg-background px-2 py-1 font-sans text-sm">Shift</kbd>
							<kbd className="rounded bg-background px-2 py-1 font-sans text-sm">O</kbd>
						</div>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">Toggle Sidebar</span>
						<div className="flex gap-1">
							<kbd className="rounded bg-background px-2 py-1 font-sans text-sm">Ctrl</kbd>
							<kbd className="rounded bg-background px-2 py-1 font-sans text-sm">B</kbd>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
} 