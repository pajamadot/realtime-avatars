'use client';

import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-[var(--surface-0)] border border-[var(--border)] shadow-sm hover:border-[var(--border-strong)] transition-colors flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--foreground)]"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12V4M4 7l4-3 4 3" />
      </svg>
    </button>
  );
}
