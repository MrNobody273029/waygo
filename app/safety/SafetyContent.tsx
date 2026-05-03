'use client';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';

const PILLARS = [
  {
    icon: 'badge',
    color: 'bg-primary-fixed/30 text-primary',
    title: { ka: 'ვინაობის ვერიფიკაცია', en: 'Identity Verification', ru: 'Верификация личности' },
    body: {
      ka: 'ყველა მომხმარებელი — სტუმარი თუ ჰოსტი — ვალდებულია წარადგინოს პირადობის მოწმობა ან პასპორტი. ჩვენი გუნდი ამოწმებს ყველა დოკუმენტს ხელით. ვერიფიცირებული მომხმარებლები იღებენ გამორჩეულ ნიშანს პროფილზე.',
      en: 'Every user — guest or host — must submit a government-issued ID or passport. Our team reviews each document manually. Verified users receive a badge on their profile.',
      ru: 'Каждый пользователь — гость или хозяин — обязан предоставить удостоверение личности или паспорт. Наша команда проверяет каждый документ вручную. Верифицированные пользователи получают значок на профиле.',
    },
  },
  {
    icon: 'photo_camera',
    color: 'bg-violet-50 text-violet-700',
    title: { ka: 'ავტომობილის ფოტო-ანგარიში', en: 'Photo Condition Report', ru: 'Фотоотчёт о состоянии авто' },
    body: {
      ka: 'ყოველი ქირავნობის გაცემისა და დაბრუნებისას ივსება ვრცელი ფოტო-ანგარიში — ავტომობილის 7 ფოტო ყველა კუთხიდან. ეს ქმნის სანდო მტკიცებულებათა ბაზას და ორივე მხარეს იცავს უკანონო პრეტენზიებისგან.',
      en: 'At both pickup and return, a detailed photo report is filed — 7 photos of the car from all angles. This creates a reliable evidence base and protects both parties from unfair claims.',
      ru: 'При выдаче и возврате автомобиля составляется подробный фотоотчёт — 7 фотографий со всех сторон. Это создаёт надёжную доказательную базу и защищает обе стороны от необоснованных претензий.',
    },
  },
  {
    icon: 'verified_user',
    color: 'bg-tertiary-fixed/30 text-tertiary',
    title: { ka: 'სადაზღვევო დაფარვა', en: 'Insurance Coverage', ru: 'Страховое покрытие' },
    body: {
      ka: 'ყოველი ჯავშანი მოიცავს სადაზღვევო გეგმას სამი დონის: Basic, Standard ან Premium. ყველა ვარიანტი ფარავს ქონებრივ ზიანს. დეპოზიტი (250 ₾) ქირავნობის გაუჯავებელ დასრულებაზე სრულად ბრუნდება.',
      en: 'Every booking includes an insurance plan at one of three tiers: Basic, Standard, or Premium. All options cover property damage. The deposit (250 ₾) is fully returned upon undamaged return.',
      ru: 'Каждое бронирование включает страховой план одного из трёх уровней: Basic, Standard или Premium. Все варианты покрывают ущерб имуществу. Депозит (250 ₾) возвращается при сдаче без повреждений.',
    },
  },
  {
    icon: 'star',
    color: 'bg-amber-50 text-amber-600',
    title: { ka: 'ორმხრივი შეფასება', en: 'Two-Way Reviews', ru: 'Взаимные отзывы' },
    body: {
      ka: 'ყოველი ქირავნობის შემდეგ, სტუმარი აფასებს ჰოსტს და ჰოსტი — სტუმარს. ეს გამჭვირვალე სისტემა ხელს უწყობს პასუხისმგებლობას და ეხმარება მომხმარებლებს სანდო პარტნიორების პოვნაში.',
      en: 'After every rental, the guest reviews the host and the host reviews the guest. This transparent system promotes accountability and helps users find trustworthy partners.',
      ru: 'После каждой аренды гость оценивает хозяина, а хозяин — гостя. Эта прозрачная система способствует ответственности и помогает пользователям находить надёжных партнёров.',
    },
  },
  {
    icon: 'payments',
    color: 'bg-primary-fixed/20 text-primary',
    title: { ka: 'გამჭვირვალე გადახდები', en: 'Secure Payments', ru: 'Безопасные платежи' },
    body: {
      ka: 'ყველა ფინანსური ტრანზაქცია ხდება WAYGO.ge-ს პლატფორმის მეშვეობით. ჰოსტი ვერ მიიღებს გადახდას პლატფორმის გვერდის ავლით. ეს უზრუნველყოფს ორივე მხარის ფინანსურ დაცვას.',
      en: 'All financial transactions go through WAYGO.ge's platform. Hosts cannot receive payment outside the platform. This ensures financial protection for both parties.',
      ru: 'Все финансовые транзакции проходят через платформу WAYGO.ge. Хозяева не могут получать оплату в обход платформы. Это обеспечивает финансовую защиту обеих сторон.',
    },
  },
  {
    icon: 'support_agent',
    color: 'bg-rose-50 text-rose-600',
    title: { ka: '24/7 მხარდაჭერა', en: '24/7 Support', ru: 'Круглосуточная поддержка' },
    body: {
      ka: 'ჩვენი მხარდაჭერის გუნდი ხელმისაწვდომია ნებისმიერ დროს — გამართვის, ავარიის, ან ნებისმიერი კითხვის შემთხვევაში. დაგვიკავშირდი: support@waygo.ge',
      en: 'Our support team is available around the clock — for breakdowns, accidents, or any questions. Contact us: support@waygo.ge',
      ru: 'Наша команда поддержки доступна круглосуточно — при поломках, авариях или любых вопросах. Свяжитесь с нами: support@waygo.ge',
    },
  },
];

const STATS = [
  { icon: 'verified', value: '500+', label: { ka: 'ვერიფიცირებული მომხმარებელი', en: 'Verified users', ru: 'Верифицированных пользователей' } },
  { icon: 'directions_car', value: '200+', label: { ka: 'აქტიური განცხადება', en: 'Active listings', ru: 'Активных объявлений' } },
  { icon: 'star', value: '4.8', label: { ka: 'საშუალო შეფასება', en: 'Average rating', ru: 'Средняя оценка' } },
  { icon: 'support_agent', value: '24/7', label: { ka: 'მხარდაჭერა', en: 'Support', ru: 'Поддержка' } },
];

export function SafetyContent() {
  const { lang } = useLang();
  const l = lang as 'ka' | 'en' | 'ru';

  return (
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[73px] pb-20 md:pb-0">
      <div className="mx-auto max-w-screen-lg px-4 md:px-8 py-12">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-label-sm font-bold text-secondary hover:text-primary mb-8 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {l === 'ka' ? 'მთავარი' : l === 'ru' ? 'Главная' : 'Home'}
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed/30">
              <span className="material-symbols-outlined text-[30px] text-primary">shield_person</span>
            </div>
            <div>
              <h1 className="text-h1 font-extrabold text-on-background">
                {l === 'ka' ? 'უსაფრთხოება და ნდობა' : l === 'ru' ? 'Безопасность и доверие' : 'Safety & Trust'}
              </h1>
              <p className="text-label-sm text-secondary mt-0.5">WAYGO.ge</p>
            </div>
          </div>
          <p className="text-body-lg text-secondary leading-relaxed max-w-2xl">
            {l === 'ka'
              ? 'WAYGO.ge-ს ყოველი ქირავნობა დაფუძნებულია ურთიერთნდობაზე. ჩვენ ვაშენებთ სივრცეს, სადაც სტუმარი ჰოსტს ენდობა, ჰოსტი სტუმარს ენდობა, და ორივე — WAYGO.ge-ს. ქვემოთ მოცემულია ჩვენი ნდობის სისტემის სრული სტრუქტურა.'
              : l === 'ru'
              ? 'Каждая аренда на WAYGO.ge строится на взаимном доверии. Мы создаём пространство, где гость доверяет хозяину, хозяин доверяет гостю, и оба доверяют WAYGO.ge. Ниже описана полная структура нашей системы доверия.'
              : 'Every rental on WAYGO.ge is built on mutual trust. We create a space where guests trust hosts, hosts trust guests, and both trust WAYGO.ge. Below is the complete structure of our trust system.'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {STATS.map(s => (
            <div key={s.icon} className="rounded-2xl bg-white border border-slate-100 shadow-card p-5 text-center">
              <span className="material-symbols-outlined text-[28px] text-primary mb-2 block">{s.icon}</span>
              <p className="text-2xl font-extrabold text-on-background">{s.value}</p>
              <p className="text-[12px] text-secondary mt-1">{s.label[l]}</p>
            </div>
          ))}
        </div>

        {/* Pillars */}
        <div className="mb-14">
          <h2 className="text-h2 font-extrabold text-on-background mb-6">
            {l === 'ka' ? 'ნდობის 6 სვეტი' : l === 'ru' ? '6 столпов доверия' : '6 Pillars of Trust'}
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {PILLARS.map((p, i) => (
              <div key={i} className="rounded-2xl bg-white border border-slate-100 shadow-card p-6 flex gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${p.color}`}>
                  <span className="material-symbols-outlined text-[22px]">{p.icon}</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-[15px] text-on-background mb-2">{p.title[l]}</h3>
                  <p className="text-[13px] text-secondary leading-relaxed">{p.body[l]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commitment */}
        <div className="rounded-3xl bg-primary-fixed/20 border border-primary/10 p-8 text-center">
          <span className="material-symbols-outlined text-[36px] text-primary mb-3 block">favorite</span>
          <h3 className="text-h3 font-extrabold text-on-background mb-3">
            {l === 'ka' ? 'ჩვენი ვალდებულება' : l === 'ru' ? 'Наше обязательство' : 'Our Commitment'}
          </h3>
          <p className="text-body-md text-secondary leading-relaxed max-w-xl mx-auto mb-6">
            {l === 'ka'
              ? 'თუ ქირავნობისას რაიმე გაუთვალისწინებელი მოხდება, ჩვენი გუნდი ყოველთვის მზადაა დაგეხმაროს. ჩვენ ვიდგებით ყველა სტუმრისა და ჰოსტის გვერდით.'
              : l === 'ru'
              ? 'Если во время аренды произойдёт что-то непредвиденное, наша команда всегда готова помочь. Мы на стороне каждого гостя и каждого хозяина.'
              : 'If anything unexpected happens during a rental, our team is always ready to help. We stand by every guest and every host.'}
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
