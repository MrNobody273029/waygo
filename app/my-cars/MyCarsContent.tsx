'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';
import { KYCModal } from '@/components/kyc-modal';
import { VerificationPendingPopup } from '@/components/verification-pending-popup';
import { AvailabilityCalendarModal } from '@/components/availability-calendar';
import { gel } from '@/lib/utils';
import { STANDARD_COMMISSION, PREMIUM_COMMISSION } from '@/lib/constants';

type CarListingStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface HostCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  dailyPrice: number;
  location: string;
  imageUrls: string[];
  isActive: boolean;
  transmission: string;
  fuelType: string;
  seats: number;
  createdAt: Date;
  listingStatus: CarListingStatus;
  listingRejectionComment: string | null;
  trips: number;
}

export interface HostRequest {
  id: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  hostApprovalDeadline: string | null;
  guestName: string;
  guestLang: string;
  guestRating: number;
  guestReviewCount: number;
  carId: string | null;
}

export interface ActiveRental {
  id: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  confirmationCode: string | null;
  guestName: string;
  guestPhone: string | null;
}

interface Props {
  cars: HostCar[];
  hostVerified: boolean;
  hostVerificationStatus: string;
  idCardFront: string | null;
  idCardBack: string | null;
  hostSelfieUrl: string | null;
  hostVerificationRejectionComment: string | null;
  pendingRequests: HostRequest[];
  activeRentals: ActiveRental[];
  isPremiumHost: boolean;
}

export function MyCarsContent({
  cars,
  hostVerified,
  hostVerificationStatus,
  idCardFront,
  idCardBack,
  hostSelfieUrl,
  hostVerificationRejectionComment,
  pendingRequests: initialRequests,
  activeRentals,
  isPremiumHost,
}: Props) {
  const { t } = useLang();
  const router = useRouter();
  const [list, setList] = useState(cars);
  const [requests, setRequests] = useState<HostRequest[]>(initialRequests);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [availCarId, setAvailCarId] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<HostRequest | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/cars/${deleteId}`, { method: 'DELETE' });
    setList(prev => prev.filter(c => c.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
  }

  async function handleApprove(reqId: string) {
    setActioningId(reqId);
    await fetch(`/api/bookings/${reqId}/approve`, { method: 'POST' });
    setRequests(prev => prev.filter(r => r.id !== reqId));
    setActioningId(null);
  }

  async function handleReject(reqId: string, comment?: string) {
    setActioningId(reqId);
    await fetch(`/api/bookings/${reqId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rejectionComment: comment?.trim() || undefined }),
    });
    setRequests(prev => prev.filter(r => r.id !== reqId));
    setActioningId(null);
  }

  function openRejectModal(req: HostRequest) {
    setRejectComment('');
    setRejectTarget(req);
  }

  async function confirmReject() {
    if (!rejectTarget) return;
    setRejectTarget(null);
    await handleReject(rejectTarget.id, rejectComment);
  }

  const commission = isPremiumHost ? PREMIUM_COMMISSION : STANDARD_COMMISSION;
  const hostSharePct = Math.round((1 - commission) * 100);

  function HostVerBanner() {
    if (hostVerified) {
      return (
        <div className="flex items-center gap-3 rounded-2xl border border-tertiary/20 bg-tertiary-fixed/20 px-5 py-4 mb-6">
          <span className="material-symbols-outlined text-tertiary text-[22px]">verified</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-label-bold text-on-background">{t.myCars.hostVerApproved}</p>
              {isPremiumHost && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-[10px] font-black uppercase">
                  <span className="material-symbols-outlined text-[11px]">star</span>
                  Premium Host · 95%
                </span>
              )}
            </div>
            <p className="text-label-sm text-secondary">Your host identity is confirmed. You earn {hostSharePct}% of each rental.</p>
          </div>
        </div>
      );
    }
    if (hostVerificationStatus === 'SUBMITTED') {
      return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 md:px-5 py-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-[22px]">pending_actions</span>
            <div>
              <p className="font-bold text-label-bold text-amber-900">{t.myCars.hostVerPending}</p>
              <p className="text-label-sm text-amber-700">{t.myCars.hostVerPendingSub}</p>
            </div>
          </div>
          <button onClick={() => setShowPending(true)}
            className="shrink-0 rounded-xl border border-amber-300 bg-white px-4 py-2 font-bold text-label-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer">
            {t.kyc.pendingClose}
          </button>
        </div>
      );
    }
    if (hostVerificationStatus === 'REJECTED') {
      return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-error/20 bg-error-container/20 px-4 md:px-5 py-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-[22px]">cancel</span>
            <div>
              <p className="font-bold text-label-bold text-on-background">{t.myCars.hostVerRejected}</p>
              <p className="text-label-sm text-secondary">{t.myCars.hostVerRejectedSub}</p>
            </div>
          </div>
          <button onClick={() => setShowKYC(true)}
            className="shrink-0 rounded-xl bg-error px-4 py-2 font-bold text-label-bold text-white hover:opacity-90 transition cursor-pointer">
            {t.myCars.hostVerRejectedBtn}
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary-fixed/20 px-4 md:px-5 py-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
          <div>
            <p className="font-bold text-label-bold text-on-background">{t.myCars.hostVerBanner}</p>
            <p className="text-label-sm text-secondary">{t.myCars.hostVerBannerSub}</p>
          </div>
        </div>
        <button onClick={() => setShowKYC(true)}
          className="shrink-0 rounded-xl bg-primary-container px-4 py-2 font-bold text-label-bold text-white hover:bg-primary transition cursor-pointer">
          {t.myCars.hostVerBtn}
        </button>
      </div>
    );
  }

  function CarListingStatusBadge({ status }: { status: CarListingStatus }) {
    if (status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-[10px] font-black uppercase">
          <span className="material-symbols-outlined text-[11px]">pending_actions</span>
          {t.myCars.carPending}
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2.5 py-0.5 text-[10px] font-black uppercase">
          <span className="material-symbols-outlined text-[11px]">cancel</span>
          {t.myCars.carRejected}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-[10px] font-black uppercase">
        <span className="material-symbols-outlined text-[11px]">verified</span>
        {t.myCars.carApproved}
      </span>
    );
  }

  return (
    <>
      <KYCModal
        open={showKYC}
        onClose={() => setShowKYC(false)}
        onSuccess={() => { setShowKYC(false); router.refresh(); }}
        verificationType="host"
        initialDocFront={idCardFront}
        initialDocBack={idCardBack}
        initialSelfie={hostSelfieUrl}
        rejectionComment={hostVerificationRejectionComment}
      />
      <VerificationPendingPopup open={showPending} onClose={() => setShowPending(false)} />
      {availCarId && (
        <AvailabilityCalendarModal
          carId={availCarId}
          open={!!availCarId}
          onClose={() => setAvailCarId(null)}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white shadow-2xl p-7 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-error-container/30">
                <span className="material-symbols-outlined text-error text-[24px]">delete</span>
              </div>
              <div>
                <h2 className="font-black text-h3 text-on-background">{t.myCars.deleteTitle}</h2>
                <p className="text-secondary text-label-sm mt-0.5">{t.myCars.deleteText}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-xl border border-outline-variant py-3 font-bold text-label-bold text-secondary hover:bg-surface-container-low transition cursor-pointer">
                {t.myCars.deleteCancel}
              </button>
              <button onClick={confirmDelete} disabled={deleting} className="flex-1 rounded-xl bg-error py-3 font-bold text-label-bold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer">
                {deleting ? <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span> : t.myCars.deleteConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (() => {
        const langNames: Record<string, string> = { en: 'English', ka: 'ქართული', ru: 'Русский' };
        const langName = langNames[rejectTarget.guestLang] ?? 'English';
        const acting = actioningId === rejectTarget.id;
        return (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !acting && setRejectTarget(null)} />
            <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white shadow-2xl p-7 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-error-container/30">
                  <span className="material-symbols-outlined text-error text-[24px]">cancel</span>
                </div>
                <div>
                  <h2 className="font-black text-h3 text-on-background">{t.hostRequests.rejectModalTitle}</h2>
                  <p className="text-secondary text-label-sm mt-0.5">{rejectTarget.carBrand} {rejectTarget.carModel} {rejectTarget.carYear}</p>
                </div>
              </div>

              <p className="text-secondary text-label-sm">{t.hostRequests.rejectModalSub}</p>

              <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[16px] shrink-0">translate</span>
                <p className="text-label-sm font-bold text-amber-800">
                  {t.hostRequests.rejectLangHint} <span className="text-amber-900">{langName}</span>
                </p>
              </div>

              <textarea
                value={rejectComment}
                onChange={e => setRejectComment(e.target.value)}
                placeholder={t.hostRequests.rejectCommentPlaceholder}
                rows={3}
                className="w-full rounded-xl border border-outline-variant px-3.5 py-3 text-label-bold font-semibold text-on-background outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed placeholder:text-slate-400 transition resize-none text-sm"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setRejectTarget(null)}
                  disabled={acting}
                  className="flex-1 rounded-xl border border-outline-variant py-3 font-bold text-label-bold text-secondary hover:bg-surface-container-low transition disabled:opacity-50 cursor-pointer"
                >
                  {t.myCars.deleteCancel}
                </button>
                <button
                  onClick={confirmReject}
                  disabled={acting}
                  className="flex-1 rounded-xl bg-error py-3 font-bold text-label-bold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  {acting
                    ? <><span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span>{t.hostRequests.rejecting}</>
                    : t.hostRequests.rejectConfirmBtn}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <main className="pt-[62px] md:pt-[120px] min-h-screen bg-surface pb-20">
        <div className="mx-auto max-w-screen-xl px-4 md:px-12 py-10">
          <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
            <div>
              <h1 className="text-[24px] md:text-h1 font-extrabold text-on-background">{t.myCars.title}</h1>
              <p className="text-secondary text-[13px] md:text-body-md mt-1">{t.myCars.sub}</p>
            </div>
            {hostVerified && (
              <a href="/become-host" className="flex items-center gap-2 rounded-xl bg-primary-container text-white px-4 md:px-5 py-2.5 md:py-3 font-bold text-label-bold hover:bg-primary transition-all active:scale-95">
                <span className="material-symbols-outlined text-[18px]">add</span>
                {t.myCars.noCarsBtn}
              </a>
            )}
          </div>

          <HostVerBanner />

          {/* Pending booking requests */}
          {requests.length > 0 && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-amber-200">
                <span className="material-symbols-outlined text-amber-600 text-[22px]">notifications_active</span>
                <div>
                  <p className="font-extrabold text-label-bold text-amber-900">{t.hostRequests.title}</p>
                  <p className="text-label-sm text-amber-700">{t.hostRequests.subtitle}</p>
                </div>
              </div>
              <div className="divide-y divide-amber-200">
                {requests.map(req => {
                  const deadline = req.hostApprovalDeadline ? new Date(req.hostApprovalDeadline) : null;
                  const isExpired = deadline && deadline < new Date();
                  const acting = actioningId === req.id;
                  const hours = deadline
                    ? Math.max(0, Math.round((deadline.getTime() - Date.now()) / 3600000))
                    : null;

                  return (
                    <div key={req.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-label-bold text-on-background">
                          {req.carBrand} {req.carModel} {req.carYear}
                        </p>
                        <p className="text-label-sm text-secondary mt-0.5">
                          {new Date(req.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          {' – '}
                          {new Date(req.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}{gel(req.totalPrice)}
                        </p>
                        <p className="text-label-sm font-bold text-tertiary mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">payments</span>
                          {gel(Math.round(req.totalPrice * (1 - commission)))}
                          <span className="text-[10px] font-normal text-secondary">({hostSharePct}% {isPremiumHost ? '· Premium' : ''})</span>
                        </p>
                        <p className="text-label-sm text-secondary mt-0.5 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">person</span>
                            {req.guestName}
                          </span>
                          {req.guestReviewCount === 0 ? (
                            <span className="inline-flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-500">
                              <span className="material-symbols-outlined text-[11px]">star</span>
                              {t.reviews.newBadge}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-700">
                              <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              {req.guestRating.toFixed(1)} · {t.reviews.reviewsText(req.guestReviewCount)}
                            </span>
                          )}
                        </p>
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-error mt-1">
                            <span className="material-symbols-outlined text-[13px]">timer_off</span>
                            {t.hostRequests.autoRejected}
                          </span>
                        ) : hours !== null && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 mt-1">
                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                            {t.hostRequests.deadlineLabel}: {hours}h
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {isExpired ? (
                          <button onClick={() => openRejectModal(req)} disabled={acting}
                            className="rounded-xl border border-error/30 px-4 py-2 font-bold text-label-sm text-error hover:bg-error-container/20 transition disabled:opacity-60 cursor-pointer">
                            {acting ? <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span> : t.hostRequests.expired}
                          </button>
                        ) : (
                          <>
                            <button onClick={() => openRejectModal(req)} disabled={acting}
                              className="rounded-xl border border-error/30 px-4 py-2.5 font-bold text-label-bold text-error hover:bg-error-container/20 transition disabled:opacity-60 cursor-pointer">
                              {acting ? <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span> : t.hostRequests.reject}
                            </button>
                            <button onClick={() => handleApprove(req.id)} disabled={acting}
                              className="rounded-xl bg-tertiary px-4 py-2.5 font-bold text-label-bold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer">
                              {acting ? <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span> : t.hostRequests.approve}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Rentals — confirmed bookings with guest contact */}
          {activeRentals.length > 0 && (
            <div className="rounded-2xl border border-tertiary/30 bg-white shadow-card overflow-hidden mb-8">
              <div className="flex items-center gap-2 border-b border-tertiary/20 bg-tertiary-fixed/10 px-5 py-4">
                <span className="material-symbols-outlined text-[20px] text-tertiary">directions_car</span>
                <h2 className="font-extrabold text-label-bold text-on-background">Active Rentals</h2>
                <span className="ml-auto rounded-full bg-tertiary px-2.5 py-0.5 text-[11px] font-bold text-white">{activeRentals.length}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {activeRentals.map(r => {
                  const startFmt = new Date(r.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                  const endFmt = new Date(r.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                  const statusBadge: Record<string, string> = {
                    pending: 'bg-amber-50 text-amber-700',
                    confirmed: 'bg-tertiary-fixed/40 text-tertiary',
                    return_review: 'bg-amber-50 text-amber-700',
                  };
                  return (
                    <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-label-bold text-on-background">{r.carBrand} {r.carModel} {r.carYear}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${statusBadge[r.status] ?? 'bg-surface-container text-secondary'}`}>
                            {r.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-label-sm text-secondary">
                          {startFmt} – {endFmt}
                          <span className="mx-2">·</span>
                          <span className="material-symbols-outlined text-[12px] align-middle mr-0.5">person</span>
                          {r.guestName}
                        </p>
                        {r.confirmationCode && (
                          <p className="mt-1 flex items-center gap-1 text-[12px] font-bold text-primary">
                            <span className="material-symbols-outlined text-[13px]">key</span>
                            <span className="font-mono tracking-widest">{r.confirmationCode}</span>
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        {r.guestPhone ? (
                          <a
                            href={`https://wa.me/${r.guestPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-label-sm text-white transition active:scale-95"
                            style={{ background: '#25D366' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            {r.guestPhone}
                          </a>
                        ) : (
                          <span className="text-label-sm text-secondary italic">No phone</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-surface-container">
                <span className="material-symbols-outlined text-[52px] text-slate-300">directions_car</span>
              </div>
              <div>
                <p className="font-bold text-h3 text-on-background">{t.myCars.noCars}</p>
                <p className="text-secondary text-body-md mt-1">{t.myCars.sub}</p>
              </div>
              {hostVerified && (
                <a href="/become-host" className="flex items-center gap-2 rounded-xl bg-primary-container text-white px-6 py-3 font-bold text-label-bold hover:bg-primary transition-all active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  {t.myCars.noCarsBtn}
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map(car => (
                <div key={car.id} className="rounded-2xl border border-outline-variant/40 bg-white shadow-card overflow-hidden flex flex-col">
                  <div className="relative h-48 bg-surface-container overflow-hidden">
                    {car.imageUrls[0] ? (
                      <img src={car.imageUrls[0]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[52px] text-slate-300">directions_car</span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3">
                      <CarListingStatusBadge status={car.listingStatus} />
                    </span>
                    {car.imageUrls.length > 1 && (
                      <span className="absolute bottom-3 right-3 bg-black/50 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {car.imageUrls.length} photos
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1 gap-3">
                    <div>
                      <h3 className="font-extrabold text-h3 text-on-background">{car.brand} {car.model} {car.year}</h3>
                      <p className="text-secondary text-label-sm flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {car.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-label-sm text-secondary">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">settings</span>
                        {car.transmission}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">local_gas_station</span>
                        {car.fuelType}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">person</span>
                        {car.seats}
                      </span>
                      {car.trips > 0 && (
                        <span className="flex items-center gap-1 text-tertiary font-bold">
                          <span className="material-symbols-outlined text-[14px]">directions_car</span>
                          {car.trips} trips
                        </span>
                      )}
                    </div>

                    {car.listingStatus === 'REJECTED' && car.listingRejectionComment && (
                      <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
                        <p className="text-[10px] font-black uppercase tracking-wider text-red-400 mb-1">{t.myCars.carRejectedComment}</p>
                        <p className="text-[12px] text-red-700 leading-relaxed">{car.listingRejectionComment}</p>
                      </div>
                    )}

                    {car.listingStatus === 'PENDING' && (
                      <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500 text-[16px]">lock</span>
                        <p className="text-[12px] text-amber-700 font-semibold">{t.myCars.pendingLocked}</p>
                      </div>
                    )}

                    <div className="flex items-baseline gap-1 mt-auto pt-1">
                      <span className="text-h2 font-black text-primary">{gel(car.dailyPrice)}</span>
                      <span className="text-secondary text-label-sm">{t.myCars.perDay}</span>
                    </div>

                    {/* Action buttons */}
                    {car.listingStatus === 'PENDING' ? null : car.listingStatus === 'REJECTED' ? (
                      <div className="flex gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => router.push(`/edit-car/${car.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 font-bold text-label-bold text-white hover:bg-amber-600 transition cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">build</span>
                          {t.myCars.fixBtn}
                        </button>
                        <button
                          onClick={() => setDeleteId(car.id)}
                          className="flex items-center justify-center gap-2 rounded-xl border border-error/30 px-3 py-2.5 font-bold text-label-bold text-error hover:bg-error-container/30 transition cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => setAvailCarId(car.id)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary-fixed/20 px-3 py-2.5 font-bold text-label-bold text-primary hover:bg-primary-fixed/30 transition cursor-pointer"
                          title={t.myCars.availabilityBtn}
                        >
                          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                          <span className="hidden sm:inline text-[12px]">{t.myCars.availabilityBtn}</span>
                        </button>
                        <button
                          onClick={() => router.push(`/edit-car/${car.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-outline-variant py-2.5 font-bold text-label-bold text-on-background hover:border-primary hover:text-primary transition cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          {t.myCars.editBtn}
                        </button>
                        <button
                          onClick={() => setDeleteId(car.id)}
                          className="flex items-center justify-center gap-2 rounded-xl border border-error/30 px-3 py-2.5 font-bold text-label-bold text-error hover:bg-error-container/30 transition cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
