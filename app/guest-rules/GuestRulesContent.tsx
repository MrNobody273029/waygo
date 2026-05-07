'use client';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';

type L = 'ka' | 'en' | 'ru';
type T3 = { ka: string; en: string; ru: string };

const copy: {
  back: T3;
  badge: T3;
  title: T3;
  sub: T3;
  steps: {
    icon: string;
    accent: string;
    iconBg: string;
    title: T3;
    body: T3;
    bullets?: T3[];
    warning?: T3;
    tip?: T3;
  }[];
} = {
  back:  { ka: 'მთავარი', en: 'Home', ru: 'Главная' },
  badge: { ka: 'მოიჯარისთვის', en: 'For Renters', ru: 'Для арендаторов' },
  title: { ka: 'როგორ მუშაობს Waygo', en: 'How Waygo Works', ru: 'Как работает Waygo' },
  sub: {
    ka: 'მარტივი ნაბიჯები — მანქანის დაჯავშნიდან დაბრუნებამდე.',
    en: 'Simple steps — from booking a car to returning it.',
    ru: 'Простые шаги — от бронирования до возврата автомобиля.',
  },
  steps: [
    {
      icon: 'how_to_reg',
      accent: 'border-primary/30',
      iconBg: 'bg-primary-fixed/20 text-primary',
      title: {
        ka: 'რეგისტრაცია და ვერიფიკაცია',
        en: 'Registration & Verification',
        ru: 'Регистрация и верификация',
      },
      body: {
        ka: 'დარეგისტრირდი Waygo-ზე და გახდი ჩვენი საზოგადოების წევრი. მანქანის დასაქირავებლად საჭიროა ვერიფიკაციის გავლა, რომელიც საშუალოდ 24 საათს ან ნაკლებს მოითხოვს. გირჩევთ ვერიფიკაცია გაიაროთ რეგისტრაციისთანავე, რათა დროულად შეძლოთ სასურველი მანქანის დაჯავშნა.',
        en: 'Sign up on Waygo and become a member of our community. To rent a car, you\'ll need to complete identity verification, which typically takes up to 24 hours or less. We recommend completing verification right after registration so you\'re ready to book whenever you need.',
        ru: 'Зарегистрируйтесь на Waygo и станьте участником нашего сообщества. Для аренды автомобиля необходимо пройти верификацию личности, которая занимает до 24 часов или меньше. Рекомендуем пройти верификацию сразу после регистрации, чтобы быть готовым к бронированию в любой момент.',
      },
    },
    {
      icon: 'directions_car',
      accent: 'border-tertiary/30',
      iconBg: 'bg-tertiary-fixed/20 text-tertiary',
      title: {
        ka: 'მანქანის არჩევა და ჯავშანი',
        en: 'Choosing a Car & Booking',
        ru: 'Выбор автомобиля и бронирование',
      },
      body: {
        ka: 'აირჩიეთ სასურველი მანქანა, გაეცანით ხელმისაწვდომ სადაზღვევო პაკეტებს და შეარჩიეთ თქვენთვის შესაფერისი. დაჯავშნისთანავე თქვენს ბარათზე დაიბლოკება ქირის თანხა და დეპოზიტი. ჯავშნის მოთხოვნა გაეგზავნება გამქირავებელს, რომელსაც პასუხის გაცემისთვის 24 საათი აქვს.',
        en: 'Browse available cars, choose your preferred insurance package, and submit a booking request. Once booked, both the rental amount and deposit will be blocked on your card. The host has 24 hours to respond.',
        ru: 'Выберите понравившийся автомобиль, ознакомьтесь с доступными страховыми пакетами и оформите бронирование. После подтверждения на вашей карте будет заблокирована сумма аренды и депозит. У хозяина есть 24 часа для ответа.',
      },
      bullets: [
        {
          ka: 'გამქირავებელი დაადასტურებს — ქირის თანხა ჩამოიჭრება, დეპოზიტი კი დაბლოკილი დარჩება ქირავნობის დასრულებამდე.',
          en: 'Host confirms — the rental amount is charged and the deposit remains blocked until the rental is complete.',
          ru: 'Хозяин подтверждает — сумма аренды списывается, депозит остаётся заблокированным до окончания аренды.',
        },
        {
          ka: 'გამქირავებელი უარყოფს ან 24 საათში არ პასუხობს — ორივე თანხა ავტომატურად განიბლოკება.',
          en: 'Host declines or doesn\'t respond within 24 hours — both amounts are automatically unblocked.',
          ru: 'Хозяин отказывает или не отвечает в течение 24 часов — обе суммы автоматически разблокируются.',
        },
      ],
      tip: {
        ka: 'გაუქმების პირობების სანახავად იხილეთ გაუქმების პოლიტიკა.',
        en: 'For cancellation terms, see our Cancellation Policy.',
        ru: 'С политикой отмены можно ознакомиться на странице Условия отмены.',
      },
    },
    {
      icon: 'camera_alt',
      accent: 'border-amber-300/50',
      iconBg: 'bg-amber-50 text-amber-600',
      title: {
        ka: 'მანქანის წაყვანა',
        en: 'Picking Up the Car',
        ru: 'Получение автомобиля',
      },
      body: {
        ka: 'მანქანის წაყვანისას გადაიღეთ მანქანის დეტალური ფოტოები — ყველა მხრიდან, არსებული მდგომარეობის დასაფიქსირებლად. ფოტოების ატვირთვის შემდეგ გააქტიურდება ღილაკი „მანქანა წავიყვანე". ამ ღილაკის დაჭერისთანავე გააქტიურდება თქვენი სადაზღვევო პაკეტი.',
        en: 'When picking up the car, take detailed photos of its current condition from all sides. Once uploaded, the "I\'ve Taken the Car" button becomes active. Pressing it activates your insurance coverage.',
        ru: 'При получении автомобиля сфотографируйте его со всех сторон в текущем состоянии. После загрузки фотографий станет активной кнопка «Я забрал автомобиль». После её нажатия активируется ваша страховка.',
      },
      warning: {
        ka: 'თუ ფოტოები არ აიტვირთა და ღილაკი არ დაიჭირა, დაზღვევა არ გააქტიურდება. ფოტოები პირველ რიგში თქვენივე დაცვის საშუალებაა.',
        en: 'If photos are not uploaded and the button is not pressed, insurance will not be activated. Photos are there to protect you first and foremost.',
        ru: 'Если фотографии не загружены и кнопка не нажата, страховка не активируется. Фотографии — это прежде всего ваша собственная защита.',
      },
    },
    {
      icon: 'local_hospital',
      accent: 'border-error/20',
      iconBg: 'bg-error-container/20 text-error',
      title: {
        ka: 'ავარიის ან დაზიანების შემთხვევაში',
        en: 'In Case of an Accident or Damage',
        ru: 'В случае аварии или повреждения',
      },
      body: {
        ka: 'თუ ქირავნობის პერიოდში მოხდა ავარია ან მანქანა დაზიანდა, აუცილებელია დაუყოვნებლივ დარეკოთ 112-ზე და გამოიძახოთ პოლიცია შემთხვევის დასაფიქსირებლად. შემთხვევის დაუფიქსირებლობის შემთხვევაში მოიჯარეს დაეკისრება ზარალის სრული ანაზღაურება.',
        en: 'If an accident occurs or the car is damaged during the rental period, you must immediately call 112 and request police attendance to officially document the incident. Failure to do so will result in the renter being held fully liable for all damages.',
        ru: 'Если в период аренды произошла авария или автомобиль получил повреждения, необходимо немедленно позвонить по номеру 112 и вызвать полицию для официальной фиксации инцидента. В случае отсутствия официального протокола арендатор несёт полную ответственность за все убытки.',
      },
      tip: {
        ka: 'შემთხვევის დაფიქსირების შემდეგ სადაზღვევო კომპანია შეაფასებს ზიანს. დარჩენილი თანხა მოიჯარეს ეკისრება. სადაზღვევო პირობების სანახავად იხილეთ დაზღვევის პირობები.',
        en: 'Once documented, the insurance company will assess the damage and compensate the host. The remaining amount is the renter\'s responsibility. See Insurance Terms.',
        ru: 'После фиксации страховая компания оценит ущерб и выплатит компенсацию хозяину. Оставшаяся сумма возлагается на арендатора. См. Условия страхования.',
      },
    },
    {
      icon: 'assignment_return',
      accent: 'border-tertiary/30',
      iconBg: 'bg-tertiary-fixed/20 text-tertiary',
      title: {
        ka: 'მანქანის დაბრუნება',
        en: 'Returning the Car',
        ru: 'Возврат автомобиля',
      },
      body: {
        ka: 'მანქანის დაბრუნებისას ისევ გადაიღეთ ფოტოები და დააჭირეთ ღილაკს „მანქანა დავაბრუნე". ფოტოების გარეშე დეპოზიტი არ განიბლოკება. გამქირავებელს 24 საათი აქვს:',
        en: 'When returning the car, take photos again and press "I\'ve Returned the Car". Without photos, your deposit will not be unblocked. The host then has 24 hours to:',
        ru: 'При возврате снова сфотографируйте автомобиль и нажмите кнопку «Я вернул автомобиль». Без фотографий депозит не будет разблокирован. У хозяина есть 24 часа:',
      },
      bullets: [
        {
          ka: 'დაადასტუროს ჩაბარება — დეპოზიტი სრულად განიბლოკება.',
          en: 'Confirm the return — your deposit is fully unblocked.',
          ru: 'Подтвердить возврат — ваш депозит полностью разблокируется.',
        },
        {
          ka: 'დავა დაიწყოს — დეპოზიტი გაყინული დარჩება საკითხის გარკვევამდე.',
          en: 'Open a dispute — your deposit remains frozen until the matter is resolved.',
          ru: 'Открыть спор — депозит остаётся замороженным до выяснения обстоятельств.',
        },
      ],
    },
    {
      icon: 'gavel',
      accent: 'border-primary/20',
      iconBg: 'bg-primary-fixed/20 text-primary',
      title: {
        ka: 'დავის გადაწყვეტა',
        en: 'Dispute Resolution',
        ru: 'Разрешение споров',
      },
      body: {
        ka: 'მცირე საკითხების შემთხვევაში (ჭუჭყიანი მანქანა, ცარიელი ავზი, ჯარიმა და სხვა) Waygo ავტომატურად ჩამოაჭრის საჭირო თანხას დეპოზიტიდან და დანარჩენს განბლოკავს. თუ დეპოზიტი არ კმარა — Waygo უფლებამოსილია დამატებითი თანხა პირდაპირ ბარათიდან ჩამოაჭრას.',
        en: 'For minor issues (dirty car, empty fuel tank, traffic fines, etc.), Waygo will automatically deduct the required amount from the deposit and unblock the rest. If the deposit is insufficient, Waygo reserves the right to charge the remaining amount directly from your card.',
        ru: 'В случае незначительных проблем (грязный автомобиль, пустой бак, штрафы и т.д.) Waygo автоматически спишет необходимую сумму с депозита и разблокирует остаток. Если депозита недостаточно, Waygo вправе списать оставшуюся сумму непосредственно с вашей карты.',
      },
      tip: {
        ka: 'მსხვილი ზიანის შემთხვევაში Waygo მოიწვევს დამოუკიდებელ ექსპერტს. ექსპერტის მომსახურების ხარჯი ზარალთან ერთად მოიჯარეს დაეკისრება — ჯერ დეპოზიტიდან, შემდეგ საჭიროების შემთხვევაში ბარათიდან.',
        en: 'For significant damage, Waygo will engage an independent expert. The expert assessment cost, along with the damage amount, will be charged to the renter — first from the deposit, then from the card if needed.',
        ru: 'При значительном ущербе Waygo привлечёт независимого эксперта. Стоимость экспертизы вместе с суммой ущерба возлагается на арендатора — сначала с депозита, затем при необходимости с карты.',
      },
    },
  ],
};

const STEP_COLORS = [
  'from-primary/5 to-transparent',
  'from-tertiary/5 to-transparent',
  'from-amber-50/80 to-transparent',
  'from-error/5 to-transparent',
  'from-tertiary/5 to-transparent',
  'from-primary/5 to-transparent',
];

export function GuestRulesContent() {
  const { lang } = useLang();
  const l = lang as L;

  return (
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[73px] pb-20 md:pb-0">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-surface to-surface border-b border-outline-variant/20">
        <div className="mx-auto max-w-screen-md px-4 md:px-8 py-12 md:py-16">
          <Link href="/" className="inline-flex items-center gap-1.5 text-label-sm font-bold text-secondary hover:text-primary mb-8 transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {copy.back[l]}
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed/30 text-primary px-3 py-1 text-[11px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-[13px]">person</span>
              {copy.badge[l]}
            </span>
          </div>
          <h1 className="text-[28px] md:text-[36px] font-extrabold text-on-background leading-tight mb-3">
            {copy.title[l]}
          </h1>
          <p className="text-body-md text-secondary leading-relaxed max-w-lg">
            {copy.sub[l]}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-screen-md px-4 md:px-8 py-12">

        {/* Step list */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[22px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-primary/20 via-outline-variant/30 to-tertiary/20 hidden md:block" />

          <div className="space-y-6">
            {copy.steps.map((step, i) => (
              <div key={i} className="relative flex gap-5 md:gap-6">

                {/* Step number + icon */}
                <div className="flex-col items-center hidden md:flex shrink-0">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${step.iconBg} shadow-sm z-10`}>
                    <span className="material-symbols-outlined text-[22px]">{step.icon}</span>
                  </div>
                </div>

                {/* Card */}
                <div className={`flex-1 rounded-2xl border-l-4 ${step.accent} bg-white shadow-card overflow-hidden`}>
                  {/* Card header */}
                  <div className={`bg-gradient-to-r ${STEP_COLORS[i]} px-5 py-4 flex items-center gap-3`}>
                    {/* Mobile icon */}
                    <div className={`flex md:hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl ${step.iconBg}`}>
                      <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                          {l === 'ka' ? `ნაბიჯი ${i + 1}` : l === 'ru' ? `Шаг ${i + 1}` : `Step ${i + 1}`}
                        </span>
                      </div>
                      <h2 className="font-extrabold text-[16px] md:text-[18px] text-on-background leading-tight">{step.title[l]}</h2>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-5 pb-5 pt-3 space-y-4">
                    <p className="text-[13px] md:text-body-md text-secondary leading-relaxed">{step.body[l]}</p>

                    {/* Bullets */}
                    {step.bullets && (
                      <div className="rounded-xl bg-surface-container-low border border-outline-variant/30 divide-y divide-outline-variant/20 overflow-hidden">
                        {step.bullets.map((b, bi) => (
                          <div key={bi} className="flex items-start gap-3 px-4 py-3">
                            <span className={`material-symbols-outlined text-[15px] mt-0.5 shrink-0 ${bi === 0 ? 'text-tertiary' : 'text-error'}`}>
                              {bi === 0 ? 'check_circle' : 'info'}
                            </span>
                            <p className="text-[12px] md:text-label-sm text-secondary leading-relaxed">{b[l]}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Warning block */}
                    {step.warning && (
                      <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                        <span className="material-symbols-outlined text-[18px] text-amber-600 mt-0.5 shrink-0">warning</span>
                        <p className="text-[12px] md:text-label-sm font-semibold text-amber-900 leading-relaxed">{step.warning[l]}</p>
                      </div>
                    )}

                    {/* Tip/info block */}
                    {step.tip && (
                      <div className="flex items-start gap-3 rounded-xl bg-primary-fixed/10 border border-primary/15 px-4 py-3">
                        <span className="material-symbols-outlined text-[16px] text-primary mt-0.5 shrink-0">info</span>
                        <p className="text-[12px] md:text-label-sm text-secondary leading-relaxed">
                          {step.tip[l].includes('Cancellation Policy') || step.tip[l].includes('გაუქმების პოლიტიკა') || step.tip[l].includes('Условия отмены') ? (
                            <>
                              {step.tip[l].split(
                                l === 'ka' ? 'გაუქმების პოლიტიკა' : l === 'ru' ? 'Условия отмены' : 'Cancellation Policy'
                              )[0]}
                              <Link href="/cancellation-policy" className="text-primary font-bold hover:underline">
                                {l === 'ka' ? 'გაუქმების პოლიტიკა' : l === 'ru' ? 'Условия отмены' : 'Cancellation Policy'}
                              </Link>
                              {step.tip[l].split(
                                l === 'ka' ? 'გაუქმების პოლიტიკა' : l === 'ru' ? 'Условия отмены' : 'Cancellation Policy'
                              )[1]}
                            </>
                          ) : step.tip[l].includes('Insurance Terms') || step.tip[l].includes('დაზღვევის პირობები') || step.tip[l].includes('Условия страхования') ? (
                            <>
                              {step.tip[l].split(
                                l === 'ka' ? 'დაზღვევის პირობები' : l === 'ru' ? 'Условия страхования' : 'Insurance Terms'
                              )[0]}
                              <Link href="/insurance-terms" className="text-primary font-bold hover:underline">
                                {l === 'ka' ? 'დაზღვევის პირობები' : l === 'ru' ? 'Условия страхования' : 'Insurance Terms'}
                              </Link>
                              {step.tip[l].split(
                                l === 'ka' ? 'დაზღვევის პირობები' : l === 'ru' ? 'Условия страхования' : 'Insurance Terms'
                              )[1]}
                            </>
                          ) : step.tip[l]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-3xl bg-gradient-to-br from-primary/8 to-tertiary/5 border border-primary/10 p-8 md:p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed/20 mx-auto mb-4">
            <span className="material-symbols-outlined text-[30px] text-primary">directions_car</span>
          </div>
          <h3 className="text-h2 font-extrabold text-on-background mb-2">
            {l === 'ka' ? 'მზად ხარ?' : l === 'ru' ? 'Готовы начать?' : 'Ready to start?'}
          </h3>
          <p className="text-body-md text-secondary mb-6 max-w-sm mx-auto">
            {l === 'ka'
              ? 'გაიარე ვერიფიკაცია და იქირავე მანქანა — სწრაფად, უსაფრთხოდ, დაზღვეულად.'
              : l === 'ru'
              ? 'Пройдите верификацию и арендуйте автомобиль — быстро, безопасно, со страховкой.'
              : 'Complete verification and rent a car — fast, safe, and insured.'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/cars"
              className="inline-flex items-center gap-2 bg-primary-container text-white px-6 py-3 rounded-xl font-bold text-label-bold hover:bg-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">search</span>
              {l === 'ka' ? 'მანქანები' : l === 'ru' ? 'Найти авто' : 'Browse Cars'}
            </Link>
            <Link href="/verify"
              className="inline-flex items-center gap-2 border-2 border-primary/30 text-primary px-6 py-3 rounded-xl font-bold text-label-bold hover:bg-primary-fixed/10 transition-colors">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              {l === 'ka' ? 'ვერიფიკაცია' : l === 'ru' ? 'Верификация' : 'Get Verified'}
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 flex items-center justify-center gap-2 text-label-sm text-secondary">
          <span className="material-symbols-outlined text-[16px]">mail</span>
          <span>{l === 'ka' ? 'კითხვა? ' : l === 'ru' ? 'Вопросы? ' : 'Questions? '}</span>
          <a href="mailto:support@waygo.ge" className="text-primary font-bold hover:underline">support@waygo.ge</a>
        </div>
      </div>
    </main>
  );
}
