import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { MyCarsContent } from './MyCarsContent';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function MyCarsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as any).id as string;

  // Auto-reject expired awaiting_host bookings for this host's cars
  await prisma.booking.findMany({
    where: {
      status: 'awaiting_host',
      hostApprovalDeadline: { lt: new Date() },
      car: { ownerId: userId },
    },
    select: { id: true },
  }).then(async expired => {
    for (const b of expired) {
      await prisma.$transaction([
        prisma.booking.update({ where: { id: b.id }, data: { status: 'rejected', hostApprovalDeadline: null } }),
        prisma.carAvailability.updateMany({ where: { bookingId: b.id }, data: { bookingId: null } }),
      ]);
    }
  });

  const [cars, profile, pendingBookings] = await Promise.all([
    prisma.car.findMany({
      where: { ownerId: userId },
      select: {
        id: true, brand: true, model: true, year: true,
        dailyPrice: true, location: true, imageUrls: true,
        isActive: true, transmission: true, fuelType: true,
        seats: true, createdAt: true,
        listingStatus: true, listingRejectionComment: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.profile.findUnique({
      where: { id: userId },
      select: {
        hostVerified: true,
        hostVerificationStatus: true,
        idCardFront: true,
        idCardBack: true,
        hostSelfieUrl: true,
        hostVerificationRejectionComment: true,
        isPremiumHost: true,
      },
    }),
    prisma.booking.findMany({
      where: {
        status: 'awaiting_host',
        car: { ownerId: userId },
      },
      select: {
        id: true,
        carId: true,
        carBrand: true,
        carModel: true,
        carYear: true,
        startDate: true,
        endDate: true,
        totalPrice: true,
        hostApprovalDeadline: true,
        guest: { select: { fullName: true, lang: true, rating: true, reviewCount: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const carIds = cars.map(c => c.id);
  const tripCounts = await prisma.booking.groupBy({
    by: ['carId'],
    where: { carId: { in: carIds }, status: { in: ['completed', 'disputed'] } },
    _count: { id: true },
  });
  const tripsMap: Record<string, number> = {};
  for (const r of tripCounts) if (r.carId) tripsMap[r.carId] = r._count.id;

  const pendingRequests = pendingBookings.map(b => ({
    id: b.id,
    carId: b.carId,
    carBrand: b.carBrand,
    carModel: b.carModel,
    carYear: b.carYear,
    startDate: b.startDate.toISOString(),
    endDate: b.endDate.toISOString(),
    totalPrice: b.totalPrice,
    hostApprovalDeadline: b.hostApprovalDeadline?.toISOString() ?? null,
    guestName: b.guest.fullName,
    guestLang: b.guest.lang ?? 'en',
    guestRating: b.guest.rating ?? 0,
    guestReviewCount: b.guest.reviewCount ?? 0,
  }));

  const carsWithTrips = cars.map(c => ({ ...c, trips: tripsMap[c.id] ?? 0 }));

  return (
    <MyCarsContent
      cars={carsWithTrips as any}
      hostVerified={profile?.hostVerified ?? false}
      hostVerificationStatus={profile?.hostVerificationStatus ?? 'UNVERIFIED'}
      idCardFront={profile?.idCardFront ?? null}
      idCardBack={profile?.idCardBack ?? null}
      hostSelfieUrl={profile?.hostSelfieUrl ?? null}
      hostVerificationRejectionComment={profile?.hostVerificationRejectionComment ?? null}
      pendingRequests={pendingRequests}
      isPremiumHost={profile?.isPremiumHost ?? false}
    />
  );
}
