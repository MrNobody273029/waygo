'use client';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';

interface TierRow {
  tier: string;
  window: string;
  refundPct: number;
  fee: string;
  deposit: string;
  icon: string;
  badgeCls: string;
}

const TIERS: TierRow[] = [
  {
    tier:      'pre_approval',
    window:    'Before host approval',
    refundPct: 100,
    fee:       'Non-refundable (5%)',
    deposit:   'Fully returned',
    icon:      'check_circle',
    badgeCls:  'bg-tertiary-fixed/30 text-tertiary',
  },
  {
    tier:      'grace_period',
    window:    'Within 24 h of booking & pickup ≥ 7 days away',
    refundPct: 100,
    fee:       'Non-refundable (5%)',
    deposit:   'Fully returned',
    icon:      'check_circle',
    badgeCls:  'bg-tertiary-fixed/30 text-tertiary',
  },
  {
    tier:      'early',
    window:    '5+ days before pickup',
    refundPct: 75,
    fee:       'Non-refundable (5%)',
    deposit:   'Fully returned',
    icon:      'info',
    badgeCls:  'bg-primary-fixed/30 text-primary',
  },
  {
    tier:      'standard',
    window:    '3–4 days before pickup',
    refundPct: 50,
    fee:       'Non-refundable (5%)',
    deposit:   'Fully returned',
    icon:      'info',
    badgeCls:  'bg-amber-50 text-amber-700',
  },
  {
    tier:      'late',
    window:    '24 h–2 days before pickup',
    refundPct: 25,
    fee:       'Non-refundable (5%)',
    deposit:   'Fully returned',
    icon:      'warning',
    badgeCls:  'bg-orange-50 text-orange-700',
  },
  {
    tier:      'no_refund',
    window:    'Less than 24 h before pickup',
    refundPct: 0,
    fee:       'Non-refundable (5%)',
    deposit:   'Fully returned',
    icon:      'cancel',
    badgeCls:  'bg-error-container/30 text-error',
  },
];

const TIER_LABELS: Record<string, Record<string, string>> = {
  en: {
    pre_approval: 'Pre-approval',
    grace_period: 'Grace period',
    early:        'Early cancel',
    standard:     'Standard',
    late:         'Late cancel',
    no_refund:    'No refund',
  },
  ka: {
    pre_approval: 'ჰოსტის დადასტურებამდე',
    grace_period: 'თავისუფალი ვადა',
    early:        'ადრეული გაუქმება',
    standard:     'სტანდარტული',
    late:         'გვიანი გაუქმება',
    no_refund:    'თანხა არ ბრუნდება',
  },
  ru: {
    pre_approval: 'До подтверждения',
    grace_period: 'Льготный период',
    early:        'Ранняя отмена',
    standard:     'Стандарт',
    late:         'Поздняя отмена',
    no_refund:    'Без возврата',
  },
};

export function CancellationPolicyContent() {
  const { lang } = useLang();

  const labels = TIER_LABELS[lang] ?? TIER_LABELS.en;

  return (
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[73px] pb-20 md:pb-0">
      <div className="mx-auto max-w-screen-md px-4 md:px-8 py-12">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-label-sm font-bold text-secondary hover:text-primary mb-8 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {lang === 'ka' ? 'მთავარი' : lang === 'ru' ? 'Главная' : 'Home'}
        </Link>

        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed/30">
              <span className="material-symbols-outlined text-[26px] text-primary">policy</span>
            </div>
            <div>
              <h1 className="text-h1 font-extrabold text-on-background">
                {lang === 'ka' ? 'გაუქმების პოლიტიკა' : lang === 'ru' ? 'Политика отмены' : 'Cancellation Policy'}
              </h1>
              <p className="text-label-sm text-secondary mt-0.5">
                {lang === 'ka' ? 'ბოლო განახლება: მაისი 2026' : lang === 'ru' ? 'Обновлено: май 2026' : 'Last updated: May 2026'}
              </p>
            </div>
          </div>
          <p className="text-body-md text-secondary leading-relaxed">
            {lang === 'ka'
              ? 'WAYGO-ს გაუქმების პოლიტიკა შექმნილია ჰოსტებისა და სტუმრების ინტერესების დასაბალანსებლად. ქვემოთ მოცემულია სრული ინფორმაცია თანხის დაბრუნების შესახებ.'
              : lang === 'ru'
              ? 'Политика отмены WAYGO разработана для справедливого баланса интересов хозяев и гостей. Ниже приведена полная информация о возвратах.'
              : 'WAYGO\'s cancellation policy is designed to fairly balance the interests of hosts and guests. Below is the full refund schedule.'}
          </p>
        </div>

        {/* Refund tiers table */}
        <section className="mb-10">
          <h2 className="text-h2 font-extrabold text-on-background mb-4">
            {lang === 'ka' ? 'დაბრუნების განრიგი' : lang === 'ru' ? 'График возвратов' : 'Refund Schedule'}
          </h2>
          <div className="rounded-2xl border border-outline-variant/40 overflow-hidden shadow-card">
            {TIERS.map((row, idx) => (
              <div
                key={row.tier}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 ${
                  idx < TIERS.length - 1 ? 'border-b border-outline-variant/30' : ''
                }`}
              >
                {/* Left: badge + window */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${row.badgeCls}`}>
                    <span className="material-symbols-outlined text-[17px]">{row.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-label-sm text-on-background">{labels[row.tier]}</p>
                    <p className="text-[12px] text-secondary mt-0.5 leading-snug">{row.window}</p>
                  </div>
                </div>
                {/* Right: refund info */}
                <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                  <div>
                    <p className={`text-[13px] font-extrabold ${
                      row.refundPct === 100 ? 'text-tertiary' :
                      row.refundPct >= 50  ? 'text-primary'  :
                      row.refundPct > 0    ? 'text-amber-700' : 'text-error'
                    }`}>
                      {row.refundPct}%
                    </p>
                    <p className="text-[11px] text-secondary">
                      {lang === 'ka' ? 'ქირის დაბრუნება' : lang === 'ru' ? 'возврат аренды' : 'rental refund'}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[13px] font-semibold text-tertiary">+ 250 ₾</p>
                    <p className="text-[11px] text-secondary">
                      {lang === 'ka' ? 'დეპოზიტი' : lang === 'ru' ? 'залог' : 'deposit'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key rules */}
        <section className="mb-10 space-y-4">
          <h2 className="text-h2 font-extrabold text-on-background">
            {lang === 'ka' ? 'მნიშვნელოვანი პირობები' : lang === 'ru' ? 'Ключевые условия' : 'Key Rules'}
          </h2>

          {[
            {
              icon: 'percent',
              title: lang === 'ka' ? '5% სერვის საკომისიო არ ბრუნდება' : lang === 'ru' ? '5% комиссия не возвращается' : '5% platform fee is never refunded',
              body:  lang === 'ka'
                ? 'WAYGO-ს საკომისიო (ქირის ჯამის 5%) ყოველთვის ინარჩუნებს, გაუქმების დროს მიუხედავად.'
                : lang === 'ru'
                ? 'Комиссия платформы (5% от стоимости аренды) удерживается при любой отмене.'
                : 'The platform service fee (5% of rental total) is retained in all cancellation scenarios.',
            },
            {
              icon: 'account_balance_wallet',
              title: lang === 'ka' ? 'დეპოზიტი ყოველთვის ბრუნდება' : lang === 'ru' ? 'Залог всегда возвращается' : 'Deposit is always returned',
              body:  lang === 'ka'
                ? '250 ₾ დეპოზიტი სრულად ბრუნდება ნებისმიერი გაუქმებისას, სანამ მანქანა ჩაბარებული არ არის.'
                : lang === 'ru'
                ? 'Залог 250 ₾ возвращается полностью при любой отмене до получения автомобиля.'
                : 'The 250 ₾ deposit is returned in full for any cancellation before the car is picked up.',
            },
            {
              icon: 'schedule',
              title: lang === 'ka' ? 'გაუქმება შეუძლებელია ჩაბარების შემდეგ' : lang === 'ru' ? 'Отмена невозможна после получения' : 'No cancellation after pickup',
              body:  lang === 'ka'
                ? 'მას შემდეგ, რაც სტუმარი ამ ავტომობილს ჩაიბარებს (სტატუსი "Confirmed"), გაუქმება შეუძლებელია.'
                : lang === 'ru'
                ? 'После получения автомобиля (статус «Подтверждено») отмена бронирования невозможна.'
                : 'Once the guest has picked up the car (status "Confirmed"), the booking cannot be cancelled.',
            },
            {
              icon: 'verified_user',
              title: lang === 'ka' ? 'კოდით დასტური გაუქმებისთვის' : lang === 'ru' ? 'Подтверждение по коду' : 'Code verification required to cancel',
              body:  lang === 'ka'
                ? 'გაუქმების დასადასტურებლად 6-ნიშნა კოდი გაიგზავნება თქვენს ელფოსტაზე. კოდი 10 წუთის განმავლობაში მოქმედებს.'
                : lang === 'ru'
                ? 'Для подтверждения отмены на вашу почту будет отправлен 6-значный код. Код действителен 10 минут.'
                : 'To confirm cancellation, a 6-digit verification code is emailed to you. Codes expire after 10 minutes.',
            },
            {
              icon: 'payments',
              title: lang === 'ka' ? 'თანხის დაბრუნება 3–5 სამუშაო დღეში' : lang === 'ru' ? 'Возврат за 3–5 рабочих дней' : 'Refunds within 3–5 business days',
              body:  lang === 'ka'
                ? 'თანხა სრულად ბრუნდება 3–5 სამუშაო დღის განმავლობაში, ბარათის გამომსცემლის პოლიტიკის შესაბამისად.'
                : lang === 'ru'
                ? 'Средства зачисляются обратно на карту в течение 3–5 рабочих дней в зависимости от политики банка.'
                : 'Refunds are issued to the original payment method within 3–5 business days, subject to your card issuer.',
            },
          ].map(item => (
            <div key={item.icon} className="flex gap-4 rounded-xl border border-outline-variant/40 bg-white p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container">
                <span className="material-symbols-outlined text-[20px] text-secondary">{item.icon}</span>
              </div>
              <div>
                <p className="font-bold text-label-sm text-on-background mb-1">{item.title}</p>
                <p className="text-[13px] text-secondary leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Example calculation */}
        <section className="mb-10">
          <h2 className="text-h2 font-extrabold text-on-background mb-4">
            {lang === 'ka' ? 'გაანგარიშების მაგალითი' : lang === 'ru' ? 'Пример расчёта' : 'Example Calculation'}
          </h2>
          <div className="rounded-2xl border border-outline-variant/40 bg-white shadow-card overflow-hidden">
            <div className="px-5 py-3 bg-surface-container-low border-b border-outline-variant/30">
              <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                {lang === 'ka' ? '5-დღიანი დაჯავშნა · 400 ₾ + 21 ₾ (5% საკომისიო) = 421 ₾ სულ' :
                 lang === 'ru' ? '5-дневная аренда · 400 ₾ + 20 ₾ (комиссия 5%) = 420 ₾ итого' :
                 '5-day rental · 400 ₾ + 20 ₾ (5% fee) = 420 ₾ total'}
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                {
                  scenario: lang === 'ka' ? 'ჰოსტის მოწვ. დასრულებამდე' : lang === 'ru' ? 'До одобрения хозяина' : 'Before host approval',
                  refund:   '400 ₾ + 250 ₾',
                  total:    '650 ₾',
                  cls:      'text-tertiary',
                },
                {
                  scenario: lang === 'ka' ? '5+ დღე აყვანამდე (75%)' : lang === 'ru' ? '5+ дней до получения (75%)' : '5+ days before pickup (75%)',
                  refund:   '300 ₾ + 250 ₾',
                  total:    '550 ₾',
                  cls:      'text-primary',
                },
                {
                  scenario: lang === 'ka' ? '3–4 დღე (50%)' : lang === 'ru' ? '3–4 дня (50%)' : '3–4 days before pickup (50%)',
                  refund:   '200 ₾ + 250 ₾',
                  total:    '450 ₾',
                  cls:      'text-amber-700',
                },
                {
                  scenario: lang === 'ka' ? '1–2 დღე (25%)' : lang === 'ru' ? '1–2 дня (25%)' : '1–2 days before pickup (25%)',
                  refund:   '100 ₾ + 250 ₾',
                  total:    '350 ₾',
                  cls:      'text-orange-700',
                },
                {
                  scenario: lang === 'ka' ? '24 სთ-ზე ნაკლები (0%)' : lang === 'ru' ? 'Менее 24 ч (0%)' : 'Less than 24 h (0%)',
                  refund:   '0 ₾ + 250 ₾',
                  total:    '250 ₾',
                  cls:      'text-error',
                },
              ].map(row => (
                <div key={row.scenario} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-label-sm font-semibold text-on-background">{row.scenario}</p>
                    <p className="text-[12px] text-secondary mt-0.5">
                      {lang === 'ka' ? 'ქირა + დეპოზიტი' : lang === 'ru' ? 'аренда + залог' : 'rental + deposit'}: {row.refund}
                    </p>
                  </div>
                  <span className={`text-[15px] font-extrabold shrink-0 ${row.cls}`}>{row.total}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <div className="rounded-2xl border border-primary/20 bg-primary-fixed/10 px-6 py-5 flex items-start gap-4">
          <span className="material-symbols-outlined text-[24px] text-primary mt-0.5">help</span>
          <div>
            <p className="font-bold text-label-sm text-on-background mb-1">
              {lang === 'ka' ? 'კითხვა გაქვს?' : lang === 'ru' ? 'Есть вопросы?' : 'Have a question?'}
            </p>
            <p className="text-[13px] text-secondary leading-relaxed">
              {lang === 'ka'
                ? 'დაგვიკავშირდი: '
                : lang === 'ru'
                ? 'Свяжитесь с нами: '
                : 'Contact us at '}
              <a href="mailto:hello@waygo.ge" className="text-primary font-semibold hover:underline">hello@waygo.ge</a>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
