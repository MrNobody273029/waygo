'use client';
import { useRouter } from 'next/navigation';
import { gel } from '@/lib/utils';

const INSURANCE_DAILY: Record<string, number> = { basic: 0, standard: 18, premium: 35 };

interface BookingRow {
  id: string;
  car: string;
  guest: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  platformFeeGel: number;
  insurancePlan: string | null;
}

interface Props {
  data: BookingRow[];
  month: string;
}

function calcDays(start: string, end: string) {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
}

function calcInsurance(plan: string | null, start: string, end: string) {
  if (!plan) return 0;
  return calcDays(start, end) * (INSURANCE_DAILY[plan] ?? 0);
}

function prevMonth(m: string) {
  const [yr, mo] = m.split('-').map(Number);
  const d = new Date(yr, mo - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function nextMonth(m: string) {
  const [yr, mo] = m.split('-').map(Number);
  const d = new Date(yr, mo, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(m: string) {
  const [yr, mo] = m.split('-').map(Number);
  return new Date(yr, mo - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

export function AdminAccountingContent({ data, month }: Props) {
  const router = useRouter();

  const totalRevenue = data.reduce((s, b) => s + b.totalPrice, 0);
  const totalPlatformFee = data.reduce((s, b) => s + b.platformFeeGel, 0);
  const totalInsurance = data.reduce((s, b) => s + calcInsurance(b.insurancePlan, b.startDate, b.endDate), 0);
  const totalHostPayouts = data.reduce((s, b) => s + (b.totalPrice - b.platformFeeGel - calcInsurance(b.insurancePlan, b.startDate, b.endDate)), 0);

  const byPlan = { basic: 0, standard: 0, premium: 0, none: 0 };
  for (const b of data) {
    const k = b.insurancePlan ?? 'none';
    if (k in byPlan) (byPlan as any)[k]++;
    else byPlan.none++;
  }

  function navigate(m: string) {
    router.push(`/admin/accounting?month=${m}`);
  }

  return (
    <main className="pt-[62px] md:pt-[120px] min-h-screen bg-surface pb-20">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8 py-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-h1 font-extrabold text-on-background">Accounting</h1>
            <p className="text-secondary text-body-md mt-1">Revenue breakdown for completed rentals</p>
          </div>

          {/* Month picker */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(prevMonth(month))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant bg-white hover:border-primary/40 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="min-w-[160px] text-center font-extrabold text-label-bold text-on-background">
              {monthLabel(month)}
            </span>
            <button
              onClick={() => navigate(nextMonth(month))}
              disabled={month >= currentMonth}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant bg-white hover:border-primary/40 transition disabled:opacity-30 cursor-pointer disabled:cursor-default"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: gel(totalRevenue), icon: 'payments', color: 'text-primary', bg: 'bg-primary-fixed/20 border-primary/20' },
            { label: 'Platform Fees', value: gel(totalPlatformFee), icon: 'percent', color: 'text-tertiary', bg: 'bg-tertiary-fixed/20 border-tertiary/20' },
            { label: 'Insurance Revenue', value: gel(totalInsurance), icon: 'shield', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
            { label: 'Host Payouts', value: gel(Math.max(0, totalHostPayouts)), icon: 'account_balance_wallet', color: 'text-slate-600', bg: 'bg-surface-container border-outline-variant/40' },
          ].map(card => (
            <div key={card.label} className={`rounded-2xl border p-5 ${card.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-[20px] ${card.color}`}>{card.icon}</span>
                <p className="text-label-sm text-secondary">{card.label}</p>
              </div>
              <p className={`text-h2 font-black ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Insurance plan breakdown */}
        <div className="rounded-2xl border border-outline-variant/40 bg-white p-5 mb-8">
          <p className="font-extrabold text-label-bold text-on-background mb-4">Insurance Breakdown</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {([
              { key: 'none',     label: 'No Insurance', daily: 0,   color: 'text-slate-500' },
              { key: 'basic',    label: 'Basic',         daily: 0,   color: 'text-slate-500' },
              { key: 'standard', label: 'Standard',      daily: 18,  color: 'text-primary' },
              { key: 'premium',  label: 'Premium',       daily: 35,  color: 'text-tertiary' },
            ] as { key: keyof typeof byPlan; label: string; daily: number; color: string }[]).map(p => (
              <div key={p.key} className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-3">
                <p className={`font-black text-[13px] ${p.color}`}>{p.label}</p>
                {p.daily > 0 && <p className="text-[11px] text-secondary">{p.daily}₾/day</p>}
                <p className="text-h3 font-black text-on-background mt-1">{byPlan[p.key]}</p>
                <p className="text-label-sm text-secondary">bookings</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings table */}
        {data.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant/40 bg-white py-16 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-[48px] text-slate-300">receipt_long</span>
            <p className="font-bold text-on-background">No completed rentals in {monthLabel(month)}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-outline-variant/40 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/40">
              <p className="font-extrabold text-label-bold text-on-background">{data.length} completed rentals</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low">
                  <tr>
                    {['Car', 'Guest', 'Dates', 'Total', 'Insurance', 'Ins. Fee', 'Platform Fee', 'Host Gets'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {data.map(b => {
                    const ins = calcInsurance(b.insurancePlan, b.startDate, b.endDate);
                    const hostGets = b.totalPrice - b.platformFeeGel - ins;
                    return (
                      <tr key={b.id} className="hover:bg-surface-container-low/50 transition">
                        <td className="px-4 py-3 font-semibold text-on-background whitespace-nowrap">{b.car}</td>
                        <td className="px-4 py-3 text-secondary whitespace-nowrap">{b.guest}</td>
                        <td className="px-4 py-3 text-secondary whitespace-nowrap text-[12px]">
                          {new Date(b.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          {' – '}
                          {new Date(b.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          <span className="text-slate-400 ml-1">({calcDays(b.startDate, b.endDate)}d)</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-on-background whitespace-nowrap">{gel(b.totalPrice)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {b.insurancePlan ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              b.insurancePlan === 'premium' ? 'bg-tertiary-fixed/30 text-tertiary' :
                              b.insurancePlan === 'standard' ? 'bg-primary-fixed/30 text-primary' :
                              'bg-surface-container text-slate-500'
                            }`}>{b.insurancePlan}</span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 font-semibold text-amber-600 whitespace-nowrap">{ins > 0 ? gel(ins) : '—'}</td>
                        <td className="px-4 py-3 font-semibold text-tertiary whitespace-nowrap">{gel(b.platformFeeGel)}</td>
                        <td className="px-4 py-3 font-bold text-on-background whitespace-nowrap">{gel(Math.max(0, hostGets))}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-surface-container-low border-t-2 border-outline-variant/40">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 font-black text-label-bold text-on-background">Totals</td>
                    <td className="px-4 py-3 font-black text-on-background">{gel(totalRevenue)}</td>
                    <td />
                    <td className="px-4 py-3 font-black text-amber-600">{gel(totalInsurance)}</td>
                    <td className="px-4 py-3 font-black text-tertiary">{gel(totalPlatformFee)}</td>
                    <td className="px-4 py-3 font-black text-on-background">{gel(Math.max(0, totalHostPayouts))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
