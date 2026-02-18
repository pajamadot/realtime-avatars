'use client';

import { useState, useEffect, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Monitor, Presentation } from 'lucide-react';

const SlidesDeck = dynamic(() => import('../slides/SlidesDeck'), { ssr: false });

export default function RootViewToggle({ children }: { children: ReactNode }) {
  const [view, setView] = useState<'slides' | 'article'>('slides');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check URL param first
    const params = new URLSearchParams(window.location.search);
    const urlView = params.get('view');
    if (urlView === 'article' || urlView === 'slides') {
      setView(urlView);
      sessionStorage.setItem('rootView', urlView);
    } else {
      // Fall back to session storage
      const stored = sessionStorage.getItem('rootView');
      if (stored === 'article' || stored === 'slides') {
        setView(stored);
      }
    }
    setMounted(true);
  }, []);

  function switchTo(newView: 'slides' | 'article') {
    setView(newView);
    sessionStorage.setItem('rootView', newView);
    // Update URL param without full navigation
    const url = new URL(window.location.href);
    if (newView === 'article') {
      url.searchParams.set('view', 'article');
    } else {
      url.searchParams.delete('view');
    }
    window.history.replaceState(null, '', url.toString());
  }

  // Before hydration, render nothing to avoid flash
  if (!mounted) return null;

  if (view === 'slides') {
    return <SlidesDeck onExit={() => switchTo('article')} />;
  }

  return (
    <>
      {/* Toggle bar above article content */}
      <div className="sticky top-0 z-50 bg-[var(--surface-0)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center gap-1 h-10">
            <button
              onClick={() => switchTo('slides')}
              className="nav-tab text-xs gap-1.5"
            >
              <Presentation size={14} />
              Slides
            </button>
            <button
              onClick={() => switchTo('article')}
              className="nav-tab text-xs gap-1.5 active"
            >
              <Monitor size={14} />
              Article
            </button>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
