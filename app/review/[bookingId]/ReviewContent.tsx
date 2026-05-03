'use client';
import { useState } from 'react';
import { useLang } from '@/components/lang-provider';

interface ExistingReview {
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface Props {
  bookingId: string;
  role: 'host' | 'guest';
  status: string;
  car: { brand: string; model: string; year: number };
  dates: { start: string; end: string };
  revieweeName: string;
  revieweeRating: number;
  revieweeCount: number;
  existingReview: ExistingReview | null;
}

function StarPicker({ value, onChange, labels }: { value: number; onChange: (v: number) => void; labels: string[] }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="group flex flex-col items-center gap-1 cursor-pointer"
        >
          <span className={`material-symbols-outlined text-[32px] transition-all ${
            n <= (hover || value) ? 'text-amber-400' : 'text-slate-200'
          } group-hover:scale-110`}
            style={{ fontVariationSettings: n <= (hover || value) ? "'FILL' 1" : "'FILL' 0" }}>
            star
          </span>
          <span className={`text-[10px] font-bold transition-opacity ${hover === n ? 'opacity-100 text-amber-600' : 'opacity-0'}`}>
            {labels[n - 1]}
          </span>
        </button>
      ))}
    </div>
  );
}

export function RatingBadge({ rating, count, newBadge, reviewsText }: { rating: number; count: number; newBadge: string; reviewsText: (n: number) => string }) {
  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1 bg-surface-container text-secondary px-2.5 py-1 rounded-full text-[11px] font-bold">
        <span className="material-symbols-outlined text-[13px]">person</span>
        {newBadge}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      {rating.toFixed(1)}
      <span className="text-amber-500/70 font-normal">· {reviewsText(count)}</span>
    </span>
  );
}

export function ReviewContent({ bookingId, role, status, car, dates, revieweeName, revieweeRating, revieweeCount, existingReview }: Props) {
  const { t } = useLang();
  const r = t.reviews;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startFmt = new Date(dates.start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const endFmt = new Date(dates.end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  async function handleSubmit() {
    if (rating === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'error');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('error');
    } finally {
      setSubmitting(false);
    }
  }

  const starLabels = [r.star1, r.star2, r.star3, r.star4, r.star5];
  const isCompleted = status === 'completed';

  return (
    <main className="min-h-screen bg-surface pt-[62px] md:pt-[73px] pb-20 flex items-start justify-center">
      <div className="w-full max-w-lg px-4 py-10">
        <a href="/my-cars" className="inline-flex items-center gap-1.5 text-label-sm font-bold text-secondary hover:text-primary mb-8 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          My Cars
        </a>

        {/* Booking card */}
        <div className="rounded-2xl border border-outline-variant/40 bg-white shadow-card p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container shrink-0">
              <span className="material-symbols-outlined text-[22px] text-secondary">directions_car</span>
            </div>
            <div>
              <p className="font-extrabold text-label-bold text-on-background">{car.brand} {car.model} {car.year}</p>
              <p className="text-label-sm text-secondary">{startFmt} – {endFmt}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
            <span className="text-label-sm text-secondary font-semibold">{revieweeName}</span>
            <RatingBadge rating={revieweeRating} count={revieweeCount} newBadge={r.newBadge} reviewsText={r.reviewsText} />
          </div>
        </div>

        {!isCompleted ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <span className="material-symbols-outlined text-amber-500 text-[40px] block mb-3">schedule</span>
            <p className="font-bold text-label-bold text-amber-800">Booking not yet completed</p>
            <p className="text-label-sm text-amber-600 mt-1">Reviews open after the return is confirmed.</p>
          </div>
        ) : existingReview || submitted ? (
          <div className="rounded-2xl border border-tertiary/20 bg-tertiary-fixed/10 p-8 flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-fixed/30">
              <span className="material-symbols-outlined text-tertiary text-[36px]">task_alt</span>
            </div>
            <div>
              <p className="font-extrabold text-h3 text-on-background">{r.successTitle}</p>
              <p className="text-secondary text-label-sm mt-1">{r.successSub}</p>
            </div>
            {(existingReview?.rating ?? rating) > 0 && (
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <span key={n} className={`material-symbols-outlined text-[28px] ${n <= (existingReview?.rating ?? rating) ? 'text-amber-400' : 'text-slate-200'}`}
                    style={{ fontVariationSettings: n <= (existingReview?.rating ?? rating) ? "'FILL' 1" : "'FILL' 0" }}>
                    star
                  </span>
                ))}
              </div>
            )}
            {(existingReview?.comment) && (
              <p className="text-secondary text-label-sm italic">"{existingReview.comment}"</p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-outline-variant/40 bg-white shadow-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 shrink-0">
                <span className="material-symbols-outlined text-amber-500 text-[22px]">star</span>
              </div>
              <div>
                <h1 className="font-extrabold text-h3 text-on-background">
                  {role === 'host' ? r.hostSectionTitle : r.sectionTitle}
                </h1>
                <p className="text-label-sm text-secondary">{revieweeName}</p>
              </div>
            </div>
            <p className="text-label-sm text-secondary mb-6">{r.subtitle}</p>

            <div className="flex flex-col items-center gap-2 mb-6 py-5 rounded-xl bg-surface-container-low">
              <StarPicker value={rating} onChange={setRating} labels={starLabels} />
              {rating > 0 && (
                <p className="text-label-sm font-bold text-amber-600 mt-1">{starLabels[rating - 1]}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-label-sm font-bold text-secondary mb-2">{r.commentLabel}</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={r.commentPlaceholder}
                rows={3}
                maxLength={500}
                className="w-full rounded-xl border border-outline-variant px-3.5 py-3 text-label-bold font-semibold text-on-background outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed placeholder:text-slate-400 transition resize-none text-sm"
              />
              <p className="text-[11px] text-slate-400 mt-1 text-right">{comment.length}/500</p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-error-container/20 border border-error/20 px-4 py-3">
                <span className="material-symbols-outlined text-error text-[16px]">error</span>
                <p className="text-label-sm text-error font-semibold">{error === 'Already reviewed' ? r.alreadyReviewed : error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="w-full rounded-xl bg-amber-500 py-3.5 font-bold text-label-bold text-white hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>{r.submitting}</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">star</span>{r.submit}</>
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
