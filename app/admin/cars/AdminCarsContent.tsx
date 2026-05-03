'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CarFront } from 'lucide-react';
import { useLang } from '@/components/lang-provider';
import { gel } from '@/lib/utils';

type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  location: string;
  carType: string;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  color: string;
  steeringWheel: string;
  estimatedValueUsd: number | null;
  dailyPrice: number;
  isActive: boolean;
  listingStatus: string;
  createdAt: Date;
  owner: { fullName: string; email: string | null };
  bookingCount: number;
};

export function AdminCarsContent({ cars }: { cars: Car[] }) {
  const { t } = useLang();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = cars.filter(c => {
    if (statusFilter === 'active' && !c.isActive) return false;
    if (statusFilter === 'inactive' && c.isActive) return false;
    if (statusFilter === 'pending' && c.listingStatus !== 'PENDING') return false;
    if (statusFilter === 'rejected' && c.listingStatus !== 'REJECTED') return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.brand.toLowerCase().includes(q) && !c.model.toLowerCase().includes(q) && !c.owner.fullName.toLowerCase().includes(q) && !(c.plateNumber ?? '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] md:text-3xl font-black text-slate-950">{t.admin.cars}</h1>
        <p className="mt-1 text-sm text-slate-500">{cars.length} {t.admin.listedVehicles}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by car, owner or plate…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary transition"
        />
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'inactive', 'pending', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer capitalize ${
                statusFilter === s ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >{s === 'all' ? 'All' : s}</button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border bg-white shadow-soft overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <CarFront size={40} className="mb-3" />
            <p className="font-semibold">{search || statusFilter !== 'all' ? 'No cars match your filters' : t.admin.noCarsYet}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left">{t.admin.car}</th>
                  <th className="px-5 py-3 text-left">{t.admin.owner}</th>
                  <th className="px-5 py-3 text-left">{t.admin.location}</th>
                  <th className="px-5 py-3 text-left">{t.admin.type}</th>
                  <th className="px-5 py-3 text-left">Specs</th>
                  <th className="px-5 py-3 text-left">{t.admin.dailyPrice}</th>
                  <th className="px-5 py-3 text-left">{t.admin.estimatedValueUsd}</th>
                  <th className="px-5 py-3 text-left">{t.admin.bookings}</th>
                  <th className="px-5 py-3 text-left">{t.admin.status}</th>
                  <th className="px-5 py-3 text-left">{t.admin.listed}</th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => window.location.href = `/admin/cars/${c.id}`}>
                    <td className="px-5 py-4">
                      <p className="font-bold">{c.brand} {c.model}</p>
                      <p className="text-xs text-slate-500">{c.year} · {c.plateNumber}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{c.color}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{c.owner.fullName}</p>
                      <p className="text-xs text-slate-500">{c.owner.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{c.location}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">
                        {c.carType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-600">{c.transmission} · {c.fuelType}</p>
                      <p className="text-xs text-slate-500">{c.seats} seats · {c.doors} doors</p>
                      <p className="text-xs text-slate-400">{c.steeringWheel === 'right' ? 'RHD' : 'LHD'}</p>
                    </td>
                    <td className="px-5 py-4 font-black">{gel(c.dailyPrice)}</td>
                    <td className="px-5 py-4">
                      {c.estimatedValueUsd != null ? (
                        <span className="font-semibold text-emerald-700">${c.estimatedValueUsd.toLocaleString()}</span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold">{c.bookingCount}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        {c.isActive ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{t.admin.active}</span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{t.admin.inactive}</span>
                        )}
                        {c.listingStatus === 'PENDING' && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Pending</span>
                        )}
                        {c.listingStatus === 'REJECTED' && (
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">Rejected</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <Link href={`/admin/cars/${c.id}`} className="text-xs font-bold text-primary hover:underline">View →</Link>
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
