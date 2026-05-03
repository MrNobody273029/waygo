'use client';
import { useLang } from '@/components/lang-provider';

export default function HowItWorksContent() {
  const { lang } = useLang();

  const t = {
    title: {
      ka: 'როგორ მუშაობს',
      en: 'How it works',
      ru: 'Как это работает',
    },
    steps: [
      {
        ka: 'აირჩიე მანქანა',
        en: 'Choose a car',
        ru: 'Выберите автомобиль',
      },
      {
        ka: 'გააკეთე ჯავშანი',
        en: 'Make a booking',
        ru: 'Сделайте бронирование',
      },
      {
        ka: 'აიღე მანქანა',
        en: 'Pick up the car',
        ru: 'Заберите автомобиль',
      },
      {
        ka: 'დააბრუნე უსაფრთხოდ',
        en: 'Return safely',
        ru: 'Верните безопасно',
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">{t.title[lang]}</h1>

      <div className="space-y-4">
        {t.steps.map((step, i) => (
          <div key={i} className="border rounded-xl p-4">
            <span className="font-semibold">{i + 1}.</span>{' '}
            {step[lang]}
          </div>
        ))}
      </div>
    </div>
  );
}