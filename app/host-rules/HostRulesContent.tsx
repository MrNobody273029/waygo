'use client';

import Link from 'next/link';
import { useLang } from '@/components/lang-provider';

type Lang = 'ka' | 'en' | 'ru';

const t = {
  back: { ka: 'მთავარი', en: 'Home', ru: 'Главная' },
  title: { ka: 'ჰოსტის წესები და პირობები', en: 'Host Rules & Terms', ru: 'Правила и условия для хозяев' },
  updated: { ka: 'ბოლო განახლება: მაისი 2026', en: 'Last updated: May 2026', ru: 'Обновлено: май 2026' },
  intro: {
    ka: 'WAYGO.ge-ის ჰოსტი გახდებით — გარკვეულ პასუხისმგებლობას გთავაზობთ. ჩვენი სტანდარტების დაცვა სავალდებულოა ყველა ჰოსტისთვის. ქვემოთ მოცემულია სრული სახელმძღვანელო, რომელიც უზრუნველყოფს სტუმრებისა და ჰოსტების სამართლიან, უსაფრთხო და გამჭვირვალე ურთიერთობას.',
    en: 'Becoming a host on WAYGO.ge comes with real responsibility. Compliance with our standards is mandatory for all hosts. Below is the full guide that ensures fair, safe and transparent relationships between guests and hosts.',
    ru: 'Становясь хозяином на WAYGO.ge, вы берёте на себя реальную ответственность. Соблюдение наших стандартов обязательно для всех хозяев. Ниже приведено полное руководство, обеспечивающее честные, безопасные и прозрачные отношения между гостями и хозяевами.',
  },
  sections: [
    {
      icon: 'task_alt',
      color: 'bg-tertiary-fixed/30 text-tertiary',
      title: { ka: 'ჰოსტის ძირითადი ვალდებულებები', en: 'Core Host Obligations', ru: 'Основные обязательства хозяина' },
      type: 'check' as const,
      items: [
        {
          ka: 'ავტომობილი უნდა ზუსტად შეესაბამებოდეს განცხადებას — ფოტოებს, სპეციფიკაციასა და მითითებულ ფასს. ყოველგვარი შეუსაბამობა ვალდებულია გასწორდეს განცხადების განახლებით.',
          en: 'The car must exactly match the listing — photos, specifications, and listed price. Any discrepancy must be corrected by updating the listing.',
          ru: 'Автомобиль должен точно соответствовать объявлению — фотографиям, характеристикам и указанной цене. Любое несоответствие необходимо исправить обновлением объявления.',
        },
        {
          ka: 'ავტომობილი გაცემამდე უნდა იყოს: სუფთა, ტექნიკურად გამართული, სავარჯიშო ანაბარიდან (ან შეთანხმებული დონით) სავსე. ტექნიკური პრობლემის შემთხვევაში, ჰოსტი ვალდებულია სტუმარს წინასწარ აცნობოს.',
          en: 'The car must be clean, mechanically sound, and fueled (or at the agreed level) before handover. In case of a technical problem, the host must notify the guest in advance.',
          ru: 'Перед передачей автомобиль должен быть чистым, технически исправным и заправленным (или на согласованном уровне). В случае технической проблемы хозяин обязан заранее уведомить гостя.',
        },
        {
          ka: 'ჰოსტი ვალდებულია ჯავშნის მოთხოვნაზე 24 საათის განმავლობაში გასცეს პასუხი. პასუხის გაჭიანურება ახდენს უარყოფით გავლენას ჰოსტის რეიტინგზე.',
          en: "The host must respond to booking requests within 24 hours. Delayed responses negatively affect the host's rating.",
          ru: 'Хозяин обязан ответить на запрос бронирования в течение 24 часов. Задержка ответа негативно влияет на рейтинг хозяина.',
        },
        {
          ka: 'ჰოსტი ვალდებულია შეთანხმებულ ადგილსა და დროს გამოცხადდეს ავტომობილის გასაცემად და უკან მისაღებად.',
          en: 'The host must appear at the agreed location and time for both car handover and return.',
          ru: 'Хозяин обязан явиться в согласованное место и время как для выдачи, так и для возврата автомобиля.',
        },
        {
          ka: 'ჰოსტი ვალდებულია ჩაატაროს ავტომობილის ფოტო-ანგარიში გაცემისა და დაბრუნებისას — 7 ფოტო ყველა კუთხიდან. ეს WAYGO.ge-ის სავალდებულო პროცედურაა.',
          en: 'The host must conduct a photo condition report at both handover and return — 7 photos from all angles. This is a mandatory WAYGO.ge procedure.',
          ru: 'Хозяин обязан провести фотоотчёт о состоянии при выдаче и возврате — 7 фотографий со всех сторон. Это обязательная процедура WAYGO.ge.',
        },
        {
          ka: 'ჰოსტი ვალდებულია ავტომობილი გააქვეყნოს სწორი და განახლებული ხელმისაწვდომობის კალენდრით. ორმაგი ჯავშნის შემთხვევაში, ჰოსტი პასუხისმგებელია ზარალზე.',
          en: 'The host must list the car with a correct and up-to-date availability calendar. In case of double booking, the host is responsible for any resulting losses.',
          ru: 'Хозяин должен размещать автомобиль с корректным и актуальным календарём доступности. В случае двойного бронирования хозяин несёт ответственность за возникший ущерб.',
        },
      ],
    },
    {
      icon: 'gavel',
      color: 'bg-error-container/30 text-error',
      title: { ka: 'კატეგორიულად აკრძალული ქმედებები', en: 'Strictly Prohibited Actions', ru: 'Строго запрещённые действия' },
      type: 'ban' as const,
      items: [
        {
          ka: 'სიცრუე ავტომობილის მდგომარეობის, ტექნიკური გამართულობის ან ფაქტობრივი სპეციფიკაციების შესახებ.',
          en: "Lying about the car's condition, mechanical soundness, or actual specifications.",
          ru: 'Ложь о состоянии автомобиля, его технической исправности или фактических характеристиках.',
        },
        {
          ka: 'ჯავშნის გაუქმება ისე, რომ სტუმარს 48 საათზე ნაკლები რჩება ალტერნატივის მოსაძებნად — გამართლებული მიზეზის გარეშე.',
          en: 'Cancelling a booking leaving the guest less than 48 hours to find an alternative, without a justified reason.',
          ru: 'Отмена бронирования, оставляющая гостю менее 48 часов на поиск альтернативы, без обоснованной причины.',
        },
        {
          ka: 'გადახდის WAYGO.ge-ის გვერდის ავლით მოთხოვნა ან სტუმართან ნაღდი ფულით ანგარიშსწორება.',
          en: 'Requesting payment outside of WAYGO.ge or settling in cash with the guest.',
          ru: 'Требование оплаты в обход WAYGO.ge или расчёт наличными с гостем.',
        },
        {
          ka: 'ნებისმიერი სახის დისკრიმინაცია: სტუმრის ეთნიკური წარმომავლობის, სქესის, ასაკის, რელიგიის ან სხვა ნიშნის საფუძველზე ჯავშნის გაუმართლებელი უარყოფა.',
          en: "Any form of discrimination: unjustified refusal of a booking based on the guest's ethnicity, gender, age, religion or other protected characteristic.",
          ru: 'Любая форма дискриминации: необоснованный отказ в бронировании на основе этнического происхождения, пола, возраста, религии или иного признака.',
        },
        {
          ka: 'ავტომობილის გაცემა ისეთ ტექნიკურ მდგომარეობაში, რომელიც საფრთხეს შეიცავს სტუმრის ან მესამე პირის სიცოცხლისა და ჯანმრთელობისთვის.',
          en: "Handing over a car in a technical condition that poses a danger to the guest's or a third party's life and health.",
          ru: 'Передача автомобиля в техническом состоянии, представляющем угрозу для жизни и здоровья гостя или третьих лиц.',
        },
      ],
    },
    {
      icon: 'verified',
      color: 'bg-primary-fixed/30 text-primary',
      title: { ka: 'ჰოსტის უფლებები', en: 'Host Rights', ru: 'Права хозяина' },
      type: 'check' as const,
      items: [
        {
          ka: 'ჯავშნის მოთხოვნის უარყოფა 24 საათის ვადაში — ნებისმიერი საფუძვლით, გარდა კანონით დაცული ნიშნებისა.',
          en: 'Rejecting a booking request within 24 hours — for any reason except legally protected characteristics.',
          ru: 'Отклонение запроса бронирования в течение 24 часов — по любой причине, кроме защищённых законом признаков.',
        },
        {
          ka: 'ხელმისაწვდომი თარიღების სრული კონტროლი: ჰოსტი თავად განსაზღვრავს, რა პერიოდში ავტომობილი ხელმისაწვდომია.',
          en: 'Full control over available dates: the host decides which periods the car is available.',
          ru: 'Полный контроль над доступными датами: хозяин сам определяет, в какие периоды автомобиль доступен.',
        },
        {
          ka: 'ფასის, მინიმალური ქირავნობის ვადისა და წინასწარი შეტყობინების განსაზღვრა. ფასი მოქმედ ჯავშნებს ავტომატურად არ ეხება.',
          en: 'Setting the price, minimum rental period, and advance notice requirements. Price changes do not affect active bookings.',
          ru: 'Установка цены, минимального срока аренды и требований к предварительному уведомлению. Изменение цены не применяется к активным бронированиям.',
        },
        {
          ka: 'სტუმრის პოსტ-ქირავნობითი შეფასება. შეფასება ნეიტრალური, ობიექტური და ფაქტებზე დაფუძნებული უნდა იყოს.',
          en: 'Post-rental review of the guest. Reviews must be neutral, objective, and fact-based.',
          ru: 'Написание отзыва о госте после аренды. Отзывы должны быть нейтральными, объективными и основанными на фактах.',
        },
      ],
    },
    {
      icon: 'warning',
      color: 'bg-amber-50 text-amber-600',
      title: { ka: 'სანქციები და შედეგები', en: 'Sanctions & Consequences', ru: 'Санкции и последствия' },
      type: 'warning' as const,
      items: [
        {
          ka: 'პირველი სერიოზული გადახვევისთვის: გაფრთხილება და ანგარიშის დროებითი შეჩერება.',
          en: 'First serious violation: warning and temporary account suspension.',
          ru: 'Первое серьёзное нарушение: предупреждение и временная приостановка аккаунта.',
        },
        {
          ka: 'განმეორებადი ან განზრახ დარღვევები: ანგარიშის სამუდამო დახურვა, ავტომობილის განცხადების მოხსნა.',
          en: 'Repeated or intentional violations: permanent account closure, listing removal.',
          ru: 'Повторные или умышленные нарушения: постоянное закрытие аккаунта, удаление объявления.',
        },
        {
          ka: 'ფინანსური ზიანის შემთხვევა: WAYGO.ge-ს ვალდებულება გათვალისწინებულ ანაზღაურებაზე.',
          en: "In case of financial damage: WAYGO.ge's obligation on agreed compensation.",
          ru: 'В случае финансового ущерба: обязательство WAYGO.ge по согласованному возмещению.',
        },
        {
          ka: 'კანონის დარღვევის შემთხვევა: WAYGO.ge ვალდებულია გადასცეს ინფორმაცია სამართალდამცავ ორგანოებს.',
          en: 'In case of legal violations: WAYGO.ge is obligated to hand information to law enforcement.',
          ru: 'В случае нарушения закона: WAYGO.ge обязана передать информацию правоохранительным органам.',
        },
      ],
    },
  ],
};

export default function HostRulesContent() {
  const { lang } = useLang();
  const currentLang = lang as Lang;

  return (
    <main className="min-h-screen bg-surface text-on-surface">
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-4 py-2 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-high"
        >
          <span className="material-symbols-rounded text-[20px]">arrow_back</span>
          {t.back[currentLang]}
        </Link>

        <div className="mb-10 rounded-[2rem] bg-surface-container p-6 shadow-sm sm:p-8">
          <p className="mb-3 text-sm font-medium text-primary">{t.updated[currentLang]}</p>

          <h1 className="mb-5 text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
            {t.title[currentLang]}
          </h1>

          <p className="max-w-3xl text-base leading-8 text-on-surface-variant">
            {t.intro[currentLang]}
          </p>
        </div>

        <div className="space-y-6">
          {t.sections.map((section) => (
            <article
              key={section.title.en}
              className="rounded-[2rem] border border-outline-variant bg-surface-container-low p-5 shadow-sm sm:p-6"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${section.color}`}>
                  <span className="material-symbols-rounded text-[24px]">{section.icon}</span>
                </div>

                <h2 className="text-xl font-semibold text-on-surface">
                  {section.title[currentLang]}
                </h2>
              </div>

              <ul className="space-y-4">
                {section.items.map((item, index) => (
                  <li key={index} className="flex gap-3 text-sm leading-7 text-on-surface-variant sm:text-base">
                    <span className="material-symbols-rounded mt-0.5 text-[20px] text-primary">
                      {section.type === 'ban'
                        ? 'block'
                        : section.type === 'warning'
                          ? 'warning'
                          : 'check_circle'}
                    </span>

                    <span>{item[currentLang]}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}