import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Resend } from 'resend';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hostCancelledGuestEmail, hostCancelledHostEmail } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge';

function calcPenaltyTier(startDate: Date): 'none' | 'medium' | 'high' {
  const hoursUntilPickup = (startDate.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntilPickup > 48) return 'none';
  if (hoursUntilPickup > 24) return 'medium';
  return 'high';
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const hostId = (session.user as any).id as string;

  // 1. Fetch booking with car ownership check
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      car: { select: { ownerId: true, brand: true, model: true, year: true } },
      guest: { select: { id: true, email: true, fullName: true, lang: true } },
    },
  });

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!booking.car) return NextResponse.json({ error: 'Car not found' }, { status: 404 });
  if (booking.car.ownerId !== hostId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (booking.status !== 'pending') {
    return NextResponse.json({ error: 'Only pending bookings can be cancelled by host' }, { status: 400 });
  }

  // 2. Calculate penalty tier
  const tier = calcPenaltyTier(booking.startDate);

  // 3. Determine penalty commission rate
  const newCommissionRate = tier === 'medium' ? 0.15 : tier === 'high' ? 0.20 : null;
  const newPenaltyBookingsRemaining = tier !== 'none' ? 2 : null;

  // 4. Coupon params
  const couponPercent = tier === 'medium' ? 10 : tier === 'high' ? 20 : null;
  const couponExpiresAt = couponPercent !== null
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    : null;

  const { car, guest } = booking;
  const guestId = guest.id;

  // 5. Transaction
  await prisma.$transaction(async (tx) => {
    // a. Update booking
    await tx.booking.update({
      where: { id: params.id },
      data: {
        status: 'cancelled_by_host',
        cancelledAt: new Date(),
        cancelPenaltyTier: tier,
      },
    });

    // b. Free CarAvailability slots
    await tx.carAvailability.updateMany({
      where: { bookingId: params.id },
      data: { bookingId: null },
    });

    // c. Guest notification
    await tx.notification.create({
      data: {
        userId: guestId,
        type: 'booking_cancelled_by_host',
        bookingId: params.id,
        message: `Your booking for ${car.brand} ${car.model} ${car.year} was cancelled by the host.`,
      },
    });

    // d. Host notification
    const penaltyNote =
      tier === 'none' ? ' No penalty applies.' :
      tier === 'medium' ? ' Medium penalty: +15% commission on next 2 bookings.' :
      ' High penalty: +20% commission on next 2 bookings.';
    await tx.notification.create({
      data: {
        userId: hostId,
        type: 'host_booking_cancelled',
        bookingId: params.id,
        message: `You cancelled the booking for ${car.brand} ${car.model} ${car.year}.${penaltyNote}`,
      },
    });

    // e. Create coupon for guest if applicable
    if (couponPercent !== null && couponExpiresAt !== null) {
      await tx.coupon.create({
        data: {
          userId: guestId,
          discountPercent: couponPercent,
          expiresAt: couponExpiresAt,
          triggeredBy: 'host_cancellation',
          bookingId: params.id,
        },
      });
    }

    // f. Update host profile penalty fields
    if (tier !== 'none') {
      await tx.profile.update({
        where: { id: hostId },
        data: {
          penaltyBookingsRemaining: newPenaltyBookingsRemaining,
          penaltyCommissionRate: newCommissionRate,
        },
      });
    }
  });

  // 6. Count penalized cancellations this month — check for suspension
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const penalizedThisMonth = await prisma.booking.count({
    where: {
      car: { ownerId: hostId },
      cancelPenaltyTier: { in: ['medium', 'high'] },
      cancelledAt: { gte: startOfMonth },
    },
  });

  let isSuspended = false;
  if (penalizedThisMonth >= 3) {
    isSuspended = true;
    await prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: hostId },
        data: {
          isSuspended: true,
          suspensionReason: `3 penalized cancellations in ${startOfMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
        },
      });
      await tx.car.updateMany({
        where: { ownerId: hostId },
        data: { isActive: false },
      });
    });

    // Admin notification
    const adminProfile = await prisma.profile.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    if (adminProfile) {
      await prisma.notification.create({
        data: {
          userId: adminProfile.id,
          type: 'host_suspended',
          bookingId: params.id,
          message: `Host account (ID: ${hostId}) has been auto-suspended after 3 penalized cancellations this month.`,
        },
      });
    }
  }

  // 7. Send emails — outside transaction, fire-and-forget
  const validLangs = ['en', 'ka', 'ru'];
  const guestLang = validLangs.includes(guest.lang) ? (guest.lang as 'en' | 'ka' | 'ru') : 'en';

  const hostProfile = await prisma.profile.findUnique({
    where: { id: hostId },
    select: { email: true, fullName: true, lang: true },
  });

  const carData = { brand: car.brand, model: car.model, year: car.year };
  const bookingData = { id: params.id, startDate: booking.startDate, endDate: booking.endDate };

  if (guest.email) {
    try {
      const { html, subject } = hostCancelledGuestEmail({
        guestName: guest.fullName,
        guestLang,
        car: carData,
        booking: bookingData,
        penaltyTier: tier,
        couponPercent,
        couponExpiresAt,
        siteUrl: SITE_URL,
      });
      resend.emails.send({
        from: 'WAYGO <info@waygo.ge>',
        to: guest.email,
        subject,
        html,
      }).catch(console.error);
    } catch (err) {
      console.error('Failed to send guest cancellation email:', err);
    }
  }

  if (hostProfile?.email) {
    const hostLang = validLangs.includes(hostProfile.lang) ? (hostProfile.lang as 'en' | 'ka' | 'ru') : 'en';
    try {
      const { html, subject } = hostCancelledHostEmail({
        hostName: hostProfile.fullName,
        hostLang,
        car: carData,
        booking: bookingData,
        penaltyTier: tier,
        isSuspended,
        siteUrl: SITE_URL,
      });
      resend.emails.send({
        from: 'WAYGO <info@waygo.ge>',
        to: hostProfile.email,
        subject,
        html,
      }).catch(console.error);
    } catch (err) {
      console.error('Failed to send host cancellation email:', err);
    }
  }

  return NextResponse.json({ ok: true, penaltyTier: tier });
}
