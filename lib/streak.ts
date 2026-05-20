// Shared streak calculation — used by dashboard and profile.

function yyyymmdd(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Almaty' });
}

export function calcStreak(finishedDates: Date[]): number {
  if (finishedDates.length === 0) return 0;
  const days = new Set(finishedDates.map((d) => yyyymmdd(d)));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(yyyymmdd(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(yyyymmdd(cursor))) return 0;
  }
  while (days.has(yyyymmdd(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
