'use client'

import { marked } from 'marked';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

// Parse markdown into blocks using marked lexer
function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map(token => token.raw);
}

// Define the code component props type
interface CodeComponentProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Memoized component for individual markdown blocks
const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ inline, className, children, ...props }: CodeComponentProps) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            // For code blocks with language specification
            if (!inline && match) {
              return (
                <CodeBlock 
                  code={String(children).replace(/\n$/, '')}
                  language={language}
                  {...props}
                />
              );
            }
            
            // For inline code or code blocks without language specification
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.content === nextProps.content;
  },
);

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

// Main memoized markdown component that splits content into blocks
export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    // Use memoization to avoid re-parsing blocks unless content changes
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return (
      <div className="prose prose-sm max-w-none dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock 
            content={block} 
            key={`${id}-block-${index}`} 
          />
        ))}
      </div>
    );
  }
);

MemoizedMarkdown.displayName = 'MemoizedMarkdown';