import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { CarCard } from '@/components/car-card';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl, getSiteUrl, jsonLdBreadcrumb, jsonLdItemList } from '@/lib/seo';

const canonical = absoluteUrl('/cars/tbilisi-airport');

export const metadata: Metadata = {
  title: 'Car Rental at Tbilisi Airport (TBS) — Pick up from Local Hosts',
  description:
    'Rent a car at Tbilisi International Airport (TBS). Verified local hosts offer airport pickup in Tbilisi. Book on WAYGO.ge — insurance included, 250 GEL deposit.',
  alternates: { canonical },
  openGraph: {
    title: 'Car Rental at Tbilisi Airport (TBS) | WAYGO.ge',
    description:
      'Pick up your rental car at Tbilisi International Airport (TBS). Verified local hosts, insurance included.',
    url: canonical,
    locale: 'en_US',
    type: 'website',
  },
  keywords: [
    'car rental Tbilisi airport',
    'TBS airport car rental',
    'Tbilisi International Airport car hire',
    'rent a car Tbilisi airport',
    'airport pickup Tbilisi',
  ],
};

export default async function TbilisiAirportPage() {
  const dbCars = await prisma.car.findMany({
    where: { isActive: true, listingStatus: 'APPROVED', location: 'Tbilisi' },
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
          { name: 'Car Rental Tbilisi', url: absoluteUrl('/cars/tbilisi') },
          { name: 'Tbilisi Airport (TBS)', url: canonical },
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
              <Link href="/cars/tbilisi" className="hover:text-white transition-colors">Tbilisi</Link>
              {' / '}
              <span>Airport</span>
            </p>
            <h1 className="text-h1 font-extrabold text-white">Car Rental at Tbilisi Airport (TBS)</h1>
            <p className="text-body-lg mt-3 text-white/80 max-w-2xl leading-relaxed">
              Landing at Tbilisi International Airport (TBS)? Book a verified local rental car from a Georgian host — with airport pickup, flexible insurance, and instant booking on WAYGO.ge.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white font-semibold">
              <span className="material-symbols-outlined text-base" style={{ fontSize: '18px' }}>flight_land</span>
              Tbilisi International Airport (TBS) — Rustavi Highway
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pt-8 pb-4">
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: 'flight_land', title: 'Airport Pickup', text: 'Many Tbilisi hosts deliver directly to TBS arrivals. Check the listing for airport delivery.' },
              { icon: 'shield', title: 'Insurance Included', text: 'Every booking includes Basic insurance. Upgrade to Standard or Premium at booking.' },
              { icon: 'payments', title: '250 GEL Deposit Hold', text: 'A 250 GEL hold (not charge) is placed at pickup and released on safe return.' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl border border-outline-variant/40 bg-white p-5 shadow-card">
                <span className="material-symbols-outlined text-primary text-[28px] mb-2 block">{f.icon}</span>
                <h2 className="font-bold text-on-background mb-1 text-label-bold">{f.title}</h2>
                <p className="text-secondary text-body-md leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-4 pb-8">
          {cars.length > 0 ? (
            <>
              <h2 className="text-h3 font-bold text-on-background mb-5">
                Cars Available Near Tbilisi Airport
                <span className="ml-2 text-label-sm text-secondary font-normal">({cars.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cars.map(car => <CarCard key={car.id} car={car} />)}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-secondary text-body-lg mb-4">No cars listed right now — check back soon.</p>
              <Link href="/cars" className="text-primary font-semibold hover:underline">
                Browse all cars in Georgia →
              </Link>
            </div>
          )}
        </div>

        <div className="mx-auto max-w-2xl px-4 pb-8 space-y-4">
          <h2 className="text-h2 font-extrabold text-on-background mb-4">About Tbilisi International Airport</h2>
          <p className="text-body-lg text-secondary leading-relaxed">
            Tbilisi International Airport (IATA: TBS) is located approximately 18 km southeast of Tbilisi city centre, off the Rustavi Highway. The airport serves international flights from Europe, the Middle East, and Central Asia.
          </p>
          <p className="text-body-lg text-secondary leading-relaxed">
            Renting a car at TBS is the most flexible option for exploring Georgia — whether you're heading to Tbilisi&apos;s Old Town, the Kazbegi mountains, Kakheti wine region, or continuing south to Batumi.
          </p>
          <div className="pt-4">
            <Link href="/cars/tbilisi" className="text-primary font-bold hover:underline">
              ← View all cars in Tbilisi
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
