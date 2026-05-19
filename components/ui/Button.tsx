import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light disabled:pointer-events-none disabled:opacity-50 leading-none',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white hover:bg-brand-hover',
        secondary:
          'bg-white text-fg border border-border hover:bg-bg-alt hover:border-border-strong',
        ghost: 'bg-transparent text-brand hover:bg-brand-light',
        accent: 'bg-accent text-white hover:bg-accent-hover',
        danger: 'bg-error text-white hover:opacity-90',
        outlineDanger:
          'bg-white text-error border border-error-light hover:bg-error-light',
      },
      size: {
        sm: 'h-9 px-3.5 text-[13px] rounded-md',
        md: 'h-10 px-5 text-[15px] rounded-md',
        lg: 'h-12 px-7 text-[17px] rounded-md',
        icon: 'h-10 w-10 rounded-md',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
