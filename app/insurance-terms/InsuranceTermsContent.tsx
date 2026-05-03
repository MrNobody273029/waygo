'use client';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';

type Lang = 'ka' | 'en' | 'ru';

const PLANS = [
  {
    key: 'basic',
    icon: 'security',
    color: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-600',
    label: { ka: 'Basic', en: 'Basic', ru: 'Basic' },
    deductible: '500 ₾',
    price: { ka: 'ყველაზე ხელმისაწვდომი', en: 'Most affordable', ru: 'Наиболее доступный' },
    features: [
      { ka: 'ქონებრივი ზიანის დაფარვა', en: 'Property damage coverage', ru: 'Покрытие ущерба имуществу' },
      { ka: 'ავარიის შემთხვევაში — ჰოსტის ავტომობილის შეკეთება', en: 'Car repair in case of accident', ru: 'Ремонт автомобиля хозяина при аварии' },
      { ka: 'ფრანშიზი: 500 ₾', en: 'Deductible: 500 ₾', ru: 'Франшиза: 500 ₾' },
    ],
    notCovered: [
      { ka: 'ქურდობა', en: 'Theft', ru: 'Угон' },
      { ka: 'განზრახი ზიანი', en: 'Intentional damage', ru: 'Умышленный ущерб' },
    ],
  },
  {
    key: 'standard',
    icon: 'verified_user',
    color: 'border-primary/40',
    badge: 'bg-primary-fixed/30 text-primary',
    label: { ka: 'Standard', en: 'Standard', ru: 'Standard' },
    deductible: '300 ₾',
    price: { ka: 'ოპტიმალური არჩევანი', en: 'Optimal choice', ru: 'Оптимальный выбор' },
    features: [
      { ka: 'ქონებრივი ზიანის დაფარვა', en: 'Property damage coverage', ru: 'Покрытие ущерба имуществу' },
      { ka: 'ავარიის შემთხვევაში — ჰოსტის ავტომობილის შეკეთება', en: 'Car repair in case of accident', ru: 'Ремонт автомобиля при аварии' },
      { ka: 'ქურდობის დაფარვა', en: 'Theft coverage', ru: 'Покрытие угона' },
      { ka: 'ფრანშიზი: 300 ₾', en: 'Deductible: 300 ₾', ru: 'Франшиза: 300 ₾' },
    ],
    notCovered: [
      { ka: 'განზრახი ზიანი', en: 'Intentional damage', ru: 'Умышленный ущерб' },
    ],
  },
  {
    key: 'premium',
    icon: 'workspace_premium',
    color: 'border-amber-400/60',
    badge: 'bg-amber-50 text-amber-700',
    label: { ka: 'Premium', en: 'Premium', ru: 'Premium' },
    deductible: '150 ₾',
    price: { ka: 'მაქსიმალური დაცვა', en: 'Maximum protection', ru: 'Максимальная защита' },
    features: [
      { ka: 'ყოვლისმომცველი ქონებრივი ზიანის დაფარვა', en: 'Comprehensive property damage coverage', ru: 'Полное покрытие ущерба имуществу' },
      { ka: 'ავარიის შემთხვევაში — ჰოსტის ავტომობილის შეკეთება', en: 'Car repair in case of accident', ru: 'Ремонт автомобиля при аварии' },
      { ka: 'ქურდობის დაფარვა', en: 'Theft coverage', ru: 'Покрытие угона' },
      { ka: 'მინიმალური ფრანშიზი: 150 ₾', en: 'Minimum deductible: 150 ₾', ru: 'Минимальная франшиза: 150 ₾' },
      { ka: 'პრიორიტეტული მხარდაჭერა', en: 'Priority support', ru: 'Приоритетная поддержка' },
    ],
    notCovered: [],
  },
];

const GENERAL = [
  {
    icon: 'lock',
    title: { ka: 'დეპოზიტი — ყველა გეგმაში', en: 'Deposit — for all plans', ru: 'Депозит — для всех планов' },
    body: {
      ka: 'ყოველ ჯავშანზე ბლოკდება 250 ₾ სადეპოზიტო უზრუნველყოფა. ქირავნობის ბოლოს, ზიანის გარეშე დაბრუნებისას, 250 ₾ სრულად ბრუნდება.',
      en: 'A 250 ₾ deposit hold is applied to every booking. At the end of the rental, if returned without damage, 250 ₾ is fully returned.',
      ru: 'На каждое бронирование блокируется залог в размере 250 ₾. По окончании аренды, при возврате без повреждений, 250 ₾ полностью возвращается.',
    },
  },
  {
    icon: 'percent',
    title: { ka: '5% საკომისიო', en: '5% Platform Fee', ru: '5% комиссия платформы' },
    body: {
      ka: 'WAYGO.ge-ის 5%-იანი საკომისიო ქირავნობის ღირებულებიდან — გაუქმების შემთხვევაში — არ ბრუნდება. ეს ფარავს ჩვენი პლატფორმის ადმინისტრაციულ ხარჯებს.',
      en: 'WAYGO.ge\'s 5% commission on the rental amount — in case of cancellation — is non-refundable. This covers our platform\'s administrative costs.',
      ru: 'Комиссия WAYGO.ge в размере 5% от стоимости аренды — при отмене — не возвращается. Она покрывает административные расходы нашей платформы.',
    },
  },
  {
    icon: 'emergency',
    title: { ka: 'გამონაკლისები', en: 'Exclusions', ru: 'Исключения' },
    body: {
      ka: 'სადაზღვევო გეგმა არ ფარავს: სამხედრო მოქმედებებს, ბუნებრივ კატასტროფებს, მძღოლის ნარკოტიკული ან ალკოჰოლური ინტოქსიკაციას, ავტომობილის კომერციულ გამოყენებას, ან სახელმძღვანელო წესების განმეორებადი დარღვევებს.',
      en: 'Insurance does not cover: military actions, natural disasters, driver intoxication by drugs or alcohol, commercial use of the vehicle, or repeated violations of the guest rules.',
      ru: 'Страхование не покрывает: военные действия, стихийные бедствия, опьянение водителя наркотиками или алкоголем, коммерческое использование транспортного средства или повторные нарушения правил для гостей.',
    },
  },
  {
    icon: 'info',
    title: { ka: 'დაზღვევის გააქტიურება', en: 'Insurance Activation', ru: 'Активация страховки' },
    body: {
      ka: 'სადაზღვევო გეგმა გააქტიურდება ჰოსტის მიერ ჯავშნის დადასტურების შემდეგ. ჯავშნის "awaiting_host" სტადიაზე, დაზღვევა ჯერ "inactive" სტატუსშია.',
      en: 'The insurance plan is activated after the host confirms the booking. While the booking is in "awaiting_host" status, the insurance is still "inactive".',
      ru: 'Страховой план активируется после подтверждения бронирования хозяином. Пока бронирование находится в статусе "awaiting_host", страховка ещё "inactive".',
    },
  },
];

export function InsuranceTermsContent() {
  const { lang } = useLang();
  const l = lang as Lang;

  return (
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[73px] pb-20 md:pb-0">
      <div className="mx-auto max-w-screen-lg px-4 md:px-8 py-12">

        <Link href="/" className="inline-flex items-center gap-1.5 text-label-sm font-bold text-secondary hover:text-primary mb-8 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {l === 'ka' ? 'მთავარი' : l === 'ru' ? 'Главная' : 'Home'}
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed/30">
              <span className="material-symbols-outlined text-[30px] text-primary">shield</span>
            </div>
            <div>
              <h1 className="text-h1 font-extrabold text-on-background">
                {l === 'ka' ? 'დაზღვევის პირობები' : l === 'ru' ? 'Условия страхования' : 'Insurance Terms'}
              </h1>
              <p className="text-label-sm text-secondary mt-0.5">
                {l === 'ka' ? 'ბოლო განახლება: მაისი 2026' : l === 'ru' ? 'Обновлено: май 2026' : 'Last updated: May 2026'}
              </p>
            </div>
          </div>
          <p className="text-body-lg text-secondary leading-relaxed max-w-2xl">
            {l === 'ka'
              ? 'ყოველი ჯავშანი WAYGO.ge-ზე ავტომატურად მოიცავს სადაზღვევო გეგმას. სამი გეგმიდან ერთ-ერთს სტუმარი ირჩევს ჯავშნის განთავსებისას. ქვემოთ მოცემულია სრული ინფორმაცია თითოეული გეგმის შესახებ.'
              : l === 'ru'
              ? 'Каждое бронирование на WAYGO.ge автоматически включает страховой план. Один из трёх планов выбирается гостем при бронировании. Ниже приведена полная информация о каждом плане.'
              : 'Every booking on WAYGO.ge automatically includes an insurance plan. One of three plans is chosen by the guest when booking. Below is full information about each plan.'}
          </p>
        </div>

        {/* Plans */}
        <div className="mb-14">
          <h2 className="text-h2 font-extrabold text-on-background mb-6">
            {l === 'ka' ? 'სამი სადაზღვევო გეგმა' : l === 'ru' ? 'Три страховых плана' : 'Three Insurance Plans'}
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {PLANS.map(plan => (
              <div key={plan.key} className={`rounded-2xl bg-white border-2 ${plan.color} shadow-card p-6 flex flex-col`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${plan.badge}`}>
                    <span className="material-symbols-outlined text-[14px]">{plan.icon}</span>
                    {plan.label[l]}
                  </div>
                  <span className="text-[12px] text-secondary">{plan.price[l]}</span>
                </div>

                <div className="mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {l === 'ka' ? 'შედის' : l === 'ru' ? 'Включено' : 'Included'}
                  </p>
                  <ul className="space-y-1.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[14px] text-tertiary mt-0.5 shrink-0">check_circle</span>
                        <span className="text-[12px] text-secondary">{f[l]}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.notCovered.length > 0 && (
                  <div className="mt-auto">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      {l === 'ka' ? 'არ ფარავს' : l === 'ru' ? 'Не покрывает' : 'Not covered'}
                    </p>
                    <ul className="space-y-1.5">
                      {plan.notCovered.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-[14px] text-error mt-0.5 shrink-0">cancel</span>
                          <span className="text-[12px] text-secondary">{f[l]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* General terms */}
        <div className="mb-12">
          <h2 className="text-h2 font-extrabold text-on-background mb-6">
            {l === 'ka' ? 'ზოგადი პირობები' : l === 'ru' ? 'Общие условия' : 'General Terms'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {GENERAL.map((item, i) => (
              <div key={i} className="rounded-2xl bg-white border border-slate-100 shadow-card p-5 flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-fixed/20">
                  <span className="material-symbols-outlined text-[20px] text-primary">{item.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-[14px] text-on-background mb-1.5">{item.title[l]}</p>
                  <p className="text-[13px] text-secondary leading-relaxed">{item.body[l]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-[20px] text-amber-600 mt-0.5 shrink-0">info</span>
            <p className="text-[13px] text-amber-800 leading-relaxed">
              {l === 'ka'
                ? 'WAYGO.ge-ის სადაზღვევო გეგმა წარმოადგენს პლატფორმის შიდა პოლიტიკას. კომპლექსური სადაზღვევო საჭიროებებისთვის, გირჩევთ, დამოუკიდებელ სადაზღვევო კომპანიას მიმართოთ. კითხვებისთვის: support@waygo.ge'
                : l === 'ru'
                ? 'Страховой план WAYGO.ge является внутренней политикой платформы. Для сложных страховых потребностей рекомендуем обратиться в независимую страховую компанию. По вопросам: support@waygo.ge'
                : 'WAYGO.ge\'s insurance plan is an internal platform policy. For complex insurance needs, we recommend consulting an independent insurance company. Questions: support@waygo.ge'}
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
