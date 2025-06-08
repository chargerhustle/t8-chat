"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    ArrowUpIcon,
    Paperclip,
} from "lucide-react";
import { ModelDropdown } from "./model-dropdown";
import { MODEL_CONFIGS, ModelConfig, DEFAULT_MODEL } from "@/ai/models-config";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

interface ChatInputProps {
    onSubmit: (message: string, model: ModelConfig) => Promise<void>;
    isSubmitting: boolean;
    onInputChange?: (hasText: boolean) => void;
    value?: string;
    onValueChange?: (value: string) => void;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // Temporarily shrink to get the right scrollHeight
            textarea.style.height = `${minHeight}px`;

            // Calculate new height
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        // Set initial height
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

export function ChatInput({ onSubmit, isSubmitting, onInputChange, value, onValueChange }: ChatInputProps) {
    const [internalValue, setInternalValue] = useState("");
    const [selectedModel, setSelectedModel] = useState<ModelConfig>(
        MODEL_CONFIGS.find(m => m.model === DEFAULT_MODEL) || MODEL_CONFIGS[0]
    );
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        
        if (!currentValue.trim() || isSubmitting) return;
        
        const messageToSend = currentValue.trim();
        
        if (isControlled) {
            onValueChange?.("");
        } else {
            setInternalValue("");
        }

        adjustHeight(true);
        
        // Notify parent that input is now empty
        onInputChange?.(false);
        
        try {
            await onSubmit(messageToSend, selectedModel);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        if (isControlled) {
            onValueChange?.(newValue);
        } else {
            setInternalValue(newValue);
        }
        adjustHeight();
        
        // Notify parent about input state change
        onInputChange?.(newValue.trim().length > 0);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-8">
                <div className="w-full">
                    <div className="relative rounded-t-[20px] bg-[#282828]/75 backdrop-blur-lg border-t border-l border-r border-white/10">
                        <div className="relative flex w-full flex-col items-stretch gap-2 rounded-t-xl px-3 py-3 text-white"
                        >
                            <Textarea
                                ref={textareaRef}
                                value={currentValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message here..."
                                className={cn(
                                    "w-full px-4 py-3",
                                    "resize-none",
                                    "bg-transparent",
                                    "border-none",
                                    "text-white text-sm",
                                    "focus:outline-none",
                                    "focus-visible:ring-0 focus-visible:ring-offset-0",
                                    "placeholder:text-neutral-500 placeholder:text-sm",
                                    "min-h-[60px]",
                                    "custom-scrollbar"
                                )}
                                style={{
                                    overflow: "auto",
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3">
                            {/* Left side - Model Dropdown */}
                            <div className="flex items-center gap-2">
                                <ModelDropdown
                                    models={MODEL_CONFIGS}
                                    selectedModel={selectedModel}
                                    onSelect={setSelectedModel}
                                />
                            </div>
                            
                            {/* Right side - Attachments + Send */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="group p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                                >
                                    <Paperclip className="w-4 h-4 text-white" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!currentValue.trim() || isSubmitting}
                                    className={cn(
                                        "px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1",
                                        currentValue.trim() && !isSubmitting
                                            ? "bg-white text-black"
                                            : "text-zinc-400"
                                    )}
                                >
                                    <ArrowUpIcon
                                        className={cn(
                                            "w-4 h-4",
                                            currentValue.trim() && !isSubmitting
                                                ? "text-black"
                                                : "text-zinc-400"
                                        )}
                                    />
                                    <span className="sr-only">Send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

