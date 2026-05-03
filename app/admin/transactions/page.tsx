import { prisma } from '@/lib/db';
import { AdminTransactionsContent } from './AdminTransactionsContent';

export const metadata = { title: 'Admin — Transactions' };

export default async function AdminTransactionsPage() {
  const [transactions, stats] = await Promise.all([
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            id: true, carBrand: true, carModel: true,
            guest: { select: { fullName: true, email: true } },
          },
        },
      },
    }),
    prisma.transaction.groupBy({
      by: ['type', 'status'],
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return (
    <AdminTransactionsContent
      transactions={transactions.map(tx => ({
        ...tx,
        createdAt: tx.createdAt.toISOString(),
      }))}
      stats={stats}
    />
  );
}
