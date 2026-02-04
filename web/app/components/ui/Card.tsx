'use client';

import { ReactNode, forwardRef, HTMLAttributes, CSSProperties } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'alt' | 'inset' | 'raised';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  glow?: boolean;
  accentColor?: string;
  children: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      interactive = false,
      glow = false,
      accentColor,
      children,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: 'card',
      alt: 'card-alt',
      inset: 'card-inset',
      raised: 'surface-raised',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const combinedStyle: CSSProperties = {
      ...style,
      ...(accentColor && {
        borderLeftWidth: '3px',
        borderLeftColor: accentColor,
      }),
    };

    return (
      <div
        ref={ref}
        className={`${variantClasses[variant]} ${paddingClasses[padding]} ${
          interactive ? 'card-interactive' : ''
        } ${glow ? 'card-glow' : ''} ${className}`}
        style={combinedStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;

// Sub-components for structured cards
export function CardHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h3 className={`font-semibold text-[var(--text-primary)] ${className}`}>{children}</h3>;
}

export function CardDescription({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`text-sm text-[var(--text-muted)] mt-1 ${className}`}>{children}</p>;
}

export function CardContent({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-4 pt-4 border-t border-[var(--border)] ${className}`}>{children}</div>
  );
}
