'use client';

import Link from 'next/link';
import { useLang } from '@/components/lang-provider';
import { policies } from '@/lib/policies';

type Lang = 'ka' | 'en' | 'ru';

export function InsuranceTermsContent() {
  const { lang } = useLang();
  const l = lang as Lang;
  const copy: any = policies.insuranceTerms;

  return (
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[73px] pb-20 md:pb-0">
      <div className="mx-auto max-w-screen-lg px-4 md:px-8 py-12">

        <Link href="/" className="inline-flex items-center gap-1.5 text-label-sm font-bold text-secondary hover:text-primary mb-8 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {copy.back[l]}
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed/30">
              <span className="material-symbols-outlined text-[30px] text-primary">shield</span>
            </div>
            <div>
              <h1 className="text-h1 font-extrabold text-on-background">
                {copy.title[l]}
              </h1>
              <p className="text-label-sm text-secondary mt-0.5">
                {copy.lastUpdated[l]}
              </p>
            </div>
          </div>
          <p className="text-body-lg text-secondary leading-relaxed max-w-2xl">
            {copy.intro[l]}
          </p>
        </div>

        {/* Plans */}
        <div className="mb-14">
          <h2 className="text-h2 font-extrabold text-on-background mb-6">
            {copy.plansTitle[l]}
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {copy.plans.map((plan: any) => (
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
                    {copy.included[l]}
                  </p>
                  <ul className="space-y-1.5">
                    {plan.features.map((f: any, i: number) => (
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
                      {copy.notCovered[l]}
                    </p>
                    <ul className="space-y-1.5">
                      {plan.notCovered.map((f: any, i: number) => (
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
            {copy.generalTitle[l]}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {copy.general.map((item: any, i: number) => (
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
              {copy.disclaimer[l]}
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}