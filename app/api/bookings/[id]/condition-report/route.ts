import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Resend } from 'resend';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hostReturnReviewEmail } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { phase, photoUrls } = await req.json();

  if (!['pickup', 'return'].includes(phase)) {
    return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });
  }

  if (!Array.isArray(photoUrls) || photoUrls.length !== 7 ||
      photoUrls.some((u: unknown) => typeof u !== 'string' || !u.trim())) {
    return NextResponse.json({ error: '7 photos required' }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    select: {
      id: true, guestId: true, status: true, endDate: true,
      carBrand: true, carModel: true, carYear: true, startDate: true,
      car: { select: { ownerId: true, owner: { select: { email: true, fullName: true, lang: true } } } },
    },
  });

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const profileId = (session.user as any).id;
  if (booking.guestId !== profileId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (phase === 'pickup' && booking.status !== 'pending') {
    return NextResponse.json({ error: 'Booking not pending' }, { status: 400 });
  }

  if (phase === 'return') {
    if (booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'Booking not confirmed' }, { status: 400 });
    }
    if (new Date() < booking.endDate) {
      return NextResponse.json({ error: 'Return date not reached' }, { status: 400 });
    }
  }

  const existing = await prisma.conditionReport.findFirst({
    where: { bookingId: params.id, phase },
  });
  if (existing) {
    return NextResponse.json({ error: 'Report already submitted' }, { status: 400 });
  }

  const guestProfile = await prisma.profile.findUnique({
    where: { id: booking.guestId },
    select: { fullName: true },
  });

  const newStatus = phase === 'pickup' ? 'confirmed' : 'return_review';

  await prisma.$transaction([
    prisma.conditionReport.create({
      data: { bookingId: params.id, phase, photoUrls },
    }),
    prisma.booking.update({
      where: { id: params.id },
      data: { status: newStatus },
    }),
  ]);

  // On return: notify host to confirm/dispute — fire and forget
  if (phase === 'return' && booking.car?.owner?.email) {
    const validLangs = ['en', 'ka', 'ru'];
    const hostLang = validLangs.includes(booking.car.owner.lang)
      ? (booking.car.owner.lang as 'en' | 'ka' | 'ru')
      : 'en';
    const { html, subject } = hostReturnReviewEmail({
      hostName: booking.car.owner.fullName,
      hostLang,
      guestName: guestProfile?.fullName ?? 'Guest',
      car: { brand: booking.carBrand, model: booking.carModel, year: booking.carYear },
      booking: { id: booking.id, startDate: booking.startDate, endDate: booking.endDate },
      reviewUrl: `${SITE_URL}/host-rentals`,
      siteUrl: SITE_URL,
    });
    resend.emails.send({ from: 'WAYGO <info@waygo.ge>', to: booking.car.owner.email, subject, html }).catch(console.error);

    // Create in-app notification for host
    prisma.notification.create({
      data: {
        userId: booking.car.ownerId,
        type: 'return_review',
        bookingId: params.id,
        message: `${guestProfile?.fullName ?? 'Guest'} submitted return photos for ${booking.carBrand} ${booking.carModel}`,
      },
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
