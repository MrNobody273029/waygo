import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { email, code, newPassword } = await req.json();
  if (!email || !code || !newPassword) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Password too short' }, { status: 400 });
  }

  const user = await prisma.profile.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'no_account' }, { status: 404 });
  if (!user.passwordResetCode || user.passwordResetCode !== code) {
    return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
  }
  if (!user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
    return NextResponse.json({ error: 'expired_code' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.profile.update({
    where: { email },
    data: {
      passwordHash,
      passwordResetCode: null,
      passwordResetExpiry: null,
    },
  });

  return NextResponse.json({ status: 'reset' });
}
