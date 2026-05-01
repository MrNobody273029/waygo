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
    include: { owner: { select: { fullName: true, isVerified: true, rating: true } } },
  });
  if (!car) return { title: 'Car Not Found' };
  const c = dbCarToUiCar(car);
  return {
    title: `${c.brand} ${c.model} rental in ${c.location}`,
    description: `Rent ${c.year} ${c.brand} ${c.model} from a verified local host with insurance options.`,
  };
}

export default async function CarDetail({ params }: { params: { id: string } }) {
  const car = await prisma.car.findUnique({
    where: { id: params.id },
    include: { owner: { select: { fullName: true, isVerified: true, rating: true } } },
  });
  if (!car) notFound();
  return <CarDetailContent car={dbCarToUiCar(car)} />;
}
