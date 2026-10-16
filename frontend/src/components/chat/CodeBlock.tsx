import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const displayLang = (language || 'text').replace(/^language-/, '');

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900 shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800/80 border-b border-slate-700/60 text-xs font-mono text-slate-300">
        <span className="uppercase font-semibold tracking-wider text-vicky-300">
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-700/50 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-sm font-mono text-slate-100 leading-relaxed">
        <pre>
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};
