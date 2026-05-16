import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { BookingDetailContent } from './BookingDetailContent';

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const profileId = (session.user as any).id;
  const guestEmail = (session.user as any).email as string ?? '';

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      carBrand: true,
      carModel: true,
      carYear: true,
      guestId: true,
      startDate: true,
      endDate: true,
      totalPrice: true,
      platformFeeGel: true,
      deliveryType: true,
      deliveryCost: true,
      deliveryAddress: true,
      status: true,
      createdAt: true,
      confirmationCode: true,
      conditionReports: {
        select: { id: true, phase: true, photoUrls: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
      insurancePolicy: {
        select: { planType: true, deductibleAmount: true },
      },
    },
  });

  if (!booking || booking.guestId !== profileId) redirect('/dashboard');

  const existingReview = await prisma.review.findFirst({
    where: { bookingId: params.id, reviewerId: profileId },
    select: { rating: true, comment: true },
  });

  const SHOW_HOST_CONTACT_STATUSES = ['pending', 'confirmed', 'return_review', 'completed', 'disputed'];
  const hostProfile = SHOW_HOST_CONTACT_STATUSES.includes(booking.status)
    ? await prisma.profile.findFirst({
        where: { cars: { some: { bookings: { some: { id: params.id } } } } },
        select: { fullName: true, rating: true, reviewCount: true, phone: true },
      })
    : null;

  return (
    <BookingDetailContent
      guestEmail={guestEmail}
      existingReview={existingReview ?? null}
      hostProfile={hostProfile ? { fullName: hostProfile.fullName, rating: hostProfile.rating, reviewCount: hostProfile.reviewCount, phone: hostProfile.phone ?? null } : null}
      booking={{
        id: booking.id,
        carBrand: booking.carBrand,
        carModel: booking.carModel,
        carYear: booking.carYear,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalPrice: booking.totalPrice,
        platformFeeGel: booking.platformFeeGel,
        deliveryType: booking.deliveryType,
        deliveryCost: booking.deliveryCost,
        deliveryAddress: booking.deliveryAddress ?? null,
        status: booking.status,
        createdAt: booking.createdAt.toISOString(),
        confirmationCode: booking.confirmationCode ?? null,
        conditionReports: booking.conditionReports.map(r => ({
          id: r.id,
          phase: r.phase,
          photoUrls: r.photoUrls,
          createdAt: r.createdAt.toISOString(),
        })),
        insurancePolicy: booking.insurancePolicy
          ? { planType: booking.insurancePolicy.planType, deductibleAmount: booking.insurancePolicy.deductibleAmount }
          : null,
      }}
    />
  );
}
