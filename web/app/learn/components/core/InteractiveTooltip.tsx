'use client';

import { useState, useRef, useEffect } from 'react';

interface InteractiveTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
}

export default function InteractiveTooltip({
  children,
  content,
  position = 'top',
  trigger = 'hover',
}: InteractiveTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (trigger === 'click') {
      const handleClickOutside = (e: MouseEvent) => {
        if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node) &&
            triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
          setIsVisible(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [trigger]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--card-bg)] border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--card-bg)] border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--card-bg)] border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--card-bg)] border-t-transparent border-b-transparent border-l-transparent',
  };

  const handleTrigger = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  return (
    <span
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={() => trigger === 'hover' && setIsVisible(true)}
      onMouseLeave={() => trigger === 'hover' && setIsVisible(false)}
      onClick={handleTrigger}
    >
      <span className="border-b border-dotted border-[var(--accent)] cursor-help">
        {children}
      </span>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 ${positionClasses[position]}
            bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-lg
            p-3 text-sm max-w-xs
            animate-fadeIn
          `}
        >
          {content}

          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </span>
  );
}
