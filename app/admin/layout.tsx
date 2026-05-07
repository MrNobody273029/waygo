export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin-sidebar';
import type { ReactNode } from 'react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="fixed inset-0 z-30 flex bg-slate-50 pt-[62px] md:pt-[96px]">
      <AdminSidebar />
      <main className="md:ml-64 flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
