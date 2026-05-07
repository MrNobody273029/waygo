import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { CarDetailContent } from './CarDetailContent';
import { JsonLd } from '@/components/JsonLd';
import {
  absoluteUrl, getSiteUrl, carTitle, carDescription,
  jsonLdBreadcrumb, jsonLdCarOffer, type CarForSeo,
} from '@/lib/seo';

function toCarForSeo(c: ReturnType<typeof dbCarToUiCar>): CarForSeo {
  return {
    id: c.id,
    brand: c.brand,
    model: c.model,
    year: c.year,
    location: c.location,
    dailyPrice: c.dailyPrice,
    transmission: c.transmission,
    seats: c.seats,
    fuelType: c.fuelType,
    type: c.type,
    description: c.description || undefined,
    images: c.images,
    verified: c.verified,
  };
}

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
  const seo = toCarForSeo(c);
  const pageUrl = absoluteUrl(`/cars/${c.id}`);
  return {
    title: carTitle(seo),
    description: carDescription(seo),
    alternates: { canonical: pageUrl },
    openGraph: {
      title: carTitle(seo),
      description: carDescription(seo),
      url: pageUrl,
      type: 'website',
      ...(c.images?.[0] && {
        images: [{ url: c.images[0], alt: `${c.brand} ${c.model} ${c.year}` }],
      }),
    },
    robots: { index: true, follow: true },
  };
}

export default async function CarDetail({ params }: { params: { id: string } }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [car, availRows, completedTrips] = await Promise.all([
    prisma.car.findUnique({
      where: { id: params.id },
      include: { owner: { select: { fullName: true, isVerified: true, rating: true, reviewCount: true } } },
    }),
    prisma.carAvailability.findMany({
      where: { carId: params.id, bookingId: null, date: { gte: today } },
      select: { date: true },
      orderBy: { date: 'asc' },
    }),
    prisma.booking.count({
      where: { carId: params.id, status: { in: ['completed', 'disputed'] } },
    }),
  ]);

  if (!car) notFound();

  const availableDates = availRows.map(r => r.date.toISOString().split('T')[0]);
  const c = dbCarToUiCar({ ...car, completedTrips });
  const seo = toCarForSeo(c);
  const pageUrl = absoluteUrl(`/cars/${params.id}`);

  return (
    <>
      <JsonLd data={[
        jsonLdBreadcrumb([
          { name: 'Home', url: getSiteUrl() },
          { name: 'Cars', url: absoluteUrl('/cars') },
          { name: `${car.brand} ${car.model} ${car.year}`, url: pageUrl },
        ]),
        jsonLdCarOffer(seo, pageUrl),
      ]} />
      <CarDetailContent car={c} availableDates={availableDates} />
    </>
  );
}
