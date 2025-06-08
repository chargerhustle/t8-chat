'use client'

import { useEffect, useState } from 'react'
import * as shiki from 'shiki'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language: string
}

export const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [html, setHtml] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  useEffect(() => {
    const highlightCode = async () => {
      try {
        const highlighter = await shiki.createHighlighter({
          themes: ['github-dark'],
          langs: [language || 'plaintext', 'javascript', 'typescript', 'jsx', 'tsx', 'json', 'css', 'html', 'markdown', 'python', 'bash', 'shell']
        })
        
        const highlighted = highlighter.codeToHtml(code, {
          lang: language || 'plaintext',
          theme: 'github-dark'
        })
        
        setHtml(highlighted)
      } catch (error) {
        console.error('Error highlighting code:', error)
        // Fallback to plain text if highlighting fails
        setHtml(`<pre class="shiki" style="background-color: #24292e"><code>${escapeHtml(code)}</code></pre>`)
      } finally {
        setIsLoading(false)
      }
    }

    highlightCode()
  }, [code, language])

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-md bg-[#24292e] p-4">
        <pre className="text-sm text-white">
          <code>{code}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className="code-block-outer my-4">
      <div className="relative flex w-full flex-col">
        {/* Code block header */}
        <div className="flex h-9 items-center justify-between rounded-t-md bg-secondary px-4 py-2 text-sm text-secondary-foreground">
          <span className="font-mono">{language || 'plaintext'}</span>
          
          {/* Copy button */}
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-foreground/50 text-xs size-8 rounded-md bg-secondary p-2 transition-colors hover:bg-muted-foreground/10 hover:text-muted-foreground dark:hover:bg-muted-foreground/5"
            aria-label="Copy code to clipboard"
            onClick={copyToClipboard}
          >
            <div className="relative size-4">
              <Copy className={`absolute inset-0 transition-all duration-200 ease-snappy ${isCopied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
              <Check className={`absolute inset-0 transition-all duration-200 ease-snappy ${isCopied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
            </div>
          </button>
        </div>

        {/* Code block content */}
        <div 
          className="code-block-wrapper"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}

// Helper function to escape HTML special characters
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
} 