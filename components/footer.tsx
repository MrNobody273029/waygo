'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';
import { termsContent } from '@/lib/terms';
import type { TermsLang } from '@/lib/terms';

export function Footer() {
  const { t, lang } = useLang();
  const router = useRouter();
  const termsLang = (lang as TermsLang) in termsContent.title ? (lang as TermsLang) : 'en';

  const policies = [
    { text: t.footer.p1, href: '/safety' },
    { text: t.footer.p2, href: '/insurance-terms' },
    { text: t.footer.p3, href: '/host-rules' },
    { text: t.footer.p4, href: '/guest-rules' },
    { text: t.bookingDetail.cancelPolicyLink, href: '/cancellation-policy' },
    { text: termsContent.title[termsLang], href: '/terms' },
    { text: t.footer.faq, href: '/faq' },
  ];

  return (
<footer className="w-full border-t border-white/10 bg-transparent pb-20 md:pb-0">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-12 py-10 md:py-16">

        {/* Brand — mobile only */}
        <div className="mb-8 md:mb-0 md:contents">
          <div className="md:hidden">
<span className="text-lg font-black text-white drop-shadow-md">
                WAYGO<span className="text-primary">.ge</span>
            </span>
            <p className="mt-2 text-[13px] text-white/75 drop-shadow-md leading-relaxed max-w-xs">
              {t.footer.tagline}
            </p>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-6">

          {/* Brand — desktop only */}
          <div className="hidden md:block col-span-1">
<span className="text-lg font-black text-white drop-shadow-md">
                WAYGO<span className="text-primary">.ge</span>
            </span>
            <p className="mt-4 text-label-sm text-white/75 drop-shadow-md leading-relaxed">
              {t.footer.tagline}
            </p>
          </div>

          {/* Locations */}
          <div>
            <h5 className="font-bold text-[13px] md:text-label-bold text-white drop-shadow-md mb-3 md:mb-4">{t.footer.locTitle}</h5>
            <ul className="space-y-2 text-[12px] md:text-label-sm text-white/75">
              {([['tbilisi', t.footer.loc1], ['batumi', t.footer.loc2], ['kutaisi', t.footer.loc3]] as [string, string][]).map(([slug, label]) => (
                <li key={slug}>
                  <Link href={`/cars/${slug}`} className="hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
            <h5 className="font-bold text-[13px] md:text-label-bold text-white drop-shadow-md mb-3 md:mb-4 mt-5">{t.footer.airportTitle}</h5>
            <ul className="space-y-2 text-[12px] md:text-label-sm text-white/75">
              <li><Link href="/cars/tbilisi-airport" className="hover:text-primary transition-colors">{t.footer.airport1}</Link></li>
              <li><Link href="/cars/batumi-airport" className="hover:text-primary transition-colors">{t.footer.airport2}</Link></li>
              <li><Link href="/cars/kutaisi-airport" className="hover:text-primary transition-colors">{t.footer.airport3}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h5 className="font-bold text-[13px] md:text-label-bold text-white drop-shadow-md mb-3 md:mb-4">{t.footer.companyTitle}</h5>
            <ul className="space-y-2 text-[12px] md:text-label-sm text-white/75">
              <li><Link href="/about" className="hover:text-primary transition-colors">{t.footer.about}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">{t.footer.contact}</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">{t.footer.faq}</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h5 className="font-bold text-[13px] md:text-label-bold text-white drop-shadow-md mb-3 md:mb-4">{t.footer.policyTitle}</h5>
            <ul className="space-y-2 text-[12px] md:text-label-sm text-white/75">
              {policies.map(({ text, href }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-primary transition-colors">{text}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-bold text-[13px] md:text-label-bold text-white drop-shadow-md mb-3 md:mb-4">{t.footer.contactTitle}</h5>
            <ul className="space-y-2 text-[12px] md:text-label-sm text-white/75">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] md:text-[16px]">mail</span>
                <a href="mailto:info@waygo.ge" className="hover:text-primary transition-colors">info@waygo.ge</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] md:text-[16px]">call</span> +995 32 2XX XXX
              </li>
            </ul>
          </div>
        </div>
      </div>

<div className="max-w-screen-2xl mx-auto px-4 md:px-12 py-4 md:py-6 border-t border-white/10">
      <p className="text-[11px] md:text-label-sm text-white drop-shadow-md text-center">
  © {new Date().getFullYear()} {t.footer.copyright}
</p>
      </div>
    </footer>
  );
}
