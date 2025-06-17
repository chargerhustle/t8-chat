"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { Button } from "./button";
import { Download, Text, WrapText } from "lucide-react";
import { CopyButton } from "@/components/copy-button";

export type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div className={cn("group", className)} {...props}>
      {children}
    </div>
  );
}

export type CodeBlockCodeProps = {
  code: string;
  language?: string;
  theme?: string;
  className?: string;
  showHeader?: boolean;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlockCode({
  code,
  language = "tsx",
  theme = "github-dark",
  className,
  showHeader = true,
  ...props
}: CodeBlockCodeProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [isWrapped, setIsWrapped] = useState(false);

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml("<pre><code></code></pre>");
        return;
      }

      const html = await codeToHtml(code, { lang: language, theme });
      // Remove empty line spans: <span class="line"></span>
      const cleanedHtml = html.replace(/<span class="line"><\/span>/g, "");
      setHighlightedHtml(cleanedHtml);
    }
    highlight();
  }, [code, language, theme]);

  const handleDownload = async () => {
    // Try the File System Access API first
    if ("showSaveFilePicker" in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `code-snippet.${language}`,
          types: [
            {
              description: "Text files",
              accept: { "text/plain": [".txt", `.${language}`] },
            },
          ],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(code);
        await writable.close();
        return;
      } catch (err: any) {
        // Check if user cancelled the dialog
        if (err.name === "AbortError") {
          // User cancelled, don't fallback to download
          return;
        }
        // Other errors (API not supported, etc.) fall through to fallback
      }
    }

    // Fallback to traditional download
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `code-snippet.${language}`;
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const toggleWrap = () => {
    setIsWrapped(!isWrapped);
  };

  if (!showHeader) {
    // Fallback to simple code block without header
    const classNames = cn(
      "w-full overflow-x-auto text-[13px] [&>pre]:px-[1em] [&>pre]:py-4",
      className
    );

    return highlightedHtml ? (
      <div
        className={classNames}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        {...props}
      />
    ) : (
      <div className={classNames} {...props}>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="relative mt-2 flex w-full flex-col pt-9" {...props}>
      {/* Header */}
      <div className="absolute inset-x-0 top-0 flex h-9 items-center justify-between rounded-t bg-secondary px-4 py-2 text-sm text-secondary-foreground">
        <span className="font-mono">{language}</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-md bg-secondary p-2 text-xs transition-colors hover:bg-muted-foreground/10 hover:text-muted-foreground dark:hover:bg-muted-foreground/5"
            onClick={handleDownload}
            aria-label="Download code"
          >
            <Download className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="mr-6 size-8 rounded-md bg-secondary p-2 text-xs transition-colors hover:bg-muted-foreground/10 hover:text-muted-foreground dark:hover:bg-muted-foreground/5"
            onClick={toggleWrap}
            aria-label={
              isWrapped ? "Disable text wrapping" : "Enable text wrapping"
            }
          >
            {isWrapped ? (
              <WrapText className="size-4" />
            ) : (
              <Text className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Copy button positioned in top-right */}
      <div className="sticky left-auto z-[1] ml-auto h-1.5 w-8 transition-[top] top-[42px] max-1170:top-20">
        <div className="absolute -top-[calc(2rem+2px)] right-2 flex gap-1">
          <CopyButton
            text={code}
            size="md"
            variant="ghost"
            showToast={true}
            ariaLabel="Copy code to clipboard"
            className="size-8 rounded-md bg-secondary p-2 text-xs text-secondary-foreground transition-colors hover:bg-muted-foreground/10 hover:text-muted-foreground dark:hover:bg-muted-foreground/5"
          />
        </div>
      </div>

      <div className="-mb-1.5"></div>

      {/* Code content */}
      <div
        className={cn(
          "shiki not-prose relative bg-chat-accent text-sm font-[450] text-secondary-foreground [&_pre]:overflow-auto [&_pre]:!bg-transparent [&_pre]:px-[1em] [&_pre]:py-[1em]",
          isWrapped && "[&_pre]:whitespace-pre-wrap",
          className
        )}
      >
        {highlightedHtml ? (
          <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        ) : (
          <pre>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

function CodeBlockGroup({
  children,
  className,
  ...props
}: CodeBlockGroupProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock };
