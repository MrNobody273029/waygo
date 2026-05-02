import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { calculateCancellation } from '@/lib/constants';
import { bookingCancelledEmail } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      guest: { select: { id: true, email: true, fullName: true, lang: true } },
    },
  });

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (booking.guestId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (!booking.cancellationOtpCode || booking.cancellationOtpCode !== code) {
    return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
  }
  if (!booking.cancellationOtpExpiry || booking.cancellationOtpExpiry < new Date()) {
    return NextResponse.json({ error: 'expired_code' }, { status: 400 });
  }

  const calc = calculateCancellation({
    startDate: booking.startDate,
    createdAt: booking.createdAt,
    status: booking.status,
    totalPrice: booking.totalPrice,
    platformFeeGel: booking.platformFeeGel,
  });

  if (!calc.eligible) {
    return NextResponse.json({ error: 'ineligible' }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: params.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationOtpCode: null,
        cancellationOtpExpiry: null,
      },
    });

    if (calc.totalRefund > 0) {
      await tx.transaction.create({
        data: {
          bookingId: params.id,
          providerId: `refund_${params.id}`,
          amount: calc.totalRefund,
          type: 'refund',
          status: 'succeeded',
        },
      });
    }

    // Release reserved availability dates
    await tx.carAvailability.updateMany({
      where: { bookingId: params.id },
      data: { bookingId: null },
    });
  });

  // Send cancellation confirmation email
  const guest = booking.guest;
  if (guest?.email) {
    const validLangs = ['en', 'ka', 'ru'];
    const lang = validLangs.includes(guest.lang) ? (guest.lang as 'en' | 'ka' | 'ru') : 'en';
    const { html, subject } = bookingCancelledEmail({
      guestName: guest.fullName,
      guestEmail: guest.email,
      lang,
      car: { brand: booking.carBrand, model: booking.carModel, year: booking.carYear },
      booking: { id: booking.id, startDate: booking.startDate, endDate: booking.endDate },
      refundAmount: calc.refundAmount,
      depositRefund: calc.depositRefund,
      platformFeeKept: calc.platformFeeKept,
      totalRefund: calc.totalRefund,
      tier: calc.tier,
      siteUrl: SITE_URL,
    });
    try {
      await resend.emails.send({ from: 'WAYGO <no-reply@waygo.ge>', to: guest.email, subject, html });
    } catch (err) {
      console.error('Cancellation email error:', err);
    }
  }

  return NextResponse.json({ status: 'cancelled', calc });
}
