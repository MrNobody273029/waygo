'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';
import { gel } from '@/lib/utils';

interface ConditionReport {
  id: string;
  phase: string;
  photoUrls: string[];
  createdAt: string;
}

interface InsurancePolicy {
  planType: string;
  deductibleAmount: number;
}

interface Booking {
  id: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  deliveryType: string;
  deliveryCost: number;
  deliveryAddress: string | null;
  status: string;
  createdAt: string;
  conditionReports: ConditionReport[];
  insurancePolicy: InsurancePolicy | null;
}

interface Props {
  booking: Booking;
}

const PHOTO_SLOTS = 7;

const STATUS_STYLE: Record<string, { cls: string; icon: string }> = {
  confirmed:  { cls: 'bg-tertiary-fixed/40 text-tertiary',    icon: 'check_circle' },
  pending:    { cls: 'bg-amber-50 text-amber-700',            icon: 'schedule' },
  completed:  { cls: 'bg-surface-container text-secondary',   icon: 'task_alt' },
  rejected:   { cls: 'bg-error-container/40 text-error',      icon: 'cancel' },
  cancelled:  { cls: 'bg-surface-container text-secondary',   icon: 'remove_circle' },
};

function PhotoGrid({
  slots,
  photos,
  locked,
  uploading,
  onUpload,
  slotLabels,
  uploadLabel,
  changeLabel,
  uploadingLabel,
  lockedLabel,
}: {
  slots: number;
  photos: (string | null)[];
  locked: boolean;
  uploading: boolean;
  onUpload: (idx: number, file: File) => void;
  slotLabels: string[];
  uploadLabel: string;
  changeLabel: string;
  uploadingLabel: string;
  lockedLabel: string;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: slots }, (_, i) => {
        const url = photos[i] ?? null;
        return (
          <div key={i} className="flex flex-col gap-1.5">
            <p className="text-[11px] font-bold text-secondary uppercase tracking-wider truncate">{slotLabels[i]}</p>
            <div
              className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                url
                  ? 'border-tertiary/30'
                  : locked
                  ? 'border-outline-variant/30 bg-surface-container-low'
                  : 'border-dashed border-outline-variant bg-surface-container-low hover:border-primary cursor-pointer'
              } transition-colors`}
              onClick={() => !locked && !uploading && inputRefs.current[i]?.click()}
            >
              {url ? (
                <>
                  <img src={url} alt={slotLabels[i]} className="w-full h-full object-cover" />
                  {!locked && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); inputRefs.current[i]?.click(); }}
                      className="absolute bottom-1.5 right-1.5 rounded-lg bg-black/60 px-2 py-1 text-white text-[10px] font-bold hover:bg-black/80 transition"
                    >
                      {changeLabel}
                    </button>
                  )}
                  {locked && (
                    <div className="absolute inset-0 flex items-end justify-end p-1.5">
                      <span className="rounded-full bg-black/40 p-0.5">
                        <span className="material-symbols-outlined text-white text-[14px]">lock</span>
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2">
                  {uploading ? (
                    <span className="material-symbols-outlined animate-spin text-[22px] text-secondary">autorenew</span>
                  ) : locked ? (
                    <span className="material-symbols-outlined text-[22px] text-slate-300">lock</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[24px] text-slate-400">add_a_photo</span>
                      <span className="text-[10px] font-semibold text-slate-400 text-center leading-tight">{uploadLabel}</span>
                    </>
                  )}
                </div>
              )}
              <input
                ref={el => { inputRefs.current[i] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(i, file);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BookingDetailContent({ booking }: Props) {
  const { t } = useLang();
  const router = useRouter();
  const bd = t.bookingDetail;

  const pickupReport = booking.conditionReports.find(r => r.phase === 'pickup') ?? null;
  const returnReport = booking.conditionReports.find(r => r.phase === 'return') ?? null;

  const [pickupPhotos, setPickupPhotos] = useState<(string | null)[]>(
    pickupReport ? pickupReport.photoUrls : Array(PHOTO_SLOTS).fill(null)
  );
  const [returnPhotos, setReturnPhotos] = useState<(string | null)[]>(
    returnReport ? returnReport.photoUrls : Array(PHOTO_SLOTS).fill(null)
  );
  const [uploadingSlot, setUploadingSlot] = useState<{ phase: string; idx: number } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const now = new Date();
  const endDate = new Date(booking.endDate);
  const returnUnlocked = now >= endDate;

  const startFmt = new Date(booking.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const endFmt = new Date(booking.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const statusStyle = STATUS_STYLE[booking.status] ?? STATUS_STYLE.pending;

  const statusLabel: Record<string, string> = {
    confirmed: t.dashboard.confirmed,
    pending:   t.dashboard.pending,
    completed: t.dashboard.completed,
    rejected:  t.dashboard.rejected,
    cancelled: t.dashboard.cancelled,
  };

  const slotLabels = [
    bd.photoSlot1, bd.photoSlot2, bd.photoSlot3, bd.photoSlot4,
    bd.photoSlot5, bd.photoSlot6, bd.photoSlot7,
  ];

  async function uploadPhoto(phase: 'pickup' | 'return', idx: number, file: File) {
    setUploadingSlot({ phase, idx });
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'waygo/condition-reports');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.url) {
        if (phase === 'pickup') {
          setPickupPhotos(prev => prev.map((p, i) => (i === idx ? data.url : p)));
        } else {
          setReturnPhotos(prev => prev.map((p, i) => (i === idx ? data.url : p)));
        }
      }
    } finally {
      setUploadingSlot(null);
    }
  }

  async function confirmReport(phase: 'pickup' | 'return') {
    const photos = phase === 'pickup' ? pickupPhotos : returnPhotos;
    if (photos.some(p => !p)) return;
    setConfirming(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/condition-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, photoUrls: photos }),
      });
      if (res.ok) router.refresh();
    } finally {
      setConfirming(false);
    }
  }

  const pickupAllUploaded = pickupPhotos.every(Boolean);
  const returnAllUploaded = returnPhotos.every(Boolean);
  const pickupLocked = !!pickupReport || booking.status === 'confirmed' || booking.status === 'completed';
  const returnLocked = !!returnReport || booking.status === 'completed';

  const showPickupSection = ['pending', 'confirmed', 'completed'].includes(booking.status);
  const showReturnSection = ['confirmed', 'completed'].includes(booking.status);

  return (
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[73px] pb-20 md:pb-0">
      <div className="mx-auto max-w-screen-lg px-4 md:px-8 py-10">

        {/* Back */}
        <a href="/dashboard" className="inline-flex items-center gap-1.5 text-label-sm font-bold text-secondary hover:text-primary mb-8 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {bd.back}
        </a>

        {/* Title + status */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8">
          <div>
            <h1 className="text-[22px] md:text-h1 font-extrabold text-on-background">{booking.carBrand} {booking.carModel} {booking.carYear}</h1>
            <p className="text-secondary text-label-sm mt-1">ID: {booking.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-label-sm font-bold ${statusStyle.cls}`}>
            <span className="material-symbols-outlined text-[16px]">{statusStyle.icon}</span>
            {statusLabel[booking.status] ?? booking.status}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Left: condition reports */}
          <div className="space-y-6">

            {/* Pickup report */}
            {showPickupSection && (
              <section className="rounded-2xl border border-outline-variant/40 bg-white shadow-card p-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${pickupLocked ? 'bg-tertiary-fixed/40' : 'bg-amber-50'}`}>
                    <span className={`material-symbols-outlined text-[20px] ${pickupLocked ? 'text-tertiary' : 'text-amber-600'}`}>
                      {pickupLocked ? 'check_circle' : 'camera_alt'}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-extrabold text-h3 text-on-background">{bd.condPickupTitle}</h2>
                    <p className="text-label-sm text-secondary">{pickupLocked ? bd.photosLocked : bd.condPickupSub}</p>
                  </div>
                </div>

                {pickupLocked && booking.status !== 'pending' && (
                  <div className="mt-3 mb-4 flex items-center gap-2 rounded-xl bg-tertiary-fixed/20 border border-tertiary/20 px-4 py-2.5">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
                    <p className="text-label-sm font-semibold text-on-background">{bd.pickupConfirmed}</p>
                  </div>
                )}

                <div className="mt-4">
                  <PhotoGrid
                    slots={PHOTO_SLOTS}
                    photos={pickupPhotos}
                    locked={pickupLocked}
                    uploading={uploadingSlot?.phase === 'pickup'}
                    onUpload={(idx, file) => uploadPhoto('pickup', idx, file)}
                    slotLabels={slotLabels}
                    uploadLabel={bd.uploadPhoto}
                    changeLabel={bd.changePhoto}
                    uploadingLabel={bd.uploading}
                    lockedLabel={bd.photosLocked}
                  />
                </div>

                {!pickupLocked && (
                  <div className="mt-5">
                    {!pickupAllUploaded && (
                      <p className="text-label-sm text-amber-600 flex items-center gap-1.5 mb-3">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        {bd.allPhotosRequired}
                      </p>
                    )}
                    <button
                      onClick={() => confirmReport('pickup')}
                      disabled={!pickupAllUploaded || confirming || !!uploadingSlot}
                      className="w-full rounded-xl bg-primary-container py-3.5 font-bold text-label-bold text-white hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {confirming ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
                          {bd.confirming}
                        </span>
                      ) : bd.confirmPickup}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Return report */}
            {showReturnSection && (
              <section className="rounded-2xl border border-outline-variant/40 bg-white shadow-card p-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${returnLocked ? 'bg-tertiary-fixed/40' : returnUnlocked ? 'bg-amber-50' : 'bg-surface-container'}`}>
                    <span className={`material-symbols-outlined text-[20px] ${returnLocked ? 'text-tertiary' : returnUnlocked ? 'text-amber-600' : 'text-slate-400'}`}>
                      {returnLocked ? 'check_circle' : 'camera_alt'}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-extrabold text-h3 text-on-background">{bd.condReturnTitle}</h2>
                    <p className="text-label-sm text-secondary">
                      {returnLocked
                        ? bd.photosLocked
                        : returnUnlocked
                        ? bd.condReturnSub
                        : `${bd.returnNotYet} ${endFmt}`}
                    </p>
                  </div>
                </div>

                {returnLocked && (
                  <div className="mt-3 mb-4 flex items-center gap-2 rounded-xl bg-tertiary-fixed/20 border border-tertiary/20 px-4 py-2.5">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
                    <p className="text-label-sm font-semibold text-on-background">{bd.returnConfirmed}</p>
                  </div>
                )}

                {(returnUnlocked || returnLocked) && (
                  <div className="mt-4">
                    <PhotoGrid
                      slots={PHOTO_SLOTS}
                      photos={returnPhotos}
                      locked={returnLocked}
                      uploading={uploadingSlot?.phase === 'return'}
                      onUpload={(idx, file) => uploadPhoto('return', idx, file)}
                      slotLabels={slotLabels}
                      uploadLabel={bd.uploadPhoto}
                      changeLabel={bd.changePhoto}
                      uploadingLabel={bd.uploading}
                      lockedLabel={bd.photosLocked}
                    />
                  </div>
                )}

                {returnUnlocked && !returnLocked && (
                  <div className="mt-5">
                    {!returnAllUploaded && (
                      <p className="text-label-sm text-amber-600 flex items-center gap-1.5 mb-3">
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        {bd.allPhotosRequired}
                      </p>
                    )}
                    <button
                      onClick={() => confirmReport('return')}
                      disabled={!returnAllUploaded || confirming || !!uploadingSlot}
                      className="w-full rounded-xl bg-primary-container py-3.5 font-bold text-label-bold text-white hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {confirming ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
                          {bd.confirming}
                        </span>
                      ) : bd.confirmReturn}
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right: booking summary */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-outline-variant/40 bg-white shadow-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container shrink-0">
                  <span className="material-symbols-outlined text-[26px] text-secondary">directions_car</span>
                </div>
                <div>
                  <p className="font-extrabold text-label-bold text-on-background">{booking.carBrand} {booking.carModel}</p>
                  <p className="text-label-sm text-secondary">{booking.carYear}</p>
                </div>
              </div>

              <div className="space-y-3 text-label-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {bd.pickup}
                  </span>
                  <span className="font-semibold text-on-background text-right">{startFmt}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">event</span>
                    {bd.dropoff}
                  </span>
                  <span className="font-semibold text-on-background text-right">{endFmt}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                  <span className="text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">payments</span>
                    {bd.totalPaid}
                  </span>
                  <span className="font-extrabold text-label-bold text-primary">{gel(booking.totalPrice)}</span>
                </div>

                {booking.deliveryCost > 0 && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-secondary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                      {bd.deliveryFee}
                    </span>
                    <span className="font-semibold text-on-background">{gel(booking.deliveryCost)}</span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                  <span className="text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">shield</span>
                    {bd.insurancePlan}
                  </span>
                  {booking.insurancePolicy ? (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${
                      booking.insurancePolicy.planType === 'premium'
                        ? 'bg-tertiary-fixed/40 text-tertiary'
                        : booking.insurancePolicy.planType === 'standard'
                        ? 'bg-primary-fixed/40 text-primary'
                        : 'bg-surface-container text-secondary'
                    }`}>
                      {booking.insurancePolicy.planType}
                    </span>
                  ) : (
                    <span className="text-secondary">{bd.noInsurance}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
