'use client';

import { useEffect, useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Click image -> opens full-screen overlay where it's centered and scales to fit.
 * On mobile, native pinch-to-zoom is enabled via `touch-action: pinch-zoom`.
 */
export function ImageZoom({
  src,
  alt,
  className,
  thumbClassName,
}: {
  src: string;
  alt?: string;
  className?: string;
  thumbClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Суретті ұлғайту"
        className={cn(
          'group relative inline-block max-w-full cursor-zoom-in transition-opacity',
          thumbClassName,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? ''} className={cn('block', className)} />
        <span className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/55 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <ZoomIn size={16} />
        </span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[80] bg-black/85 flex items-center justify-center p-4 overflow-auto"
          style={{ touchAction: 'pinch-zoom' }}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="Жабу"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center"
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt ?? ''}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[95vw] max-h-[90vh] object-contain cursor-default select-none"
            draggable={false}
          />
        </div>
      )}
    </>
  );
}
