import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { sendOtpEmail } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  idNumber: z.string().min(5),
  country: z.string().default('GE'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  lang: z.string().optional(),
  password: z.string().min(8),
});

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  const body = await req.json();
  const input = schema.safeParse(body);
  if (!input.success) {
    return NextResponse.json({ error: 'Invalid data', details: input.error.issues }, { status: 400 });
  }

  const { fullName, email, phone, idNumber, country, birthDate, lang, password } = input.data;

  const [existingEmail, existingId] = await Promise.all([
    prisma.profile.findUnique({ where: { email } }),
    prisma.profile.findUnique({ where: { idNumber } }),
  ]);
  if (existingEmail) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }
  if (existingId) {
    return NextResponse.json({ error: 'ID number already registered' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const otp = generateOtp();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.profile.create({
    data: {
      fullName,
      email,
      phone,
      idNumber,
      country,
      birthDate: new Date(birthDate),
      lang: lang ?? 'en',
      passwordHash,
      emailVerified: false,
      emailVerificationCode: otp,
      emailVerificationExpiry: expiry,
    },
  });

  const { html, subject, to } = sendOtpEmail({
    toName: fullName,
    toEmail: email,
    otp,
    type: 'verify_email',
    lang: lang ?? 'en',
  });

  try {
    await resend.emails.send({
      from: 'WAYGO <no-reply@waygo.ge>',
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Verification email send error:', err);
  }

  return NextResponse.json({ status: 'verification_sent' }, { status: 201 });
}
