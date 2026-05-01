'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useLang } from '@/components/lang-provider';
import { LayoutDashboard, Users, CalendarDays, Car, LogOut, ExternalLink, ShieldCheck, Mail } from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLang();

  const navItems = [
    { href: '/admin',               icon: LayoutDashboard, label: t.admin.overview,    exact: true },
    { href: '/admin/users',         icon: Users,           label: t.admin.users },
    { href: '/admin/bookings',      icon: CalendarDays,    label: t.admin.bookings },
    { href: '/admin/cars',          icon: Car,             label: t.admin.cars },
    { href: '/admin/verifications', icon: ShieldCheck,     label: 'Verify' },
    { href: '/admin/emails',        icon: Mail,            label: 'Emails' },
  ];

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex fixed bottom-0 left-0 top-[120px] z-30 w-64 flex-col border-r border-white/10 bg-slate-950">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-container">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t.admin.title}</p>
            <p className="text-sm font-black text-white">WAYGO.ge</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive(item.href, item.exact)
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-4 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition"
          >
            <ExternalLink size={17} />
            {t.admin.backToSite}
          </Link>
          <button
            onClick={async () => { await signOut({ redirect: false }); window.location.href = '/'; }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
          >
            <LogOut size={17} />
            {t.nav.signOut}
          </button>
          {session && (
            <div className="mt-3 flex items-center gap-2.5 rounded-xl px-3 py-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container text-xs font-black text-white">
                {session.user.name?.[0]?.toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">{session.user.name}</p>
                <p className="text-xs text-slate-400">{t.admin.administrator}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile bottom nav ───────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950 border-t border-white/10 mobile-nav-safe">
        <div className="flex items-center justify-around px-1 pt-2 pb-1">
          {navItems.map(item => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[44px] ${
                  active ? 'text-white bg-white/15' : 'text-slate-400 active:bg-white/5'
                }`}
              >
                <item.icon size={20} />
                <span className="text-[9px] font-bold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
