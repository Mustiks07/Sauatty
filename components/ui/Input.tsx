import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-[15px] text-fg placeholder:text-fg-subtle transition-colors',
        'focus-visible:outline-none focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand-light',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-[15px] text-fg placeholder:text-fg-subtle transition-colors',
      'focus-visible:outline-none focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand-light',
      'disabled:cursor-not-allowed disabled:opacity-60',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('block text-[13px] font-semibold text-fg mb-1.5', className)}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="mt-1 text-[12px] text-error flex items-center gap-1">
      {children}
    </p>
  );
}
