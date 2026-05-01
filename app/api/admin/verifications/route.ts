import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.profile.findMany({
    where: {
      OR: [
        { verificationStatus: { in: ['SUBMITTED', 'APPROVED', 'REJECTED'] } },
        { hostVerificationStatus: { in: ['SUBMITTED', 'APPROVED', 'REJECTED'] } },
      ],
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
      isVerified: true,
      verificationStatus: true,
      driverLicenseFront: true,
      driverLicenseBack: true,
      selfieUrl: true,
      hostVerified: true,
      hostVerificationStatus: true,
      idCardFront: true,
      idCardBack: true,
      hostSelfieUrl: true,
      lang: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(users);
}
