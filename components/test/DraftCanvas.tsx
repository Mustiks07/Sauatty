'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ReactSketchCanvas,
  type ReactSketchCanvasRef,
} from 'react-sketch-canvas';
import {
  Pencil,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api-fetch';

const COLORS = ['#0F172A', '#2563EB', '#EF4444', '#10B981'];
const STROKES = [2, 4, 7];

export function DraftCanvas({
  attemptId,
  questionId,
  initialData,
  fullscreen = false,
  onToggleFullscreen,
}: {
  attemptId: string;
  questionId: string;
  initialData?: string | null;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}) {
  const ref = useRef<ReactSketchCanvasRef>(null);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState(COLORS[0]);
  const [stroke, setStroke] = useState(STROKES[1]);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLoaded = useRef<string | null>(null);
  const mountedRef = useRef(true);

  // Load saved paths when question changes.
  useEffect(() => {
    if (!ref.current) return;
    if (lastLoaded.current === questionId) return;
    lastLoaded.current = questionId;
    ref.current.resetCanvas();
    if (initialData) {
      try {
        const paths = JSON.parse(initialData);
        if (Array.isArray(paths) && paths.length > 0) {
          ref.current.loadPaths(paths);
        }
      } catch {
        /* ignore */
      }
    }
  }, [questionId, initialData]);

  // Clean up pending debounce on unmount — avoids late save after navigation.
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (debounce.current) {
        clearTimeout(debounce.current);
        debounce.current = null;
      }
    };
  }, []);

  function scheduleSave() {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      if (!mountedRef.current || !ref.current) return;
      try {
        const paths = await ref.current.exportPaths();
        if (!mountedRef.current) return;
        await apiFetch(`/api/attempt/${attemptId}/draft`, {
          method: 'POST',
          body: JSON.stringify({ questionId, canvasData: JSON.stringify(paths) }),
        });
      } catch {
        /* toast handled in apiFetch */
      }
    }, 2000);
  }

  function activatePen() {
    setTool('pen');
    ref.current?.eraseMode(false);
  }
  function activateEraser() {
    setTool('eraser');
    ref.current?.eraseMode(true);
  }
  function pickColor(c: string) {
    setColor(c);
    activatePen();
  }

  const container = (
    <div
      className={cn(
        'border border-border bg-white shadow-card overflow-hidden flex flex-col flex-1',
        fullscreen
          ? 'rounded-none fixed inset-0 z-[60] flex-1'
          : 'rounded-lg min-h-[320px]',
      )}
    >
      <div className="px-3.5 py-2.5 flex items-center gap-1.5 border-b border-border bg-bg-alt flex-wrap">
        <ToolBtn active={tool === 'pen'} onClick={activatePen}>
          <Pencil size={15} />
        </ToolBtn>
        <ToolBtn active={tool === 'eraser'} onClick={activateEraser}>
          <Eraser size={15} />
        </ToolBtn>
        <div className="w-px h-5 bg-border mx-1" />
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`color ${c}`}
            onClick={() => pickColor(c)}
            className="w-[22px] h-[22px] rounded-full"
            style={{
              background: c,
              boxShadow:
                color === c && tool === 'pen'
                  ? '0 0 0 2px #2563EB'
                  : 'inset 0 0 0 1px rgba(0,0,0,0.1)',
            }}
          />
        ))}
        <div className="w-px h-5 bg-border mx-1" />
        {STROKES.map((w) => (
          <button
            key={w}
            type="button"
            aria-label={`stroke ${w}`}
            onClick={() => setStroke(w)}
            className={cn(
              'w-[26px] h-[26px] rounded-sm flex items-center justify-center transition-colors',
              stroke === w ? 'bg-brand-light' : 'hover:bg-bg-2',
            )}
          >
            <span
              className="rounded-full bg-fg"
              style={{ width: w + 2, height: w + 2 }}
            />
          </button>
        ))}
        <div className="w-px h-5 bg-border mx-1" />
        <ToolBtn onClick={() => ref.current?.undo()}>
          <Undo2 size={15} />
        </ToolBtn>
        <ToolBtn onClick={() => ref.current?.redo()}>
          <Redo2 size={15} />
        </ToolBtn>
        <div className="flex-1" />
        <ToolBtn
          onClick={() => {
            ref.current?.clearCanvas();
            scheduleSave();
          }}
          aria-label="Тазалау"
        >
          <Trash2 size={15} />
        </ToolBtn>
        {onToggleFullscreen && (
          <ToolBtn onClick={onToggleFullscreen} aria-label="Толық экран">
            {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </ToolBtn>
        )}
      </div>
      <div
        className={cn('flex-1 relative', fullscreen ? 'min-h-0' : 'min-h-[280px]')}
        style={{
          backgroundImage:
            'linear-gradient(#F1F5F9 1px, transparent 1px), linear-gradient(90deg, #F1F5F9 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <ReactSketchCanvas
          ref={ref}
          strokeColor={color}
          strokeWidth={stroke}
          eraserWidth={Math.max(12, stroke * 4)}
          canvasColor="transparent"
          style={{ border: 'none', background: 'transparent' }}
          onStroke={scheduleSave}
          width="100%"
          height="100%"
          withTimestamp={false}
        />
      </div>
    </div>
  );

  return container;
}

function ToolBtn({
  active,
  onClick,
  children,
  ...rest
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  'aria-label'?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-[30px] h-[30px] rounded-sm flex items-center justify-center transition-colors',
        active
          ? 'bg-brand-light text-brand'
          : 'bg-transparent text-fg-muted hover:bg-bg-2',
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
