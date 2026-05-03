import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { CarDetailContent } from './CarDetailContent';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const car = await prisma.car.findUnique({
    where: { id: params.id },
    include: { owner: { select: { fullName: true, isVerified: true, rating: true, reviewCount: true } } },
  });
  if (!car) return { title: 'Car Not Found' };
  const c = dbCarToUiCar(car);
  return {
    title: `${c.brand} ${c.model} rental in ${c.location}`,
    description: `Rent ${c.year} ${c.brand} ${c.model} from a verified local host with insurance options.`,
  };
}

export default async function CarDetail({ params }: { params: { id: string } }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [car, availRows] = await Promise.all([
    prisma.car.findUnique({
      where: { id: params.id },
      include: { owner: { select: { fullName: true, isVerified: true, rating: true, reviewCount: true } } },
    }),
    prisma.carAvailability.findMany({
      where: {
        carId: params.id,
        bookingId: null,
        date: { gte: today },
      },
      select: { date: true },
      orderBy: { date: 'asc' },
    }),
  ]);

  if (!car) notFound();

  const availableDates = availRows.map(r => r.date.toISOString().split('T')[0]);

  return <CarDetailContent car={dbCarToUiCar(car)} availableDates={availableDates} />;
}
