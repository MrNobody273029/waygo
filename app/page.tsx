import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { HomeContent } from './HomeContent';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const dbCars = await prisma.car.findMany({
    where: { isActive: true },
    include: {
      owner: {
        select: {
          fullName: true,
          isVerified: true,
          rating: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const featuredCars = dbCars.map(dbCarToUiCar);

  return <HomeContent featuredCars={featuredCars} />;
}