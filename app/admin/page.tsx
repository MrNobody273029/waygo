import { prisma } from '@/lib/db';
import { AdminOverviewContent } from './AdminOverviewContent';

export const metadata = { title: 'Admin — Overview' };

async function getStats() {
  const [
    userCount,
    bookingCount,
    activeCarCount,
    revenueResult,
    refundResult,
    recentBookings,
    recentUsers,
    pendingVerifCount,
    pendingCarsCount,
    cancelledCount,
    activeBookingsCount,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.booking.count(),
    prisma.car.count({ where: { isActive: true } }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'payment', status: 'succeeded' },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'refund', status: 'succeeded' },
    }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { guest: { select: { fullName: true } } },
    }),
    prisma.profile.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: { id: true, fullName: true, email: true, country: true, role: true, createdAt: true },
    }),
    prisma.profile.count({
      where: {
        OR: [
          { verificationStatus: 'SUBMITTED' },
          { hostVerificationStatus: 'SUBMITTED' },
        ],
      },
    }),
    prisma.car.count({ where: { listingStatus: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'cancelled' } }),
    prisma.booking.count({ where: { status: { in: ['pending', 'confirmed', 'awaiting_host'] } } }),
  ]);

  return {
    userCount,
    bookingCount,
    activeCarCount,
    revenue: revenueResult._sum.amount ?? 0,
    refunds: refundResult._sum.amount ?? 0,
    recentBookings,
    recentUsers,
    pendingVerifCount,
    pendingCarsCount,
    cancelledCount,
    activeBookingsCount,
  };
}

export default async function AdminOverview() {
  const stats = await getStats();
  return <AdminOverviewContent {...stats} />;
}
