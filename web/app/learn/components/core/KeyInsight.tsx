'use client';

import { useState } from 'react';

interface KeyInsightProps {
  title?: string;
  children: React.ReactNode;
  type?: 'insight' | 'warning' | 'tip' | 'note' | 'success';
  expandable?: boolean;
  defaultExpanded?: boolean;
}

export default function KeyInsight({
  title,
  children,
  type = 'insight',
  expandable = false,
  defaultExpanded = true,
}: KeyInsightProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const styles = {
    insight: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500',
      icon: '💡',
      title: 'Key Insight',
      color: 'text-purple-500',
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500',
      icon: '⚠️',
      title: 'Warning',
      color: 'text-yellow-500',
    },
    tip: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500',
      icon: '🎯',
      title: 'Pro Tip',
      color: 'text-blue-500',
    },
    note: {
      bg: 'bg-gray-500/10',
      border: 'border-gray-500',
      icon: '📝',
      title: 'Note',
      color: 'text-gray-400',
    },
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500',
      icon: '✅',
      title: 'Success',
      color: 'text-green-500',
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} border-l-4 ${style.border} rounded-r p-4 my-4`}>
      <button
        type="button"
        onClick={() => expandable && setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 font-semibold ${style.color} ${expandable ? 'cursor-pointer' : ''}`}
      >
        <span>{style.icon}</span>
        <span>{title || style.title}</span>
        {expandable && (
          <span className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="text-sm text-[var(--foreground)] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
