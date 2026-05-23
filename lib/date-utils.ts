// Almaty-timezone date helpers used across stats, streak, dashboard, profile.

export function yyyymmdd(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Almaty' });
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export type DayBucket = { day: string; value: number };

/** Fills missing days with 0 between [from..to] inclusive. */
export function fillDays(
  rows: { day: string; value: number }[],
  from: Date,
  to: Date,
): DayBucket[] {
  const map = new Map(rows.map((r) => [r.day, r.value]));
  const out: DayBucket[] = [];
  for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
    const key = yyyymmdd(d);
    out.push({ day: key, value: map.get(key) ?? 0 });
  }
  return out;
}
