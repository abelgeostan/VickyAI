import React, { useState, useMemo } from 'react';
import hljs from 'highlight.js';
import { Check, Copy, ChevronDown, ChevronRight } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const displayLang = (language || 'text').replace(/^language-/, '').trim().toLowerCase();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const highlightedHtml = useMemo(() => {
    if (!value) return '';
    try {
      if (displayLang && displayLang !== 'text' && hljs.getLanguage(displayLang)) {
        return hljs.highlight(value, { language: displayLang, ignoreIllegals: true }).value;
      }
      return hljs.highlightAuto(value).value;
    } catch {
      return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }, [value, displayLang]);

  const lineCount = value.split('\n').length;
  const isLong = lineCount > 10;

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/40 bg-[#0d1117] shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-slate-700/40">
        <div className="flex items-center gap-3">
          {/* Traffic light dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 font-mono">
            {displayLang}
          </span>
          {isLong && (
            <span className="text-[10px] text-slate-600 font-mono">{lineCount} lines</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isLong && (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/40 transition-colors text-[11px] font-medium"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all text-[11px] font-medium"
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
      </div>

      {/* Code Content */}
      {!collapsed && (
        <div className="overflow-x-auto">
          <pre className="!m-0 !p-0 !bg-transparent">
            <code
              className={`hljs ${displayLang ? `language-${displayLang}` : ''} !bg-transparent !p-4 block text-[0.8125rem] leading-relaxed font-mono`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        </div>
      )}
      {collapsed && (
        <div className="px-4 py-2 text-[11px] text-slate-600 italic font-mono">
          {lineCount} lines hidden — click Expand to view
        </div>
      )}
    </div>
  );
};
