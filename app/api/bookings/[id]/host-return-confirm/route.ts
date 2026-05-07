import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Resend } from 'resend';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { returnConfirmedGuestEmail, carReturnedReviewEmail } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profileId = (session.user as any).id;

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    select: {
      id: true, status: true, guestId: true,
      carBrand: true, carModel: true, carYear: true,
      startDate: true, endDate: true,
      car: {
        select: {
          ownerId: true,
          owner: { select: { id: true, email: true, fullName: true, lang: true } },
        },
      },
      guest: { select: { id: true, email: true, fullName: true, lang: true } },
    },
  });

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (booking.car?.owner?.id !== profileId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (booking.status !== 'return_review') return NextResponse.json({ error: 'Not in return_review state' }, { status: 400 });

  await prisma.$transaction([
    prisma.booking.update({ where: { id: params.id }, data: { status: 'completed' } }),
    prisma.notification.create({
      data: {
        userId: booking.guestId,
        type: 'return_confirmed',
        bookingId: params.id,
        message: `Your return for ${booking.carBrand} ${booking.carModel} has been confirmed. Deposit will be released.`,
      },
    }),
  ]);

  // Email guest
  if (booking.guest?.email) {
    const validLangs = ['en', 'ka', 'ru'];
    const guestLang = validLangs.includes(booking.guest.lang)
      ? (booking.guest.lang as 'en' | 'ka' | 'ru')
      : 'en';
    const { html, subject } = returnConfirmedGuestEmail({
      guestName: booking.guest.fullName,
      guestLang,
      car: { brand: booking.carBrand, model: booking.carModel, year: booking.carYear },
      booking: { id: booking.id },
      dashboardUrl: `${SITE_URL}/dashboard`,
      siteUrl: SITE_URL,
    });
    resend.emails.send({ from: 'WAYGO <info@waygo.ge>', to: booking.guest.email, subject, html }).catch(console.error);
  }

  // Email host to review guest
  if (booking.car?.owner?.email) {
    const validLangs = ['en', 'ka', 'ru'];
    const hostLang = validLangs.includes(booking.car.owner.lang)
      ? (booking.car.owner.lang as 'en' | 'ka' | 'ru')
      : 'en';
    const { html, subject } = carReturnedReviewEmail({
      hostName: booking.car.owner.fullName,
      hostLang,
      guestName: booking.guest?.fullName ?? 'Guest',
      car: { brand: booking.carBrand, model: booking.carModel, year: booking.carYear },
      booking: { id: booking.id, startDate: booking.startDate, endDate: booking.endDate },
      reviewUrl: `${SITE_URL}/review/${booking.id}`,
      siteUrl: SITE_URL,
    });
    resend.emails.send({ from: 'WAYGO <info@waygo.ge>', to: booking.car.owner.email, subject, html }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
