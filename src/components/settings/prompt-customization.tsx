"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function PromptCustomization() {
	const [name, setName] = useState("")
	const [occupation, setOccupation] = useState("")
	const [traits, setTraits] = useState("")
	const [additionalInfo, setAdditionalInfo] = useState("")

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold">Customize T8 Chat</h2>
			<form className="grid gap-6 py-2">
				{/* Name Input */}
				<div className="relative grid gap-2">
					<Label className="text-base font-medium">What should T8 Chat call you?</Label>
					<Input
						className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
						placeholder="Enter your name"
						maxLength={50}
						value={name}
						onChange={(e) => setName(e.target.value)}
						name="name"
					/>
					<span className="pointer-events-none absolute bottom-2 right-2 text-xs font-normal text-muted-foreground">
						{name.length}/50
					</span>
				</div>

				{/* Occupation Input */}
				<div className="relative grid gap-2">
					<Label className="text-base font-medium">What do you do?</Label>
					<Input
						className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
						placeholder="Engineer, student, etc."
						maxLength={100}
						value={occupation}
						onChange={(e) => setOccupation(e.target.value)}
						name="occupation"
					/>
					<span className="pointer-events-none absolute bottom-2 right-2 text-xs font-normal text-muted-foreground">
						{occupation.length}/100
					</span>
				</div>

				{/* Traits Input */}
				<div className="relative grid gap-2">
					<div className="flex items-center gap-2">
						<Label className="text-base font-medium">
							What traits should T8 Chat have?
						</Label>
					</div>
					<Textarea
						className="min-h-[100px] custom-scrollbar focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
						name="traits"
						placeholder="Friendly, witty, concise, curious, empathetic, creative, patient..."
						maxLength={500}
						value={traits}
						onChange={(e) => setTraits(e.target.value)}
					/>
					<span className="pointer-events-none absolute bottom-2 right-2 text-xs font-normal text-muted-foreground">
						{traits.length}/500
					</span>
				</div>

				{/* Additional Info */}
				<div className="relative grid gap-2">
					<div className="flex items-center gap-2">
						<Label className="text-base font-medium">
							Anything else T8 Chat should know about you?
						</Label>
					</div>
					<Textarea
						className="min-h-[100px] custom-scrollbar focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
						name="additionalInfo"
						placeholder="Interests, values, or preferences to keep in mind"
						maxLength={3000}
						value={additionalInfo}
						onChange={(e) => setAdditionalInfo(e.target.value)}
					/>
					<span className="pointer-events-none absolute bottom-2 right-2 text-xs font-normal text-muted-foreground">
						{additionalInfo.length}/3000
					</span>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-row items-center gap-2 justify-between">
					<Button variant="outline" type="button">
						Load Legacy Data
					</Button>
					<Button type="submit" disabled>
						Save Preferences
					</Button>
				</div>
			</form>
		</div>
	)
} 