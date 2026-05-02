import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { VerifyContent } from './VerifyContent';

export default async function VerifyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const profile = await prisma.profile.findUnique({
    where: { email: session.user.email ?? '' },
    select: {
      verificationStatus: true,
      verificationRejectionComment: true,
      driverLicenseFront: true,
      driverLicenseBack: true,
      selfieUrl: true,
    },
  });

  return (
    <VerifyContent
      verificationStatus={profile?.verificationStatus ?? 'UNVERIFIED'}
      verificationRejectionComment={profile?.verificationRejectionComment ?? null}
      docFront={profile?.driverLicenseFront ?? null}
      docBack={profile?.driverLicenseBack ?? null}
      selfie={profile?.selfieUrl ?? null}
    />
  );
}
