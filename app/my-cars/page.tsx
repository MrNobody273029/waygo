import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { MyCarsContent } from './MyCarsContent';

export default async function MyCarsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = (session.user as any).id as string;
  const [cars, profile] = await Promise.all([
    prisma.car.findMany({
      where: { ownerId: userId },
      select: {
        id: true, brand: true, model: true, year: true,
        dailyPrice: true, location: true, imageUrls: true,
        isActive: true, transmission: true, fuelType: true,
        seats: true, createdAt: true,
        listingStatus: true, listingRejectionComment: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.profile.findUnique({
      where: { id: userId },
      select: {
        hostVerified: true,
        hostVerificationStatus: true,
        idCardFront: true,
        idCardBack: true,
        hostSelfieUrl: true,
        hostVerificationRejectionComment: true,
      },
    }),
  ]);

  return (
    <MyCarsContent
      cars={cars as any}
      hostVerified={profile?.hostVerified ?? false}
      hostVerificationStatus={profile?.hostVerificationStatus ?? 'UNVERIFIED'}
      idCardFront={profile?.idCardFront ?? null}
      idCardBack={profile?.idCardBack ?? null}
      hostSelfieUrl={profile?.hostSelfieUrl ?? null}
      hostVerificationRejectionComment={profile?.hostVerificationRejectionComment ?? null}
    />
  );
}
