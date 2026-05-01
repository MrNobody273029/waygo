import { prisma } from '@/lib/db';
import { gel } from '@/lib/utils';
import { AdminOverviewContent } from './AdminOverviewContent';

export const metadata = { title: 'Admin — Overview' };

async function getStats() {
  const [userCount, bookingCount, activeCarCount, revenueResult, recentBookings, recentUsers] =
    await Promise.all([
      prisma.profile.count(),
      prisma.booking.count(),
      prisma.car.count({ where: { isActive: true } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'payment', status: 'succeeded' },
      }),
      prisma.booking.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          guest: { select: { fullName: true } },
        },
      }),
      prisma.profile.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { id: true, fullName: true, email: true, country: true, role: true, createdAt: true },
      }),
    ]);

  return { userCount, bookingCount, activeCarCount, revenue: revenueResult._sum.amount ?? 0, recentBookings, recentUsers };
}

export default async function AdminOverview() {
  const stats = await getStats();
  return <AdminOverviewContent {...stats} />;
}
