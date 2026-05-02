import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const { email, code } = await req.json();
  if (!email || !code) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const user = await prisma.profile.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'No account found' }, { status: 404 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ status: 'already_verified' });
  }
  if (!user.emailVerificationCode || user.emailVerificationCode !== code) {
    return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
  }
  if (!user.emailVerificationExpiry || user.emailVerificationExpiry < new Date()) {
    return NextResponse.json({ error: 'expired_code' }, { status: 400 });
  }

  await prisma.profile.update({
    where: { email },
    data: {
      emailVerified: true,
      emailVerificationCode: null,
      emailVerificationExpiry: null,
    },
  });

  return NextResponse.json({ status: 'verified' });
}
