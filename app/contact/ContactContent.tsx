'use client';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';

export function ContactContent() {
  const { t } = useLang();

  return (
    <main className="pt-[62px] md:pt-[73px] min-h-screen bg-surface pb-16">
      <div className="bg-primary py-10 px-4">
        <div className="mx-auto max-w-3xl">
          <nav className="text-sm text-white/70 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            {' / '}
            <span>{t.contact.title}</span>
          </nav>
          <h1 className="text-h1 font-extrabold text-white">{t.contact.title}</h1>
          <p className="text-body-lg mt-3 text-white/80 max-w-2xl leading-relaxed">{t.contact.subtitle}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">

        {/* Contact channels */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-outline-variant/40 bg-white p-6 shadow-card">
            <span className="material-symbols-outlined text-primary text-[32px] mb-3 block">email</span>
            <h2 className="text-h3 font-bold text-on-background mb-2">{t.contact.emailTitle}</h2>
            <p className="text-secondary text-body-md mb-4 leading-relaxed">{t.contact.emailText}</p>
            <a
              href="mailto:info@waygo.ge"
              className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              info@waygo.ge
            </a>
          </div>

          <div className="rounded-2xl border border-outline-variant/40 bg-white p-6 shadow-card">
            <span className="material-symbols-outlined text-primary text-[32px] mb-3 block">support_agent</span>
            <h2 className="text-h3 font-bold text-on-background mb-2">{t.contact.chatTitle}</h2>
            <p className="text-secondary text-body-md mb-4 leading-relaxed">{t.contact.chatText}</p>
            <span className="text-label-sm text-secondary">{t.contact.chatHours}</span>
          </div>
        </div>

        {/* FAQ link */}
        <div className="rounded-2xl border border-outline-variant/40 bg-white p-6 shadow-card flex items-start gap-4">
          <span className="material-symbols-outlined text-primary text-[32px] shrink-0">help</span>
          <div>
            <h2 className="text-h3 font-bold text-on-background mb-2">{t.contact.faqTitle}</h2>
            <p className="text-secondary text-body-md mb-4 leading-relaxed">{t.contact.faqText}</p>
            <Link href="/faq" className="text-primary font-bold hover:underline flex items-center gap-1">
              {t.contact.faqBtn}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Company info */}
        <div className="rounded-2xl border border-outline-variant/40 bg-white p-6 shadow-card">
          <h2 className="text-h3 font-bold text-on-background mb-4">{t.contact.companyTitle}</h2>
          <dl className="space-y-2 text-body-md text-secondary">
            <div className="flex gap-2">
              <dt className="font-semibold text-on-background min-w-[120px]">Company</dt>
              <dd>WAYGO Georgia</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-on-background min-w-[120px]">Location</dt>
              <dd>Tbilisi, Georgia</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-on-background min-w-[120px]">Email</dt>
              <dd><a href="mailto:info@waygo.ge" className="text-primary hover:underline">info@waygo.ge</a></dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-on-background min-w-[120px]">Languages</dt>
              <dd>English · ქართული · Русский</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-on-background min-w-[120px]">Hours</dt>
              <dd>Daily 09:00–21:00 (GET, UTC+4)</dd>
            </div>
          </dl>
        </div>

      </div>
    </main>
  );
}
