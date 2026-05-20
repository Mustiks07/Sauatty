import Link from 'next/link';
import { SauattyLogo, SauattyMark } from '@/components/shared/Logo';

export const metadata = {
  title: 'Қызмет шарттары',
  description: 'Sauatty жобасының қызмет шарттары.',
};

const LAST_UPDATED = '20 мамыр 2026';

export default function TermsPage() {
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

      <article className="container-page max-w-[760px] mx-auto py-12 md:py-16">
        <p className="text-[13px] uppercase tracking-[0.08em] font-semibold text-brand mb-3">
          Заңды
        </p>
        <h1 className="sa-display text-[36px] md:text-[44px] font-semibold tracking-[-0.025em] leading-[1.1] mb-3">
          Қызмет шарттары
        </h1>
        <p className="text-sm text-fg-muted mb-10">
          Соңғы жаңартылған күн: {LAST_UPDATED}
        </p>

        <Section title="1. Жалпы ережелер">
          <p>
            Sauatty — ҰБТ (Ұлттық бірыңғай тестілеу) -ға қазақ тілінде дайындалуға
            арналған онлайн платформа. Қызметті пайдалану арқылы сен осы шарттарды
            қабылдайсың.
          </p>
        </Section>

        <Section title="2. Аккаунт">
          <p>
            Тестілерді тапсыру үшін аккаунт қажет. Аккаунт ашқанда дұрыс деректерді
            беруге және құпиясөзіңді басқа ешкімге айтпауға міндеттісің.
          </p>
        </Section>

        <Section title="3. Қызметтің тегін табиғаты">
          <p>
            Қазіргі уақытта Sauatty <strong>толық тегін</strong>. Болашақта премиум
            мүмкіндіктер қосылуы мүмкін, бірақ бұл алдын ала ескертіледі.
          </p>
        </Section>

        <Section title="4. Дұрыс қолдану">
          <p>Қызметті қолдану кезінде сен:</p>
          <List
            items={[
              'Тесттердің жауаптарын алаяқтықпен табуға тырыспайсың.',
              'Басқа адамдардың аккаунттарын қолданбайсың.',
              'Жүйенің жұмысына зиян келтіретін әрекеттер жасамайсың.',
              'Контентті біздің рұқсатсыз көшіріп таратпайсың.',
            ]}
          />
        </Section>

        <Section title="5. Интеллектуалды меншік">
          <p>
            Sauatty платформасы, оның дизайны, сұрақтар базасы және коды — авторлық
            құқық арқылы қорғалған. Жеке оқу мақсатында тестті тапсыру — рұқсат.
            Сұрақтарды коммерциялық қолдану — тыйым салынған.
          </p>
        </Section>

        <Section title="6. Жауапкершілікті шектеу">
          <p>
            Sauatty оқу материалы ретінде ғана ұсынылады және ҰБТ-да жоғары балл
            алуға кепілдік бермейді. Біз сұрақтардың дұрыстығын сақтауға тырысамыз,
            бірақ қателер болуы мүмкін. Қате тапсаң —{' '}
            <a href="mailto:contact@sauatty.kz" className="text-brand underline">
              contact@sauatty.kz
            </a>
            -ге жаз.
          </p>
        </Section>

        <Section title="7. Аккаунтты тоқтату">
          <p>
            Шарттарды бұзған жағдайда аккаунтыңды ескертусіз бұғаттай аламыз. Сен де
            кез келген уақытта аккаунтыңды жою туралы өтініш бере аласың.
          </p>
        </Section>

        <Section title="8. Өзгерістер">
          <p>
            Шарттар уақыт өте келе өзгеруі мүмкін. Сайтты қолдануды жалғастыру арқылы
            сен жаңартылған шарттарды қабылдайсың.
          </p>
        </Section>

        <Section title="9. Қолданылатын құқық">
          <p>
            Бұл шарттарға Қазақстан Республикасының заңнамасы қолданылады.
          </p>
        </Section>

        <Section title="10. Байланыс">
          <p>
            Сұрақтар:{' '}
            <a href="mailto:contact@sauatty.kz" className="text-brand underline">
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
      <div className="text-[15px] leading-[1.7] text-fg space-y-3">{children}</div>
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
