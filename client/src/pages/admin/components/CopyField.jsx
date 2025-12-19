import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyField({ label, value, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <label className="text-gray-400 text-sm w-40 flex-shrink-0">{label}</label>
      <div className="flex-1 bg-gray-800/50 px-3 py-2 rounded text-white text-sm font-mono">
        {value || '—'}
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 px-3 py-2 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm transition-colors flex-shrink-0"
        title="Copy to clipboard"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
