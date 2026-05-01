'use client';
import { CalendarX } from 'lucide-react';
import { useLang } from '@/components/lang-provider';
import { gel } from '@/lib/utils';

type Booking = {
  id: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  startDate: Date;
  endDate: Date;
  status: string;
  totalPrice: number;
  createdAt: Date;
  guest: { fullName: string; email: string | null };
  insurancePolicy: { planType: string; status: string } | null;
};

export function AdminBookingsContent({ bookings }: { bookings: Booking[] }) {
  const { t } = useLang();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] md:text-3xl font-black text-slate-950">{t.admin.bookings}</h1>
        <p className="mt-1 text-sm text-slate-500">{bookings.length} {t.admin.totalBookingsLabel}</p>
      </div>

      <div className="rounded-3xl border bg-white shadow-soft overflow-hidden">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <CalendarX size={40} className="mb-3" />
            <p className="font-semibold">{t.admin.noBookings}</p>
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
                  <th className="px-6 py-3 text-left">{t.admin.amount}</th>
                  <th className="px-6 py-3 text-left">{t.admin.created}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
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
                      <BookingStatusBadge status={b.status} />
                    </td>
                    <td className="px-6 py-4">
                      {b.insurancePolicy ? (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 capitalize">
                          {b.insurancePolicy.planType}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-black">{gel(b.totalPrice)}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(b.createdAt).toLocaleDateString('en-GB')}
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

function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
    completed: 'bg-blue-50 text-blue-700',
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}
