'use client';
import { useLang } from '@/components/lang-provider';

type Lang = 'ka' | 'en' | 'ru';

const t = {
  title: {
    ka: 'უსაფრთხოება',
    en: 'Safety',
    ru: 'Безопасность',
  },
  intro: {
    ka: 'WAYGO.ge ქმნის უსაფრთხო გარემოს როგორც ჰოსტებისთვის, ასევე სტუმრებისთვის. ქვემოთ მოცემულია ძირითადი უსაფრთხოების პრინციპები.',
    en: 'WAYGO.ge creates a safe environment for both hosts and guests. Below are the key safety principles.',
    ru: 'WAYGO.ge создаёт безопасную среду как для хозяев, так и для гостей. Ниже приведены основные принципы безопасности.',
  },
  items: [
    {
      title: { ka: 'იდენტობის ვერიფიკაცია', en: 'Identity Verification', ru: 'Проверка личности' },
      body: {
        ka: 'ყველა მომხმარებელი გადის ვერიფიკაციას. მართვის მოწმობა და სელფი გამოიყენება უსაფრთხოების უზრუნველსაყოფად.',
        en: 'All users go through verification. Driver licenses and selfies are used to ensure safety.',
        ru: 'Все пользователи проходят проверку. Водительские удостоверения и селфи используются для обеспечения безопасности.',
      },
    },
    {
      title: { ka: 'გამჭვირვალე გადახდები', en: 'Secure Payments', ru: 'Безопасные платежи' },
      body: {
        ka: 'ყველა ფინანსური ტრანზაქცია ხდება WAYGO.ge-ს პლატფორმის მეშვეობით. ჰოსტი ვერ მიიღებს გადახდას პლატფორმის გვერდის ავლით. ეს უზრუნველყოფს ორივე მხარის ფინანსურ დაცვას.',
        en: "All financial transactions go through WAYGO.ge's platform. Hosts cannot receive payment outside the platform. This ensures financial protection for both parties.",
        ru: 'Все финансовые транзакции проходят через платформу WAYGO.ge. Хозяева не могут получать оплату в обход платформы. Это обеспечивает финансовую защиту обеих сторон.',
      },
    },
    {
      title: { ka: 'ფოტო დოკუმენტაცია', en: 'Photo Documentation', ru: 'Фото-документация' },
      body: {
        ka: 'ავტომობილის გადაცემისა და დაბრუნებისას სავალდებულოა ფოტოები, რაც იცავს ორივე მხარეს დავის შემთხვევაში.',
        en: 'Photos are mandatory during handover and return, protecting both parties in case of disputes.',
        ru: 'Фотографии обязательны при передаче и возврате, что защищает обе стороны в случае споров.',
      },
    },
    {
      title: { ka: 'რეიტინგები და შეფასებები', en: 'Ratings & Reviews', ru: 'Рейтинги и отзывы' },
      body: {
        ka: 'მომხმარებლები აფასებენ ერთმანეთს, რაც ქმნის ნდობას და ზრდის პლატფორმის უსაფრთხოებას.',
        en: 'Users review each other, building trust and increasing platform safety.',
        ru: 'Пользователи оценивают друг друга, что формирует доверие и повышает безопасность платформы.',
      },
    },
  ],
};

export default function SafetyContent() {
  const { lang } = useLang();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">{t.title[lang]}</h1>
      <p className="text-gray-600 mb-8">{t.intro[lang]}</p>

      <div className="space-y-6">
        {t.items.map((item, i) => (
          <div key={i} className="border rounded-xl p-5">
            <h2 className="text-xl font-semibold mb-2">{item.title[lang]}</h2>
            <p className="text-gray-600">{item.body[lang]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}