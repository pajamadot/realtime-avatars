'use client';

import { useEffect, useRef, useState } from 'react';

const links = [
  { href: '#methods', label: 'Methods' },
  { href: '#comparison', label: 'Comparison' },
  { href: '#hybrids', label: 'Hybrids' },
  { href: '#implementation', label: 'Implementation' },
  { href: '#living-feed', label: 'Feed' },
  { href: '#tooling-radar', label: 'Tooling' },
  { href: '#demos', label: 'Demos' },
  { href: '/learn', label: 'Learn' },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="md:hidden p-2 -mr-2 text-[var(--text-muted)] hover:text-[var(--foreground)]"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          {open ? (
            <>
              <line x1="5" y1="5" x2="15" y2="15" />
              <line x1="15" y1="5" x2="5" y2="15" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="17" y2="6" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="14" x2="17" y2="14" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute top-full left-0 right-0 bg-[var(--surface-0)] border-b border-[var(--border)] md:hidden z-50"
        >
          <div className="mx-auto max-w-4xl px-6 py-3 flex flex-col gap-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="nav-link py-2 text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
