import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[12px] font-semibold leading-[1.5]',
  {
    variants: {
      tone: {
        blue: 'bg-brand-light text-brand-hover',
        amber: 'bg-accent-light text-accent-ink',
        green: 'bg-success-light text-success-ink',
        red: 'bg-error-light text-error-ink',
        gray: 'bg-bg-2 text-fg-muted',
      },
    },
    defaultVariants: { tone: 'gray' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
