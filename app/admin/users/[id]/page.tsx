import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { AdminUserDetailContent } from './AdminUserDetailContent';

export const metadata = { title: 'Admin — User Detail' };

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const user = await prisma.profile.findUnique({
    where: { id: params.id },
    include: {
      bookings: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { insurancePolicy: { select: { planType: true } } },
      },
      cars: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, brand: true, model: true, year: true, dailyPrice: true,
          isActive: true, listingStatus: true, location: true,
          _count: { select: { bookings: true } },
        },
      },
    },
  });

  if (!user) notFound();

  const totalSpent = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      type: 'payment',
      status: 'succeeded',
      booking: { guestId: params.id },
    },
  });

  return (
    <AdminUserDetailContent
      user={{
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
        verificationStatus: user.verificationStatus,
        hostVerificationStatus: user.hostVerificationStatus,
        bio: user.bio,
        rating: user.rating,
        lang: user.lang,
        birthDate: user.birthDate?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        bookings: user.bookings.map(b => ({
          id: b.id,
          carBrand: b.carBrand,
          carModel: b.carModel,
          carYear: b.carYear,
          startDate: b.startDate.toISOString(),
          endDate: b.endDate.toISOString(),
          totalPrice: b.totalPrice,
          status: b.status,
          createdAt: b.createdAt.toISOString(),
          insurancePolicy: b.insurancePolicy,
        })),
        cars: user.cars,
      }}
      totalSpent={totalSpent._sum.amount ?? 0}
    />
  );
}
