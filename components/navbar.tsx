'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useLang } from '@/components/lang-provider';
import { useState, useRef, useEffect } from 'react';
import type { Lang } from '@/lib/i18n';

const LANG_OPTIONS: { value: Lang; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ka', label: 'ქართული', flag: '🇬🇪' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
];

function NavPill({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center rounded-xl px-5 py-2.5 text-[15px] font-semibold transition-all ${
        isActive
          ? 'bg-white text-primary shadow-sm border border-slate-200/80'
          : 'text-slate-600 hover:bg-white/80 hover:text-primary'
      }`}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const { lang, t, setLang } = useLang();
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const role = (session?.user as any)?.role;
  const isVerified = (session?.user as any)?.isVerified as boolean | undefined;
  const initial = session?.user?.name?.[0]?.toUpperCase() ?? '?';
  // currentLang reserved for future use;

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
<nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between px-4 md:px-12 py-1 max-w-screen-2xl mx-auto">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-website.svg" alt="WAYGO.GE" className="h-[54px] md:h-[108px] w-auto" />
        </Link>

        {/* Center nav — pill group */}
        <div className="hidden md:flex items-center gap-1 rounded-2xl bg-slate-100/80 px-1.5 py-1.5">
          <NavPill href="/cars">{t.nav.cars}</NavPill>
          {session && <NavPill href="/dashboard">{t.nav.dashboard}</NavPill>}
          {role === 'ADMIN' && (
            <NavPill href="/admin">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                {t.nav.admin}
              </span>
            </NavPill>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language dropdown */}
          <div ref={langRef} className="relative hidden md:block">
            <button
              onClick={() => setLangOpen(v => !v)}
className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-white font-bold text-[13px] hover:bg-white/10 hover:text-white transition-all border border-white/30 cursor-pointer"
            >
              <span className="uppercase font-black">{lang}</span>
              <span className={`material-symbols-outlined text-[15px] text-slate-400 transition-transform ${langOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border bg-white shadow-card-hover z-50 p-1 overflow-hidden">
                {LANG_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setLang(opt.value); setLangOpen(false); }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-label-bold font-semibold transition ${
                      lang === opt.value
                        ? 'bg-primary-fixed/40 text-primary'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-7 text-center text-[11px] font-black uppercase tracking-wider text-slate-500">{opt.value}</span>
                    {opt.label}
                    {lang === opt.value && (
                      <span className="material-symbols-outlined ml-auto text-[16px] text-primary">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {session ? (
            <div ref={userRef} className="relative">
              <button
                onClick={() => setUserOpen(!userOpen)}
className="flex items-center gap-2.5 border border-white/30 rounded-full pl-2 pr-4 py-1.5 hover:border-white/60 hover:bg-white/10 transition-all cursor-pointer"
              >
                <span className="relative">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-white text-sm font-black">
                    {initial}
                  </span>
                  {session && isVerified === false && (
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-amber-400 border-2 border-white" title={t.kyc.unverifiedBadge} />
                  )}
                </span>
                <span className="hidden sm:block font-semibold text-white text-[14px]">
                  {session.user.name?.split(' ')[0]}
                </span>
<span className="material-symbols-outlined text-[16px] text-white/70">expand_more</span>
              </button>
              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border bg-white shadow-card-hover z-50 p-1.5">
                    <div className="px-3 py-2 mb-1">
                      <p className="font-extrabold text-label-bold text-on-background truncate">{session.user.name}</p>
                      <p className="text-label-sm text-secondary truncate">{session.user.email}</p>
                    </div>
                    <hr className="border-slate-100 mb-1" />
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-label-bold font-semibold hover:bg-surface-container-low transition"
                      onClick={() => setUserOpen(false)}
                    >
                      <span className="material-symbols-outlined text-[18px] text-slate-500">dashboard</span>
                      {t.nav.dashboard}
                    </Link>
                    {role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-label-bold font-semibold text-primary hover:bg-primary-fixed/40 transition"
                        onClick={() => setUserOpen(false)}
                      >
                        <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                        {t.nav.admin}
                      </Link>
                    )}
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={async () => { setUserOpen(false); await signOut({ redirect: false }); window.location.href = '/'; }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-label-bold font-semibold text-error hover:bg-error-container/40 transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      {t.nav.signOut}
                    </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="font-semibold text-[14px] text-slate-600 hover:text-primary px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-all">
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className="bg-primary-container text-white px-5 py-2.5 rounded-xl font-bold text-[14px] hover:bg-primary active:scale-95 transition-all"
              >
                {t.nav.register}
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="p-2 md:hidden text-slate-500 hover:text-primary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4">
          <div className="mt-3 space-y-1">
            <MobileLink href="/cars" onClick={() => setMobileOpen(false)}>{t.nav.cars}</MobileLink>
            {session ? (
              <>
                <MobileLink href="/dashboard" onClick={() => setMobileOpen(false)}>{t.nav.dashboard}</MobileLink>
                {role === 'ADMIN' && (
                  <MobileLink href="/admin" onClick={() => setMobileOpen(false)}>{t.nav.admin}</MobileLink>
                )}
                <button
                  onClick={async () => { setMobileOpen(false); await signOut({ redirect: false }); window.location.href = '/'; }}
                  className="w-full text-left rounded-xl px-4 py-2.5 text-label-bold font-semibold text-error hover:bg-error-container/30 transition"
                >
                  {t.nav.signOut}
                </button>
              </>
            ) : (
              <>
                <MobileLink href="/login" onClick={() => setMobileOpen(false)}>{t.nav.login}</MobileLink>
                <MobileLink href="/register" onClick={() => setMobileOpen(false)}>{t.nav.register}</MobileLink>
              </>
            )}
            {/* Mobile language selector */}
            <div className="pt-2 border-t border-slate-100 mt-2">
              <p className="px-4 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Language</p>
              {LANG_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setLang(opt.value); setMobileOpen(false); }}
                  className={`w-full text-left rounded-xl px-4 py-2.5 text-label-bold font-semibold transition flex items-center gap-2 ${
                    lang === opt.value ? 'text-primary bg-primary-fixed/30' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-6 text-center text-[11px] font-black uppercase">{opt.value}</span>
                  {opt.label}
                  {lang === opt.value && (
                    <span className="material-symbols-outlined ml-auto text-[16px] text-primary">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-xl px-4 py-2.5 text-label-bold font-semibold text-slate-700 hover:bg-slate-50 transition"
    >
      {children}
    </Link>
  );
}
