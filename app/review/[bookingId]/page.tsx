import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ReviewContent } from './ReviewContent';

export default async function HostReviewPage({ params }: { params: { bookingId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as any).id as string;

  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    select: {
      id: true,
      status: true,
      carBrand: true,
      carModel: true,
      carYear: true,
      startDate: true,
      endDate: true,
      guestId: true,
      car: { select: { ownerId: true } },
      guest: { select: { fullName: true, rating: true, reviewCount: true } },
    },
  });

  if (!booking) redirect('/my-cars');

  const isHost = booking.car?.ownerId === userId;
  const isGuest = booking.guestId === userId;
  if (!isHost && !isGuest) redirect('/my-cars');

  const role = isHost ? 'host' : 'guest';

  const existingReview = await prisma.review.findFirst({
    where: { bookingId: params.bookingId, reviewerId: userId },
    select: { rating: true, comment: true, createdAt: true },
  });

  const revieweeProfile = isHost
    ? booking.guest
    : await prisma.profile.findUnique({
        where: { id: booking.car?.ownerId ?? '' },
        select: { fullName: true, rating: true, reviewCount: true },
      });

  return (
    <ReviewContent
      bookingId={params.bookingId}
      role={role}
      status={booking.status}
      car={{ brand: booking.carBrand, model: booking.carModel, year: booking.carYear }}
      dates={{ start: booking.startDate.toISOString(), end: booking.endDate.toISOString() }}
      revieweeName={revieweeProfile?.fullName ?? 'User'}
      revieweeRating={revieweeProfile?.rating ?? 0}
      revieweeCount={revieweeProfile?.reviewCount ?? 0}
      existingReview={existingReview ?? null}
    />
  );
}
