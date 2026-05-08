'use client';
import { useCurrency } from '@/components/currency-provider';
import { CURRENCY_OPTIONS, type Currency } from '@/lib/currency';

interface Props {
  /** 'nav' = white outline style for navbar; 'mobile' = full-width buttons */
  variant?: 'nav' | 'mobile';
  onSelect?: () => void;
}

export function CurrencySwitcher({ variant = 'nav', onSelect }: Props) {
  const { currency, setCurrency } = useCurrency();

  function handle(c: Currency) {
    setCurrency(c);
    onSelect?.();
  }

  if (variant === 'mobile') {
    return (
      <div className="flex gap-2">
        {CURRENCY_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handle(opt.value)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-black transition cursor-pointer ${
              currency === opt.value
                ? 'bg-primary-fixed/30 text-primary'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {opt.symbol} {opt.value}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center rounded-xl border border-slate-200/80 bg-white/90 shadow-sm overflow-hidden">
      {CURRENCY_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => handle(opt.value)}
          className={`px-2.5 py-[7px] text-[13px] font-black leading-none transition-all cursor-pointer ${
            currency === opt.value
              ? 'bg-primary text-white'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
          title={opt.value}
        >
          {opt.symbol}
        </button>
      ))}
    </div>
  );
}
