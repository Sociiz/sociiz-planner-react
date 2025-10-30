import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

// Para usar: npm install react-markdown remark-gfm rehype-sanitize rehype-highlight highlight.js
// Uso simples: <MarkdownViewer>{"# Título em Markdown"}</MarkdownViewer>

type Props = {
  children: string;
  className?: string;
};

export default function MarkdownViewer({ children, className = "" }: Props) {
  return (
    <div
      className={`markdown-viewer prose prose-sm max-w-none p-4 rounded-xl shadow ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
          ol: ({ node, ...props }) => (
            <ol className="list-decimal ml-6" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc ml-6" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
