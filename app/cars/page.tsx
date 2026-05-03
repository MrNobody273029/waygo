import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { CarsContent } from './CarsContent';

export default async function CarsPage({
  searchParams,
}: {
  searchParams: { welcome?: string; city?: string };
}) {
  const dbCars = await prisma.car.findMany({
    where: { isActive: true },
    include: { owner: { select: { fullName: true, isVerified: true, rating: true, reviewCount: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const cars = dbCars.map(dbCarToUiCar);
  return (
    <CarsContent
      cars={cars}
      showKycOnMount={searchParams.welcome === '1'}
      initialCity={searchParams.city ?? ''}
    />
  );
}
