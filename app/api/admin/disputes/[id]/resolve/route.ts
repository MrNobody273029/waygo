import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Resend } from 'resend';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { disputeResolvedEmail } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { damageAmount, expertFee, expertNote } = await req.json();

  if (typeof damageAmount !== 'number' || typeof expertFee !== 'number') {
    return NextResponse.json({ error: 'damageAmount and expertFee required' }, { status: 400 });
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
  if (dispute.status === 'RESOLVED') return NextResponse.json({ error: 'Already resolved' }, { status: 400 });

  await prisma.$transaction([
    prisma.dispute.update({
      where: { id: params.id },
      data: { status: 'RESOLVED', damageAmount, expertFee, expertNote: expertNote ?? null },
    }),
    prisma.notification.create({
      data: {
        userId: dispute.booking.guestId,
        type: 'dispute_resolved',
        bookingId: dispute.booking.id,
        message: `The dispute for ${dispute.booking.carBrand} ${dispute.booking.carModel} has been resolved.`,
      },
    }),
    prisma.notification.create({
      data: {
        userId: dispute.booking.car!.ownerId,
        type: 'dispute_resolved',
        bookingId: dispute.booking.id,
        message: `The dispute for ${dispute.booking.carBrand} ${dispute.booking.carModel} has been resolved.`,
      },
    }),
  ]);

  const carData = { brand: dispute.booking.carBrand, model: dispute.booking.carModel, year: dispute.booking.carYear };

  const sendResolvedEmail = async (email: string, name: string, lang: string, role: 'guest' | 'host') => {
    const validLangs = ['en', 'ka', 'ru'];
    const recipientLang = validLangs.includes(lang) ? (lang as 'en' | 'ka' | 'ru') : 'en';
    const { html, subject } = disputeResolvedEmail({
      recipientName: name,
      recipientLang,
      recipientRole: role,
      car: carData,
      booking: { id: dispute.booking.id },
      damageAmount,
      expertFee,
      expertNote,
      siteUrl: SITE_URL,
    });
    await resend.emails.send({ from: 'WAYGO <info@waygo.ge>', to: email, subject, html });
  };

  if (dispute.booking.guest?.email) {
    sendResolvedEmail(dispute.booking.guest.email, dispute.booking.guest.fullName, dispute.booking.guest.lang, 'guest').catch(console.error);
  }
  if (dispute.booking.car?.owner?.email) {
    sendResolvedEmail(dispute.booking.car.owner.email, dispute.booking.car.owner.fullName, dispute.booking.car.owner.lang, 'host').catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
