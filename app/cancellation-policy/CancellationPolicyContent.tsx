'use client';

import Link from 'next/link';
import { useLang } from '@/components/lang-provider';
import { policies } from '@/lib/policies';

type Lang = 'ka' | 'en' | 'ru';

export function CancellationPolicyContent() {
  const { lang } = useLang();
  const l = lang as Lang;
  const copy: any = policies.cancellationPolicy;

  return (
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[120px] pb-20 md:pb-0">
      <div className="mx-auto max-w-screen-md px-4 md:px-8 py-12">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-label-sm font-bold text-secondary hover:text-primary mb-8 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {copy.back[l]}
        </Link>

        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed/30">
              <span className="material-symbols-outlined text-[26px] text-primary">policy</span>
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
          <p className="text-body-md text-secondary leading-relaxed">
            {copy.intro[l]}
          </p>
        </div>

        {/* Refund tiers table */}
        <section className="mb-10">
          <h2 className="text-h2 font-extrabold text-on-background mb-4">
            {copy.refundScheduleTitle[l]}
          </h2>
          <div className="rounded-2xl border border-outline-variant/40 overflow-hidden shadow-card">
            {copy.tiers.map((row: any, idx: number) => (
              <div
                key={row.tier}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 ${
                  idx < copy.tiers.length - 1 ? 'border-b border-outline-variant/30' : ''
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${row.badgeCls}`}>
                    <span className="material-symbols-outlined text-[17px]">{row.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-label-sm text-on-background">{copy.tierLabels[l][row.tier]}</p>
                    <p className="text-[12px] text-secondary mt-0.5 leading-snug">{row.window[l]}</p>
                  </div>
                </div>

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
                      {copy.rentalRefund[l]}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[13px] font-semibold text-tertiary">+ 250 ₾</p>
                    <p className="text-[11px] text-secondary">
                      {copy.deposit[l]}
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
            {copy.keyRulesTitle[l]}
          </h2>

          {copy.keyRules.map((item: any) => (
            <div key={item.icon} className="flex gap-4 rounded-xl border border-outline-variant/40 bg-white p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container">
                <span className="material-symbols-outlined text-[20px] text-secondary">{item.icon}</span>
              </div>
              <div>
                <p className="font-bold text-label-sm text-on-background mb-1">{item.title[l]}</p>
                <p className="text-[13px] text-secondary leading-relaxed">{item.body[l]}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Example calculation */}
        <section className="mb-10">
          <h2 className="text-h2 font-extrabold text-on-background mb-4">
            {copy.exampleTitle[l]}
          </h2>
          <div className="rounded-2xl border border-outline-variant/40 bg-white shadow-card overflow-hidden">
            <div className="px-5 py-3 bg-surface-container-low border-b border-outline-variant/30">
              <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                {copy.exampleSubtitle[l]}
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {copy.exampleRows.map((row: any) => (
                <div key={row.scenario[l]} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-label-sm font-semibold text-on-background">{row.scenario[l]}</p>
                    <p className="text-[12px] text-secondary mt-0.5">
                      {copy.rentalPlusDeposit[l]}: {row.refund}
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
              {copy.contactTitle[l]}
            </p>
            <p className="text-[13px] text-secondary leading-relaxed">
              {copy.contactBody[l]}
              <a href="mailto:support@waygo.ge" className="text-primary font-semibold hover:underline">support@waygo.ge</a>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}