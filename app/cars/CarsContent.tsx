'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CarCard } from '@/components/car-card';
import type { Car } from '@/lib/sample-data';
import { useLang } from '@/components/lang-provider';
import { CarBrandPicker, CarModelPicker } from '@/components/car-picker';
import { KYCModal } from '@/components/kyc-modal';
import { VerificationPendingPopup } from '@/components/verification-pending-popup';
import { AISearch } from '@/components/ai-search';

// Module-level constants
const CAR_TYPES = [
  'Economy', 'Compact', 'Sedan', 'SUV', 'Minivan',
  'Premium', 'Pickup', 'Coupe', 'Hatchback', 'Convertible',
] as const;

const TRANSMISSION_OPTIONS = ['Automatic', 'Manual'] as const;

const FUEL_OPTIONS = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG'] as const;

const SEAT_OPTIONS = [
  { label: '2+', value: 2 },
  { label: '4+', value: 4 },
  { label: '5+', value: 5 },
  { label: '7+', value: 7 },
] as const;

const FEATURES_LIST = [
  'Air Conditioning',
  'Bluetooth',
  'GPS Navigation',
  'Backup Camera',
  'Heated Seats',
  'Sunroof',
  'AWD / 4WD',
] as const;

const CAR_TYPE_ICONS: Record<string, string> = {
  Economy: 'directions_car',
  Compact: 'directions_car',
  Sedan: 'directions_car',
  SUV: 'directions_car',
  Minivan: 'airport_shuttle',
  Premium: 'workspace_premium',
  Pickup: 'local_shipping',
  Coupe: 'speed',
  Hatchback: 'directions_car',
  Convertible: 'wb_sunny',
};

export function CarsContent({
  cars,
  showKycOnMount,
  initialCity = '',
  initialStart = '',
  initialEnd = '',
  initialType = '',
  initialTransmission = '',
  initialMaxPrice = 0,
  initialFuel = '',
  initialSeats = 0,
  initialBrand = '',
}: {
  cars: Car[];
  showKycOnMount: boolean;
  initialCity?: string;
  initialStart?: string;
  initialEnd?: string;
  initialType?: string;
  initialTransmission?: string;
  initialMaxPrice?: number;
  initialFuel?: string;
  initialSeats?: number;
  initialBrand?: string;
}) {
  const { t } = useLang();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Basic filter state
  const [location, setLocation] = useState(initialCity);
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  // Detailed filter state — initialized from URL params (set by AI search)
  const [brand, setBrand] = useState(initialBrand);
  const [model, setModel] = useState('');
  const [carType, setCarType] = useState(initialType);
  const [transmission, setTransmission] = useState(initialTransmission);
  const [fuelType, setFuelType] = useState(initialFuel);
  const [minSeats, setMinSeats] = useState(initialSeats);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  // KYC state
  const [showKYC, setShowKYC] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [rejectionComment, setRejectionComment] = useState<string | null>(null);

  useEffect(() => {
    if (!showKycOnMount) return;
    if (status !== 'authenticated') return;
    const isVerified = (session?.user as any)?.isVerified as boolean | undefined;
    const role = (session?.user as any)?.role as string | undefined;
    if (isVerified || role === 'ADMIN') return;
    const verificationStatus = (session?.user as any)?.verificationStatus as string | undefined;
    if (verificationStatus === 'SUBMITTED') { setShowPending(true); return; }
    if (verificationStatus === 'REJECTED') {
      fetch('/api/profile/verification')
        .then(r => r.json())
        .then(data => setRejectionComment(data.verificationRejectionComment ?? null))
        .catch(() => {})
        .finally(() => setShowKYC(true));
      return;
    }
    setShowKYC(true);
  }, [showKycOnMount, status, session]);

  function toggleFeature(f: string) {
    setSelectedFeatures(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (location) params.set('city', location);
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    const url = `/cars${params.toString() ? '?' + params.toString() : ''}`;
    router.push(url);
  }

  function handleClearFilters() {
    setBrand('');
    setModel('');
    setCarType('');
    setTransmission('');
    setFuelType('');
    setMinSeats(0);
    setSelectedFeatures([]);
    setMaxPrice(0);
  }

  // Count active detailed filters for badge
  const activeDetailCount =
    (brand ? 1 : 0) +
    (model ? 1 : 0) +
    (carType ? 1 : 0) +
    (transmission ? 1 : 0) +
    (fuelType ? 1 : 0) +
    (minSeats > 0 ? 1 : 0) +
    selectedFeatures.length +
    (maxPrice > 0 ? 1 : 0);

  const filtered = cars.filter(c => {
    if (brand && c.brand !== brand) return false;
    if (model && c.model !== model) return false;
    if (location && c.location !== location) return false;
    if (maxPrice > 0 && c.dailyPrice > maxPrice) return false;
    if (carType && c.type !== carType) return false;
    if (transmission && c.transmission !== transmission) return false;
    if (fuelType && c.fuelType !== fuelType) return false;
    if (minSeats > 0 && c.seats < minSeats) return false;
    if (selectedFeatures.length > 0 && !selectedFeatures.every(f => c.features.includes(f))) return false;
    return true;
  });

  function handleKYCClose() {
    setShowKYC(false);
    router.replace('/cars', { scroll: false });
  }

  const pillBase = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-label-sm font-semibold cursor-pointer transition-colors select-none';
  const pillActive = 'bg-primary-container text-white border-primary-container';
  const pillInactive = 'border-outline-variant text-secondary hover:border-primary/50 hover:text-on-background';

  return (
    <main className="pt-[62px] md:pt-[73px] min-h-screen bg-surface">
      <KYCModal
        open={showKYC}
        onClose={handleKYCClose}
        onSuccess={handleKYCClose}
        verificationType="guest"
        rejectionComment={rejectionComment}
      />
      <VerificationPendingPopup open={showPending} onClose={() => { setShowPending(false); router.replace('/cars', { scroll: false }); }} />

      <div className="max-w-screen-2xl mx-auto px-4 md:px-12 py-6 md:py-12">
        <div className="mb-5 md:mb-8">
          <h1 className="text-[24px] md:text-h1 font-bold text-on-background">{t.cars.title}</h1>
          <p className="text-secondary text-[13px] md:text-body-md mt-1">{filtered.length} {t.cars.available}</p>
        </div>

        {/* AI Search */}
        <AISearch />

        {/* Basic filter bar */}
        <div className="bg-white p-2 md:p-3 rounded-2xl shadow-card border border-slate-100 flex flex-col md:flex-row gap-3 mb-3">
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 md:divide-x divide-slate-100">
            {/* Location */}
            <div className="flex flex-col px-4 py-2.5">
              <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-1">{t.cars.locationLabel}</span>
              <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="border-none p-0 focus:ring-0 font-bold text-label-bold text-on-background bg-transparent cursor-pointer"
              >
                <option value="">{t.cars.anyLocation}</option>
                {(t.common.cities as readonly string[]).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Pick-up */}
            <div className="flex flex-col px-4 py-2.5">
              <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-1">{t.cars.pickupLabel}</span>
              <input
                type="date"
                value={startDate}
                onChange={e => {
                  const s = e.target.value;
                  setStartDate(s);
                  if (endDate && endDate <= s) {
                    const d = new Date(s);
                    d.setDate(d.getDate() + 1);
                    setEndDate(d.toISOString().split('T')[0]);
                  }
                }}
                className="border-none p-0 focus:ring-0 font-bold text-label-bold bg-transparent text-on-background"
              />
            </div>

            {/* Drop-off */}
            <div className="flex flex-col px-4 py-2.5">
              <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-1">{t.cars.dropoffLabel}</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={e => setEndDate(e.target.value)}
                className="border-none p-0 focus:ring-0 font-bold text-label-bold bg-transparent text-on-background"
              />
            </div>

            {/* Max price */}
            <div className="flex flex-col px-4 py-2.5">
              <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-1">{t.cars.priceLabel}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="∞"
                  min={0}
                  max={2000}
                  step={10}
                  value={maxPrice > 0 ? maxPrice : ''}
                  onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : 0)}
                  className="border-none p-0 focus:ring-0 font-bold text-label-bold bg-transparent text-on-background w-16"
                />
                {maxPrice > 0 && (
                  <span className="text-label-sm text-secondary">{t.cars.pricePerDay}</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-primary-container text-white px-8 py-3.5 rounded-xl font-bold text-label-bold hover:bg-primary transition-colors active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            {t.cars.filterBtn}
          </button>
        </div>

        {/* Toggle detailed filters */}
        <button
          type="button"
          onClick={() => setShowDetails(v => !v)}
          className="flex items-center gap-1.5 text-label-sm text-primary font-semibold cursor-pointer mb-4 hover:text-primary/80 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">
            {showDetails ? 'expand_less' : 'expand_more'}
          </span>
          {showDetails ? t.cars.hideDetailsBtn : t.cars.detailsBtn}
          {activeDetailCount > 0 && (
            <span className="ml-1 bg-primary-container text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeDetailCount}
            </span>
          )}
        </button>

        {/* Detailed filters panel */}
        {showDetails && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-label-bold text-on-background">{t.cars.detailsBtn}</span>
              {activeDetailCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-label-sm text-error font-semibold cursor-pointer hover:opacity-80 transition"
                >
                  {t.cars.clearFilters}
                </button>
              )}
            </div>

            {/* Brand & Model row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-2 block">{t.cars.brandLabel}</span>
                <CarBrandPicker
                  value={brand}
                  onChange={b => { setBrand(b); setModel(''); }}
                  placeholder={t.cars.brandLabel}
                  compact
                />
              </div>
              <div>
                <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-2 block">{t.cars.modelLabel}</span>
                <CarModelPicker
                  brand={brand}
                  value={model}
                  onChange={setModel}
                  placeholder={t.cars.modelLabel}
                  compact
                />
              </div>
            </div>

            {/* Car type */}
            <div>
              <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-2 block">{t.cars.typeLabel}</span>
              <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap">
                {CAR_TYPES.map(ct => (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => setCarType(carType === ct ? '' : ct)}
                    className={`${pillBase} whitespace-nowrap ${carType === ct ? pillActive : pillInactive}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{CAR_TYPE_ICONS[ct] ?? 'directions_car'}</span>
                    {(t.cars.carTypes as Record<string, string>)[ct] ?? ct}
                  </button>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div>
              <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-2 block">{t.cars.transmissionLabel}</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setTransmission('')}
                  className={`${pillBase} ${transmission === '' ? pillActive : pillInactive}`}
                >
                  {t.cars.anyTransmission}
                </button>
                {TRANSMISSION_OPTIONS.map(tr => (
                  <button
                    key={tr}
                    type="button"
                    onClick={() => setTransmission(transmission === tr ? '' : tr)}
                    className={`${pillBase} ${transmission === tr ? pillActive : pillInactive}`}
                  >
                    {tr}
                  </button>
                ))}
              </div>
            </div>

            {/* Fuel type */}
            <div>
              <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-2 block">{t.cars.fuelLabel}</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFuelType('')}
                  className={`${pillBase} ${fuelType === '' ? pillActive : pillInactive}`}
                >
                  {t.cars.anyFuel}
                </button>
                {FUEL_OPTIONS.map(ft => (
                  <button
                    key={ft}
                    type="button"
                    onClick={() => setFuelType(fuelType === ft ? '' : ft)}
                    className={`${pillBase} ${fuelType === ft ? pillActive : pillInactive}`}
                  >
                    {(t.cars.fuelTypes as Record<string, string>)[ft] ?? ft}
                  </button>
                ))}
              </div>
            </div>

            {/* Min seats */}
            <div>
              <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-2 block">{t.cars.seatsLabel}</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setMinSeats(0)}
                  className={`${pillBase} ${minSeats === 0 ? pillActive : pillInactive}`}
                >
                  {t.cars.anySeats}
                </button>
                {SEAT_OPTIONS.map(so => (
                  <button
                    key={so.value}
                    type="button"
                    onClick={() => setMinSeats(minSeats === so.value ? 0 : so.value)}
                    className={`${pillBase} ${minSeats === so.value ? pillActive : pillInactive}`}
                  >
                    {so.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-2 block">{t.cars.featuresLabel}</span>
              <div className="flex flex-wrap gap-2">
                {FEATURES_LIST.map(f => {
                  const isActive = selectedFeatures.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFeature(f)}
                      className={`${pillBase} ${isActive ? pillActive : pillInactive}`}
                    >
                      {isActive && <span className="material-symbols-outlined text-[13px]">check</span>}
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <span className="material-symbols-outlined text-[64px] text-slate-300">directions_car</span>
            <p className="text-h3 font-bold text-on-background">No cars found</p>
            <p className="text-secondary text-body-md">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {filtered.map(c => <CarCard key={c.id} car={c} />)}
          </div>
        )}
      </div>
    </main>
  );
}
