'use client';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';

type Lang = 'ka' | 'en' | 'ru';

const t = {
  back: { ka: 'მთავარი', en: 'Home', ru: 'Главная' },
  title: { ka: 'სტუმრის წესები და პირობები', en: 'Guest Rules & Terms', ru: 'Правила и условия для гостей' },
  updated: { ka: 'ბოლო განახლება: მაისი 2026', en: 'Last updated: May 2026', ru: 'Обновлено: май 2026' },
  intro: {
    ka: 'WAYGO.ge-ზე ავტომობილის დასაქირავებლად, ყველა სტუმარი ვალდებულია დაიცვას შემდეგი წესები. ეს სახელმძღვანელო შექმნილია ჰოსტებისა და სტუმრების ურთიერთთანამშრომლობის, ავტომობილის დაცვისა და ორივე მხარის ინტერესების გარანტიისთვის.',
    en: 'To rent a car on WAYGO.ge, all guests must comply with the following rules. This guide is designed to ensure mutual cooperation between hosts and guests, protect the vehicle, and guarantee the interests of both parties.',
    ru: 'Для аренды автомобиля на WAYGO.ge все гости обязаны соблюдать следующие правила. Данное руководство создано для обеспечения взаимного сотрудничества между хозяевами и гостями, защиты транспортного средства и гарантии интересов обеих сторон.',
  },
  sections: [
    {
      icon: 'how_to_reg',
      color: 'bg-tertiary-fixed/30 text-tertiary',
      title: { ka: 'ძირითადი ვალდებულებები', en: 'Core Obligations', ru: 'Основные обязательства' },
      type: 'check' as const,
      items: [
        {
          ka: 'სტუმარი ვალდებულია გაიაროს ვინაობის ვერიფიკაცია — ატვირთოს პირადობის მოწმობა ან პასპორტი — ჯავშნის განთავსებამდე.',
          en: 'The guest must complete identity verification — uploading an ID or passport — before placing a booking.',
          ru: 'Гость обязан пройти верификацию личности — загрузить удостоверение личности или паспорт — перед размещением бронирования.',
        },
        {
          ka: 'ავტომობილი შეიძლება გამოიყენოს მხოლოდ ვერიფიცირებულმა სტუმარმა. ჰოსტის წინასწარი წერილობითი თანხმობის გარეშე მესამე პირზე გადაცემა კატეგორიულად აკრძალულია.',
          en: 'The car may only be driven by the verified guest. Transfer to a third party without prior written consent from the host is strictly prohibited.',
          ru: 'Автомобиль может использовать только верифицированный гость. Передача третьему лицу без предварительного письменного согласия хозяина строго запрещена.',
        },
        {
          ka: 'სტუმარი ვალდებულია ჩაატაროს გაცემის ფოტო-ანგარიში (7 ფოტო) — ავტომობილის მიღებისთანავე. WAYGO.ge-ის პლატფორმაზე ანგარიშის შედგენის გარეშე ჯავშანი ვერ გადავა "დადასტურებულ" სტატუსზე.',
          en: 'The guest must complete the pickup photo report (7 photos) immediately upon receiving the car. Without submitting the report on WAYGO.ge, the booking cannot transition to "confirmed" status.',
          ru: 'Гость обязан провести фотоотчёт при получении (7 фотографий) сразу после получения автомобиля. Без отправки отчёта на WAYGO.ge бронирование не может перейти в статус «подтверждено».',
        },
        {
          ka: 'ავტომობილი დაბრუნდება შეთანხმებულ ადგილსა და დროს — სუფთა, ზიანის გარეშე, ისეთ მდგომარეობაში, როგორც გადაეცა.',
          en: 'The car must be returned at the agreed location and time — clean, undamaged, and in the same condition as received.',
          ru: 'Автомобиль должен быть возвращён в согласованное место и время — чистым, без повреждений, в том же состоянии, в котором был получен.',
        },
        {
          ka: 'ნებისმიერი ავარიის, ქურდობის ან ზიანის შემთხვევაში, სტუმარი ვალდებულია WAYGO.ge-ს მხარდაჭერას (support@waygo.ge) და ჰოსტს დაუყოვნებლივ — არაუგვიანეს 2 საათისა — შეატყობინოს.',
          en: 'In the event of an accident, theft, or damage, the guest must notify WAYGO.ge support (support@waygo.ge) and the host immediately — no later than 2 hours.',
          ru: 'В случае аварии, угона или ущерба гость обязан немедленно — не позднее 2 часов — уведомить службу поддержки WAYGO.ge (support@waygo.ge) и хозяина.',
        },
        {
          ka: 'სტუმარი ვალდებულია დაიცვას საქართველოს კანონმდებლობა მთელი ქირავნობის განმავლობაში.',
          en: 'The guest must comply with Georgian law throughout the entire rental period.',
          ru: 'Гость обязан соблюдать законодательство Грузии на протяжении всего периода аренды.',
        },
      ],
    },
    {
      icon: 'block',
      color: 'bg-error-container/30 text-error',
      title: { ka: 'კატეგორიულად აკრძალული ქმედებები', en: 'Strictly Prohibited Actions', ru: 'Строго запрещённые действия' },
      type: 'ban' as const,
      items: [
        {
          ka: 'ავტომობილის სხვა პირზე გადაცემა — ჰოსტის წინასწარი წერილობითი თანხმობის გარეშე.',
          en: 'Handing over the car to another person without the host\'s prior written consent.',
          ru: 'Передача автомобиля другому лицу без предварительного письменного согласия хозяина.',
        },
        {
          ka: 'ავტომობილის კომერციული მიზნებისთვის გამოყენება: ტაქსი, კურიერი, ავტობუსი, ან სხვა შემოსავლის მიღების მიზნით.',
          en: 'Using the car for commercial purposes: taxi, courier, shuttle, or any revenue-generating activity.',
          ru: 'Использование автомобиля в коммерческих целях: такси, курьер, маршрутка или любая деятельность с целью получения дохода.',
        },
        {
          ka: 'ავტომობილის საქართველოს ფარგლებს გარეთ გაყვანა — ჰოსტის და WAYGO.ge-ის წინასწარი წერილობითი ნებართვის გარეშე.',
          en: 'Taking the car outside Georgia without prior written permission from the host and WAYGO.ge.',
          ru: 'Вывоз автомобиля за пределы Грузии без предварительного письменного разрешения хозяина и WAYGO.ge.',
        },
        {
          ka: 'მოწევა, ვეიფინგი ან სხვა ბოლქვის გამოყენება ავტომობილის სალონში — ჰოსტის ნებართვის გარეშე.',
          en: 'Smoking, vaping, or using any tobacco products inside the car without the host\'s permission.',
          ru: 'Курение, использование вейпа или других табачных изделий в салоне автомобиля без разрешения хозяина.',
        },
        {
          ka: 'შინაური ცხოველის ტრანსპორტირება — ჰოსტის ნებართვის გარეშე.',
          en: 'Transporting pets without the host\'s permission.',
          ru: 'Перевозка домашних животных без разрешения хозяина.',
        },
        {
          ka: 'ავტომობილის ოდომეტრის, ტექნიკური მდგომარეობის ან ნებისმიერი კომპონენტის განზრახ გაფუჭება ან შეცვლა.',
          en: 'Intentionally tampering with the odometer, technical condition, or any component of the car.',
          ru: 'Умышленное повреждение или изменение одометра, технического состояния или любого компонента автомобиля.',
        },
      ],
    },
    {
      icon: 'verified',
      color: 'bg-primary-fixed/30 text-primary',
      title: { ka: 'სტუმრის უფლებები', en: 'Guest Rights', ru: 'Права гостя' },
      type: 'check' as const,
      items: [
        {
          ka: 'ჯავშნის გაუქმება — WAYGO.ge-ის გაუქმების პოლიტიკის შესაბამისად — ნებისმიერ დროს.',
          en: 'Cancel the booking at any time — in accordance with WAYGO.ge\'s cancellation policy.',
          ru: 'Отмена бронирования в любое время — в соответствии с политикой отмены WAYGO.ge.',
        },
        {
          ka: 'WAYGO.ge-ის 24/7 მხარდაჭერა ნებისმიერ სიტუაციაში — ავარიის, ხარვეზის ან ჰოსტთან კონფლიქტის შემთხვევაში.',
          en: 'WAYGO.ge 24/7 support in any situation — accident, malfunction, or conflict with the host.',
          ru: 'Поддержка WAYGO.ge 24/7 в любой ситуации — авария, неисправность или конфликт с хозяином.',
        },
        {
          ka: 'ჰოსტის და ავტომობილის შეფასება ქირავნობის შემდეგ. შეფასება უნდა იყოს გულწრფელი, ფაქტებზე დაფუძნებული.',
          en: 'Review the host and car after the rental. Reviews must be honest and fact-based.',
          ru: 'Оценить хозяина и автомобиль после аренды. Отзывы должны быть честными и основанными на фактах.',
        },
        {
          ka: 'WAYGO.ge-ში სადავო სიტუაციის დაფიქსირება — 48 საათის განმავლობაში ქირავნობის დასრულების შემდეგ.',
          en: 'File a dispute with WAYGO.ge — within 48 hours after the rental ends.',
          ru: 'Подать спор в WAYGO.ge — в течение 48 часов после окончания аренды.',
        },
      ],
    },
    {
      icon: 'policy',
      color: 'bg-amber-50 text-amber-600',
      title: { ka: 'პასუხისმგებლობა ზიანზე', en: 'Liability for Damage', ru: 'Ответственность за ущерб' },
      type: 'warning' as const,
      items: [
        {
          ka: 'ავტომობილის ზიანის შემთხვევაში, სტუმარი პასუხისმგებელია ფრანშიზის ოდენობაზე — შერჩეული სადაზღვევო გეგმის მიხედვით (Basic: 500 ₾, Standard: 300 ₾, Premium: 150 ₾).',
          en: 'In case of damage, the guest is liable up to the deductible amount based on the chosen insurance plan (Basic: 500 ₾, Standard: 300 ₾, Premium: 150 ₾).',
          ru: 'В случае ущерба гость несёт ответственность в размере франшизы согласно выбранному страховому плану (Basic: 500 ₾, Standard: 300 ₾, Premium: 150 ₾).',
        },
        {
          ka: 'დაზღვევით გაუფარული ზიანი (მაგ.: შიგნიდან განზრახ ზიანი, სატრანსპორტო კოდექსის გრობოვი დარღვევა) სრულად სტუმრის პასუხისმგებლობაა.',
          en: 'Damage not covered by insurance (e.g., intentional interior damage, gross traffic code violations) is entirely the guest\'s responsibility.',
          ru: 'Ущерб, не покрытый страховкой (например, умышленное повреждение интерьера, грубые нарушения ПДД), является полной ответственностью гостя.',
        },
        {
          ka: 'გვიანი დაბრუნების შემთხვევაში — დამატებითი სადღეღამისო ტარიფი (x1.5 ყოველ 24 საათზე) ავტომატურად ეხება.',
          en: 'In case of late return — an additional daily rate (x1.5 per 24 hours) applies automatically.',
          ru: 'В случае позднего возврата — автоматически применяется дополнительная суточная ставка (x1.5 за каждые 24 часа).',
        },
      ],
    },
  ],
};

function ItemIcon({ type }: { type: 'check' | 'ban' | 'warning' }) {
  if (type === 'check') return <span className="material-symbols-outlined text-[16px] text-tertiary mt-0.5 shrink-0">check_circle</span>;
  if (type === 'ban') return <span className="material-symbols-outlined text-[16px] text-error mt-0.5 shrink-0">cancel</span>;
  return <span className="material-symbols-outlined text-[16px] text-amber-600 mt-0.5 shrink-0">warning</span>;
}

export function GuestRulesContent() {
  const { lang } = useLang();
  const l = lang as Lang;

  return (
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[73px] pb-20 md:pb-0">
      <div className="mx-auto max-w-screen-md px-4 md:px-8 py-12">

        <Link href="/" className="inline-flex items-center gap-1.5 text-label-sm font-bold text-secondary hover:text-primary mb-8 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {t.back[l]}
        </Link>

        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary-fixed/30">
              <span className="material-symbols-outlined text-[30px] text-tertiary">person_check</span>
            </div>
            <div>
              <h1 className="text-h1 font-extrabold text-on-background">{t.title[l]}</h1>
              <p className="text-label-sm text-secondary mt-0.5">{t.updated[l]}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-tertiary-fixed/10 border border-tertiary/10 p-5">
            <p className="text-body-md text-secondary leading-relaxed">{t.intro[l]}</p>
          </div>
        </div>

        <div className="space-y-8">
          {t.sections.map((section, si) => (
            <section key={si}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${section.color}`}>
                  <span className="material-symbols-outlined text-[20px]">{section.icon}</span>
                </div>
                <h2 className="text-h2 font-extrabold text-on-background">{section.title[l]}</h2>
              </div>
              <div className="rounded-2xl border border-outline-variant/40 bg-white shadow-card overflow-hidden">
                {section.items.map((item, ii) => (
                  <div
                    key={ii}
                    className={`flex gap-3 px-5 py-4 ${ii < section.items.length - 1 ? 'border-b border-outline-variant/30' : ''}`}
                  >
                    <ItemIcon type={section.type} />
                    <p className="text-[13px] text-secondary leading-relaxed">{item[l]}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-tertiary-fixed/20 border border-tertiary/10 p-8 text-center">
          <h3 className="text-h3 font-extrabold text-on-background mb-3">
            {l === 'ka' ? 'კითხვა გაქვს?' : l === 'ru' ? 'Остались вопросы?' : 'Have questions?'}
          </h3>
          <p className="text-body-md text-secondary mb-5">
            {l === 'ka'
              ? 'ჩვენი მხარდაჭერის გუნდი ყოველთვის მზადაა დაგეხმაროს.'
              : l === 'ru'
              ? 'Наша команда поддержки всегда готова помочь.'
              : 'Our support team is always ready to help.'}
          </p>
          <a
            href="mailto:support@waygo.ge"
            className="inline-flex items-center gap-2 bg-primary-container text-white px-6 py-3 rounded-xl font-bold text-label-bold hover:bg-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">mail</span>
            support@waygo.ge
          </a>
        </div>

      </div>
    </main>
  );
}
