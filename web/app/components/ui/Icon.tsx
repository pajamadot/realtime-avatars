'use client';

import { LucideIcon } from 'lucide-react';
import { ComponentProps } from 'react';

interface IconProps extends ComponentProps<'span'> {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export default function Icon({
  icon: LucideIcon,
  size = 'md',
  className = '',
  ...props
}: IconProps) {
  const pixelSize = sizeMap[size];

  return (
    <span className={`icon icon-${size} ${className}`} {...props}>
      <LucideIcon size={pixelSize} strokeWidth={1.75} />
    </span>
  );
}
