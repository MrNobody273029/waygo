import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { HostRentalsContent } from './HostRentalsContent';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function HostRentalsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as any).id as string;

  // Auto-reject expired awaiting_host bookings
  const expired = await prisma.booking.findMany({
    where: {
      status: 'awaiting_host',
      hostApprovalDeadline: { lt: new Date() },
      car: { ownerId: userId },
    },
    select: { id: true },
  });
  for (const b of expired) {
    await prisma.$transaction([
      prisma.booking.update({ where: { id: b.id }, data: { status: 'rejected', hostApprovalDeadline: null } }),
      prisma.carAvailability.updateMany({ where: { bookingId: b.id }, data: { bookingId: null } }),
    ]);
  }

  const [pendingBookings, activeBookings, completedBookings, unreadCount] = await Promise.all([
    // Pending requests
    prisma.booking.findMany({
      where: { status: 'awaiting_host', car: { ownerId: userId } },
      select: {
        id: true, carId: true, carBrand: true, carModel: true, carYear: true,
        startDate: true, endDate: true, totalPrice: true, hostApprovalDeadline: true,
        guest: { select: { fullName: true, lang: true, rating: true, reviewCount: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),

    // Active rentals: confirmed, return_review, disputed
    prisma.booking.findMany({
      where: {
        status: { in: ['pending', 'confirmed', 'return_review', 'disputed'] },
        car: { ownerId: userId },
      },
      select: {
        id: true, carBrand: true, carModel: true, carYear: true,
        startDate: true, endDate: true, totalPrice: true, status: true,
        guest: { select: { fullName: true, rating: true, reviewCount: true } },
        conditionReports: { select: { phase: true, photoUrls: true }, orderBy: { createdAt: 'asc' } },
        dispute: {
          select: {
            id: true, hostComment: true, hostPhotos: true, status: true,
            damageAmount: true, expertFee: true, expertNote: true, createdAt: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    }),

    // Completed rentals
    prisma.booking.findMany({
      where: {
        status: { in: ['completed'] },
        car: { ownerId: userId },
      },
      select: {
        id: true, carBrand: true, carModel: true, carYear: true,
        startDate: true, endDate: true, totalPrice: true, status: true,
        guest: { select: { fullName: true, rating: true, reviewCount: true } },
        dispute: { select: { id: true, status: true, damageAmount: true, expertFee: true } },
      },
      orderBy: { endDate: 'desc' },
      take: 50,
    }),

    // Unread notifications count for this host
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  const mapPending = pendingBookings.map(b => ({
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
    guestLang: 'en',
    guestRating: b.guest.rating ?? 0,
    guestReviewCount: b.guest.reviewCount ?? 0,
  }));

  const mapActive = activeBookings.map(b => ({
    id: b.id,
    carBrand: b.carBrand,
    carModel: b.carModel,
    carYear: b.carYear,
    startDate: b.startDate.toISOString(),
    endDate: b.endDate.toISOString(),
    totalPrice: b.totalPrice,
    status: b.status,
    guestName: b.guest.fullName,
    guestRating: b.guest.rating ?? 0,
    guestReviewCount: b.guest.reviewCount ?? 0,
    pickupPhotos: b.conditionReports.find(r => r.phase === 'pickup')?.photoUrls ?? [],
    returnPhotos: b.conditionReports.find(r => r.phase === 'return')?.photoUrls ?? [],
    dispute: b.dispute ? {
      id: b.dispute.id,
      hostComment: b.dispute.hostComment,
      hostPhotos: b.dispute.hostPhotos,
      status: b.dispute.status,
      damageAmount: b.dispute.damageAmount,
      expertFee: b.dispute.expertFee,
      expertNote: b.dispute.expertNote,
      createdAt: b.dispute.createdAt.toISOString(),
    } : null,
  }));

  const mapCompleted = completedBookings.map(b => ({
    id: b.id,
    carBrand: b.carBrand,
    carModel: b.carModel,
    carYear: b.carYear,
    startDate: b.startDate.toISOString(),
    endDate: b.endDate.toISOString(),
    totalPrice: b.totalPrice,
    status: b.status,
    guestName: b.guest.fullName,
    guestRating: b.guest.rating ?? 0,
    guestReviewCount: b.guest.reviewCount ?? 0,
    dispute: b.dispute ? {
      id: b.dispute.id,
      status: b.dispute.status,
      damageAmount: b.dispute.damageAmount,
      expertFee: b.dispute.expertFee,
    } : null,
  }));

  return (
    <HostRentalsContent
      pendingRequests={mapPending}
      activeRentals={mapActive}
      completedRentals={mapCompleted}
      unreadCount={unreadCount}
    />
  );
}
