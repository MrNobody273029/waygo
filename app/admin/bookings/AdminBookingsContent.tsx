'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CalendarX } from 'lucide-react';
import { useLang } from '@/components/lang-provider';
import { gel } from '@/lib/utils';

type Booking = {
  id: string; carBrand: string; carModel: string; carYear: number;
  startDate: Date; endDate: Date; status: string; totalPrice: number; createdAt: Date;
  guest: { fullName: string; email: string | null };
  insurancePolicy: { planType: string; status: string } | null;
};

const STATUS_OPTIONS = ['all', 'awaiting_host', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'];

const STATUS_BADGE: Record<string, string> = {
  awaiting_host: 'bg-amber-50 text-amber-700',
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
  completed: 'bg-blue-50 text-blue-700',
};

export function AdminBookingsContent({ bookings }: { bookings: Booking[] }) {
  const { t } = useLang();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !b.carBrand.toLowerCase().includes(q) &&
        !b.carModel.toLowerCase().includes(q) &&
        !b.guest.fullName.toLowerCase().includes(q) &&
        !(b.guest.email ?? '').toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const cancelled = bookings.filter(b => b.status === 'cancelled').length;
  const active    = bookings.filter(b => ['pending', 'confirmed', 'awaiting_host'].includes(b.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-3xl font-black text-slate-950">{t.admin.bookings}</h1>
          <p className="mt-1 text-sm text-slate-500">{bookings.length} {t.admin.totalBookingsLabel} · {active} {t.admin.activeBookingsLabel} · {cancelled} {t.admin.cancelledBookingsLabel}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder={t.admin.searchBookings}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary transition"
        />
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer ${
                statusFilter === s
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {s === 'all' ? t.admin.filterAll : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border bg-white shadow-soft overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <CalendarX size={40} className="mb-3" />
            <p className="font-semibold">{search || statusFilter !== 'all' ? t.admin.noFilterBookings : t.admin.noBookings}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">{t.admin.car}</th>
                  <th className="px-6 py-3 text-left">{t.admin.guest}</th>
                  <th className="px-6 py-3 text-left">{t.admin.dates}</th>
                  <th className="px-6 py-3 text-left">{t.admin.status}</th>
                  <th className="px-6 py-3 text-left">{t.admin.insurance}</th>
                  <th className="px-6 py-3 text-right">{t.admin.amount}</th>
                  <th className="px-6 py-3 text-left">{t.admin.created}</th>
                  <th className="px-6 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => window.location.href = `/admin/bookings/${b.id}`}>
                    <td className="px-6 py-4">
                      <p className="font-bold">{b.carBrand} {b.carModel}</p>
                      <p className="text-xs text-slate-500">{b.carYear}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{b.guest.fullName}</p>
                      <p className="text-xs text-slate-500">{b.guest.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {new Date(b.startDate).toLocaleDateString('en-GB')} –<br />
                      {new Date(b.endDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_BADGE[b.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {b.insurancePolicy ? (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 capitalize">{b.insurancePolicy.planType}</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-black text-right">{gel(b.totalPrice)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(b.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <Link href={`/admin/bookings/${b.id}`} className="text-xs font-bold text-primary hover:underline">
                        {t.admin.viewBtn}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
