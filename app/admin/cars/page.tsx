import { prisma } from '@/lib/db';
import { AdminCarsContent } from './AdminCarsContent';

export const metadata = { title: 'Admin — Cars' };

export default async function AdminCars() {
  const [cars, bookingCounts] = await Promise.all([
    prisma.car.findMany({
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { fullName: true, email: true } } },
    }),
    prisma.booking.groupBy({
      by: ['carId'],
      _count: { id: true },
      where: { carId: { not: null } },
    }),
  ]);

  const countMap = Object.fromEntries(
    bookingCounts.map(b => [b.carId!, b._count.id])
  );

  const carsWithCounts = cars.map(c => ({ ...c, bookingCount: countMap[c.id] ?? 0 }));

  return <AdminCarsContent cars={carsWithCounts} />;
}
