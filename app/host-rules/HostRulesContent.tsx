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
    bullets?: { icon?: string; color?: string; text: T3 }[];
    warning?: T3;
    tip?: T3;
    earlyAccess?: T3;
  }[];
} = {
  back:  { ka: 'მთავარი', en: 'Home', ru: 'Главная' },
  badge: { ka: 'გამქირავებლისთვის', en: 'For Hosts', ru: 'Для хозяев' },
  title: { ka: 'როგორ მუშაობს Waygo', en: 'How Waygo Works', ru: 'Как работает Waygo' },
  sub: {
    ka: 'სრული სახელმძღვანელო — მანქანის განთავსებიდან შემოსავლის მიღებამდე.',
    en: 'Complete guide — from listing your car to receiving your earnings.',
    ru: 'Полное руководство — от размещения автомобиля до получения дохода.',
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
        ka: 'დარეგისტრირდი Waygo-ზე და გახდი ჩვენი საზოგადოების წევრი. მანქანის საიტზე განსათავსებლად საჭიროა გაიარო ვერიფიკაცია პირადობის მოწმობითა და სელფით. ვერიფიკაციის პასუხი მოვა 24 საათში ან ნაკლებ დროში. გირჩევთ ვერიფიკაცია გაიაროთ რეგისტრაციისთანავე.',
        en: 'Sign up on Waygo and become a member of our community. To list your car, you must complete identity verification using your ID and a selfie. You\'ll receive a response within 24 hours or less. We recommend completing verification right after registration.',
        ru: 'Зарегистрируйтесь на Waygo и станьте участником нашего сообщества. Для размещения автомобиля необходимо пройти верификацию личности с помощью удостоверения личности и селфи. Ответ придёт в течение 24 часов или раньше. Рекомендуем пройти верификацию сразу после регистрации.',
      },
      earlyAccess: {
        ka: 'Early Access — Premium სტატუსი: საიტის სრულ გაშვებამდე დარეგისტრირებული და მანქანის განმთავსებელი ჰოსტები მიიღებენ Premium სტატუსს სამუდამოდ — საკომისიო იქნება მხოლოდ 5% სტანდარტული 10%-ის ნაცვლად.',
        en: 'Early Access — Premium Status: Hosts who register and list their car before the platform\'s full public launch will receive lifetime Premium status — with a commission of just 5% instead of the standard 10%.',
        ru: 'Ранний доступ — Premium статус: Хосты, которые зарегистрируются и разместят автомобиль до полного запуска платформы, получат пожизненный Premium статус — комиссия составит всего 5% вместо стандартных 10%.',
      },
    },
    {
      icon: 'add_circle',
      accent: 'border-tertiary/30',
      iconBg: 'bg-tertiary-fixed/20 text-tertiary',
      title: {
        ka: 'მანქანის განთავსება',
        en: 'Listing Your Car',
        ru: 'Размещение автомобиля',
      },
      body: {
        ka: 'ვერიფიკაციის შემდეგ შეგიძლია დაუყოვნებლივ განათავსო მანქანა. შეავსე ყველა საჭირო ველი:',
        en: 'Once verified, you can list your car immediately. Fill in all required fields:',
        ru: 'После верификации вы можете сразу разместить автомобиль. Заполните все необходимые поля:',
      },
      bullets: [
        { icon: 'check', color: 'text-tertiary', text: { ka: 'მარკა, მოდელი, წელი', en: 'Make, model, year', ru: 'Марка, модель, год выпуска' } },
        { icon: 'check', color: 'text-tertiary', text: { ka: 'VIN კოდი', en: 'VIN code', ru: 'VIN-код' } },
        { icon: 'check', color: 'text-tertiary', text: { ka: 'კომპლექტაცია და აღჭურვილობა', en: 'Features and equipment', ru: 'Комплектация и оборудование' } },
        { icon: 'check', color: 'text-tertiary', text: { ka: 'საბაზრო ღირებულება', en: 'Market value', ru: 'Рыночная стоимость' } },
        { icon: 'check', color: 'text-tertiary', text: { ka: 'მანქანის ფოტოები', en: 'Photos of the car', ru: 'Фотографии автомобиля' } },
        { icon: 'check', color: 'text-tertiary', text: { ka: 'ტექინსპექტირების საბუთი (ორივე მხარე)', en: 'Technical inspection certificate (both sides)', ru: 'Талон технического осмотра (обе стороны)' } },
      ],
      warning: {
        ka: 'მანქანა აუცილებლად უნდა იყოს ქართულ სახელმწიფო ნომრებზე და განბაჟებული. საბაზრო ღირებულება განსაზღვრავს დეპოზიტის ოდენობას — მიუთითეთ სწორი ღირებულება. არასწორი ინფორმაციის შემთხვევაში მანქანა საიტზე არ განთავსდება.',
        en: 'Your car must be registered on Georgian plates and fully customs-cleared. Market value determines deposit amount — enter an accurate figure. Listings with incorrect information will not be approved.',
        ru: 'Автомобиль должен быть зарегистрирован на грузинских номерах и полностью растаможен. Рыночная стоимость определяет размер депозита — укажите точную сумму. Объявления с некорректной информацией размещены не будут.',
      },
      tip: {
        ka: 'განთავსების შემდეგ ადმინი დაადასტურებს მანქანას და ის გამოჩნდება საიტზე.',
        en: 'After submission, an admin will review and approve your listing before it appears on the site.',
        ru: 'После подачи заявки администратор проверит и подтвердит размещение, после чего автомобиль появится на сайте.',
      },
    },
    {
      icon: 'sell',
      accent: 'border-amber-300/50',
      iconBg: 'bg-amber-50 text-amber-600',
      title: {
        ka: 'ფასი და დაზღვევა',
        en: 'Pricing & Insurance',
        ru: 'Цена и страхование',
      },
      body: {
        ka: 'საიტზე შენი მანქანის ფასი ჩანს შენ მიერ დაწერილი დღიური ტარიფი + საბაზისო სადაზღვევო პაკეტის ღირებულება. მანქანების გვერდზე მომხმარებელს ეჩვენება „დაზღვევა შედის" — ეს კეთდება მომხმარებლის გამოცდილების გასაუმჯობესებლად.',
        en: 'Your car will be listed at your chosen daily rate plus the cost of the basic insurance package. The listing will show "Insurance Included" to improve the user experience.',
        ru: 'Ваш автомобиль будет отображаться по указанному вами дневному тарифу плюс стоимость базового страхового пакета. В объявлении будет указано «Страховка включена» для улучшения пользовательского опыта.',
      },
      tip: {
        ka: 'Waygo მანქანის ქირაზე არანაირ დამატებით თანხას არ ამატებს — ეს მხოლოდ სადაზღვევო პაკეტის ღირებულებაა. საშუალო და პრემიუმ პაკეტებზე საბაზისო პაკეტის ფასი უკვე გამოკლებულია.',
        en: 'Waygo does not add any extra charge to your rental price — this is purely the insurance cost. For standard and premium packages, the base package price is already deducted.',
        ru: 'Waygo не добавляет никаких дополнительных сборов к стоимости аренды — это исключительно стоимость страховки. Для стандартного и премиум пакетов стоимость базового пакета уже вычтена.',
      },
    },
    {
      icon: 'notifications_active',
      accent: 'border-primary/30',
      iconBg: 'bg-primary-fixed/20 text-primary',
      title: {
        ka: 'ჯავშნის მიღება',
        en: 'Receiving Booking Requests',
        ru: 'Получение запросов на бронирование',
      },
      body: {
        ka: 'როდესაც მოიჯარე დაჯავშნის შენს მანქანას, მიიღებ შეტყობინებას. გექნება 24 საათი, რათა დაადასტურო ან უარყო ჯავშანი.',
        en: 'When a guest books your car, you\'ll receive a notification. You have 24 hours to confirm or decline.',
        ru: 'Когда гость бронирует ваш автомобиль, вы получите уведомление. У вас есть 24 часа для подтверждения или отклонения.',
      },
      warning: {
        ka: '3 ან მეტი უარყოფა ერთი თვის განმავლობაში ერთი და იმავე მანქანაზე — მანქანა წაიშლება საიტიდან.',
        en: '3 or more declines on the same car within one month — the listing will be removed from the site.',
        ru: '3 и более отклонения по одному автомобилю в течение месяца — объявление будет удалено с сайта.',
      },
      tip: {
        ka: 'ჯავშნის გაუქმების სრული პირობებისთვის იხილეთ გაუქმების პოლიტიკა.',
        en: 'For full cancellation terms, see our Cancellation Policy.',
        ru: 'Полные условия отмены см. на странице Политика отмены.',
      },
    },
    {
      icon: 'event_busy',
      accent: 'border-error/20',
      iconBg: 'bg-error-container/20 text-error',
      title: {
        ka: 'ჰოსტის მხრიდან ჯავშნის გაუქმება',
        en: 'Host-Initiated Cancellations',
        ru: 'Отмена бронирования хостом',
      },
      body: {
        ka: 'თუ დადასტურებული ჯავშნის გაუქმება მოგიწევს, კლიენტს სრულად დაუბრუნდება გადახდილი თანხა საიტის საკომისიოს ჩათვლით. გაუქმების დროის მიხედვით მოქმედებს სანქციები:',
        en: 'If you need to cancel a confirmed booking, the guest will receive a full refund including the platform fee. The following penalties apply based on timing:',
        ru: 'Если вам необходимо отменить подтверждённое бронирование, гость получит полный возврат средств включая комиссию платформы. В зависимости от времени отмены применяются санкции:',
      },
      bullets: [
        {
          icon: 'check_circle',
          color: 'text-tertiary',
          text: {
            ka: 'მანქანის წაყვანამდე 48 საათზე მეტი — სანქცია არ არის.',
            en: 'More than 48 hours before pickup — no penalty.',
            ru: 'Более 48 часов до получения — санкций нет.',
          },
        },
        {
          icon: 'warning',
          color: 'text-amber-600',
          text: {
            ka: '24–48 საათი — შენი შემდეგი 2 ჯავშნის საკომისიო გახდება 15%.',
            en: '24–48 hours before pickup — your next 2 bookings will be charged 15% commission.',
            ru: 'За 24–48 часов — комиссия по следующим 2 бронированиям составит 15%.',
          },
        },
        {
          icon: 'warning',
          color: 'text-orange-600',
          text: {
            ka: '24 საათზე ნაკლები — შენი შემდეგი 2 ჯავშნის საკომისიო გახდება 20%.',
            en: 'Less than 24 hours before pickup — your next 2 bookings will be charged 20% commission.',
            ru: 'Менее чем за 24 часа — комиссия по следующим 2 бронированиям составит 20%.',
          },
        },
        {
          icon: 'cancel',
          color: 'text-error',
          text: {
            ka: 'თვეში 3 ან მეტი გაუქმება — ანგარიში დაიბლოკება გარკვევამდე.',
            en: '3 or more cancellations in one month — your account will be suspended pending review.',
            ru: '3 и более отмены в течение месяца — аккаунт будет заблокирован до выяснения обстоятельств.',
          },
        },
      ],
    },
    {
      icon: 'car_rental',
      accent: 'border-tertiary/30',
      iconBg: 'bg-tertiary-fixed/20 text-tertiary',
      title: {
        ka: 'მანქანის გადაცემა',
        en: 'Handing Over the Car',
        ru: 'Передача автомобиля',
      },
      body: {
        ka: 'მანქანის გადაცემისას მოუწოდე მოიჯარეს გადაიღოს ფოტოები და დააჭიროს ღილაკს „მანქანა წავიყვანე" — ეს აუცილებელია დაზღვევის გასააქტიურებლად და ორივე მხარის დასაცავად. ამ ღილაკის დაჭერის შემდეგ მიიღებ ქირის თანხის პირველ 50%-ს.',
        en: 'When handing over the car, remind the guest to take photos and press "I\'ve Taken the Car" — this is required to activate insurance and protects both parties. Once pressed, you will receive the first 50% of the rental amount.',
        ru: 'При передаче автомобиля напомните гостю сфотографировать машину и нажать кнопку «Я забрал автомобиль» — это необходимо для активации страховки и защиты обеих сторон. После нажатия кнопки вы получите первые 50% суммы аренды.',
      },
      tip: {
        ka: 'სადაზღვევო პირობების სანახავად იხილეთ დაზღვევის პირობები.',
        en: 'For insurance terms, see Insurance Terms.',
        ru: 'Условия страхования см. на странице Условия страхования.',
      },
    },
    {
      icon: 'local_hospital',
      accent: 'border-error/20',
      iconBg: 'bg-error-container/20 text-error',
      title: {
        ka: 'ავარიის ან დაზიანების შემთხვევაში',
        en: 'In Case of Accident or Damage',
        ru: 'В случае аварии или повреждения',
      },
      body: {
        ka: 'თუ ქირავნობის პერიოდში მოხდა ავარია ან დაზიანება, მოიჯარე ვალდებულია დაუყოვნებლივ დარეკოს 112-ზე შემთხვევის დასაფიქსირებლად. შემთხვევის დაფიქსირების შემდეგ სადაზღვევო კომპანია შეაფასებს ზიანს და გადაგიხდის არჩეული პაკეტის შესაბამის პროცენტს. დარჩენილი თანხა მოიჯარეს დაეკისრება.',
        en: 'If an accident or damage occurs during the rental, the guest is required to immediately call 112 to officially document the incident. The insurance company will then assess the damage and compensate you according to the guest\'s chosen package percentage. The remaining amount is the guest\'s responsibility.',
        ru: 'Если в период аренды произошла авария или повреждение, гость обязан немедленно позвонить по номеру 112 для официальной фиксации инцидента. После этого страховая компания оценит ущерб и выплатит вам компенсацию согласно выбранному гостем страховому пакету. Оставшаяся сумма возлагается на гостя.',
      },
      tip: {
        ka: 'სადაზღვევო პირობების სანახავად იხილეთ დაზღვევის პირობები.',
        en: 'For full details, see Insurance Terms.',
        ru: 'Подробнее см. Условия страхования.',
      },
    },
    {
      icon: 'assignment_return',
      accent: 'border-primary/30',
      iconBg: 'bg-primary-fixed/20 text-primary',
      title: {
        ka: 'მანქანის ჩაბარება',
        en: 'Car Return',
        ru: 'Возврат автомобиля',
      },
      body: {
        ka: 'მოიჯარის დაბრუნებისას მოუწოდე ფოტოების გადაღებას და ღილაკს „მანქანა დავაბრუნე" დაჭერას. შემდეგ გექნება 24 საათი:',
        en: 'When the guest returns the car, remind them to take photos and press "I\'ve Returned the Car". You then have 24 hours to:',
        ru: 'При возврате автомобиля напомните гостю сфотографировать машину и нажать кнопку «Я вернул автомобиль». После этого у вас есть 24 часа:',
      },
      bullets: [
        {
          icon: 'check_circle',
          color: 'text-tertiary',
          text: {
            ka: 'დაადასტურე ჩაბარება — მიიღებ ქირის დარჩენილ 50%-ს, კლიენტს განებლოკება დეპოზიტი.',
            en: 'Confirm the return — you receive the remaining 50% of the rental, guest\'s deposit is unblocked.',
            ru: 'Подтвердить возврат — вы получаете оставшиеся 50% суммы аренды, депозит гостя разблокируется.',
          },
        },
        {
          icon: 'gavel',
          color: 'text-error',
          text: {
            ka: 'დავა დაიწყე — დეპოზიტი გაყინული დარჩება საკითხის გარკვევამდე.',
            en: 'Open a dispute — the deposit remains frozen until the matter is resolved.',
            ru: 'Открыть спор — депозит остаётся замороженным до выяснения обстоятельств.',
          },
        },
      ],
      tip: {
        ka: 'დავის შემთხვევაში Waygo შეაფასებს სიტუაციას. მსხვილი ზიანისთვის მოიწვევა დამოუკიდებელი ექსპერტი. Waygo მოგაწვდის ყველა საჭირო დოკუმენტაციას და ინფორმაციას.',
        en: 'In case of dispute, Waygo will assess the situation. For significant damage, an independent expert will be engaged. Waygo will provide all necessary documentation to support you.',
        ru: 'В случае спора Waygo оценит ситуацию. При значительном ущербе будет привлечён независимый эксперт. Waygo предоставит все необходимые документы и информацию для защиты ваших интересов.',
      },
    },
  ],
};

const STEP_COLORS = [
  'from-primary/5 to-transparent',
  'from-tertiary/5 to-transparent',
  'from-amber-50/80 to-transparent',
  'from-primary/5 to-transparent',
  'from-error/5 to-transparent',
  'from-tertiary/5 to-transparent',
  'from-error/5 to-transparent',
  'from-primary/5 to-transparent',
];

export function HostRulesContent() {
  const { lang } = useLang();
  const l = lang as L;

  return (
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[73px] pb-20 md:pb-0">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-tertiary/8 via-surface to-surface border-b border-outline-variant/20">
        <div className="mx-auto max-w-screen-md px-4 md:px-8 py-12 md:py-16">
          <Link href="/" className="inline-flex items-center gap-1.5 text-label-sm font-bold text-secondary hover:text-primary mb-8 transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {copy.back[l]}
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-fixed/30 text-tertiary px-3 py-1 text-[11px] font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-[13px]">home</span>
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
          <div className="absolute left-[22px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-tertiary/20 via-outline-variant/30 to-primary/20 hidden md:block" />

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

                    {/* Early access callout */}
                    {step.earlyAccess && (
                      <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-300/60 px-4 py-3.5">
                        <span className="text-[20px] shrink-0 mt-0.5">⭐</span>
                        <p className="text-[12px] md:text-label-sm font-semibold text-amber-900 leading-relaxed">{step.earlyAccess[l]}</p>
                      </div>
                    )}

                    {/* Bullets */}
                    {step.bullets && (
                      <div className="rounded-xl border border-outline-variant/30 divide-y divide-outline-variant/20 overflow-hidden">
                        {step.bullets.map((b, bi) => (
                          <div key={bi} className="flex items-start gap-3 px-4 py-3 bg-surface-container-low/60">
                            <span className={`material-symbols-outlined text-[15px] mt-0.5 shrink-0 ${b.color ?? 'text-tertiary'}`}>
                              {b.icon ?? 'check'}
                            </span>
                            <p className="text-[12px] md:text-label-sm text-secondary leading-relaxed">{b.text[l]}</p>
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
                          {step.tip[l].includes('Insurance Terms') || step.tip[l].includes('დაზღვევის პირობები') || step.tip[l].includes('Условия страхования') ? (
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
                          ) : step.tip[l].includes('Cancellation Policy') || step.tip[l].includes('გაუქმების პოლიტიკა') || step.tip[l].includes('Политика отмены') || step.tip[l].includes('Условия отмены') ? (
                            <>
                              {step.tip[l].split(
                                l === 'ka' ? 'გაუქმების პოლიტიკა' : l === 'ru' ? 'Политика отмены' : 'Cancellation Policy'
                              )[0]}
                              <Link href="/cancellation-policy" className="text-primary font-bold hover:underline">
                                {l === 'ka' ? 'გაუქმების პოლიტიკა' : l === 'ru' ? 'Политика отмены' : 'Cancellation Policy'}
                              </Link>
                              {step.tip[l].split(
                                l === 'ka' ? 'გაუქმების პოლიტიკა' : l === 'ru' ? 'Политика отмены' : 'Cancellation Policy'
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

        {/* Earnings summary callout */}
        <div className="mt-10 rounded-2xl border border-outline-variant/40 bg-white shadow-card overflow-hidden">
          <div className="bg-gradient-to-r from-tertiary/10 to-transparent px-6 py-5 border-b border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-fixed/30">
                <span className="material-symbols-outlined text-[20px] text-tertiary">payments</span>
              </div>
              <h3 className="font-extrabold text-[16px] text-on-background">
                {l === 'ka' ? 'შემოსავლის განაწილება' : l === 'ru' ? 'Распределение выплат' : 'Payment Structure'}
              </h3>
            </div>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {[
              {
                icon: 'car_rental',
                color: 'text-tertiary',
                label: { ka: 'მანქანის გადაცემისას (ნ.1)', en: 'At car handover (pickup confirmed)', ru: 'При передаче автомобиля (после пикапа)' },
                value: '50%',
                cls: 'text-tertiary font-extrabold text-[18px]',
              },
              {
                icon: 'assignment_return',
                color: 'text-primary',
                label: { ka: 'ჩაბარების დადასტურებისას', en: 'After confirming car return', ru: 'После подтверждения возврата' },
                value: '50%',
                cls: 'text-primary font-extrabold text-[18px]',
              },
              {
                icon: 'percent',
                color: 'text-secondary',
                label: { ka: 'საკომისიო (Standard)', en: 'Platform commission (Standard)', ru: 'Комиссия платформы (Standard)' },
                value: '10%',
                cls: 'text-secondary font-bold text-[15px]',
              },
              {
                icon: 'star',
                color: 'text-amber-600',
                label: { ka: 'საკომისიო (Early Access Premium)', en: 'Platform commission (Early Access Premium)', ru: 'Комиссия (Early Access Premium)' },
                value: '5%',
                cls: 'text-amber-600 font-extrabold text-[18px]',
              },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[18px] ${row.color}`}>{row.icon}</span>
                  <span className="text-[13px] text-secondary">{row.label[l]}</span>
                </div>
                <span className={row.cls}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-tertiary/8 to-primary/5 border border-tertiary/10 p-8 md:p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary-fixed/20 mx-auto mb-4">
            <span className="material-symbols-outlined text-[30px] text-tertiary">add_home</span>
          </div>
          <h3 className="text-h2 font-extrabold text-on-background mb-2">
            {l === 'ka' ? 'მზად ხარ ჰოსტი გახდე?' : l === 'ru' ? 'Готовы стать хозяином?' : 'Ready to become a host?'}
          </h3>
          <p className="text-body-md text-secondary mb-6 max-w-sm mx-auto">
            {l === 'ka'
              ? 'განათავსე მანქანა და დაიწყე შემოსავლის მიღება — სწრაფად, უსაფრთხოდ, სრული კონტროლით.'
              : l === 'ru'
              ? 'Разместите автомобиль и начните зарабатывать — быстро, безопасно, с полным контролем.'
              : 'List your car and start earning — fast, secure, and fully in your control.'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/become-host"
              className="inline-flex items-center gap-2 bg-tertiary text-white px-6 py-3 rounded-xl font-bold text-label-bold hover:opacity-90 transition">
              <span className="material-symbols-outlined text-[18px]">add_home</span>
              {l === 'ka' ? 'მანქანის განთავსება' : l === 'ru' ? 'Разместить авто' : 'List Your Car'}
            </Link>
            <Link href="/verify"
              className="inline-flex items-center gap-2 border-2 border-tertiary/30 text-tertiary px-6 py-3 rounded-xl font-bold text-label-bold hover:bg-tertiary-fixed/10 transition">
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
