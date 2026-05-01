'use client';
import { gel } from '@/lib/utils';
import { useLang } from '@/components/lang-provider';
import { Users, CalendarDays, Car, TrendingUp } from 'lucide-react';

type Booking = { id: string; carBrand: string; carModel: string; guest: { fullName: string }; status: string; totalPrice: number };
type User = { id: string; fullName: string; email: string | null; country: string; role: string; createdAt: Date };

export function AdminOverviewContent({
  userCount, bookingCount, activeCarCount, revenue, recentBookings, recentUsers,
}: {
  userCount: number;
  bookingCount: number;
  activeCarCount: number;
  revenue: number;
  recentBookings: Booking[];
  recentUsers: User[];
}) {
  const { t } = useLang();

  const statCards = [
    { label: t.admin.totalUsers, value: userCount.toString(), icon: Users, color: 'bg-primary-fixed/60 text-primary' },
    { label: t.admin.totalBookings, value: bookingCount.toString(), icon: CalendarDays, color: 'bg-tertiary-fixed/40 text-tertiary' },
    { label: t.admin.activeCars, value: activeCarCount.toString(), icon: Car, color: 'bg-amber-50 text-amber-700' },
    { label: t.admin.totalRevenue, value: gel(revenue), icon: TrendingUp, color: 'bg-surface-container text-secondary' },
  ];

  return (
    <div className="space-y-5 md:space-y-8">
      <div>
        <h1 className="text-[22px] md:text-3xl font-black text-slate-950">{t.admin.overview}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.admin.platformStats}</p>
      </div>

      <div className="grid gap-3 md:gap-5 grid-cols-2 xl:grid-cols-4">
        {statCards.map(card => (
          <div key={card.label} className="rounded-3xl border bg-white p-4 md:p-6 shadow-soft">
            <div className={`inline-flex rounded-2xl p-2.5 ${card.color}`}>
              <card.icon size={18} />
            </div>
            <p className="mt-3 md:mt-4 text-xs md:text-sm font-semibold text-slate-500">{card.label}</p>
            <p className="mt-1 text-[22px] md:text-3xl font-black text-slate-950">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:gap-6 xl:grid-cols-[1fr_340px]">
        <div className="rounded-3xl border bg-white shadow-soft">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-black">{t.admin.recentBookings}</h2>
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
                    <th className="px-6 py-3 text-left">{t.admin.amount}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentBookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-semibold">{b.carBrand} {b.carModel}</td>
                      <td className="px-6 py-3.5 text-slate-600">{b.guest.fullName}</td>
                      <td className="px-6 py-3.5"><StatusBadge status={b.status} /></td>
                      <td className="px-6 py-3.5 font-bold">{gel(b.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-3xl border bg-white shadow-soft">
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-black">{t.admin.recentUsers}</h2>
          </div>
          {recentUsers.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-400">{t.admin.noUsers}</p>
          ) : (
            <div className="divide-y">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 px-6 py-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-xs font-black text-primary">
                    {u.fullName[0].toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{u.fullName}</p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                  </div>
                  <RoleBadge role={u.role} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-tertiary-fixed/40 text-tertiary',
    rejected: 'bg-error-container/40 text-error',
    cancelled: 'bg-slate-100 text-slate-600',
    completed: 'bg-primary-fixed/60 text-primary',
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
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
