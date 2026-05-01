'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';
import { CarBrandPicker, CarModelPicker, CarYearPicker } from '@/components/car-picker';
import { gel } from '@/lib/utils';

type AirportState = 'none' | 'free' | 'paid';

interface CarData {
  id: string;
  brand: string; model: string; year: number; plateNumber: string;
  color: string; location: string; transmission: string;
  seats: number; doors: number; fuelType: string;
  description: string | null; dailyPrice: number;
  minDays: number; advanceNotice: number;
  airportTbilisiState: string; airportTbilisiPrice: number;
  airportKutaisiState: string; airportKutaisiPrice: number;
  airportBatumiState: string; airportBatumiPrice: number;
  cityDeliveryEnabled: boolean; cityDeliveryCity: string; cityDeliveryPrice: number;
  returnPolicy: string;
  imageUrls: string[]; techPassportFront: string | null; techPassportBack: string | null;
  isActive: boolean;
}

function AirportRow({ label, state, price, onStateChange, onPriceChange, t }: {
  label: string; state: AirportState; price: string;
  onStateChange: (s: AirportState) => void; onPriceChange: (p: string) => void;
  t: ReturnType<typeof useLang>['t'];
}) {
  const opts = [
    { val: 'none' as AirportState, icon: 'block', label: t.becomeHost.airportNone, activeClass: 'bg-error-container/30 border-error text-error' },
    { val: 'free' as AirportState, icon: 'flight_takeoff', label: t.becomeHost.airportFree, activeClass: 'bg-primary-fixed/50 border-primary text-primary' },
    { val: 'paid' as AirportState, icon: 'monetization_on', label: t.becomeHost.airportPaid, activeClass: 'bg-tertiary-fixed/50 border-tertiary-container text-on-background' },
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
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-label-bold font-semibold transition-all border cursor-pointer ${state === o.val ? o.activeClass : 'bg-white border-outline-variant/40 text-secondary hover:border-primary/40'}`}>
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
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${checked ? 'bg-primary' : 'bg-slate-200'}`}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );
}

function UploadZone({ label, url, onUpload, t }: {
  label: string; url: string | null; onUpload: (url: string) => void;
  t: ReturnType<typeof useLang>['t'];
}) {
  const [preview, setPreview] = useState<string | null>(url);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    const fd = new FormData(); fd.append('file', file); fd.append('folder', 'waygo/tech-passport');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    onUpload(data.url);
  }

  return (
    <div>
      <label className="mb-1.5 block text-label-bold font-bold text-on-background">{label}</label>
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video flex items-center justify-center">
          <img src={preview} alt="" className="w-full h-full object-cover" />
          {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="material-symbols-outlined animate-spin text-white text-[32px]">autorenew</span></div>}
          {!uploading && (
            <label className="absolute bottom-2 right-2 cursor-pointer bg-white/90 rounded-lg px-2 py-1 text-label-sm font-semibold text-slate-700 hover:bg-white transition">
              {t.kyc.changeFile}
              <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
            </label>
          )}
        </div>
      ) : (
        <label className="block rounded-2xl border-2 border-dashed border-outline-variant p-6 text-center hover:border-primary/40 transition-colors cursor-pointer group">
          <span className="material-symbols-outlined text-[40px] text-slate-300 group-hover:text-primary/40 block mb-2">id_card</span>
          <p className="font-semibold text-secondary text-label-bold">{t.becomeHost.uploadText}</p>
          <p className="text-label-sm text-slate-400 mt-1">{t.becomeHost.uploadHint}</p>
          <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
        </label>
      )}
    </div>
  );
}

export function EditCarContent({ car }: { car: CarData }) {
  const { t } = useLang();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showFuelTip, setShowFuelTip] = useState(false);

  const [brand, setBrand] = useState(car.brand);
  const [model, setModel] = useState(car.model);
  const [year, setYear] = useState(String(car.year));
  const [plate, setPlate] = useState(car.plateNumber);
  const [color, setColor] = useState(car.color);
  const [baseCity, setBaseCity] = useState(car.location);

  const [seats, setSeats] = useState(String(car.seats));
  const [doors, setDoors] = useState(String(car.doors));
  const [transmission, setTransmission] = useState<'Automatic' | 'Manual'>(car.transmission as 'Automatic' | 'Manual');
  const [fuelType, setFuelType] = useState(car.fuelType);
  const [ac, setAc] = useState(car.isActive);

  const [description, setDescription] = useState(car.description ?? '');
  const [imageUrls, setImageUrls] = useState<string[]>(car.imageUrls);

  const [dailyPrice, setDailyPrice] = useState(String(car.dailyPrice));
  const [minDays, setMinDays] = useState(String(car.minDays));
  const [advanceNotice, setAdvanceNotice] = useState(String(car.advanceNotice));

  const [tbilisiState, setTbilisiState] = useState<AirportState>(car.airportTbilisiState as AirportState);
  const [tbilisiPrice, setTbilisiPrice] = useState(car.airportTbilisiPrice > 0 ? String(car.airportTbilisiPrice) : '');
  const [kutaisiState, setKutaisiState] = useState<AirportState>(car.airportKutaisiState as AirportState);
  const [kutaisiPrice, setKutaisiPrice] = useState(car.airportKutaisiPrice > 0 ? String(car.airportKutaisiPrice) : '');
  const [batumiState, setBatumiState] = useState<AirportState>(car.airportBatumiState as AirportState);
  const [batumiPrice, setBatumiPrice] = useState(car.airportBatumiPrice > 0 ? String(car.airportBatumiPrice) : '');

  const [cityDeliveryEnabled, setCityDeliveryEnabled] = useState(car.cityDeliveryEnabled);
  const [deliveryCity, setDeliveryCity] = useState(car.cityDeliveryCity);
  const [deliveryPrice, setDeliveryPrice] = useState(car.cityDeliveryPrice > 0 ? String(car.cityDeliveryPrice) : '');

  const [returnLocation, setReturnLocation] = useState<'same' | 'flexible'>(car.returnPolicy as 'same' | 'flexible');

  const [techPassportFront, setTechPassportFront] = useState<string | null>(car.techPassportFront);
  const [techPassportBack, setTechPassportBack] = useState<string | null>(car.techPassportBack);

  const steps = [
    t.becomeHost.step1, t.becomeHost.step2, t.becomeHost.step3,
    t.becomeHost.step4, t.becomeHost.step5, t.becomeHost.step6,
    t.becomeHost.step7, t.becomeHost.step8,
  ];

  const ic = 'w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-label-bold outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary-fixed';
  const sel = `${ic} cursor-pointer`;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cars/${car.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand, model, year, plateNumber: plate,
          dailyPrice, location: baseCity,
          carType: 'Economy', transmission,
          features: ac ? ['AC'] : [],
          imageUrls, description,
          techPassportFront, techPassportBack,
          color, seats, doors, fuelType,
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
          minDays, advanceNotice,
        }),
      });
      if (res.ok) router.push('/my-cars');
    } finally {
      setSubmitting(false);
    }
  }

  function renderStep() {
    switch (activeStep) {
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
              {(t.common.cities as readonly string[]).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      );

      case 1: return (
        <div className="space-y-6">
          <h2 className="text-h2 font-bold text-on-background">{t.becomeHost.specsTitle}</h2>
          <div>
            <label className="mb-2 block text-label-bold font-bold text-on-background">{t.becomeHost.seatsLabel}</label>
            <div className="flex gap-2 flex-wrap">
              {['2','4','5','7','8+'].map(s => (
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
              {['2','3','4','5'].map(d => (
                <button key={d} type="button" onClick={() => setDoors(d)}
                  className={`w-14 py-2.5 rounded-xl border text-label-bold font-bold transition cursor-pointer ${doors === d ? 'bg-primary-container text-white border-primary-container' : 'bg-white border-outline-variant/40 text-on-background hover:border-primary/40'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-label-bold font-bold text-on-background">{t.becomeHost.transmissionLabel}</label>
            <div className="flex gap-3">
              {(['Automatic','Manual'] as const).map(tr => (
                <button key={tr} type="button" onClick={() => setTransmission(tr)}
                  className={`flex-1 py-3 rounded-xl border text-label-bold font-bold flex items-center justify-center gap-2 transition cursor-pointer ${transmission === tr ? 'bg-primary-container text-white border-primary-container' : 'bg-white border-outline-variant/40 text-on-background hover:border-primary/40'}`}>
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  {tr === 'Automatic' ? t.becomeHost.transmissionAuto : t.becomeHost.transmissionManual}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-label-bold font-bold text-on-background">{t.becomeHost.fuelTypeLabel}</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {[
                { val: 'Petrol', icon: 'local_gas_station', label: t.becomeHost.fuelPetrol },
                { val: 'Diesel', icon: 'local_gas_station', label: t.becomeHost.fuelDiesel },
                { val: 'Hybrid', icon: 'electric_bolt', label: t.becomeHost.fuelHybrid },
                { val: 'Electric', icon: 'ev_station', label: t.becomeHost.fuelElectric },
                { val: 'LPG', icon: 'propane', label: t.becomeHost.fuelLpg },
              ].map(f => (
                <button key={f.val} type="button" onClick={() => setFuelType(f.val)}
                  className={`py-3 px-2 rounded-xl border text-label-sm font-bold flex flex-col items-center gap-1 transition cursor-pointer ${fuelType === f.val ? 'bg-primary-container text-white border-primary-container' : 'bg-white border-outline-variant/40 text-on-background hover:border-primary/40'}`}>
                  <span className="material-symbols-outlined text-[20px]">{f.icon}</span>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-label-bold font-bold text-on-background">{t.becomeHost.acLabel}</label>
            <div className="flex gap-3">
              {[{ val: true, icon: 'ac_unit', label: t.becomeHost.acYes }, { val: false, icon: 'do_not_disturb', label: t.becomeHost.acNo }].map(a => (
                <button key={String(a.val)} type="button" onClick={() => setAc(a.val)}
                  className={`flex-1 py-3 rounded-xl border text-label-bold font-bold flex items-center justify-center gap-2 transition cursor-pointer ${ac === a.val ? 'bg-primary-container text-white border-primary-container' : 'bg-white border-outline-variant/40 text-on-background hover:border-primary/40'}`}>
                  <span className="material-symbols-outlined text-[18px]">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

      case 2: return (
        <div className="space-y-5">
          <h2 className="text-h2 font-bold text-on-background">{t.becomeHost.step3}</h2>
          <div>
            <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.descriptionLabel}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 500))}
              rows={5} placeholder={t.becomeHost.descriptionPlaceholder} className={`${ic} resize-none`} />
            <p className="mt-1 text-label-sm text-secondary text-right">{description.length} / 500</p>
          </div>
          <div>
            <label className="block text-label-bold font-bold text-on-background mb-1">{t.becomeHost.photosTitle}</label>
            <p className="text-secondary text-label-sm mb-3">{t.becomeHost.photosDesc}</p>
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-slate-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="block rounded-2xl border-2 border-dashed border-outline-variant p-8 text-center hover:border-primary/40 transition-colors cursor-pointer group">
              <span className="material-symbols-outlined text-[48px] text-slate-300 group-hover:text-primary/40 block mb-3">cloud_upload</span>
              <p className="font-semibold text-secondary text-label-bold">{t.becomeHost.uploadText}</p>
              <p className="text-label-sm text-slate-400 mt-1">{t.becomeHost.uploadHint}</p>
              <input type="file" multiple accept="image/*" className="sr-only" onChange={async e => {
                const files = Array.from(e.target.files ?? []);
                const urls = await Promise.all(files.map(async f => {
                  const fd = new FormData(); fd.append('file', f); fd.append('folder', 'waygo/cars');
                  const r = await fetch('/api/upload', { method: 'POST', body: fd });
                  const d = await r.json(); return d.url as string;
                }));
                setImageUrls(prev => [...prev, ...urls]);
              }} />
            </label>
          </div>
        </div>
      );

      case 3: return (
        <div className="space-y-5">
          <h2 className="text-h2 font-bold text-on-background">{t.becomeHost.pricingTitle}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.pricePlaceholder}</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-black">₾</span>
                <input type="number" value={dailyPrice} onChange={e => setDailyPrice(e.target.value)} className={`${ic} pl-8`} placeholder="120" min="20" />
              </div>
            </div>
            <div className="grid gap-4 grid-cols-2">
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
              </div>
            </div>
          </div>
          {dailyPrice && Number(dailyPrice) > 0 && (
            <div className="rounded-2xl bg-primary-fixed/30 border border-primary/20 p-5">
              <p className="text-label-sm text-secondary mb-1">{t.becomeHost.estimatedEarnings}</p>
              <p className="text-h2 font-black text-primary">{gel(Number(dailyPrice) * 18)}<span className="text-label-bold font-normal text-secondary ml-2">{t.becomeHost.perMonth}</span></p>
            </div>
          )}
        </div>
      );

      case 4: return (
        <div className="space-y-4">
          <div>
            <h2 className="text-h2 font-bold text-on-background">{t.becomeHost.airportTitle}</h2>
            <p className="text-secondary text-label-bold mt-1 mb-5">{t.becomeHost.airportDesc}</p>
          </div>
          <AirportRow label={t.becomeHost.airportTbilisi} state={tbilisiState} price={tbilisiPrice} onStateChange={setTbilisiState} onPriceChange={setTbilisiPrice} t={t} />
          <AirportRow label={t.becomeHost.airportKutaisi} state={kutaisiState} price={kutaisiPrice} onStateChange={setKutaisiState} onPriceChange={setKutaisiPrice} t={t} />
          <AirportRow label={t.becomeHost.airportBatumi} state={batumiState} price={batumiPrice} onStateChange={setBatumiState} onPriceChange={setBatumiPrice} t={t} />
        </div>
      );

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
                <select value={deliveryCity} onChange={e => setDeliveryCity(e.target.value)} className={sel}>
                  <option value="">— {t.becomeHost.cityLabel} —</option>
                  {(t.common.cities as readonly string[]).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-label-bold font-bold text-on-background">{t.becomeHost.cityDeliveryPrice}</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-black">₾</span>
                  <input type="number" value={deliveryPrice} onChange={e => setDeliveryPrice(e.target.value)} className={`${ic} pl-8`} placeholder="50" min="0" />
                </div>
              </div>
            </div>
          )}
        </div>
      );

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
                    <button type="button" onMouseEnter={() => setShowFuelTip(true)} onMouseLeave={() => setShowFuelTip(false)}
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
                { val: 'same' as const, icon: 'location_on', title: t.becomeHost.returnSame, desc: t.becomeHost.returnSameDesc },
                { val: 'flexible' as const, icon: 'my_location', title: t.becomeHost.returnFlexible, desc: t.becomeHost.returnFlexibleDesc },
              ]).map(opt => (
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

      case 7: return (
        <div className="space-y-6">
          <div>
            <h2 className="text-h2 font-bold text-on-background">{t.becomeHost.techPassportTitle}</h2>
            <p className="text-secondary text-label-bold mt-1 mb-5">{t.becomeHost.techPassportSub}</p>
          </div>
          <UploadZone label={t.becomeHost.techPassportFront} url={techPassportFront} onUpload={setTechPassportFront} t={t} />
          <UploadZone label={t.becomeHost.techPassportBack} url={techPassportBack} onUpload={setTechPassportBack} t={t} />
        </div>
      );

      default: return null;
    }
  }

  return (
    <main className="pt-[62px] md:pt-[73px] min-h-screen bg-surface">
      <div className="mx-auto max-w-5xl px-4 md:px-12 py-6 md:py-12">
        <div className="mb-5 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <a href="/my-cars" className="flex items-center gap-1 text-secondary hover:text-primary transition text-label-bold font-semibold">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              {t.myCars.title}
            </a>
          </div>
          <h1 className="text-[24px] md:text-h1 font-bold text-on-background">{t.myCars.editTitle}</h1>
          <p className="mt-1 md:mt-2 text-secondary text-[13px] md:text-body-md">{t.myCars.editSub}</p>
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
          <aside className="hidden lg:block space-y-2 lg:sticky lg:top-24 lg:self-start">
            {steps.map((s, i) => (
              <button key={s} onClick={() => setActiveStep(i)}
                className={`w-full rounded-2xl border p-3.5 flex items-center gap-3 text-left transition-all cursor-pointer ${i === activeStep ? 'border-primary bg-primary-fixed/30 shadow-card' : 'border-outline-variant/40 bg-white shadow-card'}`}>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-label-sm font-black shrink-0 ${i < activeStep ? 'bg-primary text-white' : i === activeStep ? 'bg-primary-container text-white' : 'bg-surface-container text-secondary'}`}>
                  {i < activeStep ? <span className="material-symbols-outlined text-[14px]">check</span> : i + 1}
                </span>
                <span className={`font-semibold text-label-bold ${i === activeStep ? 'text-primary' : 'text-on-background'}`}>{s}</span>
              </button>
            ))}
          </aside>

          <div className="space-y-5">
            <form className="rounded-2xl border border-outline-variant/40 bg-white p-4 md:p-6 shadow-card min-h-[320px] md:min-h-[400px]" onSubmit={e => e.preventDefault()}>
              {renderStep()}
            </form>

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
                <button type="button" onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-primary-container text-white px-8 py-3 font-bold text-label-bold hover:bg-primary transition-all active:scale-95 disabled:opacity-60 cursor-pointer">
                  {submitting ? (
                    <><span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>{t.myCars.saving}</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">save</span>{t.myCars.saveBtn}</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
