'use client';

import { useEffect, useState, useCallback } from 'react';
import { evaluate } from 'mathjs';
import { cn } from '@/lib/utils';

export function Calculator() {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('0');
  const [memory, setMemory] = useState(0);

  function normalize(s: string) {
    return s.replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '.').replace(/−/g, '-');
  }

  const append = useCallback((v: string) => {
    setExpr((e) => (e === '0' || e === 'Қате' ? v : e + v));
  }, []);

  const clear = useCallback(() => {
    setExpr('');
    setResult('0');
  }, []);

  const calc = useCallback(() => {
    try {
      const n = normalize(expr);
      if (!n) return;
      const r = evaluate(n);
      setResult(formatNum(r));
      setExpr(String(r));
    } catch {
      setResult('Қате');
    }
  }, [expr]);

  const toggleSign = useCallback(() => {
    setExpr((e) => {
      if (!e) return '-';
      // toggle leading sign of last number
      const m = e.match(/(.*?)([-+]?\d*\.?\d*)$/);
      if (!m) return '-' + e;
      const [, head, num] = m;
      if (!num) return e + '-';
      if (num.startsWith('-')) return head + num.slice(1);
      return head + '-' + num;
    });
  }, []);

  // Classic calculator percent:
  //   A + B%  →  A + (A*B/100)
  //   A - B%  →  A - (A*B/100)
  //   A * B%  →  A * (B/100)
  //   A / B%  →  A / (B/100)
  //   B%      →  B/100
  const percent = useCallback(() => {
    setExpr((e) => {
      const n = normalize(e);
      const m = n.match(/^(.+?)\s*([+\-*/])\s*(\d*\.?\d+)\s*$/);
      if (m) {
        const [, left, op, right] = m;
        try {
          const A = evaluate(left);
          const B = Number(right);
          let pctVal: number;
          if (op === '+' || op === '-') pctVal = (A * B) / 100;
          else pctVal = B / 100;
          return `${left}${op}${pctVal}`;
        } catch {
          return e;
        }
      }
      try {
        const r = evaluate(n || '0') / 100;
        return String(r);
      } catch {
        return e;
      }
    });
  }, []);

  // Keyboard support
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key >= '0' && e.key <= '9') append(e.key);
      else if (e.key === '.' || e.key === ',') append(',');
      else if (e.key === '+' || e.key === '-') append(e.key === '-' ? '−' : '+');
      else if (e.key === '*') append('×');
      else if (e.key === '/') {
        e.preventDefault();
        append('÷');
      } else if (e.key === '%') percent();
      else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calc();
      } else if (e.key === 'Escape') {
        clear();
      } else if (e.key === 'Backspace') {
        setExpr((s) => s.slice(0, -1));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [append, calc, clear, percent]);

  const memOp = (op: 'C' | 'R' | '+' | '-') => {
    if (op === 'C') setMemory(0);
    else if (op === 'R') setExpr((e) => (e || '') + String(memory));
    else if (op === '+') setMemory((m) => m + Number(normalize(result) || 0));
    else if (op === '-') setMemory((m) => m - Number(normalize(result) || 0));
  };

  return (
    <div className="rounded-lg border border-border bg-white shadow-card p-4 flex flex-col gap-3">
      <div className="rounded-md bg-[#0F172A] px-4 py-3.5 text-right">
        <div className="sa-num text-[13px] text-white/50 font-mono mb-1 min-h-[16px] truncate">
          {expr || ' '}
        </div>
        <div className="sa-num text-[28px] sm:text-[32px] text-white font-semibold font-display truncate">
          {result}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <KBtn kind="ghost" onClick={() => memOp('C')}>MC</KBtn>
        <KBtn kind="ghost" onClick={() => memOp('R')}>MR</KBtn>
        <KBtn kind="ghost" onClick={() => memOp('+')}>M+</KBtn>
        <KBtn kind="ghost" onClick={() => memOp('-')}>M−</KBtn>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <KBtn kind="op" onClick={clear}>C</KBtn>
        <KBtn kind="op" onClick={toggleSign}>±</KBtn>
        <KBtn kind="op" onClick={percent}>%</KBtn>
        <KBtn kind="op" onClick={() => append('÷')}>÷</KBtn>
        <KBtn onClick={() => append('7')}>7</KBtn>
        <KBtn onClick={() => append('8')}>8</KBtn>
        <KBtn onClick={() => append('9')}>9</KBtn>
        <KBtn kind="op" onClick={() => append('×')}>×</KBtn>
        <KBtn onClick={() => append('4')}>4</KBtn>
        <KBtn onClick={() => append('5')}>5</KBtn>
        <KBtn onClick={() => append('6')}>6</KBtn>
        <KBtn kind="op" onClick={() => append('−')}>−</KBtn>
        <KBtn onClick={() => append('1')}>1</KBtn>
        <KBtn onClick={() => append('2')}>2</KBtn>
        <KBtn onClick={() => append('3')}>3</KBtn>
        <KBtn kind="op" onClick={() => append('+')}>+</KBtn>
        <KBtn span={2} onClick={() => append('0')}>0</KBtn>
        <KBtn onClick={() => append(',')}>,</KBtn>
        <KBtn kind="acc" onClick={calc}>=</KBtn>
      </div>
    </div>
  );
}

function formatNum(n: number | string): string {
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n);
  if (Math.abs(num) >= 1e12) return num.toExponential(4);
  const s = Number.isInteger(num) ? String(num) : String(Number(num.toFixed(8)));
  const [int, frac] = s.split('.');
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (frac ? '.' + frac : '');
}

function KBtn({
  kind = 'num',
  span,
  onClick,
  children,
}: {
  kind?: 'num' | 'op' | 'acc' | 'ghost';
  span?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const styles = {
    num: 'bg-white text-fg',
    op: 'bg-bg-2 text-fg font-semibold',
    acc: 'bg-brand text-white hover:bg-brand-hover',
    ghost: 'bg-bg-alt text-fg-muted font-medium',
  }[kind];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border border-border rounded-md py-3.5 text-[17px] font-semibold font-display transition-colors hover:bg-bg-alt active:scale-[0.98]',
        styles,
        span === 2 && 'col-span-2',
      )}
    >
      {children}
    </button>
  );
}
