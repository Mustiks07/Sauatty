-- Enforce MAX_USER_PENDING=1 at the DB level — protects against TOCTOU races
-- in /api/my-tests/[id]/submit where two concurrent submits can both pass the
-- "count pending == 0" check before either commits.
--
-- Partial unique index: a given author_id may appear at most once with
-- status='PENDING_REVIEW'. Admin-created tests (author_id IS NULL) are
-- unaffected because NULLs don't participate in unique constraints.
--
-- Apply via Supabase SQL editor or psql; Prisma `db push` cannot express
-- partial indexes in schema.prisma.

CREATE UNIQUE INDEX IF NOT EXISTS one_pending_per_author
  ON tests (author_id)
  WHERE status = 'PENDING_REVIEW' AND author_id IS NOT NULL;
