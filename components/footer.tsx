'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';

export function Footer() {
  const { t } = useLang();
  const router = useRouter();

  const policies = [
    { text: t.footer.p1, href: '/safety' },
    { text: t.footer.p2, href: '/insurance-terms' },
    { text: t.footer.p3, href: '/host-rules' },
    { text: t.footer.p4, href: '/guest-rules' },
    { text: (t.footer as any).p5, href: '/how-it-works' },
    { text: t.bookingDetail.cancelPolicyLink, href: '/cancellation-policy' },
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">

          {/* Brand — desktop only */}
          <div className="hidden md:block">
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
              {[t.footer.loc1, t.footer.loc2, t.footer.loc3, t.footer.loc4].map(city => (
                <li key={city}>
                  <Link
                    href={`/cars?city=${encodeURIComponent(city)}`}
                    className="hover:text-primary transition-colors"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h5 className="font-bold text-[13px] md:text-label-bold text-white drop-shadow-md mb-3 md:mb-4">{t.footer.policyTitle}</h5>
            <ul className="space-y-2 text-[12px] md:text-label-sm text-white/75">
              {policies.map(({ text, href }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-primary transition-colors">
                    {text}
                  </Link>
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
                <a href="mailto:support@waygo.ge" className="hover:text-primary transition-colors">support@waygo.ge</a>
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
