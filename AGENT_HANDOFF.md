# Sauatty — Agent Handoff

> Файл для передачи проекта новому Claude-агенту. Кидай его в первое сообщение каждого нового чата вместе со своим конкретным запросом. Не переписывай — обновляй по мере роста проекта.

---

## 0. Кто я / что от агента нужно

Я — **Мұстафа Әбілбек**, школьник из Казахстана, делаю Sauatty (платформа для подготовки к ҰБТ на казахском) соло. Английский язык — норм, но **отвечай мне по-русски** короткими понятными сообщениями. **Не извиняйся, не льсти, не разводи воду** — просто действуй.

**Правила работы:**
- Не пуши в git автоматически после каждой правки — я хочу проверить локально. Жди пока я скажу «пуш» / «давай».
- Перед большими фичами — обсуди план словами, не сразу код.
- Когда баг — найди корневую причину, не лепи костыли.
- Билд должен оставаться чистым (`npx tsc --noEmit` и `npx next build`). Проверяй прежде чем считать задачу готовой.
- На Windows: dev-сервер блокирует `node_modules/.prisma/client/query_engine-windows.dll.node`, поэтому перед `npx prisma generate` я должен сам остановить `npm run dev`.

---

## 1. Что за продукт

**Sauatty** — веб-платформа для подготовки к ҰБТ (Ұлттық бірыңғай тестілеу) на казахском языке. **Прод**: <https://www.sauatty.kz>. Аудитория — школьники 11 класса в КЗ.

Сейчас в работе **два предмета**:
1. `mat-sauattylyq` — Математикалық сауаттылық (10 вопросов, 20 мин, калькулятор+черновик)
2. `qazaqstan-tarihy` — Қазақстан тарихы (20 вопросов, 40 мин, без инструментов)

---

## 2. Стек

| Слой | Что |
|---|---|
| Framework | Next.js 14.2 (App Router, Server Components by default) |
| Язык | TypeScript strict |
| Стили | TailwindCSS + кастомные дизайн-токены |
| UI | shadcn-style примитивы (Radix Dialog), lucide-react иконки |
| Шрифты | Inter + Space Grotesk + JetBrains Mono via next/font/google (subset cyrillic-ext обязателен) |
| БД | Supabase PostgreSQL (через PgBouncer pooler) |
| ORM | Prisma 5.22 (нельзя обновляться выше — major upgrade ломает) |
| Auth | Supabase Auth через **@supabase/ssr** (никакого NextAuth) |
| Storage | Supabase Storage, bucket `question-images` |
| i18n | next-intl, только локаль `kk` |
| Toast | sonner |
| Графики | Recharts (только в админ-аналитике) |
| Calc | mathjs (lazy-loaded) |
| Draft | react-sketch-canvas (lazy-loaded, прямой import, не через next/dynamic) |
| Forms | react-hook-form + zod |
| Errors | Sentry (`NEXT_PUBLIC_SENTRY_DSN` опционально) |
| Hosting | Vercel + домен sauatty.kz (308 редирект на www) |

---

## 3. Архитектурные принципы

1. **Server Components by default.** Client Components только где нужно интерактив (формы, калькулятор, drag, toggles).
2. **Все мутации через Route Handlers** в `app/api/...`, **не** Server Actions.
3. **`runtime = 'nodejs'`** на каждом Route Handler с Prisma. Middleware на Edge (без Prisma).
4. **Все мутации валидируются через zod** на сервере. На клиенте — react-hook-form + тот же zod schema.
5. **Никакого `any` без причины.** Если нужно — комментарий почему.
6. **Все API-ответы стандартизированы**: `{ data }` или `{ error, code, details? }`. Клиент использует `apiFetch()` который читает `code` и кидает toast.
7. **Никаких хардкод-строк в UI** — всё через next-intl messages/kz.json. Хотя сейчас часть строк хардкодом, выбираем pragmatic.
8. **`@supabase/ssr`** строго. Никакого `createClient` из `@supabase/supabase-js` напрямую (кроме service-role в сидах/admin API).
9. **PgBouncer transaction mode**: НЕ использовать `prisma.$transaction(async fn => ...)` (interactive transactions). Использовать `prisma.$transaction([batch, batch])` или `Promise.all([...])` для параллельных независимых мутаций.
10. **Защита от читерства**: `AnswerOption.isCorrect` НЕ отдаётся клиенту до `finishedAt`. На всех routes/server pages, которые загружают тест для прохождения, обязателен `select: { id, textKz, order }` без `isCorrect`.
11. **Cache-инвалидация** через `unstable_cache` теги. Tag-инвалидация в `lib/cache.ts` после публикации/изменений тестов.
12. **Дату храним как `DateTime` в Postgres**, но для дневной агрегации (heatmap, streak) приводим к `Asia/Almaty` через `toLocaleDateString('en-CA', { timeZone: 'Asia/Almaty' })`.

---

## 4. Структура файлов (что где)

```
app/
  (public)/              — публичные страницы (лендинг, /kiru, /tirkelu, /privacy, /terms)
    page.tsx             — лендинг (force-dynamic для проверки сессии)
    LandingNav.tsx       — навигация с mobile hamburger, проверяет /api/me
    kiru/                — вход (phone+password), Google OAuth кнопка
    tirkelu/             — регистрация
    privacy/             — Privacy Policy (статика)
    terms/               — Terms of Service (статика)
  (auth)/                — страницы только для USER
    dashboard/           — главная юзера: stats + tabs по предметам + tests list
    test/[id]/           — прохождение теста (TestRunner client component)
    test/[id]/result/[attemptId]/  — результат + Breakdown с фильтром «тек қателер»
    profile/             — личный профиль
    profile/edit/        — редактирование (имя, аватар, пароль, ҰБТ-дата, удалить аккаунт)
    profile/mistakes/    — архив ошибок (последний ответ был неверным)
    profile/mistakes/practice/  — 10 случайных ошибок подряд для повторения
  admin/                 — только ADMIN (защищено layout.tsx через requireAdminPage)
    page.tsx             — список тестов с фильтрами/поиском
    test/new/            — создание теста
    test/[id]/           — редактор теста (TestEditor: collapse, save-all, reorder)
    test/[id]/analytics/ — per-question статистика (Recharts)
    users/               — список юзеров с поиском/сортировкой
    users/[id]/          — детальная карточка юзера со статистикой
    stats/               — общая статистика платформы (KPI, графики, топ-тесты)
  manage/                — СКРЫТЫЙ admin login (не /kiru, не индексируется)
  onboarding/            — для Google-OAuth юзеров без телефона
  auth/callback/         — Supabase OAuth callback
  api/
    test/[id]/start/     — POST: создать/переиспользовать TestAttempt
    attempt/[id]/        — answer / draft / state / finish / result
    user/                — onboarding / profile / password / account
    admin/               — tests / questions / upload (only ADMIN)
    me/                  — GET сессионная роль (для клиента)
    manage/verify/       — POST: проверка role=ADMIN, signOut если нет
  icon.tsx               — favicon (генерируется через @vercel/og)
  apple-icon.tsx         — iOS app icon
  layout.tsx             — root layout + metadata + JSON-LD
  sitemap.ts             — публичный sitemap
  robots.ts              — robots.txt
  loading.tsx, not-found.tsx, error.tsx — global states

components/
  ui/                    — Button, Input, Card, Badge, PhoneField (kz mask)
  auth/                  — AuthShell, GoogleButton (client)
  shared/                — Logo, UserAvatar (gradient presets), DashHeader, UbtCountdown, ImageZoom
  test/                  — TestRunner, Timer, Calculator, DraftCanvas, ToolDialog (mobile bottom-sheet)
  admin/                 — AdminShell (sidebar), ImageUpload, StatsCharts (Recharts wrappers)

lib/
  prisma.ts              — singleton PrismaClient
  supabase/              — server.ts (cookies-aware) + client.ts (browser) + createAdminClient
  auth.ts                — getSessionUser (React.cache wrapped), require*Page helpers
  api-error.ts           — ApiError class + handleError + ok/fail
  api-fetch.ts           — clientside fetch wrapper, sonner toast
  utils.ts               — cn, formatMSS, formatPhoneDisplay, phoneToE164, PHONE_REGEX
  validators/            — zod schemas для auth, test
  cache.ts               — unstable_cache + tag invalidation
  attempt.ts             — getAttemptOwned, isExpired, finalizeAttempt, finalizeStaleAttemptsForUser
  stats.ts               — getSiteStats, getUserStats, getTestAnalytics (server-side)
  mistakes.ts            — getUserMistakes, countUserMistakes
  streak.ts              — calcStreak (consecutive days with finished attempts)
  avatar.ts              — AVATAR_PRESETS, avatarGradient

prisma/
  schema.prisma          — 9 моделей; ВАЖНО: User.id is UUID, синхрон с auth.users.id
  seed.ts                — idempotent: создаёт subjects + первого админа через Admin API

supabase/migrations/
  0001_handle_new_user.sql — trigger auth.users INSERT → public.users INSERT (с ON CONFLICT + EXCEPTION handler)
  0002_rls.sql           — RLS deny-by-default + Storage policy для question-images

scripts/
  generate-og.mjs        — генерация public/og.png через satori+resvg

messages/kz.json         — i18n строки на казахском

middleware.ts            — Edge: проверка сессии, редиректы для гостей/админа/онбординга

ENV files (gitignored):
  .env                   — DATABASE_URL + DIRECT_URL для Prisma CLI + SUPABASE_SERVICE_ROLE_KEY для seed
  .env.local             — все ENV для Next.js рантайма
```

---

## 5. Схема БД

```prisma
model User {
  id           String    @id @db.Uuid          // = auth.users.id
  phone        String?   @unique
  email        String?   @unique
  name         String
  role         Role      @default(USER)
  createdAt    DateTime  @default(now())
  examDate     DateTime? @db.Date              // ҰБТ-дата (юзер вводит сам)
  avatarPreset String?   @default("blue-amber") // ключ из lib/avatar.ts
  attempts     TestAttempt[]
}

enum Role { USER ADMIN }

model Subject {
  id, slug @unique, nameKz, order
  // slug = 'mat-sauattylyq' | 'qazaqstan-tarihy'
}

model Topic { /* пока не используется в UI */ }

model Test {
  id, subjectId, titleKz, descriptionKz?, timeLimitMinutes,
  hasCalculator Boolean @default(true),
  hasDraftCanvas Boolean @default(true),
  isPublished Boolean @default(false), createdAt
}

model Question {
  id, testId, topicId?, order, textKz, imageUrl?, explanationKz?, explanationImageUrl?
}

model AnswerOption { id, questionId, textKz, isCorrect, order }

model TestAttempt {
  id, userId, testId, startedAt, finishedAt?, score?, totalQuestions
  @@index([userId, testId, score]), @@index([userId, finishedAt])
}

model UserAnswer {
  attemptId, questionId, selectedOptionId?, isCorrect
  @@unique([attemptId, questionId])
}

model Draft {
  attemptId, questionId, canvasData @db.Text
  @@unique([attemptId, questionId])
}
```

**Каскады**: Test→Question→AnswerOption всё onDelete: Cascade. TestAttempt тоже Cascade — удалить юзера = удалить попытки/ответы/черновики.

---

## 6. Auth flow / роли

- **USER**: регистрируется на `/tirkelu` (phone+password) или через Google на `/kiru`. После — `/dashboard`.
- **ADMIN**: создаётся только через `prisma db seed` (env переменные `SEED_ADMIN_PHONE`, `SEED_ADMIN_PASSWORD`). Логинится ТОЛЬКО через `/manage` (скрытая страница, не индексируется). LoginForm на `/kiru` проверяет `/api/me` после signIn — если ADMIN, делает signOut + общий «Кіру қате».
- **Жёсткое разделение**: `requireRegularUserPage()` редиректит ADMIN на `/admin`; `requireAdminPage()` редиректит USER на `/dashboard`. Layout админки использует `requireAdminPage`.

---

## 7. ENV переменные

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://fymlzgrcvglpugudhnai.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Prisma — используем Supabase pooler с pgbouncer=true и statement_cache_size=0
DATABASE_URL=postgresql://...pooler...:6543/postgres?pgbouncer=true&connection_limit=25&pool_timeout=30&statement_cache_size=0
DIRECT_URL=postgresql://...pooler...:5432/postgres

# Seed
SEED_ADMIN_PHONE=+77472039880
SEED_ADMIN_PASSWORD=Mustafa0607!a

# SEO verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<...>
NEXT_PUBLIC_YANDEX_VERIFICATION=<...>

# Optional
NEXT_PUBLIC_SENTRY_DSN=
```

Для Vercel prod: `connection_limit=5` (не 25, чтобы не упереться в лимит Supabase Free Tier при холодных стартах лямбд).

---

## 8. Подводные камни, на которые мы натыкались

1. **PhoneField mask** — финальный фикс: `localFromE164` ВСЕГДА стрипает первую `7` через `digits.startsWith('7') ? digits.slice(1, 11) : digits.slice(0, 10)`. Не использовать onBeforeInput (capризный на мобильных), только onChange со slice(4) после префикса `+7 (`.

2. **Hydration mismatch в Timer** — `useState(() => timeLimitMinutes * 60)` на первом рендере (детерминированно), реальное `remaining` считается в useEffect после mount.

3. **react-sketch-canvas + next/dynamic** — НЕ оборачивать через `next/dynamic`, потому что ref не пробрасывается → все кнопки тулбара (eraser, undo, clear) молча не работают. Прямой `import { ReactSketchCanvas }` работает потому что компонент в `'use client'` файле.

4. **Cache `.next` на Windows** часто корраптится с ошибками вида `Cannot find module './vendor-chunks/...'`. Лечение: `rd /s /q .next` + перезапустить `npm run dev`.

5. **`prisma generate` падает с EPERM** если запущен dev-сервер. Нужно остановить dev перед generate.

6. **WhatsApp/Facebook OG cache** — после фикса OG-изображения старые ссылки месяцами показываются без превью. Бастер: `?v=N` в URL или Facebook Debugger.

7. **Trigger `handle_new_user` может упасть** — добавлены `ON CONFLICT (id) DO NOTHING` + `EXCEPTION WHEN OTHERS RAISE WARNING`. Плюс fallback в `getSessionUser`: если строки в `public.users` нет, создаём on-the-fly.

8. **WAU/MAU вычисление** — используем `prisma.testAttempt.findMany({ distinct: ['userId'] })` потому что Prisma `count` не поддерживает distinct по полю.

9. **Recharts** — добавляет ~80kb. Используем ТОЛЬКО в admin/stats и admin/profile, на пользовательских страницах с SVG руками.

10. **`router.refresh()`** после мутаций — обязательно, иначе Server Components кэшируют старые данные.

---

## 9. Что уже сделано (Definition of Done пройдено)

✅ Auth (phone+password + Google OAuth) + onboarding + middleware  
✅ Прохождение теста: timer, autosave, restore при reload, auto-finish при истечении, calculator (mathjs + классический %), draft canvas (4 цвета, 3 толщины, undo/redo, fullscreen, debounce save), mobile bottom-sheet  
✅ Result page со скор-рингом, фильтром только ошибок, объяснениями, image zoom  
✅ Dashboard с табами по предметам, поиском, streak'ом, ҰБТ countdown  
✅ Profile: личная статистика (graph + heatmap + by-subject), история  
✅ Profile/edit: имя, аватар (6 пресетов градиента), пароль, ҰБТ-дата, удаление аккаунта  
✅ Profile/mistakes + practice mode (10 случайных ошибок)  
✅ Admin: список тестов с фильтрами, редактор (collapse, save-all, reorder), users list/detail, общая stats, per-test analytics (Recharts)  
✅ Image upload в Supabase Storage + сжатие browser-image-compression  
✅ SEO: sitemap, robots, canonical, JSON-LD, Google/Yandex verification meta  
✅ OG: статичный PNG в public/og.png (генерится через `npm run gen:og`)  
✅ Performance: lazy mathjs+sketch (-181kB на test bundle), unstable_cache + tag invalidation, React.cache для getSessionUser  
✅ KZ phone mask, hidden /manage, password reset removed (требует SMS-провайдер), Sentry hook (DSN опционально)  
✅ Deployment: www.sauatty.kz с 308 редиректом с apex, Vercel  

---

## 10. План на будущее (что хочется делать дальше)

### Tier 2 (следующее)
- **Достижения / бейджи**. Slug-based система. Список предложенных бейджей:
  - `first_step` — первая завершённая попытка
  - `collector_5/25/100` — 5/25/100 попыток
  - `iron_streak` — 7 дней подряд
  - `diamond_streak` — 30 дней подряд
  - `perfect_score` — первое 10/10
  - `polymath` — минимум 1 попытка в каждом предмете
  - `morning_owl` — тест до 7:00
  - `night_owl` — тест после 23:00
  - `speed_runner` — <50% от лимита времени
  - `comeback` — вернулся после 14+ дней перерыва
  
  Реализация: новая модель `UserAchievement (userId, achievementId String, unlockedAt)`. Проверка в `finalizeAttempt` после установки score → если что-то новое, инсертим. Toast «🏆 New achievement» на клиенте через router.refresh-trigger.

- **Ежедневная цель + streak freeze**. Юзер выбирает 1/2/3 теста в день. Прогресс-бар на dashboard. Один «заморозочный» день в неделю — если пропустил, streak не теряется.

### Tier 3 (когда будет нужно)
- **Bulk-импорт вопросов из Excel** для админа. Использовать SheetJS (`xlsx`). Шаблон со столбцами: order, text, option_a..d, correct (A/B/C/D), explanation, image_url. Preview screen перед сохранением. ~4-5 часов работы.
- **AI-парсинг произвольных документов** в вопросы через OpenRouter (GPT-4 mini / Claude Haiku). Премиум-фича. ~$0.01 за документ.
- **AI-объяснения** на странице ошибок. Кнопка «Объясни почему» → персонализированное объяснение через LLM.
- **Spaced repetition** — показывать ошибочные вопросы через 1/3/7 дней (формула Anki).
- **Rate limiting** на `/api/attempt/[id]/answer` через Upstash Redis (опционально по ТЗ).
- **Push-уведомления** или хотя бы in-app `Notification` модель + колокольчик в шапке.
- **Реферальная программа** (когда будет монетизация).
- **Mobile native** через Expo + общий Supabase backend.

### Поломки которые НЕ надо чинить (это feature, не bug)
- Пользователь может пройти тест 100 раз и оставить лучший результат — это поощряет повторение, ОК.
- Bell-иконка в шапке отсутствует — мы убрали потому что не было системы уведомлений.
- Тёмная тема — НЕ ДЕЛАЕМ в MVP (ТЗ запрещает).
- Несколько локалей — только `kk`, не плодим.

---

## 11. Команды

```powershell
# Dev
npm run dev

# Build (как на Vercel)
npm run build       # = prisma generate && next build

# Type check
npx tsc --noEmit

# Prisma
npx prisma db push                  # применить schema к БД
npx prisma generate                 # регенерировать клиент (нужно остановить dev!)
npx prisma db seed                  # idempotent — создаёт subjects + админа

# OG картинка
npm run gen:og      # пересоздаёт public/og.png
```

---

## 12. Контекст по человеку

Я школьник, делаю это соло. Ресурсы:
- **Supabase Free Tier** (60 connections, 500 MB database, 1 GB storage, 50k MAU)
- **Vercel Hobby** (бесплатно, лимит 100 GB-hrs на функции)
- **Домен sauatty.kz** куплен
- **Сидовый админ**: phone `+77472039880`, password `Mustafa0607!a`

Бюджет на платные сервисы: ноль или минимум. Поэтому пока:
- SMS-провайдера нет (фича password reset отключена)
- LLM API нет (AI-фичи отложены)
- Если предложишь платное решение — обязательно скажи стоимость

---

## 13. Как новому агенту НАЧАТЬ работу

1. Прочитай этот файл целиком.
2. Если задача про конкретную страницу/фичу — прочитай соответствующие файлы (см. раздел 4).
3. Если нужно поменять схему — обновляй `prisma/schema.prisma`, потом `npx prisma db push` + я сам остановлю dev для `npx prisma generate`.
4. Не предлагай React Query/Zustand/нового state-менеджера — мы строго на Server Components + useState/useReducer.
5. Не предлагай заменить styled-components/styled-system/etc — только Tailwind.
6. Не предлагай миграцию на App Router → Pages — мы УЖЕ на App Router.
7. После любых изменений — `npx tsc --noEmit` (тип-чек) и `npx next build` (билд) обязательны. Если красное — фиксай.
8. Перед `git push` всегда жди моего «давай» / «пуш».
9. Сообщения короткие, по делу. Без преамбул «Конечно! Я с радостью...» — сразу к делу.

---

## 14. Файлы для быстрого просмотра когда не знаешь что делать

- **«Где middleware?»** → `middleware.ts`
- **«Как auth работает?»** → `lib/auth.ts` + `lib/supabase/server.ts`
- **«Где список API endpoints?»** → `app/api/**/route.ts`
- **«Дизайн-токены?»** → `tailwind.config.ts`
- **«Как локализовать строку?»** → `messages/kz.json` + `useTranslations` / `getTranslations`
- **«Как вызвать API с клиента?»** → используй `apiFetch` из `lib/api-fetch.ts`
- **«Как защитить роут?»** → `requireRegularUserPage()` / `requireAdminPage()` / `requireUser()` / `requireAdmin()` из `lib/auth.ts`

---

## 15. Git репозиторий

GitHub: <https://github.com/Mustiks07/Sauatty>  
Деплой: Vercel (sauatty.kz)  
Бранч: `main` (только)

После пуша в main → авто-деплой на Vercel за 1-2 минуты.

---

**Все спорные ситуации — спрашивай меня. Не угадывай.**
