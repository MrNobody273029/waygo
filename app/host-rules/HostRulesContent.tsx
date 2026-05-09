'use client';

import Link from 'next/link';
import { useLang } from '@/components/lang-provider';
import { policies } from '@/lib/policies';

type L = 'ka' | 'en' | 'ru';

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
  const copy: any = policies.hostRules;

  return (
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[120px] pb-20 md:pb-0">
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
        <div className="relative">
          <div className="absolute left-[22px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-tertiary/20 via-outline-variant/30 to-primary/20 hidden md:block" />

          <div className="space-y-6">
            {copy.steps.map((step: any, i: number) => (
              <div key={i} className="relative flex gap-5 md:gap-6">
                <div className="flex-col items-center hidden md:flex shrink-0">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${step.iconBg} shadow-sm z-10`}>
                    <span className="material-symbols-outlined text-[22px]">{step.icon}</span>
                  </div>
                </div>

                <div className={`flex-1 rounded-2xl border-l-4 ${step.accent} bg-white shadow-card overflow-hidden`}>
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

                  <div className="px-5 pb-5 pt-3 space-y-4">
                    <p className="text-[13px] md:text-body-md text-secondary leading-relaxed">{step.body[l]}</p>

                    {step.earlyAccess && (
                      <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-300/60 px-4 py-3.5">
                        <span className="text-[20px] shrink-0 mt-0.5">⭐</span>
                        <p className="text-[12px] md:text-label-sm font-semibold text-amber-900 leading-relaxed">{step.earlyAccess[l]}</p>
                      </div>
                    )}

                    {step.bullets && (
                      <div className="rounded-xl border border-outline-variant/30 divide-y divide-outline-variant/20 overflow-hidden">
                        {step.bullets.map((b: any, bi: number) => (
                          <div key={bi} className="flex items-start gap-3 px-4 py-3 bg-surface-container-low/60">
                            <span className={`material-symbols-outlined text-[15px] mt-0.5 shrink-0 ${b.color ?? 'text-tertiary'}`}>
                              {b.icon ?? 'check'}
                            </span>
                            <p className="text-[12px] md:text-label-sm text-secondary leading-relaxed">{b.text[l]}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {step.warning && (
                      <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                        <span className="material-symbols-outlined text-[18px] text-amber-600 mt-0.5 shrink-0">warning</span>
                        <p className="text-[12px] md:text-label-sm font-semibold text-amber-900 leading-relaxed">{step.warning[l]}</p>
                      </div>
                    )}

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

        <div className="mt-6 flex items-center justify-center gap-2 text-label-sm text-secondary">
          <span className="material-symbols-outlined text-[16px]">mail</span>
          <span>{l === 'ka' ? 'კითხვა? ' : l === 'ru' ? 'Вопросы? ' : 'Questions? '}</span>
          <a href="mailto:support@waygo.ge" className="text-primary font-bold hover:underline">support@waygo.ge</a>
        </div>
      </div>
    </main>
  );
}