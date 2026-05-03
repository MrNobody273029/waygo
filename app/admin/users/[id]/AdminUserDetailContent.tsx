'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gel } from '@/lib/utils';

type Booking = {
  id: string; carBrand: string; carModel: string; carYear: number;
  startDate: string; endDate: string; totalPrice: number; status: string; createdAt: string;
  insurancePolicy: { planType: string } | null;
};
type Car = {
  id: string; brand: string; model: string; year: number; dailyPrice: number;
  isActive: boolean; listingStatus: string; location: string;
  _count: { bookings: number };
};
type User = {
  id: string; fullName: string; email: string | null; phone: string | null;
  country: string; role: string; isVerified: boolean; emailVerified: boolean;
  verificationStatus: string; hostVerificationStatus: string;
  bio: string | null; rating: number | null; lang: string | null;
  createdAt: string; bookings: Booking[]; cars: Car[];
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
  completed: 'bg-blue-50 text-blue-700',
  awaiting_host: 'bg-amber-50 text-amber-700',
};

const VERIFY_BADGE: Record<string, string> = {
  APPROVED: 'bg-emerald-50 text-emerald-700',
  SUBMITTED: 'bg-amber-50 text-amber-700',
  REJECTED: 'bg-red-50 text-red-700',
  UNVERIFIED: 'bg-slate-100 text-slate-500',
};

const ROLE_OPTIONS = ['USER', 'HOST', 'ADMIN'];

export function AdminUserDetailContent({ user, totalSpent }: { user: User; totalSpent: number }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);

  async function patchUser(body: object) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-screen-lg">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/users" className="hover:text-slate-900 transition">Users</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{user.fullName}</span>
      </div>

      {/* Header */}
      <div className="rounded-3xl border bg-white shadow-soft p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-2xl font-black text-primary">
          {user.fullName[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-950">{user.fullName}</h1>
            <RoleBadge role={user.role} />
            {user.isVerified && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                <span className="material-symbols-outlined text-[13px]">verified</span> Verified
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm truncate">{user.email}</p>
          <p className="text-slate-400 text-xs mt-0.5">
            Joined {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            {user.lang && ` · ${user.lang.toUpperCase()}`}
            {user.country && ` · ${user.country}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <label className="text-xs font-semibold text-slate-500">Role</label>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
            >
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {selectedRole !== user.role && (
              <button
                onClick={() => patchUser({ action: 'set_role', role: selectedRole })}
                disabled={saving}
                className="rounded-lg bg-primary-container px-2.5 py-1 text-xs font-bold text-white hover:bg-primary transition disabled:opacity-50"
              >
                {saving ? '…' : 'Save'}
              </button>
            )}
          </div>
          <button
            onClick={() => patchUser({ action: 'toggle_email_verified' })}
            disabled={saving}
            className={`rounded-xl border px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${
              user.emailVerified
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
            }`}
          >
            Email {user.emailVerified ? 'Verified ✓' : 'Unverified — click to verify'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total bookings', value: user.bookings.length.toString(), icon: 'calendar_today', color: 'bg-primary-fixed/40 text-primary' },
          { label: 'Cars listed', value: user.cars.length.toString(), icon: 'directions_car', color: 'bg-violet-50 text-violet-700' },
          { label: 'Total spent', value: gel(totalSpent), icon: 'payments', color: 'bg-tertiary-fixed/40 text-tertiary' },
          { label: 'Rating', value: user.rating ? `${user.rating}/5` : '—', icon: 'star', color: 'bg-amber-50 text-amber-700' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border bg-white p-4 shadow-soft">
            <div className={`inline-flex rounded-xl p-2 mb-3 ${s.color}`}>
              <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
            </div>
            <p className="text-xs font-semibold text-slate-500">{s.label}</p>
            <p className="text-xl font-black text-slate-950 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Verification status + contact */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white shadow-soft p-5">
          <h3 className="font-black text-base mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">shield_person</span>
            Verification Status
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Guest (Renter)', status: user.verificationStatus, action: 'set_guest_verification' as const },
              { label: 'Host', status: user.hostVerificationStatus, action: 'set_host_verification' as const },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${VERIFY_BADGE[item.status] ?? VERIFY_BADGE.UNVERIFIED}`}>
                    {item.status}
                  </span>
                  {item.status !== 'APPROVED' && (
                    <button
                      onClick={() => patchUser({ action: item.action, status: 'APPROVED' })}
                      disabled={saving}
                      className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {item.status === 'APPROVED' && (
                    <button
                      onClick={() => patchUser({ action: item.action, status: 'UNVERIFIED' })}
                      disabled={saving}
                      className="rounded-lg bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white shadow-soft p-5">
          <h3 className="font-black text-base mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">contact_page</span>
            Contact & Info
          </h3>
          <div className="space-y-2.5 text-sm">
            {[
              { icon: 'mail', label: 'Email', value: user.email },
              { icon: 'call', label: 'Phone', value: user.phone },
              { icon: 'flag', label: 'Country', value: user.country },
              { icon: 'language', label: 'Language', value: user.lang?.toUpperCase() },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[15px] text-secondary w-4">{row.icon}</span>
                <span className="text-slate-500 w-16 shrink-0">{row.label}</span>
                <span className="font-semibold text-slate-900">{row.value || '—'}</span>
              </div>
            ))}
            {user.bio && (
              <div className="mt-2 rounded-xl bg-surface-container-low p-3">
                <p className="text-xs text-slate-600 leading-relaxed">{user.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bookings */}
      <div className="rounded-3xl border bg-white shadow-soft overflow-hidden">
        <div className="border-b px-6 py-5 flex items-center justify-between">
          <h2 className="text-lg font-black">Booking History</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{user.bookings.length}</span>
        </div>
        {user.bookings.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-400">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left">Car</th>
                  <th className="px-5 py-3 text-left">Dates</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Insurance</th>
                  <th className="px-5 py-3 text-left">Total</th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {user.bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <p className="font-bold">{b.carBrand} {b.carModel}</p>
                      <p className="text-xs text-slate-400">{b.carYear}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {new Date(b.startDate).toLocaleDateString('en-GB')} –<br />
                      {new Date(b.endDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_BADGE[b.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold capitalize text-slate-600">{b.insurancePolicy?.planType ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 font-black text-slate-900">{gel(b.totalPrice)}</td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/bookings/${b.id}`} className="text-xs font-bold text-primary hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cars */}
      {user.cars.length > 0 && (
        <div className="rounded-3xl border bg-white shadow-soft overflow-hidden">
          <div className="border-b px-6 py-5 flex items-center justify-between">
            <h2 className="text-lg font-black">Listed Cars</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{user.cars.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left">Car</th>
                  <th className="px-5 py-3 text-left">Location</th>
                  <th className="px-5 py-3 text-left">Daily Price</th>
                  <th className="px-5 py-3 text-left">Bookings</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {user.cars.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-bold">{c.brand} {c.model} {c.year}</td>
                    <td className="px-5 py-3.5 text-slate-500">{c.location}</td>
                    <td className="px-5 py-3.5 font-semibold">{gel(c.dailyPrice)}/day</td>
                    <td className="px-5 py-3.5 font-semibold">{c._count.bookings}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/cars/${c.id}`} className="text-xs font-bold text-primary hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    ADMIN: 'bg-red-50 text-red-700',
    HOST: 'bg-violet-50 text-violet-700',
    USER: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${map[role] ?? 'bg-slate-100 text-slate-600'}`}>
      {role}
    </span>
  );
}
