import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { CityPageCars } from '@/components/city-page-cars';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl, getSiteUrl, jsonLdBreadcrumb, jsonLdItemList } from '@/lib/seo';

const canonical = absoluteUrl('/cars/batumi-airport');

export const metadata: Metadata = {
  title: 'Car Rental at Batumi Airport (BUS) — Pick up from Local Hosts',
  description:
    'Rent a car at Batumi International Airport (BUS). Verified Georgian hosts offer airport pickup in Batumi. Book on WAYGO.ge — insurance included, 250 GEL deposit.',
  alternates: { canonical },
  openGraph: {
    title: 'Car Rental at Batumi Airport (BUS) | WAYGO.ge',
    description:
      'Pick up your rental car at Batumi International Airport (BUS). Verified local hosts, insurance included.',
    url: canonical,
    locale: 'en_US',
    type: 'website',
  },
  keywords: [
    'car rental Batumi airport',
    'BUS airport car rental',
    'Batumi International Airport car hire',
    'rent a car Batumi airport',
    'airport pickup Batumi',
  ],
};

export default async function BatumiAirportPage() {
  const dbCars = await prisma.car.findMany({
    where: { isActive: true, listingStatus: 'APPROVED', location: 'Batumi' },
    include: { owner: { select: { fullName: true, isVerified: true, rating: true, reviewCount: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const cars = dbCars.map(dbCarToUiCar);

  return (
    <>
      <JsonLd data={[
        jsonLdBreadcrumb([
          { name: 'Home', url: getSiteUrl() },
          { name: 'Cars', url: absoluteUrl('/cars') },
          { name: 'Car Rental Batumi', url: absoluteUrl('/cars/batumi') },
          { name: 'Batumi Airport (BUS)', url: canonical },
        ]),
        ...(cars.length > 0 ? [jsonLdItemList(cars.map(c => ({ url: absoluteUrl(`/cars/${c.id}`) })))] : []),
      ]} />

      <main className="pt-[62px] md:pt-[120px] min-h-screen bg-surface pb-16">
        <div className="bg-primary py-10 px-4">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm text-white/70 mb-3">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              {' / '}
              <Link href="/cars" className="hover:text-white transition-colors">Cars</Link>
              {' / '}
              <Link href="/cars/batumi" className="hover:text-white transition-colors">Batumi</Link>
              {' / '}
              <span>Airport</span>
            </p>
            <h1 className="text-h1 font-extrabold text-white">Car Rental at Batumi Airport (BUS)</h1>
            <p className="text-body-lg mt-3 text-white/80 max-w-2xl leading-relaxed">
              Arriving at Batumi International Airport (BUS)? Pick up a rental car from a verified local Georgian host — with airport delivery, flexible insurance, and simple instant booking on WAYGO.ge.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white font-semibold">
              <span className="material-symbols-outlined text-base" style={{ fontSize: '18px' }}>flight_land</span>
              Batumi International Airport (BUS) — 2 km from city centre
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pt-8 pb-4">
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: 'flight_land', title: 'Airport Pickup', text: 'Batumi hosts can deliver to BUS arrivals. Check each listing for airport delivery availability.' },
              { icon: 'beach_access', title: 'Explore Adjara', text: 'Drive the Black Sea boulevard, Adjara mountains, or border crossing at Sarpi — all at your own pace.' },
              { icon: 'payments', title: '250 GEL Deposit Hold', text: 'A 250 GEL hold placed at pickup is fully released after the car is returned in good condition.' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl border border-outline-variant/40 bg-white p-5 shadow-card">
                <span className="material-symbols-outlined text-primary text-[28px] mb-2 block">{f.icon}</span>
                <h2 className="font-bold text-on-background mb-1 text-label-bold">{f.title}</h2>
                <p className="text-secondary text-body-md leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <CityPageCars cars={cars} fixedCity="Batumi" airportKey="batumi" />

        <div className="mx-auto max-w-2xl px-4 pb-8 space-y-4">
          <h2 className="text-h2 font-extrabold text-on-background mb-4">About Batumi International Airport</h2>
          <p className="text-body-lg text-secondary leading-relaxed">
            Batumi International Airport (IATA: BUS) is located just 2 km from Batumi city centre, making it one of the most conveniently placed airports in the Caucasus. It serves seasonal international flights from Turkey, Russia, Ukraine, and Europe.
          </p>
          <p className="text-body-lg text-secondary leading-relaxed">
            A rental car from WAYGO.ge lets you explore Batumi&apos;s beachfront boulevard, Adjara mountain villages, the historic border town of Sarpi, and beyond — all on your own schedule.
          </p>
          <div className="pt-4">
            <Link href="/cars/batumi" className="text-primary font-bold hover:underline">
              ← View all cars in Batumi
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
