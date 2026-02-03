'use client';

import { ReactNode } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  Target,
  FileText,
  CheckCircle,
  Info,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';

type CalloutType = 'insight' | 'warning' | 'tip' | 'note' | 'success' | 'info' | 'error';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

const typeConfig: Record<
  CalloutType,
  { icon: LucideIcon; className: string; iconColor: string }
> = {
  insight: {
    icon: Lightbulb,
    className: 'border-[var(--color-metahuman)] bg-[var(--color-metahuman-light)]',
    iconColor: 'text-[var(--color-metahuman)]',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-[var(--warning)] bg-[var(--warning-light)]',
    iconColor: 'text-[var(--warning)]',
  },
  tip: {
    icon: Target,
    className: 'border-[var(--info)] bg-[var(--info-light)]',
    iconColor: 'text-[var(--info)]',
  },
  note: {
    icon: FileText,
    className: 'border-[var(--border-strong)] bg-[var(--surface-2)]',
    iconColor: 'text-[var(--text-muted)]',
  },
  success: {
    icon: CheckCircle,
    className: 'border-[var(--success)] bg-[var(--success-light)]',
    iconColor: 'text-[var(--success)]',
  },
  info: {
    icon: Info,
    className: 'border-[var(--info)] bg-[var(--info-light)]',
    iconColor: 'text-[var(--info)]',
  },
  error: {
    icon: AlertCircle,
    className: 'border-[var(--error)] bg-[var(--error-light)]',
    iconColor: 'text-[var(--error)]',
  },
};

export default function Callout({
  type = 'note',
  title,
  children,
  icon,
  className = '',
}: CalloutProps) {
  const config = typeConfig[type];
  const IconComponent = icon || config.icon;

  return (
    <div className={`callout ${config.className} ${className}`}>
      <div className={`callout-icon ${config.iconColor}`}>
        <IconComponent size={20} strokeWidth={1.75} />
      </div>
      <div className="callout-content">
        {title && <div className="callout-title">{title}</div>}
        <div className="callout-text">{children}</div>
      </div>
    </div>
  );
}
