import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Resend } from 'resend';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { disputeCreatedEmail } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge';
const ADMIN_EMAIL = 'admin@waygo.ge';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profileId = (session.user as any).id;
  const { hostComment, hostPhotos } = await req.json();

  if (!hostComment || typeof hostComment !== 'string' || !hostComment.trim()) {
    return NextResponse.json({ error: 'Comment required' }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    select: {
      id: true, status: true, guestId: true,
      carBrand: true, carModel: true, carYear: true,
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

  const existing = await prisma.dispute.findUnique({ where: { bookingId: params.id } });
  if (existing) return NextResponse.json({ error: 'Dispute already exists' }, { status: 400 });

  await prisma.$transaction([
    prisma.dispute.create({
      data: {
        bookingId: params.id,
        hostComment: hostComment.trim(),
        hostPhotos: Array.isArray(hostPhotos) ? hostPhotos.filter((u: unknown) => typeof u === 'string' && u) : [],
      },
    }),
    prisma.booking.update({ where: { id: params.id }, data: { status: 'disputed' } }),
    prisma.notification.create({
      data: {
        userId: booking.guestId,
        type: 'dispute_created',
        bookingId: params.id,
        message: `A dispute was opened by the host for ${booking.carBrand} ${booking.carModel}.`,
      },
    }),
  ]);

  const carData = { brand: booking.carBrand, model: booking.carModel, year: booking.carYear };

  // Email guest
  if (booking.guest?.email) {
    const validLangs = ['en', 'ka', 'ru'];
    const guestLang = validLangs.includes(booking.guest.lang)
      ? (booking.guest.lang as 'en' | 'ka' | 'ru')
      : 'en';
    const { html, subject } = disputeCreatedEmail({
      recipientName: booking.guest.fullName,
      recipientLang: guestLang,
      recipientRole: 'guest',
      guestName: booking.guest.fullName,
      hostName: booking.car?.owner?.fullName ?? 'Host',
      car: carData,
      booking: { id: booking.id },
      hostComment: hostComment.trim(),
      bookingUrl: `${SITE_URL}/bookings/${booking.id}`,
      siteUrl: SITE_URL,
    });
    resend.emails.send({ from: 'WAYGO <info@waygo.ge>', to: booking.guest.email, subject, html }).catch(console.error);
  }

  // Email admin
  const { html: adminHtml, subject: adminSubject } = disputeCreatedEmail({
    recipientName: 'Admin',
    recipientLang: 'en',
    recipientRole: 'admin',
    guestName: booking.guest?.fullName ?? 'Guest',
    hostName: booking.car?.owner?.fullName ?? 'Host',
    car: carData,
    booking: { id: booking.id },
    hostComment: hostComment.trim(),
    bookingUrl: `${SITE_URL}/admin/disputes`,
    siteUrl: SITE_URL,
  });
  resend.emails.send({ from: 'WAYGO <info@waygo.ge>', to: ADMIN_EMAIL, subject: adminSubject, html: adminHtml }).catch(console.error);

  return NextResponse.json({ ok: true });
}
