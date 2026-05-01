import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DashboardContent } from './DashboardContent';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const profile = await prisma.profile.findUnique({
    where: { email: session.user.email ?? '' },
    select: {
      id: true,
      fullName: true,
      email: true,
      rating: true,
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
        },
      },
    },
  });

  const bookings = (profile?.bookings ?? []).map(b => ({
    id: b.id,
    car: `${b.carBrand} ${b.carModel} ${b.carYear}`,
    dates: `${b.startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} – ${b.endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    status: b.status,
    amount: b.totalPrice,
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
      rating={profile?.rating ?? 5}
      verificationStatus={profile?.verificationStatus ?? 'UNVERIFIED'}
      verificationRejectionComment={profile?.verificationRejectionComment ?? null}
    />
  );
}
