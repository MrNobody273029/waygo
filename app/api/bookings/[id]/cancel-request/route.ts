import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { sendOtpEmail } from '@/lib/email';
import { calculateCancellation } from '@/lib/constants';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { guest: { select: { id: true, email: true, fullName: true, lang: true } } },
  });

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (booking.guestId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const calc = calculateCancellation({
    startDate: booking.startDate,
    createdAt: booking.createdAt,
    status: booking.status,
    totalPrice: booking.totalPrice,
    platformFeeGel: booking.platformFeeGel,
  });

  if (!calc.eligible) {
    return NextResponse.json({ error: 'ineligible', calc }, { status: 400 });
  }

  const otp = generateOtp();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.booking.update({
    where: { id: params.id },
    data: { cancellationOtpCode: otp, cancellationOtpExpiry: expiry },
  });

  const guest = booking.guest;
  if (guest?.email) {
    const { html, subject, to } = sendOtpEmail({
      toName: guest.fullName,
      toEmail: guest.email,
      otp,
      type: 'verify_email',
      lang: guest.lang ?? 'en',
    });
    try {
      await resend.emails.send({ from: 'WAYGO <no-reply@waygo.ge>', to, subject: `WAYGO — Cancellation code`, html });
    } catch (err) {
      console.error('Cancellation OTP email error:', err);
    }
  }

  return NextResponse.json({ status: 'otp_sent', calc });
}
