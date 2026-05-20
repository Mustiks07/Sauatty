import Link from 'next/link';
import { SauattyLogo, SauattyMark } from '@/components/shared/Logo';

export const metadata = {
  title: 'Құпиялылық саясаты',
  description: 'Sauatty жобасының жеке деректерді қорғау саясаты.',
};

const LAST_UPDATED = '20 мамыр 2026';

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <nav className="border-b border-border bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <div className="container-page flex items-center justify-between py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <SauattyMark size={28} />
            <SauattyLogo size={20} />
          </Link>
          <Link href="/" className="text-sm text-fg-muted hover:text-fg">
            ← Басты бетке
          </Link>
        </div>
      </nav>

      <article className="container-page max-w-[760px] mx-auto py-12 md:py-16 prose-sa">
        <p className="text-[13px] uppercase tracking-[0.08em] font-semibold text-brand mb-3">
          Заңды
        </p>
        <h1 className="sa-display text-[36px] md:text-[44px] font-semibold tracking-[-0.025em] leading-[1.1] mb-3">
          Құпиялылық саясаты
        </h1>
        <p className="text-sm text-fg-muted mb-10">Соңғы жаңартылған күн: {LAST_UPDATED}</p>

        <Section title="1. Кіріспе">
          <p>
            Sauatty («біз», «жоба») пайдаланушылардың жеке деректерін қорғауды
            маңызды деп санайды. Бұл саясат қандай деректерді жинайтынымызды, не үшін
            қолданатынымызды және оларды қалай қорғайтынымызды түсіндіреді.
          </p>
        </Section>

        <Section title="2. Қандай деректерді жинаймыз">
          <List
            items={[
              'Аты — есепжазба үшін.',
              'Телефон нөмірі немесе Google аккаунтының электрондық поштасы — кіру үшін.',
              'Құпиясөз (шифрланған түрде) — егер телефонмен тіркелсеңіз.',
              'Тест нәтижелері: тапсырғаныңыз, балл, уақыт, жауаптар, қаралама суреттер.',
              'Техникалық ақпарат: IP, браузер түрі, кіру уақыты — қауіпсіздік үшін.',
            ]}
          />
        </Section>

        <Section title="3. Деректерді не үшін қолданамыз">
          <List
            items={[
              'Тесттерді өткізу және нәтижеңді сақтау.',
              'Жеке прогресс пен серпін көрсету.',
              'Қызметтің техникалық жұмысын қамтамасыз ету.',
              'Қызметті жақсарту (анонимді статистика).',
            ]}
          />
          <p>
            Біз жеке деректеріңді жарнама беруге, үшінші тұлғаларға сатуға
            <strong> ешқашан қолданбаймыз</strong>.
          </p>
        </Section>

        <Section title="4. Кіммен бөлісеміз">
          <p>
            Деректер келесі қызметтерде сақталады: Supabase (база), Vercel (хостинг),
            Google (OAuth кіру). Олардың өздерінің құпиялылық саясаттары қолданылады.
          </p>
        </Section>

        <Section title="5. Cookies">
          <p>
            Sauatty аутентификация (кіру сессиясы) үшін cookies қолданады. Жарнамалық
            немесе үшінші тарап трекерлері жоқ.
          </p>
        </Section>

        <Section title="6. Деректерді жою">
          <p>
            Аккаунтыңды жоюды қаласаң — <a href="mailto:contact@sauatty.kz" className="text-brand">contact@sauatty.kz</a>{' '}
            арқылы байланыс. 14 күн ішінде жеке деректерің мәңгілікке өшіріледі.
          </p>
        </Section>

        <Section title="7. Балалар">
          <p>
            Жоба 13 жастан кіші балаларға арналмаған. Егер ата-ана ретінде сенің балаң
            бізге деректерін жіберіп қойғанын білсең, бізге хабарлас — өшіреміз.
          </p>
        </Section>

        <Section title="8. Өзгерістер">
          <p>
            Саясатты жаңарта аламыз. Күрделі өзгеріс болған жағдайда, тіркеген
            байланысыңа ескерту жібереміз.
          </p>
        </Section>

        <Section title="9. Байланыс">
          <p>
            Сұрақтарың болса:{' '}
            <a href="mailto:contact@sauatty.kz" className="text-brand">
              contact@sauatty.kz
            </a>
          </p>
        </Section>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-9">
      <h2 className="sa-display text-[22px] font-semibold tracking-[-0.015em] mb-3">
        {title}
      </h2>
      <div className="text-[15px] leading-[1.7] text-fg space-y-3 [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-2 mb-3">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}
