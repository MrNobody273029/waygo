'use client';
import { insurancePlans, type InsurancePlan } from '@/lib/constants';
import { gel } from '@/lib/utils';
import { useLang } from '@/components/lang-provider';

const planMeta: Record<InsurancePlan, { icon: string; color: string; tagKey?: 'mostPopular' | 'recommended' }> = {
  basic: { icon: 'shield', color: 'text-slate-500' },
  standard: { icon: 'verified_user', color: 'text-primary', tagKey: 'mostPopular' },
  premium: { icon: 'security', color: 'text-tertiary-container', tagKey: 'recommended' },
};

export function InsurancePicker({
  plan,
  setPlan,
  days,
}: {
  plan: InsurancePlan;
  setPlan: (p: InsurancePlan) => void;
  days: number;
}) {
  const { t } = useLang();

  return (
    <div className="grid grid-cols-1 gap-4">
      {(Object.entries(insurancePlans) as [InsurancePlan, typeof insurancePlans.basic][]).map(([key, p]) => {
        const meta = planMeta[key];
        const selected = plan === key;
        const tagLabel = meta.tagKey ? t.insurance[meta.tagKey] : null;

        return (
          <button
            key={key}
            onClick={() => setPlan(key)}
            className={`relative w-full rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
              selected
                ? 'border-primary bg-primary-fixed/30 ring-2 ring-primary/20'
                : 'border-slate-200 bg-white hover:border-primary/40'
            }`}
          >
            {tagLabel && (
              <span className="absolute -top-3 right-3 bg-tertiary-container text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {tagLabel}
              </span>
            )}
            <div className="flex items-start gap-3">
              <span className={`material-symbols-outlined mt-0.5 ${meta.color}`}>{meta.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-label-bold text-on-background">{p.label}</p>
                  <p className="font-extrabold text-h3 text-on-background shrink-0">
                    {p.dailyPrice > 0 ? gel(p.dailyPrice * days) : t.insurance.free}
                  </p>
                </div>
                <p className="text-label-sm text-secondary mt-0.5">{p.description}</p>
                <p className="text-label-sm text-secondary mt-0.5">
                  {t.insurance.deductible} <span className="font-bold text-on-background">{gel(p.deductible)}</span>
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
