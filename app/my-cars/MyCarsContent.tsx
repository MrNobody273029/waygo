'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';
import { KYCModal } from '@/components/kyc-modal';
import { VerificationPendingPopup } from '@/components/verification-pending-popup';
import { AvailabilityCalendarModal } from '@/components/availability-calendar';
import { gel } from '@/lib/utils';

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
  carId: string | null;
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

  async function handleReject(reqId: string) {
    setActioningId(reqId);
    await fetch(`/api/bookings/${reqId}/reject`, { method: 'POST' });
    setRequests(prev => prev.filter(r => r.id !== reqId));
    setActioningId(null);
  }

  function HostVerBanner() {
    if (hostVerified) {
      return (
        <div className="flex items-center gap-3 rounded-2xl border border-tertiary/20 bg-tertiary-fixed/20 px-5 py-4 mb-6">
          <span className="material-symbols-outlined text-tertiary text-[22px]">verified</span>
          <div>
            <p className="font-bold text-label-bold text-on-background">{t.myCars.hostVerApproved}</p>
            <p className="text-label-sm text-secondary">Your host identity is confirmed. You can list and manage cars.</p>
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

      <main className="pt-[62px] md:pt-[73px] min-h-screen bg-surface pb-20">
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
                        <p className="text-label-sm text-secondary mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">person</span>
                          {req.guestName}
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
                          <button onClick={() => handleReject(req.id)} disabled={acting}
                            className="rounded-xl border border-error/30 px-4 py-2 font-bold text-label-sm text-error hover:bg-error-container/20 transition disabled:opacity-60 cursor-pointer">
                            {acting ? <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span> : t.hostRequests.expired}
                          </button>
                        ) : (
                          <>
                            <button onClick={() => handleReject(req.id)} disabled={acting}
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
