import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { CarDetailContent } from './CarDetailContent';
import { CarCard } from '@/components/car-card';
import { JsonLd } from '@/components/JsonLd';
import {
  absoluteUrl, getSiteUrl, carTitle, carDescription,
  jsonLdBreadcrumb, jsonLdCarOffer, jsonLdItemList, type CarForSeo,
} from '@/lib/seo';
import { createUniqueSlug } from '@/lib/slugs';
import { GEORGIAN_CITIES_EN } from '@/lib/cities';

// Static city pages take precedence; this dynamic route handles the rest
const STATIC_CITY_SLUGS = new Set(['tbilisi', 'batumi', 'kutaisi']);

const SLUG_TO_CITY = Object.fromEntries(
  GEORGIAN_CITIES_EN.map(c => [c.toLowerCase(), c]),
);

const ownerInclude = {
  owner: { select: { fullName: true, isVerified: true, rating: true, reviewCount: true } },
} as const;

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
    trips: c.trips,
    rating: c.rating,
  };
}

export async function generateStaticParams() {
  return GEORGIAN_CITIES_EN
    .filter(c => !STATIC_CITY_SLUGS.has(c.toLowerCase()))
    .map(c => ({ id: c.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const slug = params.id;

  // City page metadata
  const cityName = SLUG_TO_CITY[slug];
  if (cityName && !STATIC_CITY_SLUGS.has(slug)) {
    const canonical = absoluteUrl(`/cars/${slug}`);
    return {
      title: `Car Rental in ${cityName}, Georgia — Rent from Local Hosts`,
      description: `Rent a car in ${cityName}, Georgia from verified local hosts. Flexible insurance, 250 GEL deposit protection, and instant booking on WAYGO.ge.`,
      alternates: { canonical },
      openGraph: {
        title: `Car Rental in ${cityName}, Georgia`,
        description: `Rent a car in ${cityName} from verified local hosts on WAYGO.ge.`,
        url: canonical,
        type: 'website',
      },
      keywords: [
        `car rental ${cityName}`,
        `rent a car ${cityName}`,
        `${cityName} car hire`,
        `car rental ${cityName} Georgia`,
      ],
    };
  }

  // Car detail metadata
  const { car } = await findCar(slug);
  if (!car) return { title: 'Car Not Found' };
  const carSlug = car.slug ?? slug;
  const c = dbCarToUiCar(car);
  const seo = toSeo(c);
  const pageUrl = absoluteUrl(`/cars/${carSlug}`);
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
        images: [{ url: c.images[0], width: 1200, height: 630, alt: `${c.brand} ${c.model} ${c.year} for rent in ${c.location}` }],
      }),
    },
    robots: { index: true, follow: true },
  };
}

export default async function CarOrCityPage({ params }: { params: { id: string } }) {
  const slug = params.id;

  // --- City page ---
  const cityName = SLUG_TO_CITY[slug];
  if (cityName && !STATIC_CITY_SLUGS.has(slug)) {
    const dbCars = await prisma.car.findMany({
      where: { isActive: true, listingStatus: 'APPROVED', location: cityName },
      include: {
        owner: { select: { fullName: true, isVerified: true, rating: true, reviewCount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const cars = dbCars.map(dbCarToUiCar);
    const canonical = absoluteUrl(`/cars/${slug}`);

    return (
      <>
        <JsonLd data={[
          jsonLdBreadcrumb([
            { name: 'Home', url: getSiteUrl() },
            { name: 'Cars', url: absoluteUrl('/cars') },
            { name: `Car Rental in ${cityName}`, url: canonical },
          ]),
          ...(cars.length > 0 ? [jsonLdItemList(cars.map(c => ({ url: absoluteUrl(`/cars/${c.id}`) })))] : []),
        ]} />

        <main className="pt-[62px] md:pt-[73px] min-h-screen bg-surface pb-16">
          <div className="bg-primary py-10 px-4">
            <div className="mx-auto max-w-5xl">
              <p className="text-sm text-white/70 mb-3">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                {' / '}
                <Link href="/cars" className="hover:text-white transition-colors">Cars</Link>
                {' / '}
                <span>{cityName}</span>
              </p>
              <h1 className="text-h1 font-extrabold text-white">Car Rental in {cityName}, Georgia</h1>
              <p className="text-body-lg mt-3 text-white/80 max-w-2xl leading-relaxed">
                Find a verified local rental car in {cityName}. Browse available cars from trusted Georgian hosts on WAYGO.ge — flexible insurance, 250 GEL deposit protection, and instant booking.
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 pt-8 pb-8">
            {cars.length > 0 ? (
              <>
                <h2 className="text-h3 font-bold text-on-background mb-5">
                  Available Cars in {cityName}
                  <span className="ml-2 text-label-sm text-secondary font-normal">({cars.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cars.map(car => <CarCard key={car.id} car={car} />)}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-secondary text-body-lg mb-2">No cars available in {cityName} right now.</p>
                <p className="text-secondary text-label-sm mb-6">New listings are added regularly — check back soon or browse all cars in Georgia.</p>
                <Link href="/cars" className="text-primary font-semibold hover:underline">
                  Browse all cars in Georgia →
                </Link>
              </div>
            )}
          </div>
        </main>
      </>
    );
  }

  // --- Car detail page ---
  const { car: carData, wasSlug } = await findCar(slug);

  if (!carData) notFound();

  if (!wasSlug) {
    let carSlug = carData.slug;
    if (!carSlug) {
      carSlug = await createUniqueSlug(carData.brand, carData.model, carData.year, carData.location);
      await prisma.car.update({ where: { id: carData.id }, data: { slug: carSlug } });
    }
    permanentRedirect(`/cars/${carSlug}`);
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
  const carSlug = carData.slug ?? slug;
  const pageUrl = absoluteUrl(`/cars/${carSlug}`);

  return (
    <>
      <JsonLd data={[
        jsonLdBreadcrumb([
          { name: 'Home', url: getSiteUrl() },
          { name: 'Cars', url: absoluteUrl('/cars') },
          { name: carData.location, url: absoluteUrl(`/cars/${carData.location.toLowerCase()}`) },
          { name: `${carData.brand} ${carData.model} ${carData.year}`, url: pageUrl },
        ]),
        jsonLdCarOffer(seo, pageUrl),
      ]} />
      <CarDetailContent car={c} availableDates={availableDates} />
    </>
  );
}
