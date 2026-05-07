'use client';

import Link from 'next/link';
import { useLang } from '@/components/lang-provider';
import { policies } from '@/lib/policies';

type L = 'ka' | 'en' | 'ru';

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
  const copy: any = policies.guestRules;

  return (
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[73px] pb-20 md:pb-0">
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
        <div className="relative">
          <div className="absolute left-[22px] top-10 bottom-10 w-[2px] bg-gradient-to-b from-primary/20 via-outline-variant/30 to-tertiary/20 hidden md:block" />

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

                    {step.bullets && (
                      <div className="rounded-xl bg-surface-container-low border border-outline-variant/30 divide-y divide-outline-variant/20 overflow-hidden">
                        {step.bullets.map((b: any, bi: number) => (
                          <div key={bi} className="flex items-start gap-3 px-4 py-3">
                            <span className={`material-symbols-outlined text-[15px] mt-0.5 shrink-0 ${bi === 0 ? 'text-tertiary' : 'text-error'}`}>
                              {bi === 0 ? 'check_circle' : 'info'}
                            </span>
                            <p className="text-[12px] md:text-label-sm text-secondary leading-relaxed">{b[l]}</p>
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

        <div className="mt-6 flex items-center justify-center gap-2 text-label-sm text-secondary">
          <span className="material-symbols-outlined text-[16px]">mail</span>
          <span>{l === 'ka' ? 'კითხვა? ' : l === 'ru' ? 'Вопросы? ' : 'Questions? '}</span>
          <a href="mailto:support@waygo.ge" className="text-primary font-bold hover:underline">support@waygo.ge</a>
        </div>
      </div>
    </main>
  );
}