'use client';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';
import { useCurrency } from '@/components/currency-provider';
import type { Car } from '@/lib/sample-data';

const FUEL_ICON: Record<string, string> = {
  Hybrid: 'electric_bolt', Electric: 'ev_station',
  Diesel: 'local_gas_station', Petrol: 'local_gas_station', LPG: 'propane',
};

export function CarCard({ car }: { car: Car }) {
  const { t } = useLang();
  const { formatPrice } = useCurrency();
  const image = car.images?.[0];
  const hasTbsFree = car.airportDelivery?.tbilisi?.state === 'free';
  const hasTbsPaid = car.airportDelivery?.tbilisi?.state === 'paid';

  return (
    <Link
      href={`/cars/${car.slug ?? car.id}`}
      className="group bg-white rounded-[20px] overflow-hidden shadow-card border border-slate-100 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 active:scale-[0.98] flex flex-col"
    >
      {/* Image */}
      <div className="relative h-44 md:h-52 overflow-hidden bg-surface-container">
        {image ? (
          <img
            src={image}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[52px] text-slate-300">directions_car</span>
          </div>
        )}

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {car.ac && (
            <span className="bg-white/90 backdrop-blur-sm text-primary px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]">ac_unit</span>A/C
            </span>
          )}
          {(hasTbsFree || hasTbsPaid) && (
            <span className={`backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 ${hasTbsFree ? 'bg-primary/90 text-white' : 'bg-white/90 text-secondary'}`}>
              <span className="material-symbols-outlined text-[11px]">flight_takeoff</span>
              {hasTbsFree ? t.carDetail.freeDelivery : formatPrice(car.airportDelivery.tbilisi.price)}
            </span>
          )}
        </div>

        {/* Insurance badge */}
        <div className="absolute top-3 right-3 bg-tertiary-fixed text-on-tertiary-fixed px-2.5 py-1.5 rounded-full text-label-sm font-bold flex items-center gap-1 shadow-sm">
          <span className="material-symbols-outlined text-[13px]">shield</span>
          {t.carDetail.insuranceBadge}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-[16px] md:text-h3 font-semibold text-on-background">{car.brand} {car.model} {car.year}</h3>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              {car.verified && (
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">verified</span>
                  {t.carDetail.verifiedBadge}
                </span>
              )}
              <span className="bg-surface-container text-secondary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">
                {car.type}
              </span>
            </div>
          </div>
          {car.trips === 0 ? (
            <div className="flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-lg shrink-0">
              <span className="material-symbols-outlined text-slate-400 text-[15px]">star</span>
              <span className="font-bold text-label-bold text-slate-500">{t.reviews.newBadge}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
              <span className="material-symbols-outlined text-amber-500 text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-bold text-label-bold text-amber-700">{car.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Specs */}
        <div className="flex items-center gap-2.5 text-slate-500 text-[12px] md:text-label-sm my-3 py-3 border-y border-slate-50 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] md:text-[14px]">settings</span>
            {car.transmission === 'Automatic' ? t.becomeHost.transmissionAuto : t.becomeHost.transmissionManual}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] md:text-[14px]">person</span>
            {car.seats}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] md:text-[14px]">{FUEL_ICON[car.fuelType] ?? 'local_gas_station'}</span>
            {car.fuelType}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] md:text-[14px]">location_on</span>
            {car.location}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-[20px] md:text-h2 font-bold text-primary">{formatPrice(car.dailyPrice)}</span>
            <span className="text-[12px] md:text-label-sm text-slate-400"> {t.booking.perDay}</span>
          </div>
          <span className="bg-slate-50 hover:bg-primary hover:text-white text-primary px-4 py-2.5 md:px-5 rounded-lg font-bold text-[13px] md:text-label-bold transition-all">
            {t.common.bookNow}
          </span>
        </div>
      </div>
    </Link>
  );
}
