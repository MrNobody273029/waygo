import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { CarsContent } from './CarsContent';

function getDatesInRange(start: string, end: string): Date[] {
  const dates: Date[] = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: {
    welcome?: string; city?: string; start?: string; end?: string;
    type?: string; transmission?: string; maxPrice?: string;
    fuel?: string; seats?: string; brand?: string;
  };
}) {
  const { start, end } = searchParams;

  let availableCarIds: Set<string> | null = null;

  if (start && end && start < end) {
    const dates = getDatesInRange(start, end);
    const avail = await prisma.carAvailability.findMany({
      where: {
        date: { in: dates },
        bookingId: null,
      },
      select: { carId: true, date: true },
    });

    const carDateMap = new Map<string, Set<string>>();
    avail.forEach(row => {
      if (!carDateMap.has(row.carId)) carDateMap.set(row.carId, new Set());
      carDateMap.get(row.carId)!.add(row.date.toISOString().split('T')[0]);
    });

    const dateStrings = dates.map(d => d.toISOString().split('T')[0]);
    const carIds = Array.from(carDateMap.entries())
      .filter(([, s]) => dateStrings.every(d => s.has(d)))
      .map(([id]) => id);
    availableCarIds = new Set(carIds);
  }

  const dbCars = await prisma.car.findMany({
    where: {
      isActive: true,
      ...(availableCarIds !== null ? { id: { in: Array.from(availableCarIds) } } : {}),
    },
    include: {
      owner: { select: { fullName: true, isVerified: true, rating: true, reviewCount: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const cars = dbCars.map(dbCarToUiCar);

  return (
    <CarsContent
      cars={cars}
      showKycOnMount={searchParams.welcome === '1'}
      initialCity={searchParams.city ?? ''}
      initialStart={searchParams.start ?? ''}
      initialEnd={searchParams.end ?? ''}
      initialType={searchParams.type ?? ''}
      initialTransmission={searchParams.transmission ?? ''}
      initialMaxPrice={searchParams.maxPrice ? Number(searchParams.maxPrice) : 0}
      initialFuel={searchParams.fuel ?? ''}
      initialSeats={searchParams.seats ? Number(searchParams.seats) : 0}
      initialBrand={searchParams.brand ?? ''}
    />
  );
}
