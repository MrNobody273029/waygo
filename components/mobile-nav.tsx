'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useLang } from '@/components/lang-provider';
import { useCurrency } from '@/components/currency-provider';
import { CURRENCY_OPTIONS, type Currency } from '@/lib/currency';
import { useState, useEffect, useRef } from 'react';
import type { Lang } from '@/lib/i18n';

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ka', label: 'ქართული' },
  { value: 'ru', label: 'Русский' },
];

const LOCALE_PAGES = new Set(['/', '/cars/tbilisi', '/cars/batumi', '/cars/kutaisi']);

function getLocaleUrl(currentPath: string, target: Lang): string {
  const withoutLocale = currentPath.replace(/^\/(ru|ka)(\/|$)/, '/').replace(/\/$/, '') || '/';
  if (target === 'en') return withoutLocale || '/';
  return LOCALE_PAGES.has(withoutLocale)
    ? `/${target}${withoutLocale === '/' ? '' : withoutLocale}`
    : withoutLocale || '/';
}

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { lang, t, setLang } = useLang();
  const { currency, setCurrency } = useCurrency();
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // ALL effects must be before any early return
  useEffect(() => {
    if (!sheetOpen) return;
    function handler(e: MouseEvent | TouchEvent) {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setSheetOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [sheetOpen]);

  useEffect(() => { setSheetOpen(false); }, [pathname]);

  // Now safe to return early
  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return null;

  const role = (session?.user as any)?.role;
  const initial = session?.user?.name?.[0]?.toUpperCase() ?? '?';

  function handleLangSwitch(locale: Lang) {
    setLang(locale);
    router.push(getLocaleUrl(pathname, locale));
  }

  function handleCurrencySwitch(c: Currency) {
    setCurrency(c);
  }

  async function handleSignOut() {
    setSheetOpen(false);
    await signOut({ redirect: false });
    window.location.href = '/';
  }

  const navItems = [
    { href: '/cars', icon: 'directions_car', label: t.mobileNav.explore },
    { href: '/blog', icon: 'article', label: t.mobileNav.blog },
    { href: '/verify', icon: 'badge', label: t.mobileNav.verify },
  ];

  return (
    <>
      {/* Bottom nav bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 z-30 shadow-top mobile-nav-safe">
        <div className="flex items-stretch px-1 pt-1.5 pb-1">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${
                  active ? 'text-primary bg-primary-fixed/30' : 'text-slate-400 active:bg-slate-100'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            );
          })}

          {/* Dashboard / account button */}
          <button
            onClick={() => setSheetOpen(v => !v)}
            className={`flex flex-1 flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all cursor-pointer ${
              sheetOpen ? 'text-primary bg-primary-fixed/30' : 'text-slate-400 active:bg-slate-100'
            }`}
          >
            {session ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-container text-white text-[11px] font-black">
                {initial}
              </span>
            ) : (
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: sheetOpen ? "'FILL' 1" : "'FILL' 0" }}
              >
                person
              </span>
            )}
            <span className="text-[10px] font-bold">
              {session ? t.mobileNav.dashboard : t.nav.login}
            </span>
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      {sheetOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setSheetOpen(false)}
        />
      )}

      {/* Slide-up sheet — uses inline style for transform so Tailwind purging can't drop it */}
      <div
        ref={sheetRef}
        className="md:hidden fixed left-0 right-0 z-50 bg-white rounded-t-3xl shadow-[0_-8px_40px_rgba(15,23,42,0.15)] transition-transform duration-300 ease-out mobile-nav-safe"
        style={{ bottom: 0, transform: sheetOpen ? 'translateY(0)' : 'translateY(100%)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="px-4 pb-6 pt-1 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
          {/* User info */}
          {session && (
            <div className="flex items-center gap-3 px-3 py-3 mb-1">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-white font-black text-sm flex-shrink-0">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-on-background truncate">{session.user.name}</p>
                <p className="text-[12px] text-secondary truncate">{session.user.email}</p>
              </div>
            </div>
          )}

          {/* Login / Register */}
          {!session && (
            <div className="flex gap-2 mb-2">
              <Link href="/login" onClick={() => setSheetOpen(false)}
                className="flex-1 rounded-xl border border-outline-variant px-4 py-2.5 text-center text-sm font-bold text-on-background hover:bg-slate-50 transition">
                {t.nav.login}
              </Link>
              <Link href="/register" onClick={() => setSheetOpen(false)}
                className="flex-1 rounded-xl bg-primary-container text-white px-4 py-2.5 text-center text-sm font-bold hover:bg-primary transition">
                {t.nav.register}
              </Link>
            </div>
          )}

          {/* Dashboard */}
          {session && (
            <Link href="/dashboard" onClick={() => setSheetOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-on-background hover:bg-surface-container-low transition">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-fixed/20">
                <span className="material-symbols-outlined text-[18px] text-primary-container">dashboard</span>
              </span>
              {t.nav.dashboard}
            </Link>
          )}

          {/* Admin */}
          {role === 'ADMIN' && (
            <Link href="/admin" onClick={() => setSheetOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-primary hover:bg-primary-fixed/20 transition">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-fixed/20">
                <span className="material-symbols-outlined text-[18px] text-primary-container">admin_panel_settings</span>
              </span>
              {t.nav.admin}
            </Link>
          )}

          <div className="h-px bg-slate-100 my-2" />

          {/* Language */}
          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-secondary mb-1">Language</p>
          <div className="flex gap-1.5 px-1">
            {LANG_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => handleLangSwitch(opt.value)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-black transition cursor-pointer ${
                  lang === opt.value ? 'bg-primary-fixed/30 text-primary' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}>
                {opt.value.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="h-px bg-slate-100 my-2" />

          {/* Currency */}
          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-secondary mb-1">{t.booking.currencyLabel}</p>
          <div className="flex gap-1.5 px-1">
            {CURRENCY_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => handleCurrencySwitch(opt.value)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-black transition cursor-pointer ${
                  currency === opt.value ? 'bg-primary-fixed/30 text-primary' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}>
                {opt.value}
              </button>
            ))}
          </div>

          {/* Sign out */}
          {session && (
            <>
              <div className="h-px bg-slate-100 my-2" />
              <button onClick={handleSignOut}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-error hover:bg-error-container/30 transition cursor-pointer w-full text-left">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-error-container/30">
                  <span className="material-symbols-outlined text-[18px] text-error">logout</span>
                </span>
                {t.nav.signOut}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
