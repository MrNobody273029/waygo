'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLang } from '@/components/lang-provider';

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useLang();
  const { data: session } = useSession();
  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return null;

  const profileHref = session ? '/dashboard' : '/login';

  const items = [
    { href: '/cars', icon: 'search', label: t.mobileNav.explore },
    { href: '/verify', icon: 'badge', label: t.mobileNav.verify },
    { href: profileHref, icon: 'person', label: t.mobileNav.profile },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 z-30 shadow-top mobile-nav-safe"
    >
      <div className="flex justify-around items-center px-2 pt-2 pb-1">
        {items.map(item => {
          const active = pathname === item.href || (item.href !== '/login' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all min-w-[60px] ${
                active
                  ? 'text-primary bg-primary-fixed/40'
                  : 'text-slate-400 active:bg-slate-100'
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
      </div>
    </nav>
  );
}
