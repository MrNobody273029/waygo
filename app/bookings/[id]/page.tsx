import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { BookingDetailContent } from './BookingDetailContent';

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const profileId = (session.user as any).id;

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
      deliveryType: true,
      deliveryCost: true,
      deliveryAddress: true,
      status: true,
      createdAt: true,
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

  return (
    <BookingDetailContent
      booking={{
        id: booking.id,
        carBrand: booking.carBrand,
        carModel: booking.carModel,
        carYear: booking.carYear,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalPrice: booking.totalPrice,
        deliveryType: booking.deliveryType,
        deliveryCost: booking.deliveryCost,
        deliveryAddress: booking.deliveryAddress ?? null,
        status: booking.status,
        createdAt: booking.createdAt.toISOString(),
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
