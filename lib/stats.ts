import { prisma } from '@/lib/prisma';
import { calcStreak } from '@/lib/streak';
import { yyyymmdd, addDays, fillDays, type DayBucket } from '@/lib/date-utils';

export type { DayBucket };
export { fillDays };

export async function getSiteStats() {
  const now = new Date();
  const day7 = addDays(now, -7);
  const day30 = addDays(now, -30);

  const [
    totalUsers,
    newUsers7,
    newUsers30,
    totalAttempts,
    finishedAttempts,
    wau,
    mau,
    attemptsWeek,
    avgScoreAgg,
    publishedTests,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({ where: { role: 'USER', createdAt: { gte: day7 } } }),
    prisma.user.count({ where: { role: 'USER', createdAt: { gte: day30 } } }),
    prisma.testAttempt.count(),
    prisma.testAttempt.count({ where: { finishedAt: { not: null } } }),
    prisma.testAttempt
      .findMany({
        where: { finishedAt: { gte: day7 } },
        select: { userId: true },
        distinct: ['userId'],
      })
      .then((rs) => rs.length),
    prisma.testAttempt
      .findMany({
        where: { finishedAt: { gte: day30 } },
        select: { userId: true },
        distinct: ['userId'],
      })
      .then((rs) => rs.length),
    prisma.testAttempt.count({
      where: { finishedAt: { gte: day7 } },
    }),
    prisma.testAttempt.aggregate({
      _avg: { score: true },
      where: { finishedAt: { not: null } },
    }),
    prisma.test.count({ where: { isPublished: true } }),
  ]);

  // Score distribution: % bucket of score/total
  const finishedRows = await prisma.testAttempt.findMany({
    where: { finishedAt: { not: null } },
    select: { score: true, totalQuestions: true },
  });
  const buckets = [0, 0, 0, 0, 0]; // 0-20%, 20-40, 40-60, 60-80, 80-100
  for (const a of finishedRows) {
    if (!a.totalQuestions) continue;
    const pct = ((a.score ?? 0) / a.totalQuestions) * 100;
    const idx = Math.min(4, Math.floor(pct / 20));
    buckets[idx] += 1;
  }
  const distribution = [
    { label: '0–20%', value: buckets[0] },
    { label: '20–40%', value: buckets[1] },
    { label: '40–60%', value: buckets[2] },
    { label: '60–80%', value: buckets[3] },
    { label: '80–100%', value: buckets[4] },
  ];

  // Signups + attempts per day, last 30
  const usersByDay = await prisma.$queryRaw<{ day: string; value: bigint }[]>`
    SELECT to_char(created_at AT TIME ZONE 'Asia/Almaty', 'YYYY-MM-DD') AS day,
           count(*)::int AS value
    FROM public.users
    WHERE role = 'USER' AND created_at >= ${day30}
    GROUP BY day
    ORDER BY day;
  `;
  const attemptsByDay = await prisma.$queryRaw<{ day: string; value: bigint }[]>`
    SELECT to_char(finished_at AT TIME ZONE 'Asia/Almaty', 'YYYY-MM-DD') AS day,
           count(*)::int AS value
    FROM public.test_attempts
    WHERE finished_at IS NOT NULL AND finished_at >= ${day30}
    GROUP BY day
    ORDER BY day;
  `;

  // Per-test stats
  const attemptsByTest = await prisma.testAttempt.groupBy({
    by: ['testId'],
    where: { finishedAt: { not: null } },
    _count: { _all: true },
    _avg: { score: true },
    _max: { totalQuestions: true },
  });
  const testIds = attemptsByTest.map((r) => r.testId);
  const testInfo = await prisma.test.findMany({
    where: { id: { in: testIds } },
    select: { id: true, titleKz: true, subject: { select: { nameKz: true } } },
  });
  const testMap = new Map(testInfo.map((t) => [t.id, t]));
  const testStats = attemptsByTest
    .map((r) => {
      const t = testMap.get(r.testId);
      const totalQ = r._max.totalQuestions ?? 1;
      const avg = ((r._avg.score ?? 0) / Math.max(1, totalQ)) * 10;
      return {
        testId: r.testId,
        title: t?.titleKz ?? '—',
        subject: t?.subject.nameKz ?? '—',
        attempts: r._count._all,
        avg,
      };
    })
    .filter((r) => !!testMap.get(r.testId));

  return {
    totalUsers,
    newUsers7,
    newUsers30,
    wau,
    mau,
    totalAttempts,
    finishedAttempts,
    attemptsWeek,
    avgScorePct:
      avgScoreAgg._avg.score && finishedRows.length
        ? // Use a per-attempt percentage average
          (finishedRows.reduce(
            (s, a) => s + ((a.score ?? 0) / Math.max(1, a.totalQuestions)) * 100,
            0,
          ) /
            finishedRows.length) || 0
        : 0,
    publishedTests,
    distribution,
    usersByDay: fillDays(
      usersByDay.map((r) => ({ day: r.day, value: Number(r.value) })),
      day30,
      now,
    ),
    attemptsByDay: fillDays(
      attemptsByDay.map((r) => ({ day: r.day, value: Number(r.value) })),
      day30,
      now,
    ),
    topTests: [...testStats].sort((a, b) => b.attempts - a.attempts).slice(0, 5),
    hardestTests: [...testStats]
      .filter((t) => t.attempts >= 3)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5),
  };
}

export async function getUserStats(userId: string) {
  const [user, attempts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.testAttempt.findMany({
      where: { userId },
      include: {
        test: { include: { subject: { select: { nameKz: true, slug: true } } } },
      },
      orderBy: { startedAt: 'desc' },
      take: 500,
    }),
  ]);
  if (!user) return null;

  const finished = attempts.filter((a) => a.finishedAt);
  const total = finished.length;
  const sumScore = finished.reduce((s, a) => s + (a.score ?? 0), 0);
  const sumQ = finished.reduce((s, a) => s + a.totalQuestions, 0);
  const avg = total ? sumScore / total : 0;
  const best = finished.reduce((m, a) => Math.max(m, a.score ?? 0), 0);
  const pct = sumQ ? (sumScore / sumQ) * 100 : 0;

  // Progress: last 20 finished, oldest first
  const progress = finished
    .slice(0, 20)
    .reverse()
    .map((a, i) => ({
      idx: i + 1,
      score: a.score ?? 0,
      total: a.totalQuestions,
    }));

  // Per-subject breakdown
  const subjectMap = new Map<string, { name: string; attempts: number; sumScore: number; sumQ: number }>();
  for (const a of finished) {
    const key = a.test.subject.nameKz;
    const cur = subjectMap.get(key) ?? { name: key, attempts: 0, sumScore: 0, sumQ: 0 };
    cur.attempts += 1;
    cur.sumScore += a.score ?? 0;
    cur.sumQ += a.totalQuestions;
    subjectMap.set(key, cur);
  }
  const bySubject = Array.from(subjectMap.values()).map((s) => ({
    name: s.name,
    attempts: s.attempts,
    avg: s.attempts ? s.sumScore / s.attempts : 0,
    pct: s.sumQ ? (s.sumScore / s.sumQ) * 100 : 0,
  }));

  // Activity heatmap last 90 days
  const day90 = addDays(new Date(), -90);
  const activityRaw = finished.filter((a) => a.finishedAt && a.finishedAt >= day90);
  const dayCount = new Map<string, number>();
  for (const a of activityRaw) {
    const k = yyyymmdd(a.finishedAt!);
    dayCount.set(k, (dayCount.get(k) ?? 0) + 1);
  }
  const heatmap = fillDays(
    Array.from(dayCount.entries()).map(([day, value]) => ({ day, value })),
    day90,
    new Date(),
  );

  const streak = calcStreak(
    finished.map((a) => a.finishedAt).filter((d): d is Date => !!d),
  );

  return {
    user,
    totalAttempts: total,
    unfinishedAttempts: attempts.length - total,
    avg,
    best,
    pct,
    streak,
    progress,
    bySubject,
    heatmap,
    attempts: finished.slice(0, 30),
    lastActivity: finished[0]?.finishedAt ?? null,
  };
}

export async function getTestAnalytics(testId: string) {
  const [test, attempts, questions] = await Promise.all([
    prisma.test.findUnique({
      where: { id: testId },
      include: { subject: { select: { nameKz: true } } },
    }),
    prisma.testAttempt.findMany({
      where: { testId },
      select: {
        id: true,
        score: true,
        totalQuestions: true,
        startedAt: true,
        finishedAt: true,
      },
    }),
    prisma.question.findMany({
      where: { testId },
      orderBy: { order: 'asc' },
      include: {
        options: { orderBy: { order: 'asc' } },
      },
    }),
  ]);
  if (!test) return null;

  const finished = attempts.filter((a) => a.finishedAt);
  const completionRate = attempts.length
    ? (finished.length / attempts.length) * 100
    : 0;
  const avgScorePct = finished.length
    ? (finished.reduce(
        (s, a) => s + ((a.score ?? 0) / Math.max(1, a.totalQuestions)) * 100,
        0,
      ) /
        finished.length) || 0
    : 0;
  const avgTimeSec = finished.length
    ? finished.reduce(
        (s, a) =>
          s +
          Math.min(
            test.timeLimitMinutes * 60 + 10,
            Math.floor(
              ((a.finishedAt!.getTime() - a.startedAt.getTime()) / 1000) || 0,
            ),
          ),
        0,
      ) / finished.length
    : 0;

  // Score distribution
  const buckets = [0, 0, 0, 0, 0];
  for (const a of finished) {
    const pct = ((a.score ?? 0) / Math.max(1, a.totalQuestions)) * 100;
    const idx = Math.min(4, Math.floor(pct / 20));
    buckets[idx] += 1;
  }
  const distribution = [
    { label: '0–20%', value: buckets[0] },
    { label: '20–40%', value: buckets[1] },
    { label: '40–60%', value: buckets[2] },
    { label: '60–80%', value: buckets[3] },
    { label: '80–100%', value: buckets[4] },
  ];

  // Per-question stats: only count answers from FINISHED attempts.
  const finishedIds = finished.map((a) => a.id);
  const userAnswers =
    finishedIds.length > 0
      ? await prisma.userAnswer.findMany({
          where: { attemptId: { in: finishedIds } },
          select: {
            questionId: true,
            selectedOptionId: true,
            isCorrect: true,
          },
        })
      : [];

  const byQ = new Map<
    string,
    { total: number; correct: number; chosen: Map<string | null, number> }
  >();
  for (const a of userAnswers) {
    const cur = byQ.get(a.questionId) ?? {
      total: 0,
      correct: 0,
      chosen: new Map(),
    };
    cur.total += 1;
    if (a.isCorrect) cur.correct += 1;
    cur.chosen.set(a.selectedOptionId, (cur.chosen.get(a.selectedOptionId) ?? 0) + 1);
    byQ.set(a.questionId, cur);
  }

  const questionStats = questions.map((q) => {
    const s = byQ.get(q.id);
    if (!s) {
      return {
        questionId: q.id,
        order: q.order,
        textKz: q.textKz,
        answered: 0,
        correctPct: 0,
        skipped: 0,
        mostWrong: null as null | { text: string; count: number },
      };
    }
    const correctOptId = q.options.find((o) => o.isCorrect)?.id;
    let mostWrong: { text: string; count: number } | null = null;
    for (const [optId, cnt] of s.chosen.entries()) {
      if (optId === correctOptId) continue;
      if (optId === null) continue;
      if (!mostWrong || cnt > mostWrong.count) {
        const opt = q.options.find((o) => o.id === optId);
        if (opt) mostWrong = { text: opt.textKz, count: cnt };
      }
    }
    return {
      questionId: q.id,
      order: q.order,
      textKz: q.textKz,
      answered: s.total,
      correctPct: s.total ? (s.correct / s.total) * 100 : 0,
      skipped: s.chosen.get(null) ?? 0,
      mostWrong,
    };
  });

  return {
    test,
    totalAttempts: attempts.length,
    finishedAttempts: finished.length,
    completionRate,
    avgScorePct,
    avgTimeSec,
    distribution,
    questionStats,
  };
}
