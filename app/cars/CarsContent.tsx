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

export function CarsContent({
  cars,
  showKycOnMount,
  initialCity = '',
}: {
  cars: Car[];
  showKycOnMount: boolean;
  initialCity?: string;
}) {
  const { t } = useLang();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState(initialCity);
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

    if (verificationStatus === 'SUBMITTED') {
      setShowPending(true);
      return;
    }

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

  const filtered = cars.filter(c => {
    if (brand && c.brand !== brand) return false;
    if (model && c.model !== model) return false;
    if (location && c.location !== location) return false;
    return true;
  });

  function handleKYCClose() {
    setShowKYC(false);
    router.replace('/cars', { scroll: false });
  }

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

        {/* Filter bar */}
        <div className="bg-white p-2 md:p-3 rounded-2xl shadow-card border border-slate-100 flex flex-col md:flex-row gap-3 mb-6 md:mb-10">
          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 md:divide-x divide-slate-100">
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

            {/* Brand */}
            <div className="flex flex-col px-4 py-2.5">
              <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-1">Brand</span>
              <CarBrandPicker
                value={brand}
                onChange={b => { setBrand(b); setModel(''); }}
                placeholder="Any brand"
                compact
              />
            </div>

            {/* Model */}
            <div className="flex flex-col px-4 py-2.5">
              <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-1">Model</span>
              <CarModelPicker
                brand={brand}
                value={model}
                onChange={setModel}
                placeholder="Any model"
                compact
              />
            </div>

            {/* Pick-up */}
            <div className="flex flex-col px-4 py-2.5">
              <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-1">{t.cars.pickupLabel}</span>
              <input type="date" className="border-none p-0 focus:ring-0 font-bold text-label-bold bg-transparent text-on-background" />
            </div>

            {/* Drop-off */}
            <div className="flex flex-col px-4 py-2.5">
              <span className="text-label-sm text-slate-400 uppercase tracking-wider mb-1">{t.cars.dropoffLabel}</span>
              <input type="date" className="border-none p-0 focus:ring-0 font-bold text-label-bold bg-transparent text-on-background" />
            </div>
          </div>

          <button
            onClick={() => {}}
            className="flex items-center justify-center gap-2 bg-primary-container text-white px-8 py-3.5 rounded-xl font-bold text-label-bold hover:bg-primary transition-colors active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            {t.cars.filterBtn}
          </button>
        </div>

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
