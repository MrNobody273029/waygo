import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Resend } from 'resend';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { expertAssignedEmail } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dispute = await prisma.dispute.findUnique({
    where: { id: params.id },
    select: {
      id: true, status: true,
      booking: {
        select: {
          id: true, guestId: true,
          carBrand: true, carModel: true, carYear: true,
          guest: { select: { email: true, fullName: true, lang: true } },
          car: {
            select: {
              ownerId: true,
              owner: { select: { email: true, fullName: true, lang: true } },
            },
          },
        },
      },
    },
  });

  if (!dispute) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (dispute.status !== 'PENDING') return NextResponse.json({ error: 'Already processed' }, { status: 400 });

  await prisma.$transaction([
    prisma.dispute.update({ where: { id: params.id }, data: { status: 'EXPERT_ASSIGNED' } }),
    prisma.notification.create({
      data: {
        userId: dispute.booking.guestId,
        type: 'expert_assigned',
        bookingId: dispute.booking.id,
        message: `An independent expert has been assigned for the dispute on ${dispute.booking.carBrand} ${dispute.booking.carModel}.`,
      },
    }),
    prisma.notification.create({
      data: {
        userId: dispute.booking.car!.ownerId,
        type: 'expert_assigned',
        bookingId: dispute.booking.id,
        message: `An independent expert has been assigned for the dispute on ${dispute.booking.carBrand} ${dispute.booking.carModel}.`,
      },
    }),
  ]);

  const carData = { brand: dispute.booking.carBrand, model: dispute.booking.carModel, year: dispute.booking.carYear };

  const sendExpertEmail = async (email: string, name: string, lang: string) => {
    const validLangs = ['en', 'ka', 'ru'];
    const recipientLang = validLangs.includes(lang) ? (lang as 'en' | 'ka' | 'ru') : 'en';
    const { html, subject } = expertAssignedEmail({
      recipientName: name,
      recipientLang,
      car: carData,
      booking: { id: dispute.booking.id },
      siteUrl: SITE_URL,
    });
    await resend.emails.send({ from: 'WAYGO <info@waygo.ge>', to: email, subject, html });
  };

  if (dispute.booking.guest?.email) {
    sendExpertEmail(dispute.booking.guest.email, dispute.booking.guest.fullName, dispute.booking.guest.lang).catch(console.error);
  }
  if (dispute.booking.car?.owner?.email) {
    sendExpertEmail(dispute.booking.car.owner.email, dispute.booking.car.owner.fullName, dispute.booking.car.owner.lang).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
