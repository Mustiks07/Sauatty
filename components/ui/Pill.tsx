'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Toggle-pill button used in filter/tab bars across the app.
 * Active variant: white background with shadow.
 * Inactive: transparent with muted text.
 */
export function Pill({
  active,
  onClick,
  disabled,
  className,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-colors border',
        active
          ? 'bg-white text-fg border-border shadow-card'
          : 'bg-transparent text-fg-muted border-transparent hover:text-fg',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  );
}
