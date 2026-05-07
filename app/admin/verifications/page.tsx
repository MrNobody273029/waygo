import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { AdminVerificationsContent } from './AdminVerificationsContent';

export default async function AdminVerificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login');

  const [users, cars] = await Promise.all([
    prisma.profile.findMany({
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
        phone: true,
        idNumber: true,
        birthDate: true,
        createdAt: true,
        lang: true,
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
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.car.findMany({
      where: { listingStatus: { in: ['PENDING', 'APPROVED', 'REJECTED'] } },
      select: {
        id: true,
        brand: true,
        model: true,
        year: true,
        plateNumber: true,
        color: true,
        location: true,
        dailyPrice: true,
        seats: true,
        doors: true,
        transmission: true,
        fuelType: true,
        imageUrls: true,
        techPassportFront: true,
        techPassportBack: true,
        listingStatus: true,
        listingRejectionComment: true,
        createdAt: true,
        owner: {
          select: { id: true, fullName: true, email: true, lang: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return <AdminVerificationsContent users={users} cars={cars} />;
}
