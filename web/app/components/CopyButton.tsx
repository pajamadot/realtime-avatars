'use client';

import { useState } from 'react';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="badge hover:border-[var(--border-strong)] text-xs"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
