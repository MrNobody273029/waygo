'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/lang-provider';
import { gel } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────

interface PendingRequest {
  id: string;
  carId: string | null;
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
}

interface DisputeData {
  id: string;
  hostComment: string;
  hostPhotos: string[];
  status: string;
  damageAmount: number | null;
  expertFee: number | null;
  expertNote: string | null;
  createdAt?: string;
}

interface ActiveRental {
  id: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  guestName: string;
  guestRating: number;
  guestReviewCount: number;
  pickupPhotos: string[];
  returnPhotos: string[];
  dispute: DisputeData | null;
}

interface CompletedRental {
  id: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  guestName: string;
  guestRating: number;
  guestReviewCount: number;
  dispute: { id: string; status: string; damageAmount: number | null; expertFee: number | null } | null;
}

interface Props {
  pendingRequests: PendingRequest[];
  activeRentals: ActiveRental[];
  completedRentals: CompletedRental[];
  unreadCount: number;
}

// ── Sub-components defined at module level ─────────────────────

const PHOTO_SLOT_LABELS = [
  'Front exterior', 'Rear exterior', 'Left side',
  'Right side', 'Rear interior', 'Front interior', 'Dashboard',
];

function PhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (!photos.length) return null;
  return (
    <div className="mb-4">
      <p className="text-[11px] font-black uppercase tracking-wider text-secondary mb-2">{title}</p>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
        {photos.map((url, i) => (
          <button key={i} type="button" onClick={() => setLightbox(url)}
            className="relative aspect-square rounded-lg overflow-hidden border border-outline-variant/30 hover:border-primary transition group cursor-pointer">
            <img src={url} alt={PHOTO_SLOT_LABELS[i] ?? `Photo ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
          </button>
        ))}
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Full size" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" onClick={e => e.stopPropagation()} />
          <button type="button" onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition cursor-pointer">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}

interface ReturnReviewPanelProps {
  rental: ActiveRental;
  onConfirmed: (id: string) => void;
  onDisputed: (id: string) => void;
}

function ReturnReviewPanel({ rental, onConfirmed, onDisputed }: ReturnReviewPanelProps) {
  const { t } = useLang();
  const hr = t.hostRentals;
  const [mode, setMode] = useState<'view' | 'confirm' | 'dispute'>('view');
  const [confirming, setConfirming] = useState(false);
  const [disputeComment, setDisputeComment] = useState('');
  const [disputePhotos, setDisputePhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadPhoto(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'waygo/dispute-photos');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.url) setDisputePhotos(prev => [...prev, data.url]);
    } finally {
      setUploading(false);
    }
  }

  async function handleConfirm() {
    setConfirming(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${rental.id}/host-return-confirm`, { method: 'POST' });
      if (res.ok) { onConfirmed(rental.id); }
      else { const d = await res.json(); setError(d.error ?? 'Error'); }
    } finally { setConfirming(false); }
  }

  async function handleDispute() {
    if (!disputeComment.trim()) { setError('Please describe the issue'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${rental.id}/host-return-dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostComment: disputeComment.trim(), hostPhotos: disputePhotos }),
      });
      if (res.ok) { onDisputed(rental.id); }
      else { const d = await res.json(); setError(d.error ?? 'Error'); }
    } finally { setSubmitting(false); }
  }

  return (
    <div className="mt-4 rounded-2xl border border-outline-variant/40 bg-white shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-amber-50 flex items-center gap-3">
        <span className="material-symbols-outlined text-amber-600 text-[22px]">photo_camera</span>
        <div>
          <p className="font-extrabold text-label-bold text-amber-900">{hr.returnReviewTitle}</p>
          <p className="text-label-sm text-amber-700">{hr.returnReviewSub}</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <PhotoGallery photos={rental.pickupPhotos} title={hr.pickupPhotosTitle} />
        <PhotoGallery photos={rental.returnPhotos} title={hr.returnPhotosTitle} />

        {mode === 'view' && (
          <div className="flex gap-3 pt-2">
            <button onClick={() => setMode('dispute')}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-error/30 bg-error-container/10 py-3 font-bold text-label-bold text-error hover:bg-error-container/20 transition cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">report</span>
              {hr.disputeTitle}
            </button>
            <button onClick={() => setMode('confirm')}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-tertiary py-3 font-bold text-label-bold text-white hover:opacity-90 transition cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {hr.confirmReturnBtn}
            </button>
          </div>
        )}

        {mode === 'confirm' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-tertiary/30 bg-tertiary-fixed/20 px-4 py-3">
              <p className="text-label-sm font-semibold text-on-background">{hr.confirmReturnText}</p>
            </div>
            {error && <p className="text-label-sm text-error font-semibold">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setMode('view'); setError(null); }}
                className="flex-1 rounded-xl border border-outline-variant py-3 font-bold text-label-sm text-secondary hover:bg-surface-container transition cursor-pointer">
                {t.common.cancel}
              </button>
              <button onClick={handleConfirm} disabled={confirming}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-tertiary py-3 font-bold text-label-bold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer">
                {confirming
                  ? <><span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span>{hr.confirming}</>
                  : <><span className="material-symbols-outlined text-[18px]">check_circle</span>{hr.confirmReturnBtn}</>}
              </button>
            </div>
          </div>
        )}

        {mode === 'dispute' && (
          <div className="space-y-4">
            <div>
              <label className="text-label-sm font-bold text-on-background">{hr.disputeCommentLabel}</label>
              <textarea
                value={disputeComment}
                onChange={e => setDisputeComment(e.target.value)}
                placeholder={hr.disputeCommentPlaceholder}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-outline-variant px-3.5 py-3 text-sm font-semibold text-on-background outline-none focus:border-error focus:ring-2 focus:ring-error/20 placeholder:text-slate-400 transition resize-none"
              />
            </div>

            <div>
              <p className="text-label-sm font-bold text-on-background mb-1.5">{hr.disputePhotosLabel}</p>
              <p className="text-[11px] text-secondary mb-2">{hr.disputePhotosHint}</p>
              <div className="flex flex-wrap gap-2">
                {disputePhotos.map((url, i) => (
                  <div key={i} className="relative h-16 w-16 rounded-xl overflow-hidden border border-outline-variant/40">
                    <img src={url} alt={`dispute-${i}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setDisputePhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer">
                      <span className="material-symbols-outlined text-[11px]">close</span>
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="h-16 w-16 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low hover:border-error transition cursor-pointer disabled:opacity-50">
                  {uploading
                    ? <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">autorenew</span>
                    : <span className="material-symbols-outlined text-[20px] text-slate-400">add_a_photo</span>}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ''; }} />
              </div>
            </div>

            {error && <p className="text-label-sm text-error font-semibold">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => { setMode('view'); setError(null); setDisputeComment(''); setDisputePhotos([]); }}
                className="flex-1 rounded-xl border border-outline-variant py-3 font-bold text-label-sm text-secondary hover:bg-surface-container transition cursor-pointer">
                {t.common.cancel}
              </button>
              <button onClick={handleDispute} disabled={submitting || !disputeComment.trim()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-error py-3 font-bold text-label-bold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer">
                {submitting
                  ? <><span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span>{hr.disputeSubmitting}</>
                  : <><span className="material-symbols-outlined text-[18px]">report</span>{hr.disputeSubmitBtn}</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CancelBookingModal ────────────────────────────────────────

interface CancelModalProps {
  booking: { id: string; carBrand: string; carModel: string; carYear: number; startDate: string };
  onClose: () => void;
  onCancelled: (id: string) => void;
}

function calcTierFromStart(startDate: string): 'none' | 'medium' | 'high' {
  const hoursUntil = (new Date(startDate).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil > 48) return 'none';
  if (hoursUntil > 24) return 'medium';
  return 'high';
}

function CancelBookingModal({ booking, onClose, onCancelled }: CancelModalProps) {
  const { t } = useLang();
  const hr = t.hostRentals;
  const tier = calcTierFromStart(booking.startDate);
  const [confirmed, setConfirmed] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const tierConfig = {
    none: {
      label: hr.penaltyNoneLabel,
      desc: hr.penaltyNoneDesc,
      cls: 'bg-tertiary-fixed/20 border-tertiary/30 text-tertiary',
      icon: 'check_circle',
    },
    medium: {
      label: hr.penaltyMediumLabel,
      desc: hr.penaltyMediumDesc,
      cls: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: 'warning',
    },
    high: {
      label: hr.penaltyHighLabel,
      desc: hr.penaltyHighDesc,
      cls: 'bg-error-container/20 border-error/30 text-error',
      icon: 'error',
    },
  }[tier];

  async function handleCancel() {
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/host-cancel`, { method: 'POST' });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onCancelled(booking.id);
          onClose();
        }, 1200);
      } else {
        const d = await res.json();
        setError(d.error ?? 'An error occurred');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !cancelling && onClose()} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white shadow-2xl p-7 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-error-container/30">
            <span className="material-symbols-outlined text-error text-[24px]">cancel</span>
          </div>
          <div>
            <h2 className="font-black text-h3 text-on-background">{hr.cancelModalTitle}</h2>
            <p className="text-secondary text-label-sm mt-0.5">
              {booking.carBrand} {booking.carModel} {booking.carYear}
            </p>
          </div>
        </div>

        <p className="text-secondary text-label-sm">{hr.cancelModalSub}</p>

        {/* Penalty tier indicator */}
        <div className={`rounded-xl border px-4 py-3 ${tierConfig.cls}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[18px]">{tierConfig.icon}</span>
            <p className="font-bold text-label-bold">{tierConfig.label}</p>
          </div>
          <p className="text-[12px] leading-relaxed">{tierConfig.desc}</p>
        </div>

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-outline-variant accent-primary cursor-pointer"
          />
          <span className="text-label-sm text-on-background">
            {hr.cancelModalSub}
          </span>
        </label>

        {error && (
          <p className="text-label-sm text-error font-semibold">{error}</p>
        )}

        {success && (
          <div className="flex items-center gap-2 text-tertiary">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <p className="text-label-sm font-bold">{hr.cancelSuccess}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={cancelling}
            className="flex-1 rounded-xl border border-outline-variant py-3 font-bold text-label-bold text-secondary hover:bg-surface-container-low transition disabled:opacity-50 cursor-pointer"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleCancel}
            disabled={!confirmed || cancelling || success}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-error py-3 font-bold text-label-bold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer"
          >
            {cancelling ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span>
                {hr.cancelling}
              </>
            ) : (
              hr.confirmCancelBtn
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export function HostRentalsContent({ pendingRequests: initialRequests, activeRentals: initialActive, completedRentals, unreadCount }: Props) {
  const { t } = useLang();
  const router = useRouter();
  const hr = t.hostRentals;

  const [tab, setTab] = useState<'requests' | 'active' | 'history'>('requests');
  const [requests, setRequests] = useState(initialRequests);
  const [activeRentals, setActiveRentals] = useState(initialActive);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingRequest | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ActiveRental | null>(null);

  const pendingCount = requests.length;
  const awaitingReviewCount = activeRentals.filter(r => r.status === 'return_review').length;
  const notifCount = pendingCount + awaitingReviewCount;

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

  function handleConfirmed(id: string) {
    setActiveRentals(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' } : r));
    router.refresh();
  }

  function handleDisputed(id: string) {
    setActiveRentals(prev => prev.map(r => r.id === id ? { ...r, status: 'disputed' } : r));
    router.refresh();
  }

  function handleCancelled(id: string) {
    setActiveRentals(prev => prev.filter(r => r.id !== id));
    router.refresh();
  }

  const STATUS_STYLE: Record<string, { cls: string; icon: string }> = {
    pending:       { cls: 'bg-amber-50 text-amber-700',           icon: 'schedule' },
    confirmed:     { cls: 'bg-tertiary-fixed/40 text-tertiary',   icon: 'check_circle' },
    return_review: { cls: 'bg-primary-fixed/40 text-primary',     icon: 'photo_camera' },
    disputed:      { cls: 'bg-error-container/40 text-error',     icon: 'report' },
    completed:     { cls: 'bg-surface-container text-secondary',  icon: 'task_alt' },
  };

  const statusLabel: Record<string, string> = {
    pending:       t.dashboard.pending,
    confirmed:     t.dashboard.confirmed,
    return_review: t.dashboard.returnReview,
    disputed:      t.dashboard.disputed,
    completed:     t.dashboard.completed,
  };

  return (
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[73px] pb-20 md:pb-0">
      <div className="mx-auto max-w-screen-xl px-4 md:px-12 py-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
          <div>
            <h1 className="text-[24px] md:text-h1 font-extrabold text-on-background flex items-center gap-3">
              {hr.title}
              {notifCount > 0 && (
                <span className="inline-flex items-center justify-center h-6 min-w-6 rounded-full bg-error text-white text-[11px] font-black px-1.5">
                  {notifCount}
                </span>
              )}
            </h1>
            <p className="text-secondary text-[13px] md:text-body-md mt-1">{hr.subtitle}</p>
          </div>
          <a href="/my-cars" className="flex items-center gap-2 rounded-xl border border-outline-variant bg-white px-4 py-2.5 font-bold text-label-bold text-on-background hover:border-primary hover:text-primary transition-all">
            <span className="material-symbols-outlined text-[18px]">directions_car</span>
            {t.myCars.quickAction}
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl bg-slate-100/80 p-1.5 mb-6 w-fit">
          {([
            { key: 'requests', label: hr.tabRequests, count: pendingCount },
            { key: 'active',   label: hr.tabActive,   count: awaitingReviewCount },
            { key: 'history',  label: hr.tabHistory,  count: 0 },
          ] as const).map(tab_ => (
            <button key={tab_.key} type="button" onClick={() => setTab(tab_.key)}
              className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-semibold transition-all cursor-pointer ${
                tab === tab_.key ? 'bg-white text-primary shadow-sm border border-slate-200/80' : 'text-slate-600 hover:bg-white/80 hover:text-primary'
              }`}>
              {tab_.label}
              {tab_.count > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-error text-white text-[10px] font-black px-1">
                  {tab_.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB: Requests ─────────────────────────────────── */}
        {tab === 'requests' && (
          <>
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <span className="material-symbols-outlined text-[52px] text-slate-300">inbox</span>
                <p className="font-semibold text-secondary">{hr.noRequests}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-amber-200">
                  <span className="material-symbols-outlined text-amber-600 text-[22px]">notifications_active</span>
                  <div>
                    <p className="font-extrabold text-label-bold text-amber-900">{t.hostRequests.title}</p>
                    <p className="text-label-sm text-amber-700">{t.hostRequests.subtitle}</p>
                  </div>
                </div>
                <div className="divide-y divide-amber-100">
                  {requests.map(req => {
                    const deadline = req.hostApprovalDeadline ? new Date(req.hostApprovalDeadline) : null;
                    const isExpired = deadline && deadline < new Date();
                    const acting = actioningId === req.id;
                    const hours = deadline ? Math.max(0, Math.round((deadline.getTime() - Date.now()) / 3600000)) : null;
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
                          <button onClick={() => { setRejectComment(''); setRejectTarget(req); }} disabled={acting}
                            className="rounded-xl border border-error/30 px-4 py-2.5 font-bold text-label-bold text-error hover:bg-error-container/20 transition disabled:opacity-60 cursor-pointer">
                            {acting ? <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span> : t.hostRequests.reject}
                          </button>
                          {!isExpired && (
                            <button onClick={() => handleApprove(req.id)} disabled={acting}
                              className="rounded-xl bg-tertiary px-4 py-2.5 font-bold text-label-bold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer">
                              {acting ? <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span> : t.hostRequests.approve}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TAB: Active ───────────────────────────────────── */}
        {tab === 'active' && (
          <>
            {activeRentals.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <span className="material-symbols-outlined text-[52px] text-slate-300">directions_car</span>
                <p className="font-semibold text-secondary">{hr.noActive}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeRentals.map(rental => {
                  const s = STATUS_STYLE[rental.status] ?? STATUS_STYLE.confirmed;
                  const expanded = expandedId === rental.id;
                  return (
                    <div key={rental.id} className={`rounded-2xl border bg-white shadow-card overflow-hidden ${
                      rental.status === 'return_review' ? 'border-primary/30' :
                      rental.status === 'disputed' ? 'border-error/30' : 'border-outline-variant/40'
                    }`}>
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                        onClick={() => setExpandedId(expanded ? null : rental.id)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-extrabold text-label-bold text-on-background">
                              {rental.carBrand} {rental.carModel} {rental.carYear}
                            </p>
                            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.cls}`}>
                              <span className="material-symbols-outlined text-[12px]">{s.icon}</span>
                              {statusLabel[rental.status] ?? rental.status}
                            </span>
                            {rental.status === 'return_review' && (
                              <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 bg-primary text-white text-[10px] font-black animate-pulse">
                                <span className="material-symbols-outlined text-[11px]">notifications</span>
                                {hr.awaitingReturnReview}
                              </span>
                            )}
                          </div>
                          <p className="text-label-sm text-secondary mt-1 flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">person</span>
                              {rental.guestName}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                              {new Date(rental.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              {' – '}
                              {new Date(rental.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="font-bold text-on-background">{gel(rental.totalPrice)}</span>
                          </p>
                        </div>
                        <span className={`material-symbols-outlined text-[22px] text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </div>

                      {expanded && (
                        <div className="border-t border-slate-100 p-5">
                          {/* Disputed state: show dispute info */}
                          {rental.status === 'disputed' && rental.dispute && (
                            <div className="rounded-xl border border-error/30 bg-error-container/10 p-4 mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-error text-[20px]">report</span>
                                <p className="font-bold text-label-bold text-error">{hr.disputeBanner}</p>
                              </div>
                              <p className="text-label-sm text-secondary whitespace-pre-wrap">{rental.dispute.hostComment}</p>
                              {rental.dispute.hostPhotos.length > 0 && (
                                <div className="mt-3">
                                  <PhotoGallery photos={rental.dispute.hostPhotos} title="Dispute photos" />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Pickup / Return photos */}
                          <PhotoGallery photos={rental.pickupPhotos} title={hr.pickupPhotosTitle} />
                          <PhotoGallery photos={rental.returnPhotos} title={hr.returnPhotosTitle} />

                          {/* return_review: show review panel */}
                          {rental.status === 'return_review' && (
                            <ReturnReviewPanel
                              rental={rental}
                              onConfirmed={handleConfirmed}
                              onDisputed={handleDisputed}
                            />
                          )}

                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 flex-wrap">
                            <a href={`/bookings/${rental.id}`}
                              className="inline-flex items-center gap-1.5 text-label-sm font-bold text-primary hover:underline">
                              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                              {hr.viewDetails}
                            </a>
                            {rental.status === 'pending' && (
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); setCancelTarget(rental); }}
                                className="inline-flex items-center gap-1.5 text-label-sm font-bold text-error hover:underline cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">cancel</span>
                                {hr.cancelBookingBtn}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── TAB: History ──────────────────────────────────── */}
        {tab === 'history' && (
          <>
            {completedRentals.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                <span className="material-symbols-outlined text-[52px] text-slate-300">history</span>
                <p className="font-semibold text-secondary">{hr.noHistory}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-outline-variant/40 bg-white shadow-card overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {completedRentals.map(r => (
                    <div key={r.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-label-bold text-on-background">
                          {r.carBrand} {r.carModel} {r.carYear}
                        </p>
                        <p className="text-label-sm text-secondary mt-0.5 flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            {r.guestName}
                          </span>
                          <span>
                            {new Date(r.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            {' – '}
                            {new Date(r.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {r.dispute && (
                          <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            r.dispute.status === 'RESOLVED'
                              ? 'bg-surface-container text-secondary'
                              : 'bg-error-container/40 text-error'
                          }`}>
                            <span className="material-symbols-outlined text-[12px]">{r.dispute.status === 'RESOLVED' ? 'gavel' : 'report'}</span>
                            {r.dispute.status === 'RESOLVED' ? 'Resolved' : 'Disputed'}
                          </span>
                        )}
                        <p className="font-extrabold text-label-bold text-on-background">{gel(r.totalPrice)}</p>
                        <a href={`/bookings/${r.id}`} className="text-label-sm font-bold text-primary hover:underline flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel Booking modal */}
      {cancelTarget && (
        <CancelBookingModal
          booking={{
            id: cancelTarget.id,
            carBrand: cancelTarget.carBrand,
            carModel: cancelTarget.carModel,
            carYear: cancelTarget.carYear,
            startDate: cancelTarget.startDate,
          }}
          onClose={() => setCancelTarget(null)}
          onCancelled={handleCancelled}
        />
      )}

      {/* Reject modal */}
      {rejectTarget && (() => {
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
                  <p className="text-secondary text-label-sm mt-0.5">{rejectTarget.carBrand} {rejectTarget.carModel}</p>
                </div>
              </div>
              <p className="text-secondary text-label-sm">{t.hostRequests.rejectModalSub}</p>
              <textarea
                value={rejectComment}
                onChange={e => setRejectComment(e.target.value)}
                placeholder={t.hostRequests.rejectCommentPlaceholder}
                rows={3}
                className="w-full rounded-xl border border-outline-variant px-3.5 py-3 text-label-bold font-semibold text-on-background outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed placeholder:text-slate-400 transition resize-none text-sm"
              />
              <div className="flex gap-3">
                <button onClick={() => setRejectTarget(null)} disabled={acting}
                  className="flex-1 rounded-xl border border-outline-variant py-3 font-bold text-label-bold text-secondary hover:bg-surface-container-low transition disabled:opacity-50 cursor-pointer">
                  {t.myCars.deleteCancel}
                </button>
                <button onClick={async () => { setRejectTarget(null); await handleReject(rejectTarget.id, rejectComment); }}
                  disabled={acting}
                  className="flex-1 rounded-xl bg-error py-3 font-bold text-label-bold text-white hover:opacity-90 transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
                  {acting
                    ? <><span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span>{t.hostRequests.rejecting}</>
                    : t.hostRequests.rejectConfirmBtn}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}
