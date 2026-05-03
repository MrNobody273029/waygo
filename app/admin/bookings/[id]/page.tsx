import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { AdminBookingDetailContent } from './AdminBookingDetailContent';

export const metadata = { title: 'Admin — Booking Detail' };

export default async function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      guest: {
        select: {
          id: true, fullName: true, email: true, phone: true, country: true,
          role: true, isVerified: true, guestVerificationStatus: true,
        },
      },
      insurancePolicy: true,
      transactions: { orderBy: { createdAt: 'asc' } },
      conditionReports: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!booking) notFound();

  return (
    <AdminBookingDetailContent
      booking={{
        ...booking,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        createdAt: booking.createdAt.toISOString(),
        cancelledAt: booking.cancelledAt?.toISOString() ?? null,
        hostApprovalDeadline: booking.hostApprovalDeadline?.toISOString() ?? null,
        transactions: booking.transactions.map(tx => ({
          ...tx,
          createdAt: tx.createdAt.toISOString(),
        })),
        conditionReports: booking.conditionReports.map(r => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        })),
        insurancePolicy: booking.insurancePolicy
          ? {
              ...booking.insurancePolicy,
              createdAt: booking.insurancePolicy.createdAt.toISOString(),
            }
          : null,
      }}
    />
  );
}
