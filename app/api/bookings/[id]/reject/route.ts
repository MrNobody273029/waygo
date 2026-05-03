import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Resend } from 'resend';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { bookingRejectedEmail } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const body = await req.json().catch(() => ({}));
  const rejectionComment: string | undefined = body?.rejectionComment?.trim() || undefined;

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      car: { select: { ownerId: true } },
      guest: { select: { email: true, fullName: true, lang: true } },
    },
  });

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Only the car owner can reject
  if (!booking.car || booking.car.ownerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (booking.status !== 'awaiting_host') {
    return NextResponse.json({ error: 'Booking is not awaiting host approval' }, { status: 400 });
  }

  // If the deadline has already passed, treat as auto-reject regardless of who triggered it
  const isAutoRejected = !!(booking.hostApprovalDeadline && booking.hostApprovalDeadline < new Date());

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: params.id },
      data: { status: 'rejected', hostApprovalDeadline: null },
    }),
    // Free up the reserved availability dates
    prisma.carAvailability.updateMany({
      where: { bookingId: params.id },
      data: { bookingId: null },
    }),
  ]);

  // Send rejection email to guest — fire and forget
  const { guest } = booking;
  if (guest?.email) {
    const validLangs = ['en', 'ka', 'ru'];
    const lang = validLangs.includes(guest.lang) ? (guest.lang as 'en' | 'ka' | 'ru') : 'en';

    const { html, subject } = bookingRejectedEmail({
      guestName: guest.fullName,
      lang,
      car: { brand: booking.carBrand, model: booking.carModel, year: booking.carYear },
      booking: { startDate: booking.startDate, endDate: booking.endDate },
      isAutoRejected,
      rejectionComment,
      siteUrl: SITE_URL,
    });

    resend.emails.send({
      from: 'WAYGO <info@waygo.ge>',
      to: guest.email,
      subject,
      html,
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
