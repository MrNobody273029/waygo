import { prisma } from '@/lib/db';
import { AdminBookingsContent } from './AdminBookingsContent';

export const metadata = { title: 'Admin — Bookings' };

export default async function AdminBookings() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      guest: { select: { fullName: true, email: true } },
      insurancePolicy: { select: { planType: true, status: true } },
    },
  });

  return <AdminBookingsContent bookings={bookings} />;
}
