'use client';
import { useLang } from '@/components/lang-provider';
import { termsContent } from '@/lib/terms';
import type { TermsLang } from '@/lib/terms';

export default function TermsPage() {
  const { lang } = useLang();
  const l = (lang as TermsLang) in termsContent.title ? (lang as TermsLang) : 'en';

  return (
    <main className="pt-[62px] md:pt-[73px] min-h-screen bg-surface pb-20">
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-10 md:py-16">
        <div className="mb-8">
          <h1 className="text-h1 font-extrabold text-on-background">{termsContent.title[l]}</h1>
          <p className="text-label-sm text-secondary mt-1">{termsContent.lastUpdated[l]}</p>
        </div>

        <div className="space-y-8">
          {termsContent.sections.map((s, i) => (
            <div key={i} className="rounded-2xl border border-outline-variant/40 bg-white p-6">
              <h2 className="font-extrabold text-h3 text-on-background mb-3">{s.heading[l]}</h2>
              <p className="text-body-md text-secondary leading-relaxed">{s.body[l]}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
