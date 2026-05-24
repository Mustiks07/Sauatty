import { unstable_cache, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const CACHE_TAGS = {
  publishedTests: 'published-tests',
  subjects: 'subjects',
};

/**
 * Cached list of published tests (with question counts).
 * Invalidated when an admin publishes / unpublishes / deletes a test or
 * edits its question count.
 */
export const getPublishedTestsCached = unstable_cache(
  async () => {
    return prisma.test.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        subject: { select: { id: true, slug: true, nameKz: true, kind: true } },
        author: { select: { id: true, name: true } },
        _count: { select: { questions: true } },
      },
      orderBy: [{ subject: { order: 'asc' } }, { createdAt: 'asc' }],
    });
  },
  ['published-tests-v3'],
  { tags: [CACHE_TAGS.publishedTests], revalidate: 300 },
);

export const getSubjectsCached = unstable_cache(
  async () => prisma.subject.findMany({ orderBy: { order: 'asc' } }),
  ['subjects-v1'],
  { tags: [CACHE_TAGS.subjects], revalidate: 3600 },
);

export function invalidatePublishedTests() {
  revalidateTag(CACHE_TAGS.publishedTests);
}

export function invalidateSubjects() {
  revalidateTag(CACHE_TAGS.subjects);
}
