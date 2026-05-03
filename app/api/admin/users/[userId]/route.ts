import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const VERIFICATION_STATUSES = ['UNVERIFIED', 'SUBMITTED', 'APPROVED', 'REJECTED'] as const;

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('set_role'), role: z.enum(['USER', 'HOST', 'ADMIN']) }),
  z.object({ action: z.literal('set_guest_verification'), status: z.enum(VERIFICATION_STATUSES) }),
  z.object({ action: z.literal('set_host_verification'),  status: z.enum(VERIFICATION_STATUSES) }),
  z.object({ action: z.literal('toggle_email_verified') }),
]);

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const user = await prisma.profile.findUnique({ where: { id: params.userId } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const PROTECTED_EMAIL = 'admin@waygo.ge';
  const data = body.data;

  // Permanently protect the super-admin account from role/login changes
  if (user.email === PROTECTED_EMAIL && (data.action === 'set_role' || data.action === 'toggle_email_verified')) {
    return NextResponse.json({ error: 'Cannot modify the super-admin account' }, { status: 403 });
  }

  if (data.action === 'set_role') {
    await prisma.profile.update({ where: { id: params.userId }, data: { role: data.role } });
    return NextResponse.json({ ok: true, role: data.role });
  }

  if (data.action === 'set_guest_verification') {
    await prisma.profile.update({
      where: { id: params.userId },
      data: {
        verificationStatus: data.status,
        isVerified: data.status === 'APPROVED',
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (data.action === 'set_host_verification') {
    await prisma.profile.update({
      where: { id: params.userId },
      data: { hostVerificationStatus: data.status },
    });
    return NextResponse.json({ ok: true });
  }

  if (data.action === 'toggle_email_verified') {
    await prisma.profile.update({
      where: { id: params.userId },
      data: { emailVerified: !user.emailVerified },
    });
    return NextResponse.json({ ok: true, emailVerified: !user.emailVerified });
  }
}
