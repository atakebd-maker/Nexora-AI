import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Simple, robust markdown parser without heavy external dependencies
  // Handles headers, code blocks, bullet points, numbered lists, bold, italics, inline code, and paragraphs.
  
  const renderFormattedText = (text: string) => {
    // Process bold, italic, and inline code
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-blue-50 text-blue-800 font-mono text-xs border border-blue-100">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-slate-700">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockLines: string[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' = 'ul';

  const flushList = (keyIndex: number) => {
    if (listItems.length === 0) return;
    if (listType === 'ul') {
      elements.push(
        <ul key={`ul-${keyIndex}`} className="my-2.5 ml-4 list-disc space-y-1 text-slate-700 text-sm">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderFormattedText(item)}
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${keyIndex}`} className="my-2.5 ml-4 list-decimal space-y-1 text-slate-700 text-sm">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderFormattedText(item)}
            </li>
          ))}
        </ol>
      );
    }
    listItems = [];
  };

  lines.forEach((line, index) => {
    // Code block boundary
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        const codeText = codeBlockLines.join('\n');
        elements.push(
          <CodeBlockView
            key={`code-${index}`}
            code={codeText}
            language={codeBlockLanguage}
          />
        );
        inCodeBlock = false;
        codeBlockLanguage = '';
        codeBlockLines = [];
      } else {
        // Start of code block
        flushList(index);
        inCodeBlock = true;
        codeBlockLanguage = line.trim().replace(/^```/, '').trim() || 'code';
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Unordered list item
    const ulMatch = line.match(/^\s*[-*•]\s+(.*)$/);
    if (ulMatch) {
      if (listItems.length > 0 && listType !== 'ul') {
        flushList(index);
      }
      listType = 'ul';
      listItems.push(ulMatch[1]);
      return;
    }

    // Ordered list item
    const olMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (listItems.length > 0 && listType !== 'ol') {
        flushList(index);
      }
      listType = 'ol';
      listItems.push(olMatch[2]);
      return;
    }

    // If not a list item, flush any pending list
    flushList(index);

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={`empty-${index}`} className="h-2" />);
      return;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-base font-semibold text-slate-900 mt-3 mb-1">
          {renderFormattedText(line.replace('### ', ''))}
        </h3>
      );
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${index}`} className="text-lg font-bold text-slate-900 mt-4 mb-1.5 border-b border-slate-100 pb-1">
          {renderFormattedText(line.replace('## ', ''))}
        </h2>
      );
      return;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${index}`} className="text-xl font-bold text-slate-900 mt-4 mb-2">
          {renderFormattedText(line.replace('# ', ''))}
        </h1>
      );
      return;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${index}`} className="border-l-4 border-blue-500 pl-3.5 my-2 italic text-slate-600 text-sm">
          {renderFormattedText(line.replace('> ', ''))}
        </blockquote>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${index}`} className="text-slate-800 text-sm leading-relaxed my-1">
        {renderFormattedText(line)}
      </p>
    );
  });

  // Flush remaining list if any
  flushList(lines.length);

  // If code block was not closed
  if (inCodeBlock && codeBlockLines.length > 0) {
    elements.push(
      <CodeBlockView
        key="code-unclosed"
        code={codeBlockLines.join('\n')}
        language={codeBlockLanguage}
      />
    );
  }

  return <div className="space-y-1 leading-normal break-words">{elements}</div>;
};

interface CodeBlockViewProps {
  code: string;
  language: string;
}

const CodeBlockView: React.FC<CodeBlockViewProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800 border-b border-slate-700 text-xs text-slate-300 font-mono">
        <span className="uppercase tracking-wider font-medium text-blue-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};
