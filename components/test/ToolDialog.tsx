'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToolDialog({
  open,
  onOpenChange,
  title,
  icon,
  fullscreen = false,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  icon?: React.ReactNode;
  fullscreen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out',
            fullscreen ? '' : 'backdrop-blur-sm',
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed z-50 bg-bg-alt flex flex-col overflow-hidden focus:outline-none',
            fullscreen
              ? 'inset-0'
              : 'left-0 right-0 bottom-0 h-[88vh] rounded-t-2xl shadow-modal',
          )}
        >
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-border bg-white">
            <div className="flex items-center gap-2.5">
              {icon}
              <Dialog.Title className="text-[15px] font-semibold">
                {title}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Жабу"
                className="w-8 h-8 rounded-full bg-bg-2 flex items-center justify-center hover:bg-border"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
