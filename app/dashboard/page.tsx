import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DashboardContent } from './DashboardContent';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as any).id as string;

  const [profile, unreadCount, hostCarCount] = await Promise.all([
    prisma.profile.findUnique({
      where: { email: session.user.email ?? '' },
      select: {
        id: true,
        fullName: true,
        email: true,
        rating: true,
        reviewCount: true,
        verificationStatus: true,
        verificationRejectionComment: true,
        createdAt: true,
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            carBrand: true,
            carModel: true,
            carYear: true,
            startDate: true,
            endDate: true,
            totalPrice: true,
            status: true,
            confirmationCode: true,
          },
        },
      },
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.car.count({ where: { ownerId: userId } }),
  ]);

  const bookings = (profile?.bookings ?? []).map(b => ({
    id: b.id,
    car: `${b.carBrand} ${b.carModel} ${b.carYear}`,
    dates: `${b.startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} – ${b.endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    status: b.status,
    amount: b.totalPrice,
    confirmationCode: b.confirmationCode ?? null,
  }));

  const totalSpent = bookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((s, b) => s + b.amount, 0);

  const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;

  return (
    <DashboardContent
      name={profile?.fullName ?? session.user.name ?? 'User'}
      email={profile?.email ?? session.user.email ?? ''}
      bookings={bookings}
      totalSpent={totalSpent}
      upcomingTrips={upcoming}
      memberSince={profile?.createdAt ? new Date(profile.createdAt).getFullYear().toString() : '2025'}
      rating={profile?.rating ?? 0}
      reviewCount={profile?.reviewCount ?? 0}
      verificationStatus={profile?.verificationStatus ?? 'UNVERIFIED'}
      verificationRejectionComment={profile?.verificationRejectionComment ?? null}
      unreadNotifications={unreadCount}
      isHost={hostCarCount > 0}
    />
  );
}
