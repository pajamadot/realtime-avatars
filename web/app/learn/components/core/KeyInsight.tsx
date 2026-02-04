'use client';

import { useState } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  Target,
  FileText,
  CheckCircle,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';

interface KeyInsightProps {
  title?: string;
  children: React.ReactNode;
  type?: 'insight' | 'warning' | 'tip' | 'note' | 'success';
  expandable?: boolean;
  defaultExpanded?: boolean;
}

const typeConfig: Record<
  string,
  { bg: string; border: string; Icon: LucideIcon; title: string; color: string }
> = {
  insight: {
    bg: 'bg-[var(--color-metahuman-light)]',
    border: 'border-[var(--color-metahuman)]',
    Icon: Lightbulb,
    title: 'Key Insight',
    color: 'text-[var(--color-metahuman)]',
  },
  warning: {
    bg: 'bg-[var(--warning-light)]',
    border: 'border-[var(--warning)]',
    Icon: AlertTriangle,
    title: 'Warning',
    color: 'text-[var(--warning)]',
  },
  tip: {
    bg: 'bg-[var(--info-light)]',
    border: 'border-[var(--info)]',
    Icon: Target,
    title: 'Pro Tip',
    color: 'text-[var(--info)]',
  },
  note: {
    bg: 'bg-[var(--surface-2)]',
    border: 'border-[var(--border-strong)]',
    Icon: FileText,
    title: 'Note',
    color: 'text-[var(--text-muted)]',
  },
  success: {
    bg: 'bg-[var(--success-light)]',
    border: 'border-[var(--success)]',
    Icon: CheckCircle,
    title: 'Success',
    color: 'text-[var(--success)]',
  },
};

export default function KeyInsight({
  title,
  children,
  type = 'insight',
  expandable = false,
  defaultExpanded = true,
}: KeyInsightProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isHovered, setIsHovered] = useState(false);

  const config = typeConfig[type];
  const { Icon } = config;

  return (
    <div
      className={`${config.bg} border-l-4 ${config.border} rounded-r-lg p-4 my-4 transition-shadow duration-200 relative overflow-hidden`}
      style={{
        boxShadow: isHovered ? 'var(--shadow-md)' : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 100%)',
          opacity: 0.5,
        }}
      />
      <button
        type="button"
        onClick={() => expandable && setIsExpanded(!isExpanded)}
        className={`relative z-10 flex items-center gap-2 font-semibold ${config.color} ${
          expandable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
        } transition-opacity`}
      >
        <Icon size={18} strokeWidth={2} />
        <span>{title || config.title}</span>
        {expandable && (
          <ChevronRight
            size={14}
            strokeWidth={2}
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          />
        )}
      </button>

      <div
        className={`relative z-10 overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="text-sm text-[var(--text-secondary)] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
