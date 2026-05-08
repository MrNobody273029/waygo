'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';

type VerificationStatus = 'UNVERIFIED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
type CarListingStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface VerificationUser {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  idNumber: string | null;
  birthDate: Date | null;
  createdAt: Date;
  lang: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  driverLicenseFront: string | null;
  driverLicenseBack: string | null;
  selfieUrl: string | null;
  hostVerified: boolean;
  hostVerificationStatus: VerificationStatus;
  idCardFront: string | null;
  idCardBack: string | null;
  hostSelfieUrl: string | null;
}

function calcAge(birthDate: Date | null): string {
  if (!birthDate) return '';
  const today = new Date();
  const bd = new Date(birthDate);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return `${age} y.o.`;
}

interface PendingCarItem {
  id: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  color: string;
  location: string;
  dailyPrice: number;
  seats: number;
  doors: number;
  transmission: string;
  fuelType: string;
  imageUrls: string[];
  techPassportFront: string | null;
  techPassportBack: string | null;
  listingStatus: CarListingStatus;
  listingRejectionComment: string | null;
  createdAt: Date;
  owner: { id: string; fullName: string; email: string | null; lang: string };
}

type Tab = 'guest' | 'host' | 'cars';

const STATUS_BADGE_CLS: Record<VerificationStatus, { cls: string; icon: string }> = {
  UNVERIFIED: { cls: 'bg-slate-100 text-slate-500',        icon: 'help' },
  SUBMITTED:  { cls: 'bg-amber-50 text-amber-700',         icon: 'pending_actions' },
  APPROVED:   { cls: 'bg-tertiary-fixed/40 text-tertiary', icon: 'verified' },
  REJECTED:   { cls: 'bg-error-container/40 text-error',   icon: 'cancel' },
};

const CAR_STATUS_BADGE_CLS: Record<CarListingStatus, { cls: string; icon: string }> = {
  PENDING:  { cls: 'bg-amber-50 text-amber-700',         icon: 'pending_actions' },
  APPROVED: { cls: 'bg-tertiary-fixed/40 text-tertiary', icon: 'verified' },
  REJECTED: { cls: 'bg-error-container/40 text-error',   icon: 'cancel' },
};

const LANG_BADGE: Record<string, { cls: string; label: string }> = {
  ka: { cls: 'bg-red-50 text-red-700 border border-red-200',    label: '🇬🇪 KA' },
  en: { cls: 'bg-blue-50 text-blue-700 border border-blue-200', label: '🇬🇧 EN' },
  ru: { cls: 'bg-sky-50 text-sky-700 border border-sky-200',    label: '🇷🇺 RU' },
};

function StatusBadge({ status }: { status: VerificationStatus }) {
  const { t } = useLang();
  const b = STATUS_BADGE_CLS[status];
  const labels: Record<VerificationStatus, string> = {
    UNVERIFIED: t.admin.statusUnverified,
    SUBMITTED:  t.admin.statusPending,
    APPROVED:   t.admin.statusApproved,
    REJECTED:   t.admin.statusRejected,
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${b.cls}`}>
      <span className="material-symbols-outlined text-[12px]">{b.icon}</span>
      {labels[status]}
    </span>
  );
}

function CarStatusBadge({ status }: { status: CarListingStatus }) {
  const { t } = useLang();
  const b = CAR_STATUS_BADGE_CLS[status];
  const labels: Record<CarListingStatus, string> = {
    PENDING:  t.admin.statusPending,
    APPROVED: t.admin.statusApproved,
    REJECTED: t.admin.statusRejected,
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${b.cls}`}>
      <span className="material-symbols-outlined text-[12px]">{b.icon}</span>
      {labels[status]}
    </span>
  );
}

function LangBadge({ lang }: { lang: string }) {
  const b = LANG_BADGE[lang] ?? LANG_BADGE.en;
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-black ${b.cls}`}>
      {b.label}
    </span>
  );
}

function PhotoCard({ src, label }: { src: string | null; label: string }) {
  if (!src) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
        <div className="aspect-video rounded-xl bg-slate-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-slate-300 text-[32px]">image_not_supported</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <a href={src} target="_blank" rel="noreferrer" className="block aspect-video rounded-xl overflow-hidden bg-slate-100 hover:opacity-90 transition">
        <img src={src} alt={label} className="w-full h-full object-cover" />
      </a>
    </div>
  );
}

interface CardSharedProps {
  rejectingId: string | null;
  rejectComment: string;
  loading: string | null;
  onRejectComment: (v: string) => void;
  onStartReject: (id: string) => void;
  onCancelReject: () => void;
  onAction: (userId: string, action: string, comment?: string) => void;
}

function GuestCard({ u, rejectingId, rejectComment, loading, onRejectComment, onStartReject, onCancelReject, onAction }: { u: VerificationUser } & CardSharedProps) {
  const { t } = useLang();
  const isPending = u.verificationStatus === 'SUBMITTED';
  const isRejectOpen = rejectingId === u.id + '-guest';
  const busy = (a: string) => loading === `${u.id}-${a}`;

  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-white p-5 shadow-card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-label-bold text-on-background">{u.fullName}</p>
          <p className="text-label-sm text-secondary">{u.email}</p>
          {u.phone && <p className="text-label-sm text-slate-500 mt-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">phone</span>{u.phone}</p>}
          {u.idNumber && <p className="text-label-sm font-bold text-primary mt-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">badge</span>{u.idNumber}</p>}
          {u.birthDate && (
            <p className="text-label-sm text-slate-600 mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">cake</span>
              {new Date(u.birthDate).toLocaleDateString('en-GB')}
              <span className="font-bold text-on-background">· {calcAge(u.birthDate)}</span>
            </p>
          )}
          <p className="text-label-sm text-slate-400 mt-0.5">{t.admin.joinedPrefix} {new Date(u.createdAt).toLocaleDateString('en-GB')}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={u.verificationStatus} />
          <LangBadge lang={u.lang} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <PhotoCard src={u.driverLicenseFront} label={t.admin.dlFront} />
        <PhotoCard src={u.driverLicenseBack}  label={t.admin.dlBack} />
        <PhotoCard src={u.selfieUrl}           label={t.admin.selfie} />
      </div>

      {isPending && !isRejectOpen && (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button onClick={() => onAction(u.id, 'approve_guest')} disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-tertiary-fixed/40 text-tertiary border border-tertiary/20 py-2.5 font-bold text-label-bold hover:bg-tertiary/10 transition disabled:opacity-60 cursor-pointer">
            {busy('approve_guest') ? <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span> : <span className="material-symbols-outlined text-[16px]">check_circle</span>}
            {t.admin.approve}
          </button>
          <button onClick={() => onStartReject(u.id + '-guest')} disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-error-container/30 text-error border border-error/20 py-2.5 font-bold text-label-bold hover:bg-error/10 transition disabled:opacity-60 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            {t.admin.reject}
          </button>
        </div>
      )}

      {isPending && isRejectOpen && (
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              {t.admin.rejectionCommentGuest} <LangBadge lang={u.lang} />
            </p>
            <textarea value={rejectComment} onChange={e => onRejectComment(e.target.value)} rows={3}
              placeholder={u.lang === 'ka' ? 'დაწერე მიზეზი ქართულად…' : u.lang === 'ru' ? 'Напишите причину по-русски…' : 'Write the reason in English…'}
              className="w-full rounded-xl border border-outline-variant px-3.5 py-2.5 text-label-bold text-on-background outline-none focus:border-error focus:ring-2 focus:ring-error/20 resize-none placeholder:text-slate-400 transition" />
          </div>
          <div className="flex gap-2">
            <button onClick={onCancelReject} className="flex-1 rounded-xl border border-outline-variant py-2.5 font-bold text-label-bold text-secondary hover:bg-slate-50 transition cursor-pointer">{t.admin.cancelBtn}</button>
            <button onClick={() => onAction(u.id, 'reject_guest', rejectComment || undefined)} disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-error text-white py-2.5 font-bold text-label-bold hover:opacity-90 transition disabled:opacity-60 cursor-pointer">
              {busy('reject_guest') ? <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span> : <span className="material-symbols-outlined text-[16px]">cancel</span>}
              {t.admin.confirmReject}
            </button>
          </div>
        </div>
      )}

      {u.verificationStatus === 'APPROVED' && (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button onClick={() => onAction(u.id, 'reject_guest')} disabled={!!loading}
            className="flex items-center gap-1.5 rounded-xl border border-error/20 text-error px-4 py-2 font-semibold text-label-bold hover:bg-error/5 transition disabled:opacity-60 cursor-pointer">
            <span className="material-symbols-outlined text-[15px]">cancel</span>
            {t.admin.revoke}
          </button>
        </div>
      )}

      {u.verificationStatus === 'REJECTED' && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[13px]">info</span>
            {t.admin.awaitingResubmitGuest}
          </p>
        </div>
      )}
    </div>
  );
}

function HostCard({ u, rejectingId, rejectComment, loading, onRejectComment, onStartReject, onCancelReject, onAction }: { u: VerificationUser } & CardSharedProps) {
  const { t } = useLang();
  const isPending = u.hostVerificationStatus === 'SUBMITTED';
  const isRejectOpen = rejectingId === u.id + '-host';
  const busy = (a: string) => loading === `${u.id}-${a}`;

  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-white p-5 shadow-card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-label-bold text-on-background">{u.fullName}</p>
          <p className="text-label-sm text-secondary">{u.email}</p>
          {u.phone && <p className="text-label-sm text-slate-500 mt-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">phone</span>{u.phone}</p>}
          {u.idNumber && <p className="text-label-sm font-bold text-primary mt-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">badge</span>{u.idNumber}</p>}
          {u.birthDate && (
            <p className="text-label-sm text-slate-600 mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">cake</span>
              {new Date(u.birthDate).toLocaleDateString('en-GB')}
              <span className="font-bold text-on-background">· {calcAge(u.birthDate)}</span>
            </p>
          )}
          <p className="text-label-sm text-slate-400 mt-0.5">{t.admin.joinedPrefix} {new Date(u.createdAt).toLocaleDateString('en-GB')}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={u.hostVerificationStatus} />
          <LangBadge lang={u.lang} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <PhotoCard src={u.idCardFront}   label={t.admin.idFront} />
        <PhotoCard src={u.idCardBack}    label={t.admin.idBack} />
        <PhotoCard src={u.hostSelfieUrl} label={t.admin.selfie} />
      </div>

      {isPending && !isRejectOpen && (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button onClick={() => onAction(u.id, 'approve_host')} disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-tertiary-fixed/40 text-tertiary border border-tertiary/20 py-2.5 font-bold text-label-bold hover:bg-tertiary/10 transition disabled:opacity-60 cursor-pointer">
            {busy('approve_host') ? <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span> : <span className="material-symbols-outlined text-[16px]">check_circle</span>}
            {t.admin.approve}
          </button>
          <button onClick={() => onStartReject(u.id + '-host')} disabled={!!loading}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-error-container/30 text-error border border-error/20 py-2.5 font-bold text-label-bold hover:bg-error/10 transition disabled:opacity-60 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            {t.admin.reject}
          </button>
        </div>
      )}

      {isPending && isRejectOpen && (
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              {t.admin.rejectionCommentGuest} <LangBadge lang={u.lang} />
            </p>
            <textarea value={rejectComment} onChange={e => onRejectComment(e.target.value)} rows={3}
              placeholder={u.lang === 'ka' ? 'დაწერე მიზეზი ქართულად…' : u.lang === 'ru' ? 'Напишите причину по-русски…' : 'Write the reason in English…'}
              className="w-full rounded-xl border border-outline-variant px-3.5 py-2.5 text-label-bold text-on-background outline-none focus:border-error focus:ring-2 focus:ring-error/20 resize-none placeholder:text-slate-400 transition" />
          </div>
          <div className="flex gap-2">
            <button onClick={onCancelReject} className="flex-1 rounded-xl border border-outline-variant py-2.5 font-bold text-label-bold text-secondary hover:bg-slate-50 transition cursor-pointer">{t.admin.cancelBtn}</button>
            <button onClick={() => onAction(u.id, 'reject_host', rejectComment || undefined)} disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-error text-white py-2.5 font-bold text-label-bold hover:opacity-90 transition disabled:opacity-60 cursor-pointer">
              {busy('reject_host') ? <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span> : <span className="material-symbols-outlined text-[16px]">cancel</span>}
              {t.admin.confirmReject}
            </button>
          </div>
        </div>
      )}

      {u.hostVerificationStatus === 'APPROVED' && (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button onClick={() => onAction(u.id, 'reject_host')} disabled={!!loading}
            className="flex items-center gap-1.5 rounded-xl border border-error/20 text-error px-4 py-2 font-semibold text-label-bold hover:bg-error/5 transition disabled:opacity-60 cursor-pointer">
            <span className="material-symbols-outlined text-[15px]">cancel</span>
            {t.admin.revoke}
          </button>
        </div>
      )}

      {u.hostVerificationStatus === 'REJECTED' && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[13px]">info</span>
            {t.admin.awaitingResubmitHost}
          </p>
        </div>
      )}
    </div>
  );
}

interface CarCardSharedProps {
  rejectingCarId: string | null;
  rejectCarComment: string;
  carLoading: string | null;
  onRejectCarComment: (v: string) => void;
  onStartRejectCar: (id: string) => void;
  onCancelRejectCar: () => void;
  onCarAction: (carId: string, action: 'approve' | 'reject', comment?: string) => void;
}

function CarCard({ car, rejectingCarId, rejectCarComment, carLoading, onRejectCarComment, onStartRejectCar, onCancelRejectCar, onCarAction }: { car: PendingCarItem } & CarCardSharedProps) {
  const { t } = useLang();
  const isPending = car.listingStatus === 'PENDING';
  const isRejectOpen = rejectingCarId === car.id;
  const busy = (a: string) => carLoading === `${car.id}-${a}`;

  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-white p-5 shadow-card space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-label-bold text-on-background">{car.brand} {car.model} {car.year}</p>
          <p className="text-label-sm text-secondary flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[13px]">pin</span>
            {car.plateNumber}
            <span className="mx-1 text-slate-300">·</span>
            <span className="material-symbols-outlined text-[13px]">location_on</span>
            {car.location}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px] text-slate-500">
            <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px]">person</span>{car.seats}</span>
            <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px]">door_open</span>{car.doors}</span>
            <span>{car.transmission}</span>
            <span>{car.fuelType}</span>
            <span className="font-bold text-primary">{car.dailyPrice} {t.admin.gelPerDay}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <CarStatusBadge status={car.listingStatus} />
          <LangBadge lang={car.owner.lang} />
        </div>
      </div>

      {/* Owner info */}
      <div className="rounded-xl bg-slate-50 px-3 py-2.5 flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
        <div>
          <p className="text-[12px] font-bold text-on-background">{car.owner.fullName}</p>
          <p className="text-[11px] text-slate-400">{car.owner.email}</p>
        </div>
        <p className="ml-auto text-[10px] text-slate-400">{new Date(car.createdAt).toLocaleDateString('en-GB')}</p>
      </div>

      {/* Car photos grid */}
      {car.imageUrls.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">{t.admin.carPhotos} ({car.imageUrls.length})</p>
          <div className="grid grid-cols-3 gap-2">
            {car.imageUrls.slice(0, 6).map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-video rounded-lg overflow-hidden bg-slate-100 hover:opacity-90 transition">
                <img src={url} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
          {car.imageUrls.length > 6 && (
            <p className="text-[10px] text-slate-400 mt-1">+{car.imageUrls.length - 6} {t.admin.morePhotos}</p>
          )}
        </div>
      )}

      {/* Tech passport */}
      <div className="grid grid-cols-2 gap-3">
        <PhotoCard src={car.techPassportFront} label={t.admin.techPassFront} />
        <PhotoCard src={car.techPassportBack}  label={t.admin.techPassBack} />
      </div>

      {/* Actions */}
      {isPending && !isRejectOpen && (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button onClick={() => onCarAction(car.id, 'approve')} disabled={!!carLoading}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-tertiary-fixed/40 text-tertiary border border-tertiary/20 py-2.5 font-bold text-label-bold hover:bg-tertiary/10 transition disabled:opacity-60 cursor-pointer">
            {busy('approve') ? <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span> : <span className="material-symbols-outlined text-[16px]">check_circle</span>}
            {t.admin.approve}
          </button>
          <button onClick={() => onStartRejectCar(car.id)} disabled={!!carLoading}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-error-container/30 text-error border border-error/20 py-2.5 font-bold text-label-bold hover:bg-error/10 transition disabled:opacity-60 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            {t.admin.reject}
          </button>
        </div>
      )}

      {isPending && isRejectOpen && (
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              {t.admin.rejectionCommentCar} <LangBadge lang={car.owner.lang} />
            </p>
            <textarea value={rejectCarComment} onChange={e => onRejectCarComment(e.target.value)} rows={3}
              placeholder={
                car.owner.lang === 'ka' ? 'დაწერე მიზეზი ქართულად…'
                : car.owner.lang === 'ru' ? 'Напишите причину по-русски…'
                : 'Write the reason in English…'
              }
              className="w-full rounded-xl border border-outline-variant px-3.5 py-2.5 text-label-bold text-on-background outline-none focus:border-error focus:ring-2 focus:ring-error/20 resize-none placeholder:text-slate-400 transition" />
          </div>
          <div className="flex gap-2">
            <button onClick={onCancelRejectCar} className="flex-1 rounded-xl border border-outline-variant py-2.5 font-bold text-label-bold text-secondary hover:bg-slate-50 transition cursor-pointer">{t.admin.cancelBtn}</button>
            <button onClick={() => onCarAction(car.id, 'reject', rejectCarComment || undefined)} disabled={!!carLoading}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-error text-white py-2.5 font-bold text-label-bold hover:opacity-90 transition disabled:opacity-60 cursor-pointer">
              {busy('reject') ? <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span> : <span className="material-symbols-outlined text-[16px]">cancel</span>}
              {t.admin.confirmReject}
            </button>
          </div>
        </div>
      )}

      {car.listingStatus === 'APPROVED' && (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button onClick={() => onCarAction(car.id, 'reject')} disabled={!!carLoading}
            className="flex items-center gap-1.5 rounded-xl border border-error/20 text-error px-4 py-2 font-semibold text-label-bold hover:bg-error/5 transition disabled:opacity-60 cursor-pointer">
            <span className="material-symbols-outlined text-[15px]">cancel</span>
            {t.admin.revokeApproval}
          </button>
        </div>
      )}

      {car.listingStatus === 'REJECTED' && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {car.listingRejectionComment && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-red-400 mb-1">{t.admin.rejectionNote}</p>
              <p className="text-[12px] text-red-700">{car.listingRejectionComment}</p>
            </div>
          )}
          <button onClick={() => onCarAction(car.id, 'approve')} disabled={!!carLoading}
            className="flex items-center gap-1.5 rounded-xl border border-tertiary/20 text-tertiary px-4 py-2 font-semibold text-label-bold hover:bg-tertiary/5 transition disabled:opacity-60 cursor-pointer">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            {t.admin.approve}
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminVerificationsContent({ users, cars }: { users: VerificationUser[]; cars: PendingCarItem[] }) {
  const { t } = useLang();
  const router = useRouter();

  // User verification state
  const [tab, setTab] = useState<Tab>('guest');
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  // Car listing state
  const [carLoading, setCarLoading] = useState<string | null>(null);
  const [rejectingCarId, setRejectingCarId] = useState<string | null>(null);
  const [rejectCarComment, setRejectCarComment] = useState('');

  const guestUsers = users.filter(u => u.verificationStatus !== 'UNVERIFIED');
  const hostUsers  = users.filter(u => u.hostVerificationStatus !== 'UNVERIFIED');

  const pendingGuest = guestUsers.filter(u => u.verificationStatus === 'SUBMITTED').length;
  const pendingHost  = hostUsers.filter(u => u.hostVerificationStatus === 'SUBMITTED').length;
  const pendingCars  = cars.filter(c => c.listingStatus === 'PENDING').length;

  async function doAction(userId: string, action: string, comment?: string) {
    setLoading(`${userId}-${action}`);
    await fetch(`/api/admin/verifications/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, comment }),
    });
    setLoading(null);
    setRejectingId(null);
    setRejectComment('');
    router.refresh();
  }

  async function doCarAction(carId: string, action: 'approve' | 'reject', comment?: string) {
    setCarLoading(`${carId}-${action}`);
    await fetch(`/api/admin/car-listings/${carId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, comment }),
    });
    setCarLoading(null);
    setRejectingCarId(null);
    setRejectCarComment('');
    router.refresh();
  }

  const sharedProps: CardSharedProps = {
    rejectingId,
    rejectComment,
    loading,
    onRejectComment: setRejectComment,
    onStartReject: (id) => { setRejectingId(id); setRejectComment(''); },
    onCancelReject: () => { setRejectingId(null); setRejectComment(''); },
    onAction: doAction,
  };

  const carCardProps: CarCardSharedProps = {
    rejectingCarId,
    rejectCarComment,
    carLoading,
    onRejectCarComment: setRejectCarComment,
    onStartRejectCar: (id) => { setRejectingCarId(id); setRejectCarComment(''); },
    onCancelRejectCar: () => { setRejectingCarId(null); setRejectCarComment(''); },
    onCarAction: doCarAction,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] md:text-2xl font-black text-slate-950">{t.admin.verifications}</h1>
        <p className="text-slate-500 text-sm mt-1">{t.admin.pendingReview}</p>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit flex-wrap">
        <button onClick={() => setTab('guest')}
          className={`flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${tab === 'guest' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
          <span className="material-symbols-outlined text-[16px]">badge</span>
          {t.admin.guestRenter}
          {pendingGuest > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white">{pendingGuest}</span>}
        </button>
        <button onClick={() => setTab('host')}
          className={`flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${tab === 'host' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
          <span className="material-symbols-outlined text-[16px]">shield_person</span>
          {t.admin.hostLessor}
          {pendingHost > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white">{pendingHost}</span>}
        </button>
        <button onClick={() => setTab('cars')}
          className={`flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${tab === 'cars' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
          <span className="material-symbols-outlined text-[16px]">directions_car</span>
          {t.admin.carListings}
          {pendingCars > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white">{pendingCars}</span>}
        </button>
      </div>

      {tab === 'guest' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white/5 px-3 py-1.5 w-fit">
            <p className="text-xs text-slate-400">
              <span className="font-black text-white">{guestUsers.length}</span> {t.admin.submissions}
              {pendingGuest > 0 && <> · <span className="font-black text-amber-400">{pendingGuest} {t.admin.pendingLabel}</span></>}
            </p>
          </div>
          {guestUsers.length === 0 ? (
            <div className="rounded-2xl bg-white/5 p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-slate-600">verified_user</span>
              <p className="text-slate-400 mt-3">{t.admin.noGuestSubmissions}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {guestUsers.map(u => <GuestCard key={u.id} u={u} {...sharedProps} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'host' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white/5 px-3 py-1.5 w-fit">
            <p className="text-xs text-slate-400">
              <span className="font-black text-white">{hostUsers.length}</span> {t.admin.submissions}
              {pendingHost > 0 && <> · <span className="font-black text-amber-400">{pendingHost} {t.admin.pendingLabel}</span></>}
            </p>
          </div>
          {hostUsers.length === 0 ? (
            <div className="rounded-2xl bg-white/5 p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-slate-600">directions_car</span>
              <p className="text-slate-400 mt-3">{t.admin.noHostSubmissions}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {hostUsers.map(u => <HostCard key={u.id} u={u} {...sharedProps} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'cars' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white/5 px-3 py-1.5 w-fit">
            <p className="text-xs text-slate-400">
              <span className="font-black text-white">{cars.length}</span> {t.admin.carListings}
              {pendingCars > 0 && <> · <span className="font-black text-amber-400">{pendingCars} {t.admin.listingsPending}</span></>}
            </p>
          </div>
          {cars.length === 0 ? (
            <div className="rounded-2xl bg-white/5 p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-slate-600">directions_car</span>
              <p className="text-slate-400 mt-3">{t.admin.noCarSubmissions}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {cars.map(car => <CarCard key={car.id} car={car} {...carCardProps} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
