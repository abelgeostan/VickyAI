import React, { useState, useMemo } from 'react';
import { Check, Copy } from 'lucide-react';
import hljs from 'highlight.js';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const displayLang = (language || 'text').replace(/^language-/, '').trim().toLowerCase();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const highlightedHtml = useMemo(() => {
    if (!value) return '';
    try {
      if (displayLang && displayLang !== 'text' && hljs.getLanguage(displayLang)) {
        return hljs.highlight(value, { language: displayLang, ignoreIllegals: true }).value;
      }
      return hljs.highlightAuto(value).value;
    } catch {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }, [value, displayLang]);

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900 shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700/60 text-xs font-mono text-slate-300">
        <span className="uppercase font-semibold tracking-wider text-vicky-400">
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed bg-[#1e1e2e]/95 text-slate-100">
        <pre className="!m-0 !p-0 !bg-transparent">
          <code
            className={`hljs ${displayLang ? `language-${displayLang}` : ''} !bg-transparent !p-0`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  );
};
