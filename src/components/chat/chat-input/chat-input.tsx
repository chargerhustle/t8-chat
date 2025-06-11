"use client";

import {
  useEffect,
  useRef,
  useCallback,
  useState,
  useLayoutEffect,
} from "react";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, Paperclip, Globe, ChevronDown } from "lucide-react";
import { ModelDropdown } from "./model-dropdown";
import { ReasoningEffortDropdown } from "./reasoning-effort-dropdown";
import { MODEL_CONFIGS, ModelConfig, DEFAULT_MODEL } from "@/ai/models-config";
import { EffortLevel } from "@/types";
import {
  AttachmentsList,
  type Attachment,
} from "@/components/chat/attachments";
import { useAttachmentsHeight } from "@/hooks/use-chat-input-height";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

interface ChatInputProps {
  onSubmit: (
    message: string,
    model: ModelConfig,
    reasoningEffort?: EffortLevel,
    includeSearch?: boolean
  ) => Promise<void>;
  isSubmitting: boolean;
  onInputChange?: (hasText: boolean) => void;
  value?: string;
  onValueChange?: (value: string) => void;
  showScrollToBottom?: boolean;
  onScrollToBottom?: () => void;
  onHeightChange?: (height: number) => void;
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
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
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

export function ChatInput({
  onSubmit,
  isSubmitting,
  onInputChange,
  value,
  onValueChange,
  showScrollToBottom,
  onScrollToBottom,
  onHeightChange,
}: ChatInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(
    MODEL_CONFIGS.find((m) => m.model === DEFAULT_MODEL) || MODEL_CONFIGS[0]
  );
  const [reasoningEffort, setReasoningEffort] = useState<EffortLevel>("medium");
  const [includeSearch, setIncludeSearch] = useState(false);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  // Mock attachments state for UI testing
  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: "1",
      fileName: "image.webp",
      fileUrl:
        "https://makerworld.bblmw.com/makerworld/model/US2ab61bb7d3000c/design/2024-01-30_029b2304056c.png?x-oss-process=image/resize,w_1000/format,webp",
      mimeType: "image/webp",
      status: "uploaded",
    },
  ]);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 200,
  });

  // Get ref for measuring attachments height
  const { attachmentsRef } = useAttachmentsHeight();

  // Simple ref for the container
  const chatInputContainerRef = useRef<HTMLDivElement>(null);

  // Calculate and report total height when content changes
  const calculateAndReportHeight = useCallback(() => {
    if (chatInputContainerRef.current && onHeightChange) {
      const totalHeight = chatInputContainerRef.current.offsetHeight;
      onHeightChange(totalHeight);
    }
  }, [onHeightChange]);

  // Measure height after DOM updates
  useLayoutEffect(() => {
    calculateAndReportHeight();
  }, [calculateAndReportHeight, attachments.length, currentValue]);

  // Check if current model supports search
  const modelSupportsSearch = selectedModel.features.includes("search");
  // Check if current model supports reasoning (for models like o1, o3, etc.)
  const modelSupportsReasoning = selectedModel.features.includes("reasoning");

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
      await onSubmit(
        messageToSend,
        selectedModel,
        modelSupportsReasoning ? reasoningEffort : undefined,
        includeSearch
      );
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

  const toggleSearch = () => {
    setIncludeSearch(!includeSearch);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  return (
    <div
      ref={chatInputContainerRef}
      className="pointer-events-none absolute bottom-0 z-10 w-full px-2"
    >
      <div className="relative mx-auto flex w-full max-w-3xl flex-col text-center">
        {showScrollToBottom && (
          <div className="flex justify-center pb-4">
            <button
              onClick={onScrollToBottom}
              className={cn(
                "justify-center whitespace-nowrap font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                "disabled:hover:bg-secondary/50 h-8 px-3 text-xs pointer-events-auto",
                "flex items-center gap-2 rounded-full border border-secondary/40",
                "bg-chat-overlay text-secondary-foreground/70 backdrop-blur-xl hover:bg-secondary"
              )}
            >
              <span className="pb-0.5">Scroll to bottom</span>
              <ChevronDown className="-mr-1 h-4 w-4" />
            </button>
          </div>
        )}
        <div className="pointer-events-none">
          <div className="pointer-events-auto mx-auto w-fit"></div>
          <div className="pointer-events-auto">
            <div
              className="![--c:--chat-input-gradient] backdrop-blur-lg bg-chat-input border-reflect p-2 pb-0 rounded-t-[20px]"
              style={
                {
                  "--gradientBorder-gradient":
                    "linear-gradient(180deg, var(--min), var(--max), var(--min)), linear-gradient(15deg, var(--min) 50%, var(--max))",
                  "--start": "#000000",
                  "--opacity": "1",
                } as React.CSSProperties
              }
            >
              <form
                onSubmit={handleSubmit}
                className={cn(
                  "relative flex w-full flex-col items-stretch gap-2 rounded-t-xl",
                  "border border-b-0 border-white/70 bg-chat-input",
                  "px-3 pt-3 text-secondary-foreground",
                  "outline outline-8 outline-[hsl(var(--chat-input-gradient)/0.5)]",
                  "pb-safe-offset-3 max-sm:pb-6 sm:max-w-3xl",
                  "dark:border-[hsl(0,0%,83%)]/[0.04] dark:bg-secondary/[0.045] dark:outline-chat-background/40"
                )}
                style={{
                  boxShadow:
                    "rgba(0, 0, 0, 0.1) 0px 80px 50px 0px, rgba(0, 0, 0, 0.07) 0px 50px 30px 0px, rgba(0, 0, 0, 0.06) 0px 30px 15px 0px, rgba(0, 0, 0, 0.04) 0px 15px 8px, rgba(0, 0, 0, 0.04) 0px 6px 4px, rgba(0, 0, 0, 0.02) 0px 2px 2px",
                }}
              >
                <div className="flex flex-grow flex-col">
                  <AttachmentsList
                    ref={attachmentsRef}
                    attachments={attachments}
                    onRemoveAttachment={handleRemoveAttachment}
                  />
                  <div className="flex flex-grow flex-row items-start">
                    <textarea
                      ref={textareaRef}
                      name="input"
                      id="chat-input"
                      value={currentValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message here..."
                      className="w-full resize-none bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-secondary-foreground/60 disabled:opacity-0 custom-scrollbar"
                      aria-label="Message input"
                      aria-describedby="chat-input-description"
                      autoComplete="off"
                      style={{ height: "48px !important" }}
                    />
                    <div id="chat-input-description" className="sr-only">
                      Press Enter to send, Shift + Enter for new line
                    </div>
                  </div>
                  <div className="-mb-px mt-2 flex w-full flex-row-reverse justify-between">
                    <div
                      className="-mr-0.5 -mt-0.5 flex items-center justify-center gap-2"
                      aria-label="Message actions"
                    >
                      <button
                        type="submit"
                        disabled={!currentValue.trim() || isSubmitting}
                        className={cn(
                          "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                          "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                          "border-reflect button-reflect",
                          "bg-[rgb(162,59,103)] font-semibold shadow hover:bg-[#d56698] active:bg-[rgb(162,59,103)]",
                          "disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)]",
                          "dark:bg-primary/20 dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40",
                          "disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20",
                          "h-9 w-9 relative rounded-lg p-2 text-pink-50"
                        )}
                        aria-label={
                          currentValue.trim()
                            ? "Send message"
                            : "Message requires text"
                        }
                        data-state="closed"
                      >
                        <ArrowUpIcon className="lucide lucide-arrow-up !size-5" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-2 pr-2 sm:flex-row sm:items-center">
                      <div className="ml-[-7px] flex items-center gap-1">
                        <ModelDropdown
                          models={MODEL_CONFIGS}
                          selectedModel={selectedModel}
                          onSelect={setSelectedModel}
                        />
                        {modelSupportsReasoning && (
                          <ReasoningEffortDropdown
                            value={reasoningEffort}
                            onValueChange={setReasoningEffort}
                          />
                        )}
                        {modelSupportsSearch && (
                          <button
                            type="button"
                            onClick={toggleSearch}
                            className={cn(
                              "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors",
                              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                              "disabled:cursor-not-allowed disabled:opacity-50",
                              "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                              "hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50",
                              "px-3 text-xs -mb-1.5 h-auto gap-2",
                              "rounded-full border border-solid border-secondary-foreground/10",
                              "py-1.5 pl-2 pr-2.5 text-muted-foreground max-sm:p-2",
                              includeSearch
                                ? "bg-pink-500/15 hover:text-foreground"
                                : "hover:bg-muted/40"
                            )}
                            aria-label={
                              includeSearch ? "Disable search" : "Enable search"
                            }
                            data-state="closed"
                          >
                            <Globe className="lucide lucide-globe h-4 w-4 scale-x-[-1]" />
                            <span className="max-sm:hidden">Search</span>
                          </button>
                        )}
                        <label
                          className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors",
                            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                            "hover:bg-muted/40 hover:text-foreground",
                            "disabled:hover:bg-transparent disabled:hover:text-foreground/50",
                            "text-xs cursor-pointer -mb-1.5 h-auto gap-2",
                            "rounded-full border border-solid border-secondary-foreground/10",
                            "px-2 py-1.5 pr-2.5 text-muted-foreground max-sm:p-2"
                          )}
                          aria-label="Attach a file"
                          data-state="closed"
                        >
                          <input multiple className="sr-only" type="file" />
                          <div className="flex gap-1">
                            <Paperclip className="lucide lucide-paperclip size-4" />
                            <span className="max-sm:hidden sm:ml-0.5">
                              Attach
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
