'use client';
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
  dailyPrice: number;
  isActive: boolean;
  createdAt: Date;
  owner: { fullName: string; email: string | null };
  bookingCount: number;
};

export function AdminCarsContent({ cars }: { cars: Car[] }) {
  const { t } = useLang();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] md:text-3xl font-black text-slate-950">{t.admin.cars}</h1>
        <p className="mt-1 text-sm text-slate-500">{cars.length} {t.admin.listedVehicles}</p>
      </div>

      <div className="rounded-3xl border bg-white shadow-soft overflow-hidden">
        {cars.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <CarFront size={40} className="mb-3" />
            <p className="font-semibold">{t.admin.noCarsYet}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">{t.admin.car}</th>
                  <th className="px-6 py-3 text-left">{t.admin.owner}</th>
                  <th className="px-6 py-3 text-left">{t.admin.location}</th>
                  <th className="px-6 py-3 text-left">{t.admin.type}</th>
                  <th className="px-6 py-3 text-left">{t.admin.dailyPrice}</th>
                  <th className="px-6 py-3 text-left">{t.admin.bookings}</th>
                  <th className="px-6 py-3 text-left">{t.admin.status}</th>
                  <th className="px-6 py-3 text-left">{t.admin.listed}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cars.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-bold">{c.brand} {c.model}</p>
                      <p className="text-xs text-slate-500">{c.year} · {c.plateNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{c.owner.fullName}</p>
                      <p className="text-xs text-slate-500">{c.owner.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{c.location}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">
                        {c.carType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black">{gel(c.dailyPrice)}</td>
                    <td className="px-6 py-4 font-semibold">{c.bookingCount}</td>
                    <td className="px-6 py-4">
                      {c.isActive ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{t.admin.active}</span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{t.admin.inactive}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString('en-GB')}
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
