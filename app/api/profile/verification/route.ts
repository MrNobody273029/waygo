import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: {
      verificationRejectionComment: true,
      hostVerificationRejectionComment: true,
    },
  });

  return NextResponse.json(profile ?? {});
}
