'use client';
import { useState, useRef, useEffect } from 'react';
import { MAKE_NAMES, BRAND_LOGOS, POPULAR_BRANDS, getModelsForMake, YEARS } from '@/lib/car-data';
import { useLang } from '@/components/lang-provider';

/* ─── Brand Logo ────────────────────────────────────────────── */
function BrandLogo({ brand, size = 'md' }: { brand: string; size?: 'sm' | 'md' | 'lg' }) {
  const [err, setErr] = useState(false);
  const url = BRAND_LOGOS[brand];
  const sz = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';

  if (url && !err) {
    return (
      <img
        src={url}
        alt={brand}
        className={`${sz} object-contain`}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <span className={`${sz} flex items-center justify-center rounded-lg bg-primary-fixed text-[11px] font-black text-primary shrink-0`}>
      {brand.slice(0, 2).toUpperCase()}
    </span>
  );
}

/* ─── Brand Card (grid item) ───────────────────────────────── */
function BrandCard({ brand, selected, onClick }: { brand: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-all cursor-pointer ${
        selected
          ? 'bg-primary-fixed/50 border-2 border-primary ring-2 ring-primary/10'
          : 'bg-white border border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-low'
      }`}
    >
      <BrandLogo brand={brand} size="md" />
      <span className={`text-[10px] font-bold leading-tight line-clamp-1 w-full ${selected ? 'text-primary' : 'text-on-background'}`}>
        {brand}
      </span>
    </button>
  );
}

/* ─── Brand Picker ─────────────────────────────────────────── */
export function CarBrandPicker({
  value,
  onChange,
  placeholder = 'Any brand',
  compact = false,
}: {
  value: string;
  onChange: (brand: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const lc = search.toLowerCase();
  const filtered = lc ? MAKE_NAMES.filter(n => n.toLowerCase().includes(lc)) : MAKE_NAMES;
  const popular = filtered.filter(n => POPULAR_BRANDS.includes(n));
  const others  = filtered.filter(n => !POPULAR_BRANDS.includes(n));

  const triggerBase = compact
    ? 'flex items-center gap-1.5 border-none p-0 bg-transparent font-bold text-label-bold text-on-background focus:ring-0 cursor-pointer'
    : 'flex items-center gap-2 w-full rounded-xl border border-outline-variant bg-white px-4 py-3.5 font-bold text-label-bold transition hover:border-primary/60 cursor-pointer';

  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={() => setOpen(v => !v)} className={triggerBase}>
        {value ? (
          <>
            <BrandLogo brand={value} size="sm" />
            <span className="flex-1 text-left truncate text-on-background">{value}</span>
          </>
        ) : (
          <span className="flex-1 text-left text-secondary">{placeholder}</span>
        )}
        <span className={`material-symbols-outlined text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} style={{ fontSize: 18 }}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-[99] mt-2 w-[520px] max-w-[92vw] rounded-2xl border border-outline-variant bg-white shadow-card-hover overflow-hidden">
          {/* Search bar */}
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>search</span>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.common.searchBrands}
              className="flex-1 bg-transparent text-label-bold text-on-background placeholder:text-slate-400 outline-none"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="text-slate-400 hover:text-on-background cursor-pointer">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            )}
          </div>

          <div className="max-h-[340px] overflow-y-auto p-3 space-y-3">
            {/* Popular */}
            {!search && popular.length > 0 && (
              <div>
                <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{t.common.popular}</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {popular.map(b => (
                    <BrandCard key={b} brand={b} selected={value === b} onClick={() => { onChange(b); setOpen(false); setSearch(''); }} />
                  ))}
                </div>
              </div>
            )}

            {/* All / filtered */}
            <div>
              {!search && others.length > 0 && (
                <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{t.common.allBrands}</p>
              )}
              <div className="grid grid-cols-5 gap-2">
                {(search ? filtered : others).map(b => (
                  <BrandCard key={b} brand={b} selected={value === b} onClick={() => { onChange(b); setOpen(false); setSearch(''); }} />
                ))}
              </div>
            </div>

            {filtered.length === 0 && (
              <p className="py-8 text-center text-label-bold text-secondary">{t.common.noBrandsFound}</p>
            )}
          </div>

          {value && (
            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className="w-full rounded-xl py-2 text-label-sm font-bold text-error transition hover:bg-error-container/30 cursor-pointer"
              >
                {t.common.clearSelection}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Model Picker ─────────────────────────────────────────── */
export function CarModelPicker({
  brand,
  value,
  onChange,
  placeholder = 'Any model',
  compact = false,
}: {
  brand: string;
  value: string;
  onChange: (model: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLang();
  const models = brand ? getModelsForMake(brand) : [];

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const filtered = search ? models.filter(m => m.toLowerCase().includes(search.toLowerCase())) : models;

  const triggerBase = compact
    ? 'flex items-center gap-1.5 border-none p-0 bg-transparent font-bold text-label-bold text-on-background focus:ring-0 disabled:opacity-50 cursor-pointer'
    : 'flex items-center gap-2 w-full rounded-xl border border-outline-variant bg-white px-4 py-3.5 font-bold text-label-bold transition hover:border-primary/60 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer';

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        disabled={!brand}
        onClick={() => setOpen(v => !v)}
        className={triggerBase}
      >
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>directions_car</span>
        <span className={`flex-1 text-left truncate ${value ? 'text-on-background' : 'text-secondary'}`}>
          {value || placeholder}
        </span>
        <span className={`material-symbols-outlined text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} style={{ fontSize: 18 }}>
          expand_more
        </span>
      </button>

      {open && brand && (
        <div className="absolute left-0 top-full z-[99] mt-2 w-full min-w-[220px] rounded-2xl border border-outline-variant bg-white shadow-card-hover overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16 }}>search</span>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.common.searchModels}
              className="flex-1 bg-transparent text-label-bold text-on-background placeholder:text-slate-400 outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { onChange(m); setOpen(false); setSearch(''); }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-label-bold font-semibold transition cursor-pointer ${
                  value === m ? 'bg-primary-fixed/40 text-primary' : 'text-on-background hover:bg-surface-container-low'
                }`}
              >
                {value === m && <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>check</span>}
                {m}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-4 text-label-sm text-secondary">{t.common.noModelsFound}</p>
            )}
          </div>
          {value && (
            <div className="border-t border-slate-100 p-2">
              <button type="button" onClick={() => { onChange(''); setOpen(false); }}
                className="w-full rounded-xl py-2 text-label-sm font-bold text-error hover:bg-error-container/30 transition cursor-pointer">
                {t.common.clear}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Year Picker ──────────────────────────────────────────── */
export function CarYearPicker({
  value,
  onChange,
  placeholder = 'Any year',
  compact = false,
}: {
  value: string;
  onChange: (year: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const base = compact
    ? 'w-full appearance-none border-none bg-transparent font-bold text-label-bold text-on-background focus:ring-0 cursor-pointer'
    : 'w-full appearance-none rounded-xl border border-outline-variant bg-white pl-10 pr-8 py-3.5 font-bold text-label-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-fixed cursor-pointer text-on-background';

  return (
    <div className="relative w-full">
      {!compact && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
          calendar_today
        </span>
      )}
      <select value={value} onChange={e => onChange(e.target.value)} className={base}>
        <option value="">{placeholder}</option>
        {YEARS.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      {!compact && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400" style={{ fontSize: 18 }}>
          expand_more
        </span>
      )}
    </div>
  );
}
