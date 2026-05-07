import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminDisputesContent } from './DisputesContent';

export default async function AdminDisputesPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      hostComment: true,
      hostPhotos: true,
      damageAmount: true,
      expertFee: true,
      expertNote: true,
      createdAt: true,
      booking: {
        select: {
          id: true,
          carBrand: true,
          carModel: true,
          carYear: true,
          startDate: true,
          endDate: true,
          conditionReports: {
            select: { phase: true, photoUrls: true },
            orderBy: { createdAt: 'asc' },
          },
          guest: { select: { fullName: true, email: true } },
          car: {
            select: {
              owner: { select: { fullName: true, email: true } },
            },
          },
        },
      },
    },
  });

  const mapped = disputes.map(d => ({
    id: d.id,
    status: d.status,
    hostComment: d.hostComment,
    hostPhotos: d.hostPhotos,
    damageAmount: d.damageAmount,
    expertFee: d.expertFee,
    expertNote: d.expertNote,
    createdAt: d.createdAt.toISOString(),
    booking: {
      id: d.booking.id,
      carBrand: d.booking.carBrand,
      carModel: d.booking.carModel,
      carYear: d.booking.carYear,
      startDate: d.booking.startDate.toISOString(),
      endDate: d.booking.endDate.toISOString(),
      pickupPhotos: d.booking.conditionReports.find(r => r.phase === 'pickup')?.photoUrls ?? [],
      returnPhotos: d.booking.conditionReports.find(r => r.phase === 'return')?.photoUrls ?? [],
      guestName: d.booking.guest.fullName,
      guestEmail: d.booking.guest.email ?? '',
      hostName: d.booking.car?.owner?.fullName ?? '',
      hostEmail: d.booking.car?.owner?.email ?? '',
    },
  }));

  return <AdminDisputesContent disputes={mapped} />;
}
