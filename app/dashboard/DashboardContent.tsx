'use client';
import { useState } from 'react';
import { gel } from '@/lib/utils';
import { useLang } from '@/components/lang-provider';
import { KYCModal } from '@/components/kyc-modal';
import { VerificationPendingPopup } from '@/components/verification-pending-popup';

interface Booking {
  id: string;
  car: string;
  dates: string;
  status: string;
  amount: number;
}

interface Props {
  name: string;
  email: string;
  bookings: Booking[];
  totalSpent: number;
  upcomingTrips: number;
  memberSince: string;
  rating: number;
  reviewCount: number;
  verificationStatus: string;
  verificationRejectionComment: string | null;
}

export function DashboardContent({ name, email, bookings, totalSpent, upcomingTrips, memberSince, rating, reviewCount, verificationStatus, verificationRejectionComment }: Props) {
  const { t } = useLang();
  const firstName = name.split(' ')[0];
  const [showKYC, setShowKYC] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const isVerified = verificationStatus === 'APPROVED';
  const isSubmitted = verificationStatus === 'SUBMITTED';
  const isRejected = verificationStatus === 'REJECTED';

  const statusStyle: Record<string, { cls: string; icon: string }> = {
    awaiting_host: { cls: 'bg-primary-fixed/40 text-primary',      icon: 'hourglass_empty' },
    confirmed:     { cls: 'bg-tertiary-fixed/40 text-tertiary',    icon: 'check_circle' },
    pending:       { cls: 'bg-amber-50 text-amber-700',            icon: 'schedule' },
    completed:     { cls: 'bg-surface-container text-secondary',   icon: 'task_alt' },
    rejected:      { cls: 'bg-error-container/40 text-error',      icon: 'cancel' },
    cancelled:     { cls: 'bg-surface-container text-secondary',   icon: 'remove_circle' },
  };

  const statusLabel: Record<string, string> = {
    awaiting_host: t.dashboard.awaitingHost,
    confirmed:     t.dashboard.confirmed,
    pending:       t.dashboard.pending,
    completed:     t.dashboard.completed,
    rejected:      t.dashboard.rejected,
    cancelled:     t.dashboard.cancelled,
  };

  const verBadge = isVerified
    ? { cls: 'bg-tertiary-fixed/40 text-tertiary',     label: t.dashboard.confirmed }
    : isSubmitted
    ? { cls: 'bg-amber-50 text-amber-700',             label: t.dashboard.pending }
    : isRejected
    ? { cls: 'bg-error-container/40 text-error',       label: t.kyc.rejectedLabel }
    : { cls: 'bg-surface-container text-secondary',    label: t.dashboard.verifyIdentity };

  function handleVerifyClick() {
    if (isSubmitted) { setShowPending(true); return; }
    setShowKYC(true);
  }

  return (
    <>
    <KYCModal open={showKYC} onClose={() => setShowKYC(false)} onSuccess={() => setShowKYC(false)} verificationType="guest" rejectionComment={verificationRejectionComment} />
    <VerificationPendingPopup open={showPending} onClose={() => setShowPending(false)} />
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[73px] pb-20 md:pb-0">
      <div className="mx-auto max-w-screen-xl px-4 md:px-12 py-10">
        {/* Header */}
        <div className="mb-6 md:mb-10 flex items-center justify-between">
          <div>
            <p className="text-[12px] md:text-label-bold text-secondary mb-0.5 md:mb-1">{t.dashboard.welcomeBack}</p>
            <h1 className="text-[24px] md:text-h1 font-extrabold text-on-background">Hey, {firstName} 👋</h1>
          </div>
          <a href="/cars"
            className="hidden md:flex items-center gap-2 rounded-xl bg-primary-container px-5 py-3 font-bold text-label-bold text-white hover:bg-primary transition-all active:scale-95">
            <span className="material-symbols-outlined text-[18px]">add</span>
            {t.dashboard.bookCar}
          </a>
        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-3 md:gap-5 grid-cols-2 xl:grid-cols-4">
          {[
            { label: t.dashboard.totalBookings, value: String(bookings.length),  icon: 'calendar_today',  color: 'text-primary bg-primary-fixed/60' },
            { label: t.dashboard.totalSpent,    value: gel(totalSpent),           icon: 'payments',        color: 'text-tertiary bg-tertiary-fixed/60' },
            { label: t.dashboard.upcomingTrips, value: String(upcomingTrips),     icon: 'directions_car',  color: 'text-amber-700 bg-amber-50' },
            { label: t.dashboard.memberSince,   value: memberSince,               icon: 'person',          color: 'text-secondary bg-surface-container' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-outline-variant/40 bg-white p-4 md:p-6 shadow-card">
              <div className={`inline-flex rounded-xl p-2 md:p-2.5 ${s.color}`}>
                <span className="material-symbols-outlined text-[18px] md:text-[20px]">{s.icon}</span>
              </div>
              <p className="mt-3 md:mt-4 text-[10px] md:text-label-sm font-semibold text-secondary uppercase tracking-wider">{s.label}</p>
              <p className="mt-1 text-[20px] md:text-h2 font-extrabold text-on-background leading-tight">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
          {/* Bookings list */}
          <div className="rounded-2xl border border-outline-variant/40 bg-white shadow-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 md:px-6 py-4 md:py-5">
              <h2 className="text-[16px] md:text-h3 font-extrabold text-on-background">{t.dashboard.myBookings}</h2>
              <a href="/cars" className="flex items-center gap-1 text-label-sm font-bold text-primary hover:underline">
                {t.dashboard.bookAgain}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>

            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <span className="material-symbols-outlined text-[48px] text-slate-300">directions_car</span>
                <p className="text-label-bold font-semibold text-secondary">{t.dashboard.noBookings}</p>
                <a href="/cars" className="rounded-xl bg-primary-container px-5 py-2.5 font-bold text-label-bold text-white hover:bg-primary transition">
                  {t.dashboard.findCar}
                </a>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {bookings.map(b => {
                  const s = statusStyle[b.status] ?? statusStyle.pending;
                  return (
                    <a key={b.id} href={`/bookings/${b.id}`} className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-4 hover:bg-surface-container-low transition-colors cursor-pointer active:bg-surface-container-low">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container">
                        <span className="material-symbols-outlined text-[22px] text-secondary">directions_car</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-label-bold text-on-background truncate">{b.car}</p>
                        <p className="text-label-sm text-secondary flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {b.dates}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <p className="font-extrabold text-label-bold text-on-background">{gel(b.amount)}</p>
                        <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.cls}`}>
                          <span className="material-symbols-outlined text-[12px]">{s.icon}</span>
                          {statusLabel[b.status] ?? b.status}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-outline-variant/40 bg-white shadow-card p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed font-extrabold text-primary text-xl shrink-0">
                  {name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-label-bold text-on-background truncate">{name}</p>
                  <p className="text-label-sm text-secondary truncate">{email}</p>
                </div>
              </div>
              <div className="space-y-2">
                {isVerified ? (
                  <div className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
                    <span className="text-label-sm font-semibold text-secondary flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">badge</span>
                      {t.dashboard.verification}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${verBadge.cls}`}>{verBadge.label}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleVerifyClick}
                    className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 transition-colors cursor-pointer ${
                      isRejected
                        ? 'bg-error-container/20 border-error/20 hover:bg-error-container/30'
                        : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <span className={`text-label-sm font-semibold flex items-center gap-2 ${isRejected ? 'text-error' : 'text-amber-700'}`}>
                      <span className="material-symbols-outlined text-[16px]">{isRejected ? 'cancel' : 'badge'}</span>
                      {t.dashboard.verification}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${verBadge.cls}`}>{verBadge.label}</span>
                      <span className={`material-symbols-outlined text-[14px] ${isRejected ? 'text-error' : 'text-amber-500'}`}>chevron_right</span>
                    </span>
                  </button>
                )}
                <div className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
                  <span className="text-label-sm font-semibold text-secondary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">star</span>
                    {t.dashboard.rating}
                  </span>
                  {reviewCount === 0 ? (
                    <span className="text-label-sm font-bold text-slate-400">{t.reviews.newBadge}</span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <span className="font-extrabold text-label-bold text-amber-700">{rating.toFixed(1)}</span>
                      <span className="text-[11px] text-slate-400">({t.reviews.reviewsText(reviewCount)})</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-outline-variant/40 bg-white shadow-card p-6">
              <h3 className="text-label-bold font-extrabold text-on-background mb-4">{t.dashboard.quickActions}</h3>
              <div className="space-y-2">
                {[
                  { href: '/cars',        icon: 'search',        label: t.dashboard.browseCars },
                  { href: '/become-host', icon: 'add_home',      label: t.dashboard.listYourCar },
                  { href: '/my-cars',     icon: 'directions_car', label: t.myCars.quickAction },
                ].map(action => (
                  <a key={action.href} href={action.href}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-label-bold text-on-background hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-primary text-[20px]">{action.icon}</span>
                    {action.label}
                    <span className="material-symbols-outlined ml-auto text-[16px] text-slate-300">chevron_right</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
