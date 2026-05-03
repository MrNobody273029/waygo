import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { AdminCarDetailContent } from './AdminCarDetailContent';

export const metadata = { title: 'Admin — Car Detail' };

export default async function AdminCarDetailPage({ params }: { params: { id: string } }) {
  const car = await prisma.car.findUnique({
    where: { id: params.id },
    include: {
      owner: {
        select: {
          id: true, fullName: true, email: true, phone: true,
          country: true, hostVerificationStatus: true, isVerified: true,
        },
      },
      bookings: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          guest: { select: { fullName: true, email: true } },
        },
      },
    },
  });

  if (!car) notFound();

  const totalRevenue = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      type: 'payment',
      status: 'succeeded',
      booking: { carId: params.id },
    },
  });

  return (
    <AdminCarDetailContent
      car={{
        ...car,
        createdAt: car.createdAt.toISOString(),
        bookings: car.bookings.map(b => ({
          id: b.id,
          startDate: b.startDate.toISOString(),
          endDate: b.endDate.toISOString(),
          totalPrice: b.totalPrice,
          status: b.status,
          createdAt: b.createdAt.toISOString(),
          cancelledAt: b.cancelledAt?.toISOString() ?? null,
          guest: b.guest,
        })),
      }}
      totalRevenue={totalRevenue._sum.amount ?? 0}
    />
  );
}
