import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  truncate?: boolean;
}

export function MarkdownPreview({ content, className, truncate = false }: MarkdownPreviewProps) {
  if (!content) {
    return (
      <p className={cn("text-muted-foreground italic text-sm", className)}>
        No content yet...
      </p>
    );
  }

  if (truncate) {
    // For truncated preview, just show first line with basic formatting
    const firstLine = content.split('\n')[0].slice(0, 100);
    return (
      <div className={cn("text-sm text-foreground line-clamp-3", className)}>
        <ReactMarkdown
          components={{
            p: ({ children }) => <span>{children}</span>,
            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            em: ({ children }) => <em>{children}</em>,
            h1: ({ children }) => <span className="font-bold">{children}</span>,
            h2: ({ children }) => <span className="font-bold">{children}</span>,
            h3: ({ children }) => <span className="font-semibold">{children}</span>,
            ul: ({ children }) => <span>{children}</span>,
            ol: ({ children }) => <span>{children}</span>,
            li: ({ children }) => <span>• {children} </span>,
            a: ({ children }) => <span className="text-primary underline">{children}</span>,
            code: ({ children }) => (
              <code className="bg-muted px-1 rounded text-xs">{children}</code>
            ),
          }}
        >
          {firstLine}
        </ReactMarkdown>
        {content.length > 100 && <span className="text-muted-foreground">...</span>}
      </div>
    );
  }

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-foreground mb-3 mt-4 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-foreground mb-2 mt-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-foreground mb-2 mt-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-foreground mb-2 leading-relaxed">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground">{children}</li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="bg-muted text-foreground px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-2">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-2">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-border my-4" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
