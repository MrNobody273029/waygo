'use client';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { calculateBooking, type InsurancePlan } from '@/lib/constants';
import { daysBetween, gel } from '@/lib/utils';
import { InsurancePicker } from './insurance-picker';
import { useLang } from '@/components/lang-provider';
import { KYCModal } from '@/components/kyc-modal';
import { VerificationPendingPopup } from '@/components/verification-pending-popup';
import { DateRangeCalendar } from '@/components/date-range-calendar';
import type { AirportState } from '@/lib/sample-data';

type DeliveryOption = { id: string; label: string; cost: number; icon: string };

export function BookingWidget({ car, availableDates }: { car: any; availableDates?: string[] }) {
  const { t } = useLang();
  const { data: session } = useSession();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const minEnd = (s: string) => {
    const d = new Date(s);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(tomorrow);
  const [plan, setPlan] = useState<InsurancePlan>('standard');
  const [loading, setLoading] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [rejectionComment, setRejectionComment] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [deliveryId, setDeliveryId] = useState('none');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [availError, setAvailError] = useState<string | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setCalOpen(false);
      }
    }
    if (calOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [calOpen]);

  const availSet = availableDates ? new Set(availableDates) : null;
  const noAvailability = availSet !== null && availSet.size === 0;

  function fmtDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDate();
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${day} ${monthNames[d.getMonth()]}`;
  }

  // Build delivery options from car data
  const deliveryOptions: DeliveryOption[] = useMemo(() => {
    const opts: DeliveryOption[] = [
      { id: 'none', label: t.booking.deliveryPickup, cost: 0, icon: 'home' },
    ];
    const ad = car.airportDelivery;
    if (ad) {
      const addAirport = (key: 'tbilisi' | 'kutaisi' | 'batumi', label: string) => {
        const a = ad[key] as { state: AirportState; price: number } | undefined;
        if (a && a.state !== 'none') {
          opts.push({
            id: `airport_${key}`,
            label,
            cost: a.state === 'free' ? 0 : a.price,
            icon: 'flight_takeoff',
          });
        }
      };
      addAirport('tbilisi', t.booking.deliveryAirportTbs);
      addAirport('kutaisi', t.booking.deliveryAirportKut);
      addAirport('batumi', t.booking.deliveryAirportBat);
    }
    if (car.cityDelivery?.enabled) {
      opts.push({
        id: 'city',
        label: `${t.booking.deliveryCityLabel} — ${car.cityDelivery.city}`,
        cost: car.cityDelivery.price,
        icon: 'location_city',
      });
    }
    return opts;
  }, [car, t]);

  const selectedDelivery = deliveryOptions.find(o => o.id === deliveryId) ?? deliveryOptions[0];

  const days = daysBetween(start, end);
  const totals = useMemo(() => calculateBooking(car.dailyPrice, days, plan), [car.dailyPrice, days, plan]);
  const grandTotal = totals.total + selectedDelivery.cost;

  function dateRange(s: string, e: string): string[] {
    const dates: string[] = [];
    const cur = new Date(s);
    const last = new Date(e);
    while (cur <= last) {
      dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }

  async function book() {
    if (!session) { setShowLoginPrompt(true); return; }
    const isVerified = (session?.user as any)?.isVerified as boolean | undefined;
    const verificationStatus = (session?.user as any)?.verificationStatus as string | undefined;
    if (!isVerified) {
      if (verificationStatus === 'SUBMITTED') { setShowPending(true); return; }
      if (verificationStatus === 'REJECTED') {
        const data = await fetch('/api/profile/verification').then(r => r.json()).catch(() => ({}));
        setRejectionComment(data.verificationRejectionComment ?? null);
      }
      setShowKYC(true);
      return;
    }
    // Validate date range
    if (new Date(end) <= new Date(start)) {
      setAvailError(t.booking.invalidDates);
      return;
    }
    // Check availability client-side before submitting
    if (availSet !== null) {
      const requested = dateRange(start, end);
      const unavailable = requested.filter(d => !availSet.has(d));
      if (unavailable.length > 0) {
        setAvailError(t.booking.datesUnavailable);
        return;
      }
    }
    setAvailError(null);
    if (deliveryId === 'city' && !deliveryAddress.trim()) {
      document.getElementById('delivery-address-input')?.focus();
      return;
    }
    setLoading(true);
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        carId: car.id,
        startDate: start,
        endDate: end,
        insurancePlan: plan,
        deliveryType: deliveryId,
        deliveryCost: selectedDelivery.cost,
        deliveryAddress: deliveryId === 'city' ? deliveryAddress : undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    window.location.href = `/checkout/${data.bookingId ?? 'demo'}`;
  }

  return (
    <>
      <KYCModal open={showKYC} onClose={() => setShowKYC(false)} onSuccess={() => setShowKYC(false)} verificationType="guest" rejectionComment={rejectionComment} />
      <VerificationPendingPopup open={showPending} onClose={() => setShowPending(false)} />

      {showLoginPrompt && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLoginPrompt(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white shadow-2xl p-8 flex flex-col items-center text-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed/30">
              <span className="material-symbols-outlined text-primary text-[32px]">lock</span>
            </div>
            <div>
              <h2 className="text-h2 font-black text-on-background mb-2">{t.booking.loginRequired}</h2>
              <p className="text-secondary text-body-md">{t.booking.loginRequiredSub}</p>
            </div>
            <div className="flex flex-col gap-2.5 w-full">
              <a href="/login" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary-container text-white font-bold text-label-bold hover:bg-primary transition-all active:scale-95">
                <span className="material-symbols-outlined text-[18px]">login</span>
                {t.booking.loginBtn}
              </a>
              <a href="/register" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-outline-variant font-semibold text-label-bold text-on-background hover:bg-surface-container-low transition-all">
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                {t.booking.registerBtn}
              </a>
            </div>
            <button onClick={() => setShowLoginPrompt(false)} className="text-label-sm text-secondary hover:text-on-background transition cursor-pointer">{t.kyc.doLater}</button>
          </div>
        </div>
      )}

      <aside id="booking" className="lg:sticky top-24 rounded-2xl border bg-white shadow-card-hover p-6">
        <div className="mb-5">
          <span className="text-h1 font-bold text-primary">{gel(car.dailyPrice)}</span>
          <span className="text-secondary text-label-sm"> {t.booking.perDay}</span>
        </div>

        {/* No availability notice */}
        {noAvailability && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
            <span className="material-symbols-outlined text-amber-500 text-[18px] shrink-0 mt-0.5">event_busy</span>
            <p className="text-label-sm text-amber-700 font-semibold">{t.booking.noAvailability}</p>
          </div>
        )}

        {/* Dates */}
        <div className="relative mb-1" ref={calRef}>
          <div
            className="grid grid-cols-2 gap-3 cursor-pointer"
            onClick={() => setCalOpen(v => !v)}
          >
            <div className={`rounded-xl border px-3 py-2.5 transition-colors ${calOpen ? 'border-primary ring-2 ring-primary-fixed/30' : 'border-slate-200'}`}>
              <p className="text-label-sm text-slate-400 uppercase tracking-wider mb-1">{t.booking.pickup}</p>
              <p className="font-bold text-label-bold text-on-background">
                {start ? fmtDisplayDate(start) : t.booking.selectDate}
              </p>
            </div>
            <div className={`rounded-xl border px-3 py-2.5 transition-colors ${calOpen ? 'border-primary ring-2 ring-primary-fixed/30' : 'border-slate-200'}`}>
              <p className="text-label-sm text-slate-400 uppercase tracking-wider mb-1">{t.booking.dropoff}</p>
              <p className="font-bold text-label-bold text-on-background">
                {end ? fmtDisplayDate(end) : t.booking.selectDate}
              </p>
            </div>
          </div>
          {calOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50">
              <DateRangeCalendar
                start={start}
                end={end}
                availableDates={availableDates}
                onStartChange={s => { setStart(s); setAvailError(null); }}
                onEndChange={e => { setEnd(e); setAvailError(null); }}
                minDate={today}
                open={calOpen}
                onClose={() => setCalOpen(false)}
              />
            </div>
          )}
        </div>
        {availError && (
          <p className="mb-4 text-[12px] font-bold text-error flex items-center gap-1 mt-2">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {availError}
          </p>
        )}
        {!availError && <div className="mb-4" />}

        {/* Delivery selector */}
        <div className="mb-5">
          <h4 className="font-bold text-label-bold text-on-background mb-2">{t.booking.deliveryTitle}</h4>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDeliveryOpen(v => !v)}
              className="w-full flex items-center justify-between rounded-xl border border-outline-variant px-3.5 py-3 text-label-bold font-semibold text-on-background hover:border-primary/50 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">{selectedDelivery.icon}</span>
                <span>{selectedDelivery.label}</span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                {selectedDelivery.cost === 0
                  ? <span className="text-[11px] font-black text-tertiary bg-tertiary-fixed/40 px-2 py-0.5 rounded-full">{t.booking.deliveryFree}</span>
                  : <span className="text-[12px] font-bold text-slate-600">+{gel(selectedDelivery.cost)}</span>
                }
                <span className={`material-symbols-outlined text-[16px] text-slate-400 transition-transform ${deliveryOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </span>
            </button>

            {deliveryOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border border-outline-variant bg-white shadow-card-hover overflow-hidden">
                {deliveryOptions.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { setDeliveryId(opt.id); setDeliveryOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-label-bold font-semibold transition-colors cursor-pointer ${
                      opt.id === deliveryId ? 'bg-primary-fixed/30 text-primary' : 'text-on-background hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[17px]">{opt.icon}</span>
                      {opt.label}
                    </span>
                    <span className="shrink-0">
                      {opt.cost === 0
                        ? <span className="text-[11px] font-black text-tertiary bg-tertiary-fixed/40 px-2 py-0.5 rounded-full">{t.booking.deliveryFree}</span>
                        : <span className="text-[12px] font-bold text-slate-500">+{gel(opt.cost)}</span>
                      }
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City delivery address input */}
          {deliveryId === 'city' && (
            <div className="mt-2">
              <input
                id="delivery-address-input"
                type="text"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                placeholder={t.booking.deliveryAddressPlaceholder}
                className="w-full rounded-xl border border-outline-variant px-3.5 py-3 text-label-bold font-semibold text-on-background outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed placeholder:text-slate-400 transition"
              />
            </div>
          )}
        </div>

        {/* Insurance */}
        <h4 className="font-bold text-label-bold text-on-background mb-3">{t.booking.protectionPlan}</h4>
        <InsurancePicker plan={plan} setPlan={setPlan} days={days} />

        {/* Price breakdown */}
        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-label-bold">
          <Row l={`${gel(car.dailyPrice)} × ${days} ${days !== 1 ? t.booking.days : t.booking.day}`} r={gel(totals.base)} />
          <Row l={t.booking.protection} r={gel(totals.insurance)} />
          <Row l={t.booking.platformFee} r={gel(totals.platformFee)} />
          {selectedDelivery.cost > 0 && (
            <Row l={t.booking.deliveryCost} r={gel(selectedDelivery.cost)} />
          )}
          <Row l={t.booking.depositHold} r={gel(car.deposit ?? 250)} muted />
          <div className="flex justify-between pt-3 border-t border-slate-100 text-h3 font-bold">
            <span>{t.booking.totalNow}</span>
            <span className="text-primary">{gel(grandTotal)}</span>
          </div>
        </div>

        <button
          onClick={book}
          disabled={loading}
          className="mt-5 w-full py-4 bg-primary-container text-white rounded-xl font-bold text-label-bold hover:bg-primary transition-colors active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <><span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>{t.booking.processing}</>
          ) : (
            <><span className="material-symbols-outlined text-[18px]">lock</span>{t.booking.reserveBtn} — {gel(grandTotal)}</>
          )}
        </button>
        <p className="mt-2 text-center text-label-sm text-secondary">{t.booking.depositNote}</p>
        <p className="mt-1 text-center text-[11px] text-slate-400">{t.booking.awaitingHostNote}</p>
      </aside>
    </>
  );
}

function Row({ l, r, muted }: { l: string; r: string; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-secondary">{l}</span>
      <span className={muted ? 'text-slate-400' : 'font-semibold text-on-background'}>{r}</span>
    </div>
  );
}
