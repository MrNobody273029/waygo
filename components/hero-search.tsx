'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';

export function HeroSearch() {
  const router = useRouter();
  const { t } = useLang();
  const [location, setLocation] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  function handleSearch() {
    const params = new URLSearchParams({ location, start, end });
    router.push(`/cars?${params.toString()}`);
  }

  return (
    <section className="relative min-h-[600px] md:min-h-[660px] flex items-center justify-center bg-hero-mesh px-4 md:px-12 pt-8 pb-24 md:py-24 overflow-hidden">
      <div className="relative z-10 max-w-5xl w-full text-center">

        {/* Badge */}
        <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed/60 px-3 py-1.5 md:px-4 md:py-2 text-[12px] md:text-label-bold font-semibold text-primary mb-3 md:mb-5">
          <span className="material-symbols-outlined text-[14px] md:text-[16px]">shield</span>
          {t.hero.badge}
        </p>

        {/* Heading */}
        <h1 className="text-[28px] leading-tight sm:text-[38px] md:text-display font-extrabold text-on-background mb-3 md:mb-5 tracking-tight">
          {t.hero.title1}<br className="hidden sm:block" /> {t.hero.title2}
        </h1>

        {/* Subtitle */}
        <p className="text-[14px] md:text-body-lg text-secondary mb-7 md:mb-12 max-w-2xl mx-auto">
          {t.hero.sub}
        </p>

        {/* Search card */}
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.10)] overflow-hidden">

          {/* Fields */}
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 flex flex-col md:flex-row md:divide-x divide-slate-100">

              {/* Location */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 md:border-b-0 md:flex-1 md:flex-col md:items-start md:py-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 md:hidden">
                  <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
                </div>
                <div className="flex-1 min-w-0 text-left md:w-full">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-0.5">{t.hero.locationLabel}</span>
                  <select
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full border-none p-0 focus:ring-0 font-bold text-[14px] md:text-label-bold text-on-background bg-transparent cursor-pointer"
                  >
                    <option value="">{t.hero.loc1}</option>
                    <option>{t.hero.loc2}</option>
                    <option>{t.hero.loc3}</option>
                    <option>{t.hero.loc4}</option>
                  </select>
                </div>
              </div>

              {/* Pick-up */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 md:border-b-0 md:flex-1 md:flex-col md:items-start md:py-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 md:hidden">
                  <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
                </div>
                <div className="flex-1 min-w-0 text-left md:w-full">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-0.5">{t.hero.pickupLabel}</span>
                  <input
                    type="date"
                    value={start}
                    onChange={e => setStart(e.target.value)}
                    className="w-full border-none p-0 focus:ring-0 font-bold text-[14px] md:text-label-bold text-on-background bg-transparent"
                  />
                </div>
              </div>

              {/* Drop-off */}
              <div className="flex items-center gap-3 px-4 py-3.5 md:flex-1 md:flex-col md:items-start md:py-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 md:hidden">
                  <span className="material-symbols-outlined text-[18px] text-primary">event_available</span>
                </div>
                <div className="flex-1 min-w-0 text-left md:w-full">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-0.5">{t.hero.dropoffLabel}</span>
                  <input
                    type="date"
                    value={end}
                    onChange={e => setEnd(e.target.value)}
                    className="w-full border-none p-0 focus:ring-0 font-bold text-[14px] md:text-label-bold text-on-background bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Desktop search button — same row as fields */}
            <div className="hidden md:flex items-center p-3">
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 bg-primary-container text-white px-8 py-4 rounded-xl font-bold text-label-bold hover:bg-primary transition-colors active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined">search</span>
                {t.hero.searchBtn}
              </button>
            </div>
          </div>

          {/* Mobile search button — full width below fields */}
          <div className="md:hidden px-3 pb-3">
            <button
              onClick={handleSearch}
              className="w-full flex items-center justify-center gap-2 bg-primary-container text-white px-8 py-3.5 rounded-xl font-bold text-[15px] hover:bg-primary transition-colors active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              {t.hero.searchBtn}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
