'use client';
import Link from 'next/link';
import { gel } from '@/lib/utils';
import { useLang } from '@/components/lang-provider';
import { Users, CalendarDays, Car, TrendingUp, ShieldAlert, XCircle, Activity, ArrowUpRight } from 'lucide-react';

type Booking = {
  id: string; carBrand: string; carModel: string; status: string; totalPrice: number; createdAt: Date;
  guest: { fullName: string };
};
type User = { id: string; fullName: string; email: string | null; country: string; role: string; createdAt: Date };

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  awaiting_host: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
  completed: 'bg-blue-50 text-blue-700',
};

export function AdminOverviewContent({
  userCount, bookingCount, activeCarCount, revenue, refunds,
  recentBookings, recentUsers,
  pendingVerifCount, pendingCarsCount, cancelledCount, activeBookingsCount,
}: {
  userCount: number; bookingCount: number; activeCarCount: number;
  revenue: number; refunds: number;
  recentBookings: Booking[]; recentUsers: User[];
  pendingVerifCount: number; pendingCarsCount: number;
  cancelledCount: number; activeBookingsCount: number;
}) {
  const { t } = useLang();
  const netRevenue = revenue - refunds;

  const statCards = [
    { label: t.admin.totalUsers,    value: userCount.toString(),        icon: Users,        color: 'bg-primary-fixed/60 text-primary',      href: '/admin/users' },
    { label: t.admin.totalBookings, value: bookingCount.toString(),     icon: CalendarDays, color: 'bg-tertiary-fixed/40 text-tertiary',    href: '/admin/bookings' },
    { label: t.admin.activeCars,    value: activeCarCount.toString(),   icon: Car,          color: 'bg-amber-50 text-amber-700',            href: '/admin/cars' },
    { label: t.admin.netRevenue,      value: gel(netRevenue),             icon: TrendingUp,   color: 'bg-emerald-50 text-emerald-700',        href: '/admin/transactions' },
  ];

  const alertCards = [
    { label: t.admin.pendingVerificationsLabel, value: pendingVerifCount, isPending: true,  icon: ShieldAlert, color: pendingVerifCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-400', href: '/admin/verifications' },
    { label: t.admin.pendingCarsLabel,           value: pendingCarsCount,  isPending: true,  icon: Car,         color: pendingCarsCount > 0  ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-400', href: '/admin/verifications' },
    { label: t.admin.activeBookingsLabel,        value: activeBookingsCount, isPending: false, icon: Activity,  color: 'bg-blue-50 text-blue-700',  href: '/admin/bookings' },
    { label: t.admin.cancelledBookingsLabel,     value: cancelledCount,    isPending: false, icon: XCircle,     color: 'bg-slate-50 text-slate-500', href: '/admin/bookings' },
  ];

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-3xl font-black text-slate-950">{t.admin.overview}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.admin.platformStats}</p>
        </div>
        <p className="text-xs text-slate-400 mt-1">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Primary stats */}
      <div className="grid gap-3 md:gap-5 grid-cols-2 xl:grid-cols-4">
        {statCards.map(card => (
          <Link key={card.label} href={card.href} className="rounded-3xl border bg-white p-4 md:p-6 shadow-soft hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className={`inline-flex rounded-2xl p-2.5 ${card.color}`}>
                <card.icon size={18} />
              </div>
              <ArrowUpRight size={14} className="text-slate-300 group-hover:text-slate-500 transition" />
            </div>
            <p className="text-xs md:text-sm font-semibold text-slate-500">{card.label}</p>
            <p className="mt-1 text-[22px] md:text-3xl font-black text-slate-950">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Revenue breakdown */}
      <div className="rounded-3xl border bg-white shadow-soft p-5 md:p-6">
        <h2 className="font-black text-base mb-4">{t.admin.revenueBreakdown}</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t.admin.grossPayments, value: gel(revenue), sub: t.admin.totalBookings, color: 'text-slate-900' },
            { label: t.admin.refundsIssued, value: gel(refunds), sub: '', color: 'text-error' },
            { label: t.admin.netRevenue,    value: gel(netRevenue), sub: '', color: 'text-tertiary' },
          ].map(r => (
            <div key={r.label} className="border-l pl-4 first:border-l-0 first:pl-0">
              <p className="text-xs font-semibold text-slate-500">{r.label}</p>
              <p className={`text-xl font-black mt-0.5 ${r.color}`}>{r.value}</p>
              <p className="text-[11px] text-slate-400">{r.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alert / action items */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {alertCards.map(card => (
          <Link key={card.label} href={card.href} className="rounded-2xl border bg-white p-4 shadow-soft hover:shadow-md transition group flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
              <card.icon size={17} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-950">{card.value}</p>
              <p className="text-[11px] font-semibold text-slate-500 leading-tight">{card.label}</p>
            </div>
            {(card.isPending && card.value > 0) && (
              <span className="ml-auto flex h-2 w-2 rounded-full bg-amber-500 shrink-0" />
            )}
          </Link>
        ))}
      </div>

      {/* Recent bookings + users */}
      <div className="grid gap-4 md:gap-6 xl:grid-cols-[1fr_340px]">
        <div className="rounded-3xl border bg-white shadow-soft">
          <div className="border-b px-6 py-5 flex items-center justify-between">
            <h2 className="text-lg font-black">{t.admin.recentBookings}</h2>
            <Link href="/admin/bookings" className="text-xs font-bold text-primary hover:underline">{t.admin.viewAll}</Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-400">{t.admin.noBookings}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">{t.admin.car}</th>
                    <th className="px-6 py-3 text-left">{t.admin.guest}</th>
                    <th className="px-6 py-3 text-left">{t.admin.status}</th>
                    <th className="px-6 py-3 text-right">{t.admin.amount}</th>
                    <th className="px-6 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentBookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => window.location.href = `/admin/bookings/${b.id}`}>
                      <td className="px-6 py-3.5 font-semibold">{b.carBrand} {b.carModel}</td>
                      <td className="px-6 py-3.5 text-slate-600">{b.guest.fullName}</td>
                      <td className="px-6 py-3.5">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_BADGE[b.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-right">{gel(b.totalPrice)}</td>
                      <td className="px-6 py-3.5 text-xs text-slate-400">{new Date(b.createdAt).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border bg-white shadow-soft">
          <div className="border-b px-6 py-5 flex items-center justify-between">
            <h2 className="text-lg font-black">{t.admin.recentUsers}</h2>
            <Link href="/admin/users" className="text-xs font-bold text-primary hover:underline">{t.admin.viewAll}</Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-400">{t.admin.noUsers}</p>
          ) : (
            <div className="divide-y">
              {recentUsers.map(u => (
                <Link key={u.id} href={`/admin/users/${u.id}`} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 transition">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-xs font-black text-primary">
                    {u.fullName[0].toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{u.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                  </div>
                  <RoleBadge role={u.role} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    ADMIN: 'bg-error-container/40 text-error',
    HOST: 'bg-tertiary-fixed/40 text-tertiary',
    USER: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${map[role] ?? 'bg-slate-100 text-slate-600'}`}>
      {role}
    </span>
  );
}
