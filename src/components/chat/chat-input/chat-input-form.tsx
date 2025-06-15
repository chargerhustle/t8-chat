"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ChatInputFormProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChatInputForm({ children, onSubmit }: ChatInputFormProps) {
  return (
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
            onSubmit={onSubmit}
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
            <div className="flex flex-grow flex-col">{children}</div>
          </form>
        </div>
      </div>
    </div>
  );
}
