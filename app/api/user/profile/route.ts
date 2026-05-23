import { NextRequest } from 'next/server';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { ok, handleError } from '@/lib/api-error';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const profileSchema = z.object({
  name: z.string().min(2, 'Атың тым қысқа').max(60).optional(),
  avatarPreset: z
    .enum([
      'blue-amber',
      'green-blue',
      'purple-pink',
      'red-orange',
      'cyan-purple',
      'graphite',
    ])
    .optional(),
  examDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Күн форматы: YYYY-MM-DD')
    .refine((s) => {
      const d = new Date(s + 'T00:00:00Z');
      if (Number.isNaN(d.getTime())) return false;
      const year = d.getUTCFullYear();
      return year >= 2024 && year <= 2030;
    }, 'Күн дұрыс емес')
    .nullable()
    .optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const u = await requireUser();
    const body = profileSchema.parse(await req.json());

    const data: Prisma.UserUpdateInput = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.avatarPreset !== undefined) data.avatarPreset = body.avatarPreset;
    if (body.examDate !== undefined) {
      data.examDate = body.examDate ? new Date(body.examDate) : null;
    }

    if (Object.keys(data).length === 0) return ok({ updated: false });

    await prisma.user.update({ where: { id: u.db.id }, data });
    return ok({ updated: true });
  } catch (e) {
    return handleError(e);
  }
}
