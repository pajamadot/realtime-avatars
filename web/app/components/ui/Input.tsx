'use client';

import { LucideIcon } from 'lucide-react';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon: Icon,
      iconPosition = 'left',
      className = '',
      ...props
    },
    ref
  ) => {
    const hasIcon = !!Icon;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {hasIcon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              <Icon size={16} strokeWidth={1.75} />
            </div>
          )}
          <input
            ref={ref}
            className={`input ${hasIcon && iconPosition === 'left' ? 'pl-10' : ''} ${
              hasIcon && iconPosition === 'right' ? 'pr-10' : ''
            } ${error ? 'border-[var(--error)] focus:border-[var(--error)]' : ''} ${className}`}
            {...props}
          />
          {hasIcon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              <Icon size={16} strokeWidth={1.75} />
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-[var(--error)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
