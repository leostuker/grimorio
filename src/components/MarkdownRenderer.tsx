import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export type MarkdownTheme = 'dark' | 'clean' | 'parchment' | 'default';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  theme?: MarkdownTheme;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  theme = 'default',
}) => {
  if (!content) {
    return <span className="opacity-60 italic">Sem descrição informada.</span>;
  }

  const isClean = theme === 'clean';
  const isParchment = theme === 'parchment';
  const isDark = theme === 'dark' || theme === 'default';

  // Dynamic classes based on theme for maximum legibility and contrast
  const c = {
    wrapper: isClean
      ? 'text-slate-900'
      : isParchment
      ? 'text-[#20150c]'
      : 'text-slate-100',
    h1: isClean
      ? 'text-slate-950 border-slate-300'
      : isParchment
      ? 'text-[#381f08] border-[#c4a97d]'
      : 'text-indigo-300 border-slate-800',
    h2: isClean
      ? 'text-slate-900'
      : isParchment
      ? 'text-[#48280a]'
      : 'text-indigo-300',
    h3: isClean
      ? 'text-slate-900'
      : isParchment
      ? 'text-[#2a1708]'
      : 'text-slate-100',
    h4: isClean
      ? 'text-slate-800'
      : isParchment
      ? 'text-[#3d240e]'
      : 'text-slate-300',
    p: isClean
      ? 'text-slate-900 leading-snug'
      : isParchment
      ? 'text-[#20150c] leading-snug'
      : 'text-slate-100 leading-snug',
    strong: isClean
      ? 'font-bold text-black'
      : isParchment
      ? 'font-bold text-[#0d0702]'
      : 'font-bold text-white',
    em: isClean
      ? 'italic text-slate-800'
      : isParchment
      ? 'italic text-[#3a2210]'
      : 'italic text-slate-200',
    list: isClean
      ? 'text-slate-900 marker:text-slate-700'
      : isParchment
      ? 'text-[#20150c] marker:text-[#6d461f]'
      : 'text-slate-100 marker:text-indigo-400',
    blockquote: isClean
      ? 'border-l-3 border-slate-400 bg-slate-100/90 text-slate-800'
      : isParchment
      ? 'border-l-3 border-[#8c6738] bg-[#f4ebd5] text-[#2c1a0c]'
      : 'border-l-3 border-indigo-500 bg-slate-900/80 text-slate-200',
    inlineCode: isClean
      ? 'bg-slate-100 text-slate-900 border-slate-300'
      : isParchment
      ? 'bg-[#eddcb9] text-[#261405] border-[#c9ae7e]'
      : 'bg-slate-900 text-indigo-300 border-slate-800',
    codeBlock: isClean
      ? 'bg-slate-100 text-slate-900 border-slate-300'
      : isParchment
      ? 'bg-[#efe3cb] text-[#261405] border-[#caa872]'
      : 'bg-slate-950 text-slate-200 border-slate-800',
    tableBorder: isClean
      ? 'border-slate-300'
      : isParchment
      ? 'border-[#caa872]'
      : 'border-slate-800',
    tableHead: isClean
      ? 'bg-slate-100 text-slate-900 border-slate-300'
      : isParchment
      ? 'bg-[#ebd9b3] text-[#331c07] border-[#caa872]'
      : 'bg-slate-900 text-slate-200 border-slate-800',
    tableRow: isClean
      ? 'bg-white text-slate-900 border-slate-200'
      : isParchment
      ? 'bg-[#f8f1e0] text-[#20150c] border-[#dfcca4]'
      : 'bg-slate-950/60 text-slate-300 border-slate-800/80',
    hr: isClean
      ? 'border-slate-300'
      : isParchment
      ? 'border-[#c9ae7e]'
      : 'border-slate-800',
  };

  return (
    <div className={`space-y-2 leading-snug text-sm ${c.wrapper} ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className={`text-base font-black border-b pb-0.5 mt-2 mb-1 tracking-tight ${c.h1}`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-sm font-bold mt-1.5 mb-1 tracking-tight ${c.h2}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-xs font-bold mt-1 mb-0.5 ${c.h3}`}>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className={`text-[11px] font-bold uppercase tracking-wider mt-1 mb-0.5 ${c.h4}`}>
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className={`mb-1.5 last:mb-0 ${c.p}`}>
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className={c.strong}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={c.em}>
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className={`list-disc list-outside pl-4 space-y-0.5 my-1 ${c.list}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`list-decimal list-outside pl-4 space-y-0.5 my-1 ${c.list}`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-snug pl-0.5">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`px-2.5 py-1 my-1.5 rounded-r text-[11px] italic leading-snug ${c.blockquote}`}>
              {children}
            </blockquote>
          ),
          code: ({ children, className: codeClassName }) => {
            const isInline = !codeClassName;
            return isInline ? (
              <code className={`px-1 py-0.2 rounded font-mono text-[10px] border ${c.inlineCode}`}>
                {children}
              </code>
            ) : (
              <code className={`block p-2 rounded font-mono text-[10px] overflow-x-auto border my-1 ${c.codeBlock}`}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-1 overflow-x-auto rounded border p-1.5">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className={`overflow-x-auto my-1.5 rounded border ${c.tableBorder}`}>
              <table className="w-full text-left text-[10px] border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={`border-b font-bold ${c.tableHead}`}>
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className={`divide-y ${c.tableRow}`}>
              {children}
            </tbody>
          ),
          th: ({ children }) => (
            <th className="py-1 px-1.5 font-bold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="py-1 px-1.5">
              {children}
            </td>
          ),
          hr: () => (
            <hr className={`my-2 ${c.hr}`} />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 font-medium"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};
