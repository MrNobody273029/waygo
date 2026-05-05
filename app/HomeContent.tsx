'use client';
import { HeroSearch } from '@/components/hero-search';
import { CarCard } from '@/components/car-card';
import { useLang } from '@/components/lang-provider';
import type { Car } from '@/lib/sample-data';
import Image from "next/image";

export function HomeContent({ featuredCars }: { featuredCars: Car[] }) {
  const { t } = useLang();

return (
  <main className="pt-[62px] md:pt-[73px]">
    <Image
      src="/home-photo.png"
      alt="Home banner"
      width={1983}
      height={793}
      className="w-full h-auto block"
      priority
    />

    <HeroSearch />

      {/* Featured cars */}
      <section className="max-w-screen-2xl mx-auto px-4 md:px-12 py-10 md:py-20 bg-surface">
        <div className="flex justify-between items-end mb-5 md:mb-10">
          <div>
            <p className="text-[12px] md:text-label-bold font-semibold text-primary mb-1">{t.home.sectionBadge}</p>
            <h2 className="text-[26px] md:text-h1 font-bold text-on-background leading-tight">{t.home.sectionTitle}</h2>
            <p className="text-secondary text-[13px] md:text-body-md mt-1 md:mt-2">{t.home.sectionSub}</p>
          </div>
          <a href="/cars" className="hidden md:flex items-center gap-1 text-primary font-bold text-label-bold hover:underline shrink-0">
            {t.home.viewAll}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>

        {featuredCars.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <span className="material-symbols-outlined text-[52px] text-slate-300">directions_car</span>
            <p className="text-secondary text-label-bold">No cars listed yet — check back soon!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {featuredCars.map(c => <CarCard key={c.id} car={c} />)}
            </div>
            {/* View all — mobile only, below the grid */}
            <div className="mt-6 flex md:hidden">
              <a
                href="/cars"
                className="flex-1 flex items-center justify-center gap-2 border-2 border-primary/20 text-primary font-bold text-[14px] py-3 rounded-xl hover:bg-primary/5 transition active:scale-95"
              >
                {t.home.viewAll}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
            </div>
          </>
        )}
      </section>

      {/* Trust section */}
      <section className="max-w-screen-2xl mx-auto px-4 md:px-12 pb-8 md:pb-24">
        <div className="bg-slate-900 rounded-[24px] md:rounded-[32px] p-6 md:p-16 flex flex-col md:flex-row items-center gap-8 md:gap-12 overflow-hidden relative">
          <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-primary-container/20 blur-[100px] rounded-full" />

          <div className="flex-1 z-10 text-center md:text-left w-full">
            <h2 className="text-[22px] md:text-h1 font-bold text-white mb-6 md:mb-8 leading-tight">{t.home.trustTitle}</h2>
            <div className="grid grid-cols-2 gap-5 md:gap-8 text-left">
              {[
                { icon: 'verified_user', title: t.home.f1Title, text: t.home.f1Text },
                { icon: 'support_agent', title: t.home.f2Title, text: t.home.f2Text },
                { icon: 'badge', title: t.home.f3Title, text: t.home.f3Text },
                { icon: 'lock', title: t.home.f4Title, text: t.home.f4Text },
              ].map(f => (
                <div key={f.title} className="space-y-2 md:space-y-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-container/20 rounded-xl flex items-center justify-center text-primary-fixed-dim">
                    <span className="material-symbols-outlined text-[18px] md:text-[24px]">{f.icon}</span>
                  </div>
                  <h4 className="text-[14px] md:text-h3 font-semibold text-white leading-snug">{f.title}</h4>
                  <p className="text-slate-400 text-[12px] md:text-label-bold leading-relaxed hidden sm:block">{f.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial card */}
          <div className="flex-1 w-full max-w-md bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 md:p-8 z-10">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-container/40 flex items-center justify-center text-white font-black text-base md:text-lg shrink-0">N</div>
              <div>
                <p className="font-bold text-[14px] md:text-label-bold text-white">{t.home.testimonialName}</p>
                <p className="text-slate-400 text-[12px] md:text-label-sm">{t.home.testimonialMeta}</p>
              </div>
            </div>
            <p className="text-slate-200 italic text-[13px] md:text-body-md leading-relaxed mb-4">{t.home.testimonialText}</p>
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-[16px] md:text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
        

  );
}
