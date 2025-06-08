"use client"

import { useState } from "react"
import { Copy, Check, CircleCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
	text: string
	className?: string
	size?: "sm" | "md" | "lg"
	variant?: "ghost" | "outline" | "secondary"
}

export function CopyButton({ 
	text, 
	className, 
	size = "sm", 
	variant = "ghost" 
}: CopyButtonProps) {
	const [isCopied, setIsCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text)
			
			// Show the check icon and sonner toast
			setIsCopied(true)
			toast("Copied to Clipboard!", {
				icon: <CircleCheck className="h-4 w-4" />,
				duration: 2000,
			})

			// Reset the icon back to copy after 2 seconds
			setTimeout(() => {
				setIsCopied(false)
			}, 2000)
		} catch (err) {
			console.error('Failed to copy text: ', err)
			toast.error("Failed to copy to clipboard")
		}
	}

	const iconSize = {
		sm: "h-3 w-3",
		md: "h-4 w-4", 
		lg: "h-5 w-5"
	}

	return (
		<Button
			variant={variant}
			size="icon"
			onClick={handleCopy}
			className={cn(
				"transition-all duration-200",
				size === "sm" && "h-6 w-6",
				size === "md" && "h-8 w-8",
				size === "lg" && "h-10 w-10",
				className
			)}
		>
			{isCopied ? (
				<Check className={iconSize[size]} />
			) : (
				<Copy className={iconSize[size]} />
			)}
		</Button>
	)
} 