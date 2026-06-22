import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const markdownComponents: Components = {
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
  em: ({ children }) => <em className="text-text/90">{children}</em>,
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1.5 pl-4 marker:text-accent">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1.5 pl-4 marker:text-accent">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  h3: ({ children }) => (
    <h3 className="mb-1 mt-3 font-mono text-xs uppercase tracking-wider text-accent first:mt-0">
      {children}
    </h3>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline underline-offset-2 hover:text-accent2"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-bg/80 px-1 py-0.5 font-mono text-xs text-accent">{children}</code>
  ),
}

interface ChatMarkdownProps {
  content: string
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  )
}
