'use client';

import { useLang } from '@/components/lang-provider';
import { policies } from '@/lib/policies';

export default function SafetyContent() {
  const { lang } = useLang();
  const t = policies.safety;

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