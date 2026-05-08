'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gel } from '@/lib/utils';
import { useLang } from '@/components/lang-provider';

type Owner = {
  id: string; fullName: string; email: string | null; phone: string | null;
  country: string; hostVerificationStatus: string; isVerified: boolean;
};
type Booking = {
  id: string; startDate: string; endDate: string; totalPrice: number; status: string; createdAt: string;
  cancelledAt: string | null;
  guest: { fullName: string; email: string | null };
};
type Car = {
  id: string; brand: string; model: string; year: number; plateNumber: string | null;
  dailyPrice: number; location: string; carType: string; transmission: string;
  fuelType: string; seats: number; doors: number; color: string | null;
  steeringWheel: string; estimatedValueUsd: number | null; isActive: boolean;
  listingStatus: string; listingRejectionComment: string | null;
  imageUrls: string[]; features: string[]; createdAt: string;
  minDays: number; advanceNotice: number; returnPolicy: string;
  owner: Owner; bookings: Booking[];
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
  completed: 'bg-blue-50 text-blue-700',
  awaiting_host: 'bg-amber-50 text-amber-700',
};

export function AdminCarDetailContent({ car, totalRevenue }: { car: Car; totalRevenue: number }) {
  const router = useRouter();
  const { t } = useLang();
  const [toggling, setToggling] = useState(false);
  const [currentActive, setCurrentActive] = useState(car.isActive);

  async function toggleActive() {
    setToggling(true);
    try {
      const res = await fetch(`/api/admin/cars/${car.id}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) setCurrentActive(data.isActive);
    } finally {
      setToggling(false);
    }
  }

  const completedBookings = car.bookings.filter(b => b.status === 'completed').length;
  const activeBookings = car.bookings.filter(b => ['pending', 'confirmed', 'awaiting_host'].includes(b.status)).length;

  return (
    <div className="space-y-6 max-w-screen-lg">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/cars" className="hover:text-slate-900 transition">{t.admin.cars}</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{car.brand} {car.model} {car.year}</span>
      </div>

      {/* Header */}
      <div className="rounded-3xl border bg-white shadow-soft p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {car.imageUrls[0] && (
            <img
              src={car.imageUrls[0]}
              alt={`${car.brand} ${car.model}`}
              className="w-full sm:w-48 h-32 sm:h-32 rounded-2xl object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-slate-950">{car.brand} {car.model} {car.year}</h1>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${currentActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {currentActive ? t.admin.active : t.admin.inactive}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                car.listingStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                car.listingStatus === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                'bg-red-50 text-red-700'
              }`}>{car.listingStatus}</span>
            </div>
            {car.plateNumber && <p className="text-slate-500 text-sm font-mono">{car.plateNumber}</p>}
            <p className="text-slate-400 text-xs mt-0.5">{car.location} · Listed {new Date(car.createdAt).toLocaleDateString('en-GB')}</p>
          </div>
          <button
            onClick={toggleActive}
            disabled={toggling}
            className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 ${
              currentActive
                ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {toggling ? '…' : currentActive ? t.admin.deactivate : t.admin.activate}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t">
          {[
            { label: t.admin.dailyPriceStat, value: `${gel(car.dailyPrice)}/day` },
            { label: t.admin.totalRevenueStat, value: gel(totalRevenue) },
            { label: t.admin.completedTripsStat, value: completedBookings.toString() },
            { label: t.admin.activeNow, value: activeBookings.toString() },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="font-bold text-slate-900 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          {/* All images */}
          {car.imageUrls.length > 1 && (
            <div className="rounded-2xl border bg-white shadow-soft p-5">
              <h3 className="font-black text-base mb-3">{t.admin.allPhotos}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {car.imageUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Photo ${i + 1}`} className="aspect-square rounded-xl object-cover w-full border hover:opacity-90 transition" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Booking history */}
          <div className="rounded-2xl border bg-white shadow-soft overflow-hidden">
            <div className="border-b px-5 py-4 flex items-center justify-between">
              <h3 className="font-black text-base">{t.admin.bookingHistory}</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{car.bookings.length}</span>
            </div>
            {car.bookings.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-400">{t.admin.noBookings}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3 text-left">{t.admin.guest}</th>
                      <th className="px-5 py-3 text-left">{t.admin.dates}</th>
                      <th className="px-5 py-3 text-left">{t.admin.status}</th>
                      <th className="px-5 py-3 text-right">{t.admin.amount}</th>
                      <th className="px-5 py-3 text-left"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {car.bookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold">{b.guest.fullName}</p>
                          <p className="text-xs text-slate-400">{b.guest.email}</p>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {new Date(b.startDate).toLocaleDateString('en-GB')} –<br />
                          {new Date(b.endDate).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_BADGE[b.status] ?? 'bg-slate-100 text-slate-600'}`}>
                            {b.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-black">{gel(b.totalPrice)}</td>
                        <td className="px-5 py-3.5">
                          <Link href={`/admin/bookings/${b.id}`} className="text-xs font-bold text-primary hover:underline">{t.admin.viewBtn}</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: specs + owner */}
        <div className="space-y-5">
          {/* Specs */}
          <div className="rounded-2xl border bg-white shadow-soft p-5">
            <h3 className="font-black text-base mb-4">{t.admin.specifications}</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: t.admin.type, value: car.carType },
                { label: t.carDetail.transmission, value: car.transmission },
                { label: t.carDetail.fuelType, value: car.fuelType },
                { label: t.carDetail.seats, value: car.seats.toString() },
                { label: t.carDetail.doors, value: car.doors.toString() },
                { label: t.carDetail.color, value: car.color },
                { label: t.carDetail.steeringWheel, value: car.steeringWheel },
                { label: t.admin.minDays, value: car.minDays.toString() },
                { label: t.admin.advanceNotice, value: `${car.advanceNotice}h` },
                ...(car.estimatedValueUsd ? [{ label: t.admin.estimatedValueUsd, value: `$${car.estimatedValueUsd.toLocaleString()}` }] : []),
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="flex justify-between gap-2">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-semibold text-slate-900 capitalize">{row.value}</span>
                </div>
              ))}
            </div>
            {car.features.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-bold text-slate-500 mb-2">{t.admin.carFeatures}</p>
                <div className="flex flex-wrap gap-1.5">
                  {car.features.map(f => (
                    <span key={f} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Owner */}
          <div className="rounded-2xl border bg-white shadow-soft p-5">
            <h3 className="font-black text-base mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">person</span>
              {t.admin.owner}
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-black text-violet-700">
                {car.owner.fullName[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-900">{car.owner.fullName}</p>
                <p className="text-xs text-slate-500">{car.owner.email}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between"><span>{t.admin.phone}</span><span className="font-semibold">{car.owner.phone || '—'}</span></div>
              <div className="flex justify-between"><span>{t.admin.country}</span><span className="font-semibold">{car.owner.country}</span></div>
              <div className="flex justify-between"><span>{t.admin.hostStatus}</span>
                <span className={`font-bold ${car.owner.hostVerificationStatus === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {car.owner.hostVerificationStatus}
                </span>
              </div>
            </div>
            <Link href={`/admin/users/${car.owner.id}`} className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
              {t.admin.viewProfile}
            </Link>
          </div>

          {car.listingRejectionComment && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-bold text-red-700 mb-1">{t.admin.rejectionReason}</p>
              <p className="text-xs text-red-600 leading-relaxed">{car.listingRejectionComment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
