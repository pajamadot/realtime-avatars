'use client';

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  icon?: LucideIcon;
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  icon: Icon,
  size = 'md',
  className = '',
}: BadgeProps) {
  const variantClasses = {
    default: 'badge',
    accent: 'badge badge-accent',
    success: 'badge badge-success',
    warning: 'badge badge-warning',
    error: 'badge badge-error',
    info: 'badge badge-info',
  };

  const sizeClasses = {
    sm: 'text-[10px] py-0 px-1.5',
    md: '',
  };

  return (
    <span className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {Icon && <Icon size={size === 'sm' ? 10 : 12} strokeWidth={2} />}
      {children}
    </span>
  );
}
