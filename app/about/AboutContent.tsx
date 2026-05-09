'use client';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';

export function AboutContent() {
  const { t } = useLang();

  return (
    <main className="pt-[62px] md:pt-[120px] min-h-screen bg-surface pb-16">
      <div className="bg-primary py-10 px-4">
        <div className="mx-auto max-w-3xl">
          <nav className="text-sm text-white/70 mb-3">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            {' / '}
            <span>{t.about.title}</span>
          </nav>
          <h1 className="text-h1 font-extrabold text-white">{t.about.title}</h1>
          <p className="text-body-lg mt-3 text-white/80 max-w-2xl leading-relaxed">{t.about.subtitle}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 space-y-10">

        <section>
          <h2 className="text-h2 font-bold text-on-background mb-4">{t.about.missionTitle}</h2>
          <p className="text-body-lg text-secondary leading-relaxed">{t.about.missionText}</p>
        </section>

        <section>
          <h2 className="text-h2 font-bold text-on-background mb-4">{t.about.howTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: 'search', title: 'Browse & Book', text: 'Search verified cars in Tbilisi, Batumi, Kutaisi and across Georgia. Filter by dates, type, and price.' },
              { icon: 'verified_user', title: 'Verified Hosts', text: 'Every host completes identity verification. Every car listing is reviewed before going live.' },
              { icon: 'shield', title: 'Insurance Included', text: 'Basic insurance is included in every booking. Upgrade to Standard or Premium for extra peace of mind.' },
            ].map(item => (
              <div key={item.title} className="rounded-2xl border border-outline-variant/40 bg-white p-5 shadow-card">
                <span className="material-symbols-outlined text-primary text-[32px] mb-3 block">{item.icon}</span>
                <h3 className="font-bold text-on-background mb-2">{item.title}</h3>
                <p className="text-secondary text-body-md leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-h2 font-bold text-on-background mb-4">{t.about.whyTitle}</h2>
          <ul className="space-y-3 text-body-lg text-secondary leading-relaxed list-none">
            {[
              { bold: 'Local hosts, real cars.', text: 'Every vehicle is listed by a real Georgian owner — not a fleet company. You get local knowledge and personal service.' },
              { bold: 'Transparent pricing.', text: 'All prices shown in GEL. No hidden fees, no currency surprises. Deposit is a hold, not a charge.' },
              { bold: 'Three languages.', text: 'Our platform is fully available in English, Georgian (ქართული), and Russian (Русский).' },
              { bold: 'KYC-verified guests.', text: 'Hosts can rent with confidence — every guest completes identity verification before their first booking.' },
              { bold: 'Airport pickup.', text: 'Many hosts offer delivery to Tbilisi (TBS), Batumi (BUS), and Kutaisi (KUT) airports.' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">check_circle</span>
                <span><strong className="text-on-background">{item.bold}</strong> {item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-h2 font-bold text-on-background mb-4">{t.about.companyTitle}</h2>
          <div className="rounded-2xl border border-outline-variant/40 bg-white p-6 shadow-card space-y-3 text-body-md text-secondary">
            <p><strong className="text-on-background">Company:</strong> WAYGO Georgia</p>
            <p><strong className="text-on-background">Founded:</strong> 2024</p>
            <p><strong className="text-on-background">Headquarters:</strong> Tbilisi, Georgia</p>
            <p><strong className="text-on-background">Email:</strong> <a href="mailto:info@waygo.ge" className="text-primary hover:underline">info@waygo.ge</a></p>
            <p><strong className="text-on-background">Languages:</strong> English · ქართული · Русский</p>
          </div>
        </section>

        <div className="flex flex-wrap gap-4 pt-2">
          <Link href="/cars" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition">
            {t.about.browseBtn}
          </Link>
          <Link href="/contact" className="border-2 border-primary text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary/5 transition">
            {t.about.contactBtn}
          </Link>
        </div>
      </div>
    </main>
  );
}
