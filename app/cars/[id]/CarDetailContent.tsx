'use client';
import { BookingWidget } from '@/components/booking-widget';
import { useLang } from '@/components/lang-provider';
import { useCurrency } from '@/components/currency-provider';
import type { Car } from '@/lib/sample-data';

const FUEL_ICON: Record<string, string> = {
  Hybrid: 'electric_bolt', Electric: 'ev_station',
  Diesel: 'local_gas_station', Petrol: 'local_gas_station', LPG: 'propane',
};

function SpecChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-white p-4 shadow-card">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-fixed/30">
        <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="font-bold text-label-bold text-on-background">{value}</p>
      </div>
    </div>
  );
}

function AirportDeliveryRow({ icon, label, state, price, freeText, noneText }: {
  icon: string; label: string; state: 'none' | 'free' | 'paid'; price: number;
  freeText: string; noneText: string;
}) {
  const { formatPrice } = useCurrency();
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-[18px]">{icon}</span>
        <span className="text-label-bold font-semibold text-on-background">{label}</span>
      </div>
      {state === 'none' && (
        <span className="text-label-sm text-slate-400 font-semibold">{noneText}</span>
      )}
      {state === 'free' && (
        <span className="flex items-center gap-1 bg-primary-fixed/50 text-primary px-3 py-1 rounded-full text-label-sm font-bold">
          <span className="material-symbols-outlined text-[13px]">check_circle</span>
          {freeText}
        </span>
      )}
      {state === 'paid' && (
        <span className="flex items-center gap-1 bg-surface-container text-on-background px-3 py-1 rounded-full text-label-sm font-bold">
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
}

export function CarDetailContent({ car, availableDates }: { car: Car; availableDates?: string[] }) {
  const { t } = useLang();
  const { formatPrice } = useCurrency();

  const steeringLabel = car.steeringWheel === 'right' ? t.carDetail.steeringRight : t.carDetail.steeringLeft;
  const specItems = [
    { icon: 'person',                   label: t.carDetail.seats,         value: String(car.seats) },
    { icon: 'door_front',               label: t.carDetail.doors,         value: String(car.doors) },
    { icon: 'category',                 label: t.carDetail.carType,       value: car.type },
    { icon: 'settings',                 label: t.carDetail.transmission,  value: car.transmission === 'Automatic' ? t.becomeHost.transmissionAuto : t.becomeHost.transmissionManual },
    { icon: FUEL_ICON[car.fuelType] ?? 'local_gas_station', label: t.carDetail.fuelType, value: car.fuelType },
    { icon: 'directions_car',            label: t.carDetail.steeringWheel, value: steeringLabel },
    { icon: 'ac_unit',                  label: t.carDetail.ac,            value: car.ac ? t.becomeHost.acYes : t.becomeHost.acNo },
    { icon: 'palette',                  label: t.carDetail.color,         value: car.color },
  ];

  return (
    <main className="pt-[62px] md:pt-[73px] bg-surface min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-12 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-label-sm text-secondary mb-4">
          <a href="/cars" className="hover:text-primary transition-colors">{t.carDetail.back}</a>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-background font-semibold">{car.brand} {car.model}</span>
        </nav>

        {/* Mobile booking shortcut */}
        <a href="#booking" className="lg:hidden flex items-center justify-between gap-3 mb-5 rounded-2xl bg-primary-fixed/20 border border-primary/20 px-4 py-3.5 active:scale-[0.98] transition-all">
          <div>
            <span className="text-[20px] font-bold text-primary">{formatPrice(car.dailyPrice)}</span>
            <span className="text-label-sm text-secondary"> {t.booking.perDay}</span>
          </div>
          <span className="flex items-center gap-2 bg-primary-container text-white px-4 py-2.5 rounded-xl font-bold text-label-bold">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            {t.common.bookNow}
          </span>
        </a>

        {/* Photo gallery */}
        <div className="grid gap-3 md:grid-cols-2 mb-8">
          {car.images?.[0] ? (
            <img src={car.images[0]} className="w-full h-72 md:h-[420px] rounded-2xl object-cover"
              alt={`${car.brand} ${car.model}`} />
          ) : (
            <div className="w-full h-72 md:h-[420px] rounded-2xl bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[72px] text-slate-300">directions_car</span>
            </div>
          )}
          {car.images.length > 1 && (
            <div className="hidden md:grid grid-cols-2 gap-3">
              {car.images.slice(1, 5).map((img, i) => (
                <img key={i} src={img} className="w-full h-full rounded-2xl object-cover" alt="" />
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <section className="space-y-8">
            {/* Title & badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1.5 rounded-full text-label-sm font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">shield</span>
                  {t.carDetail.insuranceBadge}
                </span>
                {car.verified && (
                  <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-label-sm font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    {t.carDetail.verifiedBadge}
                  </span>
                )}
              </div>
              <h1 className="text-[22px] md:text-h1 font-bold text-on-background">{car.brand} {car.model} {car.year}</h1>
              <p className="text-secondary text-body-md mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {car.trips > 0 ? (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[17px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-bold text-amber-700">{car.rating.toFixed(1)}</span>
                    <span className="text-secondary">({t.reviews.reviewsText(car.trips)})</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[17px] text-slate-400">star</span>
                    <span className="text-secondary text-label-sm">{t.reviews.noReviews}</span>
                  </span>
                )}
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[17px]">location_on</span>
                  {car.location}
                </span>
              </p>
            </div>

            {/* Description */}
            {car.description && (
              <p className="text-secondary text-body-md leading-relaxed border-l-4 border-primary/20 pl-4">
                {car.description}
              </p>
            )}

            {/* Specs grid */}
            <div>
              <h2 className="text-h2 font-bold text-on-background mb-4">{t.carDetail.specsTitle}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {specItems.map(s => <SpecChip key={s.label} icon={s.icon} label={s.label} value={s.value} />)}
              </div>
            </div>

            {/* Host */}
            <div className="rounded-2xl border bg-white p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center font-black text-primary text-lg">
                  {car.host?.[0] ?? '?'}
                </div>
                <div>
                  <p className="text-h3 font-semibold text-on-background">{t.carDetail.hostedBy} {car.host}</p>
                  <p className="text-secondary text-label-bold flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    {t.carDetail.verifiedOwner}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-secondary text-body-md">{t.carDetail.hostDesc}</p>
            </div>

            {/* Features */}
            {car.features?.length > 0 && (
              <div>
                <h2 className="text-h2 font-bold text-on-background mb-4">{t.carDetail.featuresTitle}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {car.features.map((f: string) => (
                    <div key={f} className="flex items-center gap-2 rounded-xl bg-white border p-4 shadow-card">
                      <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      <span className="font-semibold text-label-bold text-on-background">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery options */}
            <div>
              <h2 className="text-h2 font-bold text-on-background mb-4">{t.carDetail.deliveryTitle}</h2>
              <div className="rounded-2xl border border-outline-variant/40 bg-white shadow-card overflow-hidden">
                {/* Airport */}
                <div className="p-5 border-b border-slate-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    <span className="material-symbols-outlined text-[13px] align-middle mr-1">flight</span>
                    Airport Transfers
                  </p>
                  <AirportDeliveryRow icon="flight_takeoff" label={t.carDetail.airportTbilisi}
                    state={car.airportDelivery.tbilisi.state} price={car.airportDelivery.tbilisi.price}
                    freeText={t.carDetail.freeDelivery} noneText={t.carDetail.notAvailable} />
                  <AirportDeliveryRow icon="flight_takeoff" label={t.carDetail.airportKutaisi}
                    state={car.airportDelivery.kutaisi.state} price={car.airportDelivery.kutaisi.price}
                    freeText={t.carDetail.freeDelivery} noneText={t.carDetail.notAvailable} />
                  <AirportDeliveryRow icon="flight_takeoff" label={t.carDetail.airportBatumi}
                    state={car.airportDelivery.batumi.state} price={car.airportDelivery.batumi.price}
                    freeText={t.carDetail.freeDelivery} noneText={t.carDetail.notAvailable} />
                </div>

                {/* City delivery */}
                <div className="p-5 border-b border-slate-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    <span className="material-symbols-outlined text-[13px] align-middle mr-1">local_shipping</span>
                    {t.carDetail.cityDelivery}
                  </p>
                  {car.cityDelivery.enabled ? (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-label-bold font-semibold text-on-background">
                        <span className="material-symbols-outlined text-secondary text-[18px]">location_city</span>
                        {car.cityDelivery.city}
                      </span>
                      <span className="bg-surface-container text-on-background px-3 py-1 rounded-full text-label-sm font-bold">
                        {formatPrice(car.cityDelivery.price)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-label-sm text-slate-400 font-semibold">{t.carDetail.notAvailable}</p>
                  )}
                </div>

                {/* Fuel & return */}
                <div className="grid grid-cols-2 divide-x divide-slate-50">
                  <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      {t.carDetail.fuelPolicy}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">local_gas_station</span>
                      <span className="font-bold text-label-bold text-on-background">{t.carDetail.fullToFull}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      {t.carDetail.returnPolicy}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">
                        {car.returnLocation === 'same' ? 'location_on' : 'my_location'}
                      </span>
                      <span className="font-bold text-label-bold text-on-background">
                        {car.returnLocation === 'same' ? t.carDetail.returnSame : t.carDetail.returnFlexible}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Check-in protocol */}
            <div className="rounded-2xl bg-slate-900 p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary-fixed-dim">photo_camera</span>
                <h2 className="text-h3 font-semibold">{t.carDetail.checkinTitle}</h2>
              </div>
              <p className="text-slate-300 text-body-md">{t.carDetail.checkinDesc}</p>
            </div>
          </section>

          <BookingWidget car={car} availableDates={availableDates} />
        </div>
      </div>
    </main>
  );
}
