import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { CarDetailContent } from './CarDetailContent';
import { JsonLd } from '@/components/JsonLd';
import {
  absoluteUrl, getSiteUrl, carTitle, carDescription,
  jsonLdBreadcrumb, jsonLdCarOffer, type CarForSeo,
} from '@/lib/seo';
import { createUniqueSlug } from '@/lib/slugs';

const ownerInclude = {
  owner: { select: { fullName: true, isVerified: true, rating: true, reviewCount: true } },
} as const;

// Shared per-request: both generateMetadata and the page use this cached result
const findCar = cache(async (slugOrId: string) => {
  const bySlug = await prisma.car.findUnique({ where: { slug: slugOrId }, include: ownerInclude });
  if (bySlug) return { car: bySlug, wasSlug: true };
  const byId = await prisma.car.findUnique({ where: { id: slugOrId }, include: ownerInclude });
  return { car: byId, wasSlug: false };
});

function toSeo(c: ReturnType<typeof dbCarToUiCar>): CarForSeo {
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
  const { car } = await findCar(params.id);
  if (!car) return { title: 'Car Not Found' };
  const slug = car.slug ?? params.id;
  const c = dbCarToUiCar(car);
  const seo = toSeo(c);
  const pageUrl = absoluteUrl(`/cars/${slug}`);
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
  const { car: carData, wasSlug } = await findCar(params.id);

  if (!carData) notFound();

  // Old CUID URL — redirect to slug URL (generates slug lazily if missing)
  if (!wasSlug) {
    let slug = carData.slug;
    if (!slug) {
      slug = await createUniqueSlug(carData.brand, carData.model, carData.year, carData.location);
      await prisma.car.update({ where: { id: carData.id }, data: { slug } });
    }
    permanentRedirect(`/cars/${slug}`);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [availRows, completedTrips] = await Promise.all([
    prisma.carAvailability.findMany({
      where: { carId: carData.id, bookingId: null, date: { gte: today } },
      select: { date: true },
      orderBy: { date: 'asc' },
    }),
    prisma.booking.count({
      where: { carId: carData.id, status: { in: ['completed', 'disputed'] } },
    }),
  ]);

  const availableDates = availRows.map(r => r.date.toISOString().split('T')[0]);
  const c = dbCarToUiCar({ ...carData, completedTrips });
  const seo = toSeo(c);
  const slug = carData.slug ?? params.id;
  const pageUrl = absoluteUrl(`/cars/${slug}`);

  return (
    <>
      <JsonLd data={[
        jsonLdBreadcrumb([
          { name: 'Home', url: getSiteUrl() },
          { name: 'Cars', url: absoluteUrl('/cars') },
          { name: `${carData.brand} ${carData.model} ${carData.year}`, url: pageUrl },
        ]),
        jsonLdCarOffer(seo, pageUrl),
      ]} />
      <CarDetailContent car={c} availableDates={availableDates} />
    </>
  );
}
