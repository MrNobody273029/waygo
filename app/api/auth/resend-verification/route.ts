import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { sendOtpEmail } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  const user = await prisma.profile.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'No account found' }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ status: 'already_verified' });

  const otp = generateOtp();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.profile.update({
    where: { email },
    data: { emailVerificationCode: otp, emailVerificationExpiry: expiry },
  });

  const { html, subject, to } = sendOtpEmail({
    toName: user.fullName,
    toEmail: email,
    otp,
    type: 'verify_email',
    lang: user.lang ?? 'en',
  });

  try {
    await resend.emails.send({ from: 'WAYGO <no-reply@waygo.ge>', to, subject, html });
  } catch (err) {
    console.error('Resend verification email error:', err);
  }

  return NextResponse.json({ status: 'sent' });
}
