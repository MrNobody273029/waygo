'use client';
import { useState } from 'react';
import { useLang } from '@/components/lang-provider';
import { FAQ_CATEGORIES, type FaqLang } from '@/lib/faq';

export function FaqContent() {
  const { lang } = useLang();
  const faqLang: FaqLang = (lang === 'ka' || lang === 'ru') ? lang : 'en';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openItem, setOpenItem] = useState<string | null>(null);

  const displayed = activeCategory === 'all'
    ? FAQ_CATEGORIES
    : FAQ_CATEGORIES.filter(c => c.id === activeCategory);

  const totalCount = FAQ_CATEGORIES.reduce((s, c) => s + c.items.length, 0);

  const headings: Record<FaqLang, { all: string; title: string; subtitle: string }> = {
    en: {
      all: `All (${totalCount})`,
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about renting and hosting with WAYGO.ge',
    },
    ka: {
      all: `ყველა (${totalCount})`,
      title: 'ხშირად დასმული კითხვები',
      subtitle: 'ყველაფერი რაც უნდა იცოდეთ WAYGO.ge-ზე ქირაობისა და ჰოსტობის შესახებ',
    },
    ru: {
      all: `Все (${totalCount})`,
      title: 'Часто задаваемые вопросы',
      subtitle: 'Всё, что нужно знать об аренде и хостинге на WAYGO.ge',
    },
  };

  const h = headings[faqLang];

  function toggleItem(key: string) {
    setOpenItem(prev => (prev === key ? null : key));
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-primary-container/80 py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-label-sm font-bold mb-6">
            <span className="material-symbols-outlined text-[15px]">help</span>
            FAQ
          </div>
          <h1 className="text-[28px] md:text-display font-black text-white leading-tight mb-4">
            {h.title}
          </h1>
          <p className="text-white/80 text-body-md md:text-body-lg max-w-xl mx-auto leading-relaxed">
            {h.subtitle}
          </p>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="sticky top-[62px] md:top-[116px] z-20 bg-surface/95 backdrop-blur-sm border-b border-outline-variant/30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-label-sm font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container text-secondary hover:text-on-background'
            }`}
          >
            {h.all}
          </button>
          {FAQ_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-label-sm font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container text-secondary hover:text-on-background'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
              {cat.label[faqLang]}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ list */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {displayed.map(cat => (
          <section key={cat.id}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <span className="material-symbols-outlined text-[18px] text-primary">{cat.icon}</span>
              </div>
              <h2 className="text-h3 font-black text-on-background">{cat.label[faqLang]}</h2>
            </div>

            <div className="space-y-2">
              {cat.items.map((item, idx) => {
                const key = `${cat.id}-${idx}`;
                const isOpen = openItem === key;
                return (
                  <div
                    key={key}
                    className={`rounded-2xl border transition-all duration-200 ${
                      isOpen
                        ? 'border-primary/30 bg-white shadow-card'
                        : 'border-outline-variant/40 bg-white hover:border-primary/20 hover:shadow-sm'
                    }`}
                  >
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="font-bold text-[15px] text-on-background leading-snug pr-2">
                        {item.q[faqLang]}
                      </span>
                      <span
                        className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 transition-transform duration-200 ${
                          isOpen ? 'text-primary rotate-180' : 'text-secondary'
                        }`}
                      >
                        expand_more
                      </span>
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-5 pb-5 pt-0 border-t border-outline-variant/20">
                        <p className="text-body-md text-secondary leading-relaxed mt-3">
                          {item.a[faqLang]}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="rounded-2xl bg-primary/5 border border-primary/15 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <span className="material-symbols-outlined text-[32px] text-primary">support_agent</span>
            <div>
              <p className="font-black text-h3 text-on-background">
                {faqLang === 'ka' ? 'კიდევ გაქვთ კითხვები?' : faqLang === 'ru' ? 'Остались вопросы?' : 'Still have questions?'}
              </p>
              <p className="text-label-sm text-secondary mt-0.5">
                {faqLang === 'ka' ? 'ჩვენი გუნდი მზადაა დასახმარებლად.' : faqLang === 'ru' ? 'Наша команда готова помочь.' : 'Our team is ready to help.'}
              </p>
            </div>
          </div>
          <a
            href="mailto:info@waygo.ge"
            className="shrink-0 flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-label-bold hover:bg-primary/90 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">mail</span>
            info@waygo.ge
          </a>
        </div>
      </div>
    </div>
  );
}
