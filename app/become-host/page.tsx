'use client';
import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';
import { CarBrandPicker, CarModelPicker, CarYearPicker } from '@/components/car-picker';
import { GEORGIAN_CITIES_EN } from '@/lib/cities';
import { KYCModal } from '@/components/kyc-modal';
import { VerificationPendingPopup } from '@/components/verification-pending-popup';
import { TermsModal } from '@/components/terms-modal';
import { termsContent } from '@/lib/terms';
import type { TermsLang } from '@/lib/terms';
import { gel } from '@/lib/utils';

type AirportState = 'none' | 'free' | 'paid';

function AirportRow({
  label, state, price, onStateChange, onPriceChange, t,
}: {
  label: string; state: AirportState; price: string;
  onStateChange: (s: AirportState) => void;
  onPriceChange: (p: string) => void;
  t: ReturnType<typeof useLang>['t'];
}) {
  const opts: { val: AirportState; icon: string; label: string; activeClass: string }[] = [
    { val: 'none', icon: 'block', label: t.becomeHost.airportNone, activeClass: 'bg-error-container/30 border-error text-error' },
    { val: 'free', icon: 'flight_takeoff', label: t.becomeHost.airportFree, activeClass: 'bg-primary-fixed/50 border-primary text-primary' },
    { val: 'paid', icon: 'monetization_on', label: t.becomeHost.airportPaid, activeClass: 'bg-tertiary-fixed/50 border-tertiary-container text-on-background' },
  ];
  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-[20px]">flight</span>
        <span className="font-bold text-label-bold text-on-background">{label}</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {opts.map(o => (
          <button key={o.val} type="button" onClick={() => onStateChange(o.val)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-label-bold font-semibold transition-all border cursor-pointer ${
              state === o.val ? o.activeClass : 'bg-white border-outline-variant/40 text-secondary hover:border-primary/40'
            }`}>
            <span className="material-symbols-outlined text-[16px]">{o.icon}</span>
            {o.label}
          </button>
        ))}
      </div>
      {state === 'paid' && (
        <div className="flex items-center gap-3 pt-1">
          <span className="material-symbols-outlined text-secondary text-[18px]">payments</span>
          <input type="number" value={price} onChange={e => onPriceChange(e.target.value)}
            placeholder={t.becomeHost.airportPrice}
            className="flex-1 rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-label-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-fixed"
            min="0" />
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={e => { e.stopPropagation(); onChange(!checked); }}
      className={`relative w-12 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${checked ? 'bg-primary' : 'bg-slate-200'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

function UploadZone({ label, url, onUpload, t }: {
  label: string;
  url: string | null;
  onUpload: (url: string, preview: string) => void;
  t: ReturnType<typeof useLang>['t'];
}) {
  const [preview, setPreview] = useState<string | null>(url ? '/demo-secure-upload/doc' : null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'waygo/tech-passport');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (!data.url) throw new Error('No URL returned');
      onUpload(data.url, objectUrl);
    } catch {
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-label-bold font-bold text-on-background">{label}</label>
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video flex items-center justify-center">
          <img src={preview} alt="" className="w-full h-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="material-symbols-outlined animate-spin text-white text-[32px]">autorenew</span>
            </div>
          )}
          {!uploading && (
            <label className="absolute bottom-2 right-2 cursor-pointer bg-white/90 rounded-lg px-2 py-1 text-label-sm font-semibold text-slate-700 hover:bg-white transition">
              {t.kyc.changeFile}
              <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
            </label>
          )}
        </div>
      ) : (
        <label className="block rounded-2xl border-2 border-dashed border-outline-variant p-6 text-center hover:border-primary/40 transition-colors cursor-pointer group">
          <span className="material-symbols-outlined text-[40px] text-slate-300 group-hover:text-primary/40 transition-colors block mb-2">id_card</span>
          <p className="font-semibold text-secondary text-label-bold">{t.becomeHost.uploadText}</p>
          <p className="text-label-sm text-slate-400 mt-1">{t.becomeHost.uploadHint}</p>
          <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
        </label>
      )}
    </div>
  );
}

export default function BecomeHost() {
  const { t, lang } = useLang();
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [activeStep, setActiveStep] = useState(0);
  const [showKYC, setShowKYC] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photosUploading, setPhotosUploading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const termsLang = (lang as TermsLang) in termsContent.title ? (lang as TermsLang) : 'en';

  // Step 0 — Car details
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [baseCity, setBaseCity] = useState('');

  // Step 1 — Specs
  const [seats, setSeats] = useState('5');
  const [doors, setDoors] = useState('4');
  const [carType, setCarType] = useState('Economy');
  const [transmission, setTransmission] = useState<'Automatic' | 'Manual'>('Automatic');
  const [fuelType, setFuelType] = useState('Petrol');
  const [steeringWheel, setSteeringWheel] = useState<'left' | 'right'>('left');
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set(['Air Conditioning']));

  function toggleFeature(f: string) {
    setSelectedFeatures(prev => {
      const s = new Set(prev);
      if (s.has(f)) s.delete(f); else s.add(f);
      return s;
    });
  }

  // Step 2 — Description & photos
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Step 3 — Pricing
  const [dailyPrice, setDailyPrice] = useState('');
  const [estimatedValueUsd, setEstimatedValueUsd] = useState('');
  const [minDays, setMinDays] = useState('1');
  const [advanceNotice, setAdvanceNotice] = useState('2');

  // Step 4 — Airport delivery
  const [tbilisiState, setTbilisiState] = useState<AirportState>('free');
  const [tbilisiPrice, setTbilisiPrice] = useState('');
  const [kutaisiState, setKutaisiState] = useState<AirportState>('none');
  const [kutaisiPrice, setKutaisiPrice] = useState('');
  const [batumiState, setBatumiState] = useState<AirportState>('none');
  const [batumiPrice, setBatumiPrice] = useState('');
  const [showTbilisiWarning, setShowTbilisiWarning] = useState(false);
  const pendingState = useRef<AirportState>('none');

  // Step 5 — City delivery
  const [cityDeliveryEnabled, setCityDeliveryEnabled] = useState(false);
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState('');

  // Step 6 — Fuel & return
  const [returnLocation, setReturnLocation] = useState<'same' | 'flexible'>('same');
  const [showFuelTip, setShowFuelTip] = useState(false);

  // Step 7 — Tech passport
  const [techPassportFront, setTechPassportFront] = useState<string | null>(null);
  const [techPassportBack, setTechPassportBack] = useState<string | null>(null);

  // Step 8 — Availability
  const [availDates, setAvailDates] = useState<Set<string>>(new Set());
  const [availMonth, setAvailMonth] = useState(0);

  const sessionRefreshed = useRef(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { router.push('/login'); return; }

    // On first mount, refresh the session from DB so we get the latest
    // hostVerified/hostVerificationStatus (avoids showing stale "pending" popup
    // to a host who was already approved while their JWT was still old).
    if (!sessionRefreshed.current) {
      sessionRefreshed.current = true;
      update(); // triggers jwt callback with trigger='update', re-reads from DB
      return;   // wait for the re-render with fresh session data
    }

    const hostVerified = (session.user as any)?.hostVerified as boolean | undefined;
    const hostVerificationStatus = (session.user as any)?.hostVerificationStatus as string | undefined;
    if (!hostVerified) {
      if (hostVerificationStatus === 'SUBMITTED') {
        setShowPending(true);
      } else {
        setShowKYC(true);
      }
    }
  }, [status, session, router, update]);

  const steps = [
    t.becomeHost.step1, t.becomeHost.step2, t.becomeHost.step3,
    t.becomeHost.step4, t.becomeHost.step5, t.becomeHost.step6,
    t.becomeHost.step7, t.becomeHost.step8, t.becomeHost.step9,
  ];

  const ic = 'w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-label-bold outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary-fixed';
  const sel = `${ic} cursor-pointer`;

  function handleTbilisiChange(s: AirportState) {
    if (tbilisiState === 'free' && s === 'none') {
      pendingState.current = s;
      setShowTbilisiWarning(true);
    } else {
      setTbilisiState(s);
    }
  }

  async function handleSubmit() {
    if (!techPassportFront || !techPassportBack) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand, model, year, plateNumber: plate,
          dailyPrice, location: baseCity,
          carType,
          transmission,
          features: Array.from(selectedFeatures),
          imageUrls,
          description,
          techPassportFront,
          techPassportBack,
          color,
          seats,
          doors,
          fuelType,
          steeringWheel,
          estimatedValueUsd: estimatedValueUsd ? parseInt(estimatedValueUsd, 10) : null,
          depositGel: estimatedValueUsd ? Math.round(parseFloat(estimatedValueUsd) * 0.05) : 250,
          airportTbilisiState: tbilisiState,
          airportTbilisiPrice: tbilisiPrice || '0',
          airportKutaisiState: kutaisiState,
          airportKutaisiPrice: kutaisiPrice || '0',
          airportBatumiState: batumiState,
          airportBatumiPrice: batumiPrice || '0',
          cityDeliveryEnabled,
          cityDeliveryCity: deliveryCity,
          cityDeliveryPrice: deliveryPrice || '0',
          returnPolicy: returnLocation,
          minDays,
          advanceNotice,
        }),
      });
      if (res.ok) {
        const { carId } = await res.json();
        if (carId && availDates.size > 0) {
          await fetch(`/api/cars/${carId}/availability`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ add: Array.from(availDates), remove: [] }),
          }).catch(() => {});
        }
        router.push('/my-cars');
      } else {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error ?? 'Failed to save car. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function renderStep() {
    switch (activeStep) {
      /* ── STEP 0: Car details ─────────────────────────────── */
      case 0: return (
        <div className="space-y-5">
          <div>
            <h2 className="text-h2 font-bold text-on-background">{t.becomeHost.step1}</h2>
            <p className="text-secondary text-label-bold mt-1 mb-5">{t.becomeHost.step0Desc}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.brandPlaceholder}</label>
              <CarBrandPicker value={brand} onChange={b => { setBrand(b); setModel(''); }} placeholder={`— ${t.becomeHost.brandPlaceholder} —`} />
            </div>
            <div>
              <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.modelPlaceholder}</label>
              <CarModelPicker brand={brand} value={model} onChange={setModel} placeholder={`— ${t.becomeHost.modelPlaceholder} —`} />
            </div>
            <div>
              <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.yearPlaceholder}</label>
              <CarYearPicker value={year} onChange={setYear} placeholder={`— ${t.becomeHost.yearPlaceholder} —`} />
            </div>
          </div>
          {brand && model && year && (
            <div className="flex items-center gap-3 rounded-xl bg-primary-fixed/30 px-4 py-3 border border-primary/20">
              <span className="material-symbols-outlined text-primary text-[20px]">directions_car</span>
              <span className="font-bold text-label-bold text-primary">{brand} {model} {year}</span>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.platePlaceholder}</label>
              <input value={plate} onChange={e => setPlate(e.target.value)} className={ic} placeholder="AA-123-AA" />
            </div>
            <div>
              <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.colorLabel}</label>
              <input value={color} onChange={e => setColor(e.target.value)} className={ic} placeholder={t.becomeHost.colorPlaceholder} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.locationPlaceholder}</label>
            <select value={baseCity} onChange={e => setBaseCity(e.target.value)} className={sel}>
              <option value="">— {t.becomeHost.locationPlaceholder} —</option>
              {GEORGIAN_CITIES_EN.map((enName, i) => (
                <option key={enName} value={enName}>{(t.common.cities as readonly string[])[i] ?? enName}</option>
              ))}
            </select>
          </div>
        </div>
      );

      /* ── STEP 1: Specifications ───────────────────────────── */
      case 1: return (
        <div className="space-y-6">
          <h2 className="text-h2 font-bold text-on-background">{t.becomeHost.specsTitle}</h2>

          {/* Car type */}
          <div>
            <label className="mb-2 block text-label-bold font-bold text-on-background">{t.becomeHost.carTypeLabel}</label>
            <div className="flex gap-2 flex-wrap">
              {['Economy','Compact','Sedan','SUV','Minivan','Premium','Pickup','Coupe','Hatchback','Convertible'].map(ct => (
                <button key={ct} type="button" onClick={() => setCarType(ct)}
                  className={`px-4 py-2 rounded-xl border text-label-sm font-bold transition cursor-pointer ${carType === ct ? 'bg-primary-container text-white border-primary-container' : 'bg-white border-outline-variant/40 text-on-background hover:border-primary/40'}`}>
                  {ct}
                </button>
              ))}
            </div>
          </div>

          {/* Seats & Doors */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-label-bold font-bold text-on-background">{t.becomeHost.seatsLabel}</label>
              <div className="flex gap-2 flex-wrap">
                {['2', '4', '5', '7', '8+'].map(s => (
                  <button key={s} type="button" onClick={() => setSeats(s)}
                    className={`w-14 py-2.5 rounded-xl border text-label-bold font-bold transition cursor-pointer ${seats === s ? 'bg-primary-container text-white border-primary-container' : 'bg-white border-outline-variant/40 text-on-background hover:border-primary/40'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-label-bold font-bold text-on-background">{t.becomeHost.doorsLabel}</label>
              <div className="flex gap-2 flex-wrap">
                {['2', '3', '4', '5'].map(d => (
                  <button key={d} type="button" onClick={() => setDoors(d)}
                    className={`w-14 py-2.5 rounded-xl border text-label-bold font-bold transition cursor-pointer ${doors === d ? 'bg-primary-container text-white border-primary-container' : 'bg-white border-outline-variant/40 text-on-background hover:border-primary/40'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transmission */}
          <div>
            <label className="mb-2 block text-label-bold font-bold text-on-background">{t.becomeHost.transmissionLabel}</label>
            <div className="flex gap-3">
              {(['Automatic', 'Manual'] as const).map(tr => (
                <button key={tr} type="button" onClick={() => setTransmission(tr)}
                  className={`flex-1 py-3 rounded-xl border text-label-bold font-bold flex items-center justify-center gap-2 transition cursor-pointer ${transmission === tr ? 'bg-primary-container text-white border-primary-container' : 'bg-white border-outline-variant/40 text-on-background hover:border-primary/40'}`}>
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  {tr === 'Automatic' ? t.becomeHost.transmissionAuto : t.becomeHost.transmissionManual}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel type */}
          <div>
            <label className="mb-2 block text-label-bold font-bold text-on-background">{t.becomeHost.fuelTypeLabel}</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {[
                { val: 'Petrol',   icon: 'local_gas_station', label: t.becomeHost.fuelPetrol },
                { val: 'Diesel',   icon: 'local_gas_station', label: t.becomeHost.fuelDiesel },
                { val: 'Hybrid',   icon: 'electric_bolt',     label: t.becomeHost.fuelHybrid },
                { val: 'Electric', icon: 'ev_station',        label: t.becomeHost.fuelElectric },
                { val: 'LPG',      icon: 'propane',           label: t.becomeHost.fuelLpg },
              ].map(f => (
                <button key={f.val} type="button" onClick={() => setFuelType(f.val)}
                  className={`py-3 px-2 rounded-xl border text-label-sm font-bold flex flex-col items-center gap-1 transition cursor-pointer ${fuelType === f.val ? 'bg-primary-container text-white border-primary-container' : 'bg-white border-outline-variant/40 text-on-background hover:border-primary/40'}`}>
                  <span className="material-symbols-outlined text-[20px]">{f.icon}</span>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Steering wheel */}
          <div>
            <label className="mb-2 block text-label-bold font-bold text-on-background">{t.becomeHost.steeringWheelLabel}</label>
            <div className="flex gap-3">
              {([
                { val: 'left'  as const, icon: 'settings_backup_restore', label: t.becomeHost.steeringLeft },
                { val: 'right' as const, icon: 'sync',                    label: t.becomeHost.steeringRight },
              ]).map(sw => (
                <button key={sw.val} type="button" onClick={() => setSteeringWheel(sw.val)}
                  className={`flex-1 py-3 rounded-xl border text-label-bold font-bold flex items-center justify-center gap-2 transition cursor-pointer ${steeringWheel === sw.val ? 'bg-primary-container text-white border-primary-container' : 'bg-white border-outline-variant/40 text-on-background hover:border-primary/40'}`}>
                  <span className="material-symbols-outlined text-[18px]">{sw.icon}</span>
                  {sw.label}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="mb-2 block text-label-bold font-bold text-on-background">{t.becomeHost.featuresLabel}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { key: 'Air Conditioning', icon: 'ac_unit' },
                { key: 'Bluetooth',        icon: 'bluetooth' },
                { key: 'USB Charging',     icon: 'usb' },
                { key: 'GPS Navigation',   icon: 'map' },
                { key: 'Backup Camera',    icon: 'camera_rear' },
                { key: 'Parking Sensors',  icon: 'sensors' },
                { key: 'Heated Seats',     icon: 'heat' },
                { key: 'Sunroof',          icon: 'wb_sunny' },
                { key: 'Electric Windows', icon: 'power' },
                { key: 'ABS',              icon: 'emergency_heat' },
                { key: 'Cruise Control',   icon: 'speed' },
                { key: 'Roof Rack',        icon: 'luggage' },
                { key: 'Child Seat',       icon: 'child_care' },
                { key: 'AWD / 4WD',        icon: 'settings_input_component' },
              ].map(f => {
                const active = selectedFeatures.has(f.key);
                return (
                  <button key={f.key} type="button" onClick={() => toggleFeature(f.key)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-label-sm font-semibold transition cursor-pointer text-left ${active ? 'bg-primary-fixed/30 border-primary text-primary' : 'bg-white border-outline-variant/40 text-on-background hover:border-primary/40'}`}>
                    <span className={`material-symbols-outlined text-[18px] shrink-0 ${active ? 'text-primary' : 'text-secondary'}`}>{active ? 'check_circle' : f.icon}</span>
                    {f.key}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );

      /* ── STEP 2: Description & photos ───────────────────────── */
      case 2: return (
        <div className="space-y-5">
          <h2 className="text-h2 font-bold text-on-background">{t.becomeHost.step3}</h2>
          <div>
            <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.descriptionLabel}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 500))}
              rows={5} placeholder={t.becomeHost.descriptionPlaceholder}
              className={`${ic} resize-none`} />
            <p className="mt-1 text-label-sm text-secondary text-right">{description.length} / 500</p>
          </div>
          <div>
            <label className="block text-label-bold font-bold text-on-background mb-1">{t.becomeHost.photosTitle}</label>
            <p className="text-secondary text-label-sm mb-3">{t.becomeHost.photosDesc}</p>
            <label className={`block rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer group ${photosUploading ? 'border-primary/40 pointer-events-none' : 'border-outline-variant hover:border-primary/40'}`}>
              {photosUploading ? (
                <span className="material-symbols-outlined text-[48px] text-primary/40 animate-spin block mb-3">autorenew</span>
              ) : (
                <span className="material-symbols-outlined text-[48px] text-slate-300 group-hover:text-primary/40 transition-colors block mb-3">cloud_upload</span>
              )}
              <p className="font-semibold text-secondary text-label-bold">
                {photosUploading ? 'Uploading...' : t.becomeHost.uploadText}
              </p>
              <p className="text-label-sm text-slate-400 mt-1">{t.becomeHost.uploadHint}</p>
              <input type="file" multiple accept="image/*" className="sr-only" disabled={photosUploading} onChange={async e => {
                const files = Array.from(e.target.files ?? []);
                if (!files.length) return;
                setPhotosUploading(true);
                try {
                  const urls = await Promise.all(files.map(async f => {
                    const fd = new FormData();
                    fd.append('file', f);
                    fd.append('folder', 'waygo/cars');
                    const r = await fetch('/api/upload', { method: 'POST', body: fd });
                    if (!r.ok) throw new Error('Upload failed');
                    const d = await r.json();
                    return d.url as string;
                  }));
                  setImageUrls(prev => [...prev, ...urls]);
                } catch {
                  setSubmitError('Photo upload failed. Please try again.');
                } finally {
                  setPhotosUploading(false);
                  e.target.value = '';
                }
              }} />
            </label>
            {imageUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-surface-container">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Main</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );

      /* ── STEP 3: Pricing ─────────────────────────────────────── */
      case 3: return (
        <div className="space-y-5">
          <h2 className="text-h2 font-bold text-on-background">{t.becomeHost.pricingTitle}</h2>
          <div>
            <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.pricePlaceholder}</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-black">₾</span>
              <input type="number" value={dailyPrice} onChange={e => setDailyPrice(e.target.value)}
                className={`${ic} pl-8`} placeholder="120" min="20" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.minDaysLabel}</label>
              <select value={minDays} onChange={e => setMinDays(e.target.value)} className={sel}>
                {['1','2','3','5','7','14','30'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.advanceNoticeLabel}</label>
              <select value={advanceNotice} onChange={e => setAdvanceNotice(e.target.value)} className={sel}>
                {['1','2','6','12','24','48'].map(h => <option key={h} value={h}>{h}h</option>)}
              </select>
              <p className="mt-1.5 text-label-sm text-slate-400">{t.becomeHost.advanceNoticeHint}</p>
            </div>
          </div>
          {dailyPrice && Number(dailyPrice) > 0 && (
            <div className="rounded-2xl bg-primary-fixed/30 border border-primary/20 p-5">
              <p className="text-label-sm text-secondary mb-1">{t.becomeHost.estimatedEarnings}</p>
              <p className="text-h2 font-black text-primary">{gel(Number(dailyPrice) * 18)}<span className="text-label-bold font-normal text-secondary ml-2">{t.becomeHost.perMonth}</span></p>
            </div>
          )}
          {/* Estimated car value */}
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">shield</span>
              <span className="font-bold text-label-bold text-on-background">{t.becomeHost.estimatedValueLabel}</span>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-black text-label-bold">$</span>
              <input type="number" value={estimatedValueUsd} onChange={e => setEstimatedValueUsd(e.target.value)}
                className={`${ic} pl-8`} placeholder="15000" min="0" />
            </div>
            <p className="text-label-sm text-slate-400">{t.becomeHost.estimatedValueHint}</p>
            {/* Auto-calculated deposit */}
            <div className="border-t border-outline-variant/30 pt-3">
              <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.depositLabel}</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-black">₾</span>
                <input
                  type="number"
                  readOnly
                  value={estimatedValueUsd ? Math.round(parseFloat(estimatedValueUsd) * 0.05) : 250}
                  className={`${ic} pl-8 bg-surface-container cursor-default`}
                />
              </div>
              <p className="text-label-sm text-slate-400 mt-1.5">{t.becomeHost.depositHint}</p>
            </div>
          </div>
        </div>
      );

      /* ── STEP 4: Airport delivery ─────────────────────────────── */
      case 4: return (
        <div className="space-y-4">
          <div>
            <h2 className="text-h2 font-bold text-on-background">{t.becomeHost.airportTitle}</h2>
            <p className="text-secondary text-label-bold mt-1 mb-5">{t.becomeHost.airportDesc}</p>
          </div>
          <AirportRow label={t.becomeHost.airportTbilisi} state={tbilisiState} price={tbilisiPrice} onStateChange={handleTbilisiChange} onPriceChange={setTbilisiPrice} t={t} />
          <AirportRow label={t.becomeHost.airportKutaisi} state={kutaisiState} price={kutaisiPrice} onStateChange={setKutaisiState} onPriceChange={setKutaisiPrice} t={t} />
          <AirportRow label={t.becomeHost.airportBatumi}  state={batumiState}  price={batumiPrice}  onStateChange={setBatumiState}  onPriceChange={setBatumiPrice}  t={t} />
        </div>
      );

      /* ── STEP 5: City delivery ────────────────────────────────── */
      case 5: return (
        <div className="space-y-5">
          <div>
            <h2 className="text-h2 font-bold text-on-background">{t.becomeHost.cityDeliveryTitle}</h2>
            <p className="text-secondary text-label-bold mt-1 mb-5">{t.becomeHost.cityDeliveryDesc}</p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-outline-variant/40 bg-white p-4 cursor-pointer hover:border-primary/40 transition"
            onClick={() => setCityDeliveryEnabled(v => !v)}>
            <ToggleSwitch checked={cityDeliveryEnabled} onChange={setCityDeliveryEnabled} />
            <div>
              <p className="font-bold text-label-bold text-on-background">{t.becomeHost.cityDeliveryEnabled}</p>
              <p className="text-label-sm text-secondary">{t.becomeHost.cityDeliveryDesc}</p>
            </div>
          </div>
          {cityDeliveryEnabled && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.cityLabel}</label>
                <select value={deliveryCity} onChange={e => setDeliveryCity(e.target.value)}
                  className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-label-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-fixed cursor-pointer">
                  <option value="">— {t.becomeHost.cityLabel} —</option>
                  {GEORGIAN_CITIES_EN.map((enName, i) => (
                    <option key={enName} value={enName}>{(t.common.cities as readonly string[])[i] ?? enName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.cityDeliveryPrice}</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-black">₾</span>
                  <input type="number" value={deliveryPrice} onChange={e => setDeliveryPrice(e.target.value)}
                    className="w-full rounded-xl border border-outline-variant bg-white pl-8 pr-4 py-3 text-label-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-fixed"
                    placeholder="50" min="0" />
                </div>
              </div>
            </div>
          )}
        </div>
      );

      /* ── STEP 6: Fuel & return ─────────────────────────────────── */
      case 6: return (
        <div className="space-y-8">
          <div>
            <h2 className="text-h2 font-bold text-on-background mb-4">{t.becomeHost.fuelPolicyTitle}</h2>
            <div className="rounded-2xl border border-primary/20 bg-primary-fixed/20 p-5 flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-[28px] shrink-0">local_gas_station</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-black text-h3 text-primary">{t.becomeHost.fuelPolicyValue}</p>
                  <div className="relative">
                    <button type="button"
                      onMouseEnter={() => setShowFuelTip(true)}
                      onMouseLeave={() => setShowFuelTip(false)}
                      className="flex items-center justify-center w-5 h-5 rounded-full bg-secondary/20 text-secondary hover:bg-primary/20 hover:text-primary transition cursor-pointer">
                      <span className="material-symbols-outlined text-[13px]">info</span>
                    </button>
                    {showFuelTip && (
                      <div className="absolute left-7 top-1/2 -translate-y-1/2 z-50 w-64 rounded-xl bg-slate-900 text-white p-3 text-label-sm shadow-card-hover leading-relaxed">
                        {t.becomeHost.fuelPolicyTooltip}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-secondary text-label-bold">{t.becomeHost.fuelPolicyNote}</p>
              </div>
              <span className="bg-primary-container text-white text-[10px] font-black uppercase px-2 py-1 rounded-lg shrink-0">{t.becomeHost.standard}</span>
            </div>
          </div>
          <div>
            <h2 className="text-h2 font-bold text-on-background mb-4">{t.becomeHost.returnPolicyTitle}</h2>
            <div className="space-y-3">
              {([
                { val: 'same'     as const, icon: 'location_on', title: t.becomeHost.returnSame,     desc: t.becomeHost.returnSameDesc },
                { val: 'flexible' as const, icon: 'my_location', title: t.becomeHost.returnFlexible, desc: t.becomeHost.returnFlexibleDesc },
              ] as const).map(opt => (
                <button key={opt.val} type="button" onClick={() => setReturnLocation(opt.val)}
                  className={`w-full rounded-2xl border p-4 flex items-start gap-4 text-left transition-all cursor-pointer ${returnLocation === opt.val ? 'bg-primary-fixed/30 border-primary shadow-card' : 'bg-white border-outline-variant/40 hover:border-primary/40'}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${returnLocation === opt.val ? 'bg-primary-container text-white' : 'bg-surface-container text-secondary'}`}>
                    <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-label-bold ${returnLocation === opt.val ? 'text-primary' : 'text-on-background'}`}>{opt.title}</p>
                    <p className="text-secondary text-label-sm mt-0.5">{opt.desc}</p>
                  </div>
                  {returnLocation === opt.val && <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">check_circle</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

      /* ── STEP 7: Tech passport ────────────────────────────────── */
      case 7: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-h2 font-bold text-on-background">{t.becomeHost.techPassportTitle}</h2>
            <p className="text-secondary text-label-bold mt-1 mb-5">{t.becomeHost.techPassportSub}</p>
          </div>
          <UploadZone
            label={t.becomeHost.techPassportFront}
            url={techPassportFront}
            onUpload={(url) => setTechPassportFront(url)}
            t={t}
          />
          <UploadZone
            label={t.becomeHost.techPassportBack}
            url={techPassportBack}
            onUpload={(url) => setTechPassportBack(url)}
            t={t}
          />
        </div>
      );

      /* ── STEP 8: Availability ──────────────────────────────── */
      case 8: {
        const today = new Date().toISOString().split('T')[0];
        const base = new Date();
        base.setDate(1);
        base.setMonth(base.getMonth() + availMonth);
        const yr = base.getFullYear();
        const mo = base.getMonth();
        const totalD = new Date(yr, mo + 1, 0).getDate();
        const startOff = (new Date(yr, mo, 1).getDay() + 6) % 7;
        const ta = t.availability;
        const monthName = (ta.months as unknown as string[])[mo];

        const toggleDay = (d: string) => {
          if (d < today) return;
          setAvailDates(prev => {
            const s = new Set(prev);
            if (s.has(d)) s.delete(d); else s.add(d);
            return s;
          });
        };

        const selectAllMonth = () => {
          setAvailDates(prev => {
            const s = new Set(prev);
            for (let i = 1; i <= totalD; i++) {
              const d = new Date(yr, mo, i).toISOString().split('T')[0];
              if (d >= today) s.add(d);
            }
            return s;
          });
        };

        const clearAllMonth = () => {
          setAvailDates(prev => {
            const s = new Set(prev);
            for (let i = 1; i <= totalD; i++) {
              const d = new Date(yr, mo, i).toISOString().split('T')[0];
              s.delete(d);
            }
            return s;
          });
        };

        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-h2 font-bold text-on-background">{t.becomeHost.availabilityStepTitle}</h2>
              <p className="text-secondary text-label-bold mt-1 mb-1">{t.becomeHost.availabilityStepSub}</p>
              <p className="text-label-sm text-primary font-semibold">{availDates.size} days selected</p>
            </div>

            {/* Month nav */}
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setAvailMonth(m => m - 1)} disabled={availMonth === 0}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-outline-variant disabled:opacity-30 hover:border-primary/40 transition cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="font-extrabold text-label-bold text-on-background">{monthName} {yr}</span>
              <button type="button" onClick={() => setAvailMonth(m => m + 1)} disabled={availMonth >= 5}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-outline-variant disabled:opacity-30 hover:border-primary/40 transition cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              <button type="button" onClick={selectAllMonth}
                className="flex-1 rounded-xl border border-primary/30 bg-primary-fixed/20 py-2 text-label-sm font-bold text-primary hover:bg-primary-fixed/30 transition cursor-pointer">
                {ta.selectMonth}
              </button>
              <button type="button" onClick={clearAllMonth}
                className="flex-1 rounded-xl border border-outline-variant py-2 text-label-sm font-bold text-secondary hover:bg-surface-container-low transition cursor-pointer">
                {ta.clearMonth}
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7">
              {(ta.weekdays as unknown as string[]).map(d => (
                <div key={d} className="text-center text-[10px] font-black uppercase text-slate-400 py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startOff }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: totalD }).map((_, i) => {
                const day = i + 1;
                const d = new Date(yr, mo, day).toISOString().split('T')[0];
                const isPast = d < today;
                const sel = availDates.has(d);
                let cls = 'flex items-center justify-center rounded-xl h-9 text-[13px] font-bold transition-all ';
                if (isPast) cls += 'text-slate-300 cursor-default';
                else if (sel) cls += 'bg-primary-container text-white cursor-pointer active:scale-95';
                else cls += 'text-slate-500 hover:bg-surface-container-low cursor-pointer';
                return (
                  <button key={d} type="button" onClick={() => toggleDay(d)} className={cls}>{day}</button>
                );
              })}
            </div>
          </div>
        );
      }

      default: return null;
    }
  }

  return (
    <main className="pt-[62px] md:pt-[120px] min-h-screen bg-surface">
      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => { setTermsAccepted(true); setShowTerms(false); }}
      />
      <KYCModal
        open={showKYC}
        onClose={() => {
          setShowKYC(false);
          router.push('/cars');
        }}
        onSuccess={() => setShowKYC(false)}
        verificationType="host"
      />
      <VerificationPendingPopup open={showPending} onClose={() => { setShowPending(false); router.push('/cars'); }} />

      <div className="mx-auto max-w-5xl px-4 md:px-12 py-6 md:py-12">
        <div className="mb-5 md:mb-8">
          <h1 className="text-[24px] md:text-h1 font-bold text-on-background">{t.becomeHost.title}</h1>
          <p className="mt-1 md:mt-2 text-secondary text-[13px] md:text-body-md">{t.becomeHost.sub}</p>
        </div>

        {/* Mobile step indicator */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-label-sm font-bold text-secondary">{activeStep + 1} / {steps.length}</p>
            <p className="text-label-sm font-bold text-primary">{steps[activeStep]}</p>
          </div>
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div key={i} onClick={() => setActiveStep(i)} className={`flex-1 h-1.5 rounded-full cursor-pointer transition-colors ${i <= activeStep ? 'bg-primary' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block space-y-2 lg:sticky lg:top-24 lg:self-start">
            {steps.map((s, i) => (
              <button key={s} onClick={() => setActiveStep(i)}
                className={`w-full rounded-2xl border p-3.5 flex items-center gap-3 text-left transition-all cursor-pointer ${
                  i === activeStep ? 'border-primary bg-primary-fixed/30 shadow-card'
                  : 'border-outline-variant/40 bg-white shadow-card'
                }`}>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-label-sm font-black shrink-0 ${
                  i < activeStep ? 'bg-primary text-white' : i === activeStep ? 'bg-primary-container text-white' : 'bg-surface-container text-secondary'
                }`}>
                  {i < activeStep
                    ? <span className="material-symbols-outlined text-[14px]">check</span>
                    : i + 1}
                </span>
                <span className={`font-semibold text-label-bold ${i === activeStep ? 'text-primary' : 'text-on-background'}`}>{s}</span>
              </button>
            ))}
          </aside>

          {/* Form area */}
          <div className="space-y-5">
            <form className="rounded-2xl border border-outline-variant/40 bg-white p-4 md:p-6 shadow-card min-h-[320px] md:min-h-[400px]" onSubmit={e => e.preventDefault()}>
              {renderStep()}
            </form>

            {submitError && (
              <div className="flex items-start gap-3 rounded-xl border border-error/30 bg-error-container/20 px-4 py-3">
                <span className="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">error</span>
                <p className="text-label-bold text-error font-semibold">{submitError}</p>
              </div>
            )}

            {activeStep === steps.length - 1 && (
              <div className="flex items-start gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3">
                <input
                  type="checkbox"
                  id="host-terms"
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary cursor-pointer shrink-0"
                />
                <label htmlFor="host-terms" className="text-label-sm text-secondary cursor-pointer leading-relaxed select-none">
                  {termsContent.checkboxLabel[termsLang]}.{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    {termsContent.readMore[termsLang]} ↗
                  </button>
                </label>
              </div>
            )}

            <div className="flex items-center justify-between">
              {activeStep > 0 ? (
                <button type="button" onClick={() => setActiveStep(s => s - 1)}
                  className="flex items-center gap-2 rounded-xl border border-outline-variant px-6 py-3 font-bold text-label-bold text-secondary hover:border-primary hover:text-primary transition cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  {t.becomeHost.back}
                </button>
              ) : <div />}

              {activeStep < steps.length - 1 ? (
                <button type="button" onClick={() => setActiveStep(s => s + 1)}
                  className="flex items-center gap-2 rounded-xl bg-primary-container text-white px-6 py-3 font-bold text-label-bold hover:bg-primary transition-all active:scale-95 cursor-pointer">
                  {t.becomeHost.next}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <div className="flex gap-3">
                  {availDates.size === 0 && (
                    <button type="button" onClick={handleSubmit} disabled={submitting || !techPassportFront || !techPassportBack || !termsAccepted}
                      className="rounded-xl border border-outline-variant px-5 py-3 font-bold text-label-bold text-secondary hover:bg-surface-container-low transition disabled:opacity-60 cursor-pointer">
                      {t.becomeHost.availabilitySkip}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !techPassportFront || !techPassportBack || !termsAccepted}
                    className="flex items-center gap-2 rounded-xl bg-primary-container text-white px-8 py-3 font-bold text-label-bold hover:bg-primary transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
                        {t.common.loading}
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                        {t.becomeHost.saveBtn}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tbilisi warning modal */}
      {showTbilisiWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTbilisiWarning(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white shadow-card-hover p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
                <span className="material-symbols-outlined text-amber-500 text-[24px]">flight_takeoff</span>
              </div>
              <div>
                <p className="font-black text-h3 text-on-background leading-tight">{t.becomeHost.tbilisiWarningTitle}</p>
              </div>
            </div>
            <p className="text-secondary text-body-md leading-relaxed">{t.becomeHost.tbilisiWarningText}</p>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowTbilisiWarning(false)}
                className="flex-1 rounded-xl bg-primary-container text-white py-3 font-bold text-label-bold hover:bg-primary transition cursor-pointer">
                {t.becomeHost.tbilisiWarningCancel}
              </button>
              <button type="button" onClick={() => { setTbilisiState(pendingState.current); setShowTbilisiWarning(false); }}
                className="flex-1 rounded-xl border border-error/30 text-error py-3 font-bold text-label-bold hover:bg-error-container/30 transition cursor-pointer">
                {t.becomeHost.tbilisiWarningConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
