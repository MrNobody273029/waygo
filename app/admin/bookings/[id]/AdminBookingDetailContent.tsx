'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gel } from '@/lib/utils';

type Transaction = {
  id: string; type: string; status: string; amount: number;
  providerId: string; createdAt: string;
};
type ConditionReport = {
  id: string; phase: string; photoUrls: string[]; notes: string | null; createdAt: string;
};
type InsurancePolicy = {
  id: string; planType: string; deductibleAmount: number; status: string; createdAt: string;
};
type Guest = {
  id: string; fullName: string; email: string | null; phone: string | null;
  country: string; role: string; isVerified: boolean; verificationStatus: string;
};
type Booking = {
  id: string; carBrand: string; carModel: string; carYear: number;
  startDate: string; endDate: string; totalPrice: number; platformFeeGel: number;
  deliveryType: string; deliveryCost: number; deliveryAddress: string | null;
  status: string; createdAt: string; cancelledAt: string | null;
  hostApprovalDeadline: string | null;
  confirmationCode: string | null;
  guest: Guest;
  transactions: Transaction[];
  conditionReports: ConditionReport[];
  insurancePolicy: InsurancePolicy | null;
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
  completed: 'bg-blue-50 text-blue-700',
  awaiting_host: 'bg-amber-50 text-amber-700',
};

const TX_TYPE_BADGE: Record<string, string> = {
  payment: 'bg-blue-50 text-blue-700',
  deposit_hold: 'bg-violet-50 text-violet-700',
  refund: 'bg-emerald-50 text-emerald-700',
  payout: 'bg-slate-100 text-slate-600',
};

const TX_STATUS_BADGE: Record<string, string> = {
  succeeded: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  authorized: 'bg-blue-50 text-blue-700',
  failed: 'bg-red-50 text-red-700',
  released: 'bg-slate-100 text-slate-500',
};

export function AdminBookingDetailContent({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const canForceCancel = !['cancelled', 'completed', 'rejected'].includes(booking.status);

  async function forceCancel() {
    if (!confirm(`Force-cancel booking ${booking.id.slice(0, 8).toUpperCase()}? This cannot be undone.`)) return;
    setCancelling(true);
    setCancelError('');
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/force-cancel`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setCancelled(true);
        setTimeout(() => router.refresh(), 1500);
      } else {
        setCancelError(data.error ?? 'Error');
      }
    } finally {
      setCancelling(false);
    }
  }

  const startFmt = new Date(booking.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const endFmt   = new Date(booking.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const days = Math.round((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 86400000);

  const totalPaid = booking.transactions.filter(t => t.type === 'payment' && t.status === 'succeeded').reduce((s, t) => s + t.amount, 0);
  const totalRefund = booking.transactions.filter(t => t.type === 'refund').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 max-w-screen-lg">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/bookings" className="hover:text-slate-900 transition">Bookings</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{booking.id.slice(0, 8).toUpperCase()}</span>
      </div>

      {/* Header */}
      <div className="rounded-3xl border bg-white shadow-soft p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-5">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-slate-950">{booking.carBrand} {booking.carModel} {booking.carYear}</h1>
              <span className={`rounded-full px-3 py-1 text-sm font-bold capitalize ${STATUS_BADGE[booking.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-500 text-sm">Booking ID: <span className="font-mono font-bold text-slate-900">{booking.id.slice(0, 8).toUpperCase()}</span></p>
            <p className="text-slate-400 text-xs mt-0.5">
              Created {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              {booking.cancelledAt && ` · Cancelled ${new Date(booking.cancelledAt).toLocaleDateString('en-GB')}`}
            </p>
          </div>
          {canForceCancel && (
            <div className="flex flex-col items-end gap-2">
              {cancelled ? (
                <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-bold text-emerald-700">
                  Cancelled ✓
                </span>
              ) : (
                <button
                  onClick={forceCancel}
                  disabled={cancelling}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {cancelling ? (
                    <><span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span> Cancelling…</>
                  ) : (
                    <><span className="material-symbols-outlined text-[16px]">cancel</span> Force Cancel</>
                  )}
                </button>
              )}
              {cancelError && <p className="text-xs text-red-600">{cancelError}</p>}
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t">
          {[
            { label: 'Duration', value: `${days} day${days !== 1 ? 's' : ''}` },
            { label: 'Pickup', value: startFmt },
            { label: 'Return', value: endFmt },
            { label: 'Total', value: gel(booking.totalPrice) },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="font-bold text-slate-900 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Confirmation code */}
        {booking.confirmationCode && (
          <div className="mt-4 pt-4 border-t flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400">key</span>
              <span className="text-xs text-slate-500">Pickup Code</span>
            </div>
            <span className="font-mono text-2xl font-black tracking-[6px] text-slate-900">{booking.confirmationCode}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${['pending','confirmed','return_review','completed'].includes(booking.status) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {['pending','confirmed','return_review','completed'].includes(booking.status) ? 'Active' : 'Inactive'}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="space-y-5">

          {/* Transactions */}
          <div className="rounded-2xl border bg-white shadow-soft overflow-hidden">
            <div className="border-b px-5 py-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">payments</span>
              <h2 className="font-black text-base">Transactions</h2>
            </div>
            {booking.transactions.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-400">No transactions.</p>
            ) : (
              <div className="divide-y">
                {booking.transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${TX_TYPE_BADGE[tx.type] ?? 'bg-slate-100 text-slate-600'}`}>
                            {tx.type.replace('_', ' ')}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${TX_STATUS_BADGE[tx.status] ?? 'bg-slate-100 text-slate-600'}`}>
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">{tx.providerId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-base ${tx.type === 'refund' ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {tx.type === 'refund' ? '+ ' : ''}{gel(tx.amount)}
                      </p>
                      <p className="text-[11px] text-slate-400">{new Date(tx.createdAt).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50">
                  <span className="text-sm font-bold text-slate-700">Net (paid − refunded)</span>
                  <span className="font-black text-base text-slate-900">{gel(totalPaid - totalRefund)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Condition reports */}
          {booking.conditionReports.length > 0 && (
            <div className="rounded-2xl border bg-white shadow-soft overflow-hidden">
              <div className="border-b px-5 py-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">camera_alt</span>
                <h2 className="font-black text-base">Condition Reports</h2>
              </div>
              <div className="divide-y">
                {booking.conditionReports.map(report => (
                  <div key={report.id} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${report.phase === 'pickup' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                        {report.phase}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(report.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {report.photoUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={`Photo ${i + 1}`} className="aspect-square rounded-lg object-cover w-full border hover:opacity-90 transition" />
                        </a>
                      ))}
                    </div>
                    {report.notes && (
                      <p className="mt-3 text-xs text-slate-500 leading-relaxed border-t pt-3">{report.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Guest */}
          <div className="rounded-2xl border bg-white shadow-soft p-5">
            <h3 className="font-black text-base mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">person</span>
              Guest
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-sm font-black text-primary">
                {booking.guest.fullName[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-900">{booking.guest.fullName}</p>
                <p className="text-xs text-slate-500">{booking.guest.email}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between"><span>Phone</span><span className="font-semibold">{booking.guest.phone || '—'}</span></div>
              <div className="flex justify-between"><span>Country</span><span className="font-semibold">{booking.guest.country}</span></div>
              <div className="flex justify-between"><span>Role</span><span className="font-semibold">{booking.guest.role}</span></div>
              <div className="flex justify-between"><span>Verified</span>
                <span className={`font-bold ${booking.guest.isVerified ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {booking.guest.isVerified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <Link href={`/admin/users/${booking.guest.id}`} className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
              View profile →
            </Link>
          </div>

          {/* Booking details */}
          <div className="rounded-2xl border bg-white shadow-soft p-5">
            <h3 className="font-black text-base mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">receipt_long</span>
              Booking Details
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between"><span>Platform fee</span><span className="font-bold text-error">{gel(booking.platformFeeGel)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className="font-semibold">{booking.deliveryType}</span></div>
              {booking.deliveryCost > 0 && (
                <div className="flex justify-between"><span>Delivery cost</span><span className="font-semibold">{gel(booking.deliveryCost)}</span></div>
              )}
              {booking.deliveryAddress && (
                <div className="flex justify-between gap-2"><span>Address</span><span className="font-semibold text-right">{booking.deliveryAddress}</span></div>
              )}
              {booking.hostApprovalDeadline && (
                <div className="flex justify-between"><span>Host deadline</span>
                  <span className="font-semibold">{new Date(booking.hostApprovalDeadline).toLocaleDateString('en-GB')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Insurance */}
          {booking.insurancePolicy && (
            <div className="rounded-2xl border bg-white shadow-soft p-5">
              <h3 className="font-black text-base mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">shield</span>
                Insurance
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Plan</span>
                  <span className={`rounded-full px-2.5 py-0.5 font-bold capitalize ${
                    booking.insurancePolicy.planType === 'premium' ? 'bg-tertiary-fixed/40 text-tertiary' :
                    booking.insurancePolicy.planType === 'standard' ? 'bg-primary-fixed/40 text-primary' :
                    'bg-slate-100 text-slate-600'
                  }`}>{booking.insurancePolicy.planType}</span>
                </div>
                <div className="flex justify-between"><span>Status</span><span className="font-semibold">{booking.insurancePolicy.status}</span></div>
                <div className="flex justify-between"><span>Deductible</span><span className="font-bold">{gel(booking.insurancePolicy.deductibleAmount)}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
