'use client';
import { useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, UserX } from 'lucide-react';
import { useLang } from '@/components/lang-provider';

type User = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  country: string;
  role: string;
  isVerified: boolean;
  rating: number | null;
  createdAt: Date;
  _count: { bookings: number; cars: number };
};

export function AdminUsersContent({ users }: { users: User[] }) {
  const { t } = useLang();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.fullName.toLowerCase().includes(q) && !(u.email ?? '').toLowerCase().includes(q) && !(u.phone ?? '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] md:text-3xl font-black text-slate-950">{t.admin.users}</h1>
          <p className="mt-1 text-sm text-slate-500">{users.length} {t.admin.registeredAccounts}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary transition"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition bg-white cursor-pointer"
        >
          <option value="all">All roles</option>
          <option value="USER">USER</option>
          <option value="HOST">HOST</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      <div className="rounded-3xl border bg-white shadow-soft overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <UserX size={40} className="mb-3" />
            <p className="font-semibold">{search || roleFilter !== 'all' ? 'No users match your filters' : t.admin.noUsers}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">{t.admin.userCol}</th>
                  <th className="px-6 py-3 text-left">{t.admin.phone}</th>
                  <th className="px-6 py-3 text-left">{t.admin.country}</th>
                  <th className="px-6 py-3 text-left">{t.admin.role}</th>
                  <th className="px-6 py-3 text-left">{t.admin.bookings}</th>
                  <th className="px-6 py-3 text-left">{t.admin.cars}</th>
                  <th className="px-6 py-3 text-left">{t.admin.joined}</th>
                  <th className="px-6 py-3 text-left">{t.admin.status}</th>
                  <th className="px-6 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => window.location.href = `/admin/users/${u.id}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-xs font-black text-primary">
                          {u.fullName[0].toUpperCase()}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{u.fullName}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{u.country}</span>
                    </td>
                    <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                    <td className="px-6 py-4 font-semibold">{u._count.bookings}</td>
                    <td className="px-6 py-4 font-semibold">{u._count.cars}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4">
                      {u.isVerified ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <BadgeCheck size={13} /> {t.admin.verified}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">{t.admin.unverified}</span>
                      )}
                    </td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <Link href={`/admin/users/${u.id}`} className="text-xs font-bold text-primary hover:underline">
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
