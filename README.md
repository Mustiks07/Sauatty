# Sauatty

ҰБТ-ға қазақша дайындалу платформасы. MVP — Математикалық сауаттылық.

## Stack

Next.js 14 (App Router) · TypeScript · TailwindCSS · shadcn-style primitives · Supabase (Auth + Postgres + Storage) · Prisma · next-intl (kz).

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Supabase + DATABASE_URL
npx prisma generate
npx prisma db push           # or migrate dev
npx prisma db seed
npm run dev
```

Open <http://localhost:3000>.

## Project structure

```
app/                Next.js App Router
  (public)/         Landing, kiru, tirkelu
  (auth)/           Dashboard, test, profile (auth-gated)
  admin/            Admin pages
  api/              Route handlers
  auth/callback/    Supabase OAuth callback
components/
  ui/               shadcn-style primitives
  test/             Question, Timer, Calculator, DraftCanvas
  shared/           Logo, layout chrome
lib/
  prisma.ts
  supabase/         server.ts, client.ts
  auth.ts           requireUser, requireAdmin
  api-error.ts
  api-fetch.ts
  validators/
messages/kz.json
prisma/schema.prisma
middleware.ts
```

See `SAUATTY_TECH_SPEC.md` for the full spec.
