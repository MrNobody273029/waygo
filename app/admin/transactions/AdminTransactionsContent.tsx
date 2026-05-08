'use client';
import { useState } from 'react';
import Link from 'next/link';
import { gel } from '@/lib/utils';
import { useLang } from '@/components/lang-provider';

type Transaction = {
  id: string; type: string; status: string; amount: number;
  providerId: string; createdAt: string;
  booking: {
    id: string; carBrand: string; carModel: string;
    guest: { fullName: string; email: string | null };
  } | null;
};
type StatGroup = {
  type: string; status: string;
  _sum: { amount: number | null };
  _count: number;
};

const TYPE_BADGE: Record<string, string> = {
  payment: 'bg-blue-50 text-blue-700',
  deposit_hold: 'bg-violet-50 text-violet-700',
  refund: 'bg-emerald-50 text-emerald-700',
  payout: 'bg-slate-100 text-slate-600',
};
const STATUS_BADGE: Record<string, string> = {
  succeeded: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  authorized: 'bg-blue-50 text-blue-700',
  failed: 'bg-red-50 text-red-700',
  released: 'bg-slate-100 text-slate-500',
};

const TYPE_FILTER_OPTIONS = ['all', 'payment', 'deposit_hold', 'refund', 'payout'];
const STATUS_FILTER_OPTIONS = ['all', 'succeeded', 'pending', 'authorized', 'failed', 'released'];

export function AdminTransactionsContent({
  transactions,
  stats,
}: {
  transactions: Transaction[];
  stats: StatGroup[];
}) {
  const { t } = useLang();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const totalRevenue  = stats.filter(s => s.type === 'payment'      && s.status === 'succeeded').reduce((sum, s) => sum + (s._sum.amount ?? 0), 0);
  const totalDeposits = stats.filter(s => s.type === 'deposit_hold' && s.status === 'authorized').reduce((sum, s) => sum + (s._sum.amount ?? 0), 0);
  const totalRefunds  = stats.filter(s => s.type === 'refund'       && s.status === 'succeeded').reduce((sum, s) => sum + (s._sum.amount ?? 0), 0);
  const netRevenue    = totalRevenue - totalRefunds;

  const filtered = transactions.filter(tx => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !tx.booking?.carBrand.toLowerCase().includes(q) &&
        !tx.booking?.carModel.toLowerCase().includes(q) &&
        !tx.booking?.guest.fullName.toLowerCase().includes(q) &&
        !(tx.booking?.guest.email ?? '').toLowerCase().includes(q) &&
        !tx.providerId.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] md:text-3xl font-black text-slate-950">{t.admin.transactions}</h1>
        <p className="mt-1 text-sm text-slate-500">{transactions.length} {t.admin.totalBookingsLabel}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-5">
        {[
          { label: t.admin.grossPayments, value: gel(totalRevenue), sub: '', color: 'bg-blue-50 text-blue-700', icon: 'trending_up' },
          { label: t.admin.refundsIssued, value: gel(totalRefunds), sub: '', color: 'bg-emerald-50 text-emerald-700', icon: 'undo' },
          { label: t.admin.netRevenue,    value: gel(netRevenue),  sub: '', color: 'bg-primary-fixed/60 text-primary', icon: 'account_balance' },
          { label: t.admin.totalRevenue,  value: gel(totalDeposits), sub: '', color: 'bg-violet-50 text-violet-700', icon: 'lock' },
        ].map(c => (
          <div key={c.label} className="rounded-3xl border bg-white p-4 md:p-6 shadow-soft">
            <div className={`inline-flex rounded-xl p-2 mb-3 ${c.color}`}>
              <span className="material-symbols-outlined text-[18px]">{c.icon}</span>
            </div>
            <p className="text-xs font-semibold text-slate-500">{c.label}</p>
            <p className="text-xl md:text-2xl font-black text-slate-950 mt-0.5">{c.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder={t.admin.searchTransactions}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary transition"
        />
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition bg-white cursor-pointer"
          >
            {TYPE_FILTER_OPTIONS.map(o => (
              <option key={o} value={o}>{o === 'all' ? t.admin.filterAllTypes : o.replace('_', ' ')}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition bg-white cursor-pointer"
          >
            {STATUS_FILTER_OPTIONS.map(o => (
              <option key={o} value={o}>{o === 'all' ? t.admin.filterAllStatuses : o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border bg-white shadow-soft overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-[40px] mb-3">receipt_long</span>
            <p className="font-semibold">{t.admin.noFilterTransactions}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left">{t.admin.type} / {t.admin.status}</th>
                  <th className="px-5 py-3 text-left">{t.admin.bookings}</th>
                  <th className="px-5 py-3 text-left">{t.admin.guest}</th>
                  <th className="px-5 py-3 text-right">{t.admin.amount}</th>
                  <th className="px-5 py-3 text-left">{t.admin.created}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold w-fit ${TYPE_BADGE[tx.type] ?? 'bg-slate-100 text-slate-600'}`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold w-fit ${STATUS_BADGE[tx.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {tx.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {tx.booking ? (
                        <>
                          <p className="font-semibold">{tx.booking.carBrand} {tx.booking.carModel}</p>
                          <Link href={`/admin/bookings/${tx.booking.id}`} className="text-[11px] text-primary font-bold hover:underline">
                            {tx.booking.id.slice(0, 8).toUpperCase()} →
                          </Link>
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {tx.booking?.guest ? (
                        <p className="text-slate-600 text-xs">{tx.booking.guest.fullName}</p>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`font-black text-base ${tx.type === 'refund' ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {tx.type === 'refund' ? '+ ' : ''}{gel(tx.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
