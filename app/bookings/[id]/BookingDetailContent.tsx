'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';
import { gel } from '@/lib/utils';
import { calculateCancellation } from '@/lib/constants';

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
  platformFeeGel: number;
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
  guestEmail: string;
}

const PHOTO_SLOTS = 7;

const STATUS_STYLE: Record<string, { cls: string; icon: string }> = {
  confirmed:     { cls: 'bg-tertiary-fixed/40 text-tertiary',    icon: 'check_circle' },
  pending:       { cls: 'bg-amber-50 text-amber-700',            icon: 'schedule' },
  awaiting_host: { cls: 'bg-amber-50 text-amber-700',            icon: 'hourglass_top' },
  completed:     { cls: 'bg-surface-container text-secondary',   icon: 'task_alt' },
  rejected:      { cls: 'bg-error-container/40 text-error',      icon: 'cancel' },
  cancelled:     { cls: 'bg-surface-container text-secondary',   icon: 'remove_circle' },
};

const TIER_BADGE: Record<string, string> = {
  pre_approval: 'bg-tertiary-fixed/30 text-tertiary border-tertiary/20',
  grace_period: 'bg-tertiary-fixed/30 text-tertiary border-tertiary/20',
  early:        'bg-primary-fixed/30 text-primary border-primary/20',
  standard:     'bg-amber-50 text-amber-700 border-amber-200',
  late:         'bg-orange-50 text-orange-700 border-orange-200',
  no_refund:    'bg-error-container/30 text-error border-error/20',
  ineligible:   'bg-surface-container text-secondary border-outline-variant/40',
};

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(i: number, val: string) {
    const digit = val.replace(/\D/g, '');
    if (!digit) return;
    const next = [...value];
    next[i] = digit[0];
    onChange(next);
    if (i < 5) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace') {
      if (value[i]) {
        const next = [...value];
        next[i] = '';
        onChange(next);
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < 5) {
      refs.current[i + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      onChange(text.split(''));
      refs.current[5]?.focus();
      e.preventDefault();
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-14 rounded-xl border-2 border-outline-variant text-center text-xl font-bold text-on-background bg-white focus:border-primary focus:outline-none transition disabled:opacity-50 disabled:bg-surface-container-low"
        />
      ))}
    </div>
  );
}

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
                capture="environment"
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

export function BookingDetailContent({ booking, guestEmail }: Props) {
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

  // Cancel flow state
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelStep, setCancelStep] = useState<'idle' | 'otp' | 'success'>('idle');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [cancelOtp, setCancelOtp] = useState<string[]>(Array(6).fill(''));
  const [cancelConfirming, setCancelConfirming] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const now = new Date();
  const endDate = new Date(booking.endDate);
  const returnUnlocked = now >= endDate;

  const startFmt = new Date(booking.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const endFmt = new Date(booking.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const statusStyle = STATUS_STYLE[booking.status] ?? STATUS_STYLE.pending;

  const statusLabel: Record<string, string> = {
    confirmed:     t.dashboard.confirmed,
    pending:       t.dashboard.pending,
    awaiting_host: t.dashboard.awaitingHost,
    completed:     t.dashboard.completed,
    rejected:      t.dashboard.rejected,
    cancelled:     t.dashboard.cancelled,
  };

  const slotLabels = [
    bd.photoSlot1, bd.photoSlot2, bd.photoSlot3, bd.photoSlot4,
    bd.photoSlot5, bd.photoSlot6, bd.photoSlot7,
  ];

  const canCancel = ['awaiting_host', 'pending'].includes(booking.status);

  const cancelCalc = calculateCancellation({
    startDate: new Date(booking.startDate),
    createdAt: new Date(booking.createdAt),
    status: booking.status,
    totalPrice: booking.totalPrice,
    platformFeeGel: booking.platformFeeGel,
  });

  const tierLabel: Record<string, string> = {
    pre_approval: bd.cancelTierPreApproval,
    grace_period: bd.cancelTierGrace,
    early:        bd.cancelTierEarly,
    standard:     bd.cancelTierStandard,
    late:         bd.cancelTierLate,
    no_refund:    bd.cancelTierNoRefund,
    ineligible:   bd.cancelTierIneligible,
  };

  function openCancel() {
    setCancelStep('idle');
    setCancelOtp(Array(6).fill(''));
    setCancelError(null);
    setCancelOpen(true);
  }

  async function handleSendOtp() {
    setSendingOtp(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel-request`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setCancelError(data.error ?? 'error');
      } else {
        setCancelStep('otp');
      }
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleConfirmCancel() {
    const code = cancelOtp.join('');
    if (code.length !== 6) return;
    setCancelConfirming(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'invalid_code') setCancelError(bd.cancelInvalidCode);
        else if (data.error === 'expired_code') setCancelError(bd.cancelExpiredCode);
        else setCancelError(data.error ?? 'error');
      } else {
        setCancelStep('success');
        setTimeout(() => { setCancelOpen(false); router.refresh(); }, 2500);
      }
    } finally {
      setCancelConfirming(false);
    }
  }

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
    <>
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

                {/* Cancel booking button */}
                {canCancel && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <button
                      onClick={openCancel}
                      className="w-full rounded-xl border-2 border-error/30 bg-error-container/10 py-3 font-bold text-label-sm text-error hover:bg-error-container/20 hover:border-error/50 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                      {bd.cancelBtn}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cancellation Modal */}
      {cancelOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget && cancelStep !== 'success') setCancelOpen(false); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className={`px-6 pt-6 pb-4 flex items-start justify-between gap-3 ${
              cancelStep === 'success' ? 'border-b border-tertiary/20 bg-tertiary-fixed/10' : 'border-b border-slate-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  cancelStep === 'success'
                    ? 'bg-tertiary-fixed/40'
                    : cancelStep === 'otp'
                    ? 'bg-primary-fixed/30'
                    : 'bg-error-container/30'
                }`}>
                  <span className={`material-symbols-outlined text-[22px] ${
                    cancelStep === 'success'
                      ? 'text-tertiary'
                      : cancelStep === 'otp'
                      ? 'text-primary'
                      : 'text-error'
                  }`}>
                    {cancelStep === 'success' ? 'check_circle' : cancelStep === 'otp' ? 'mark_email_read' : 'cancel'}
                  </span>
                </div>
                <h2 className="font-extrabold text-[17px] text-on-background">
                  {cancelStep === 'success'
                    ? bd.cancelSuccess.split('.')[0]
                    : cancelStep === 'otp'
                    ? bd.cancelConfirmTitle
                    : bd.cancelTitle}
                </h2>
              </div>
              {cancelStep !== 'success' && (
                <button
                  onClick={() => setCancelOpen(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-secondary hover:bg-surface-container hover:text-on-background transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* ── Step: idle — refund breakdown ── */}
              {cancelStep === 'idle' && (
                <>
                  {/* Tier badge */}
                  <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${TIER_BADGE[cancelCalc.tier] ?? TIER_BADGE.ineligible}`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {cancelCalc.refundPct === 100 ? 'check_circle' :
                       cancelCalc.refundPct > 0 ? 'info' : 'warning'}
                    </span>
                    <p className="text-label-sm font-bold leading-snug">
                      {tierLabel[cancelCalc.tier] ?? bd.cancelTierIneligible}
                    </p>
                  </div>

                  {/* Days until pickup */}
                  {cancelCalc.daysUntilPickup > 0 && (
                    <p className="text-label-sm text-secondary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                      {bd.daysUntilPickup(cancelCalc.daysUntilPickup)}
                    </p>
                  )}

                  {/* Refund breakdown */}
                  {cancelCalc.eligible && (
                    <div className="rounded-xl border border-outline-variant/40 overflow-hidden">
                      <div className="px-4 py-2.5 bg-surface-container-low border-b border-outline-variant/30">
                        <p className="text-[11px] font-bold text-secondary uppercase tracking-wider">{bd.cancelPolicyTitle}</p>
                      </div>
                      <div className="divide-y divide-slate-100">
                        <div className="flex items-center justify-between gap-2 px-4 py-3">
                          <span className="text-label-sm text-secondary">{bd.cancelBreakdownRental}</span>
                          <span className="text-label-sm font-semibold text-on-background">{gel(booking.totalPrice)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 px-4 py-3">
                          <span className="text-label-sm text-secondary flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-error">remove_circle_outline</span>
                            {bd.cancelBreakdownFeeKept}
                          </span>
                          <span className="text-label-sm font-semibold text-error">− {gel(cancelCalc.platformFeeKept)}</span>
                        </div>
                        {cancelCalc.refundAmount > 0 && (
                          <div className="flex items-center justify-between gap-2 px-4 py-3">
                            <span className="text-label-sm text-secondary flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px] text-tertiary">add_circle_outline</span>
                              {bd.cancelBreakdownRefund} ({cancelCalc.refundPct}%)
                            </span>
                            <span className="text-label-sm font-semibold text-tertiary">+ {gel(cancelCalc.refundAmount)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2 px-4 py-3">
                          <span className="text-label-sm text-secondary flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-tertiary">add_circle_outline</span>
                            {bd.cancelBreakdownDeposit}
                          </span>
                          <span className="text-label-sm font-semibold text-tertiary">+ {gel(cancelCalc.depositRefund)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-tertiary-fixed/10">
                          <span className="text-label-sm font-bold text-on-background">{bd.cancelBreakdownTotal}</span>
                          <span className="text-[16px] font-extrabold text-tertiary">{gel(cancelCalc.totalRefund)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!cancelCalc.eligible && (
                    <div className="rounded-xl border border-error/20 bg-error-container/10 px-4 py-3">
                      <p className="text-label-sm text-error">{bd.cancelTierIneligible}</p>
                    </div>
                  )}

                  <p className="text-[11px] text-secondary leading-relaxed">
                    {bd.cancelPlatformFeeNote}
                    {' · '}
                    <a href="/cancellation-policy" target="_blank" className="text-primary font-semibold hover:underline">
                      {bd.cancelPolicyLink}
                    </a>
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setCancelOpen(false)}
                      className="flex-1 rounded-xl border border-outline-variant py-3 text-label-sm font-bold text-secondary hover:bg-surface-container transition cursor-pointer"
                    >
                      {t.common.cancel}
                    </button>
                    {cancelCalc.eligible && (
                      <button
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="flex-1 rounded-xl bg-error py-3 text-label-sm font-bold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer"
                      >
                        {sendingOtp ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span>
                            {bd.cancelSendingOtp}
                          </span>
                        ) : bd.cancelSendOtp}
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ── Step: otp — enter confirmation code ── */}
              {cancelStep === 'otp' && (
                <>
                  <div className="text-center space-y-1.5">
                    <p className="text-label-sm text-secondary">{bd.cancelOtpSent(maskEmail(guestEmail))}</p>
                  </div>

                  <OtpInput
                    value={cancelOtp}
                    onChange={setCancelOtp}
                    disabled={cancelConfirming}
                  />

                  {cancelError && (
                    <div className="flex items-center gap-2 rounded-xl bg-error-container/20 border border-error/20 px-4 py-3">
                      <span className="material-symbols-outlined text-[16px] text-error">error</span>
                      <p className="text-label-sm text-error font-semibold">{cancelError}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setCancelStep('idle'); setCancelError(null); }}
                      disabled={cancelConfirming}
                      className="flex-1 rounded-xl border border-outline-variant py-3 text-label-sm font-bold text-secondary hover:bg-surface-container transition cursor-pointer disabled:opacity-50"
                    >
                      {t.common.cancel}
                    </button>
                    <button
                      onClick={handleConfirmCancel}
                      disabled={cancelOtp.join('').length !== 6 || cancelConfirming}
                      className="flex-1 rounded-xl bg-error py-3 text-label-sm font-bold text-white hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                    >
                      {cancelConfirming ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span>
                          {bd.cancelConfirming}
                        </span>
                      ) : bd.cancelConfirmBtn}
                    </button>
                  </div>
                </>
              )}

              {/* ── Step: success ── */}
              {cancelStep === 'success' && (
                <div className="flex flex-col items-center text-center py-4 gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-fixed/30">
                    <span className="material-symbols-outlined text-[36px] text-tertiary">check_circle</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-[17px] text-on-background">{bd.cancelSuccess.split('.')[0]}.</p>
                    <p className="text-label-sm text-secondary">{bd.cancelSuccess.split('.')[1]?.trim()}</p>
                  </div>
                  <p className="text-[11px] text-secondary">Redirecting to dashboard…</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
