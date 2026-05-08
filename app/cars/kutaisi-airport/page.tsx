import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { CityPageCars } from '@/components/city-page-cars';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl, getSiteUrl, jsonLdBreadcrumb, jsonLdItemList } from '@/lib/seo';

const canonical = absoluteUrl('/cars/kutaisi-airport');

export const metadata: Metadata = {
  title: 'Car Rental at Kutaisi Airport (KUT) — Pick up from Local Hosts',
  description:
    'Rent a car at Kutaisi International Airport (KUT). Verified Georgian hosts offer airport delivery in Kutaisi. Book on WAYGO.ge — insurance included, 250 GEL deposit.',
  alternates: { canonical },
  openGraph: {
    title: 'Car Rental at Kutaisi Airport (KUT) | WAYGO.ge',
    description:
      'Pick up your rental car at Kutaisi International Airport (KUT). Verified local hosts, insurance included.',
    url: canonical,
    locale: 'en_US',
    type: 'website',
  },
  keywords: [
    'car rental Kutaisi airport',
    'KUT airport car rental',
    'Kutaisi International Airport car hire',
    'rent a car Kutaisi airport',
    'David the Builder airport car rental',
    'airport pickup Kutaisi',
  ],
};

export default async function KutaisiAirportPage() {
  const dbCars = await prisma.car.findMany({
    where: { isActive: true, listingStatus: 'APPROVED', location: 'Kutaisi' },
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
          { name: 'Car Rental Kutaisi', url: absoluteUrl('/cars/kutaisi') },
          { name: 'Kutaisi Airport (KUT)', url: canonical },
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
              <Link href="/cars/kutaisi" className="hover:text-white transition-colors">Kutaisi</Link>
              {' / '}
              <span>Airport</span>
            </p>
            <h1 className="text-h1 font-extrabold text-white">Car Rental at Kutaisi Airport (KUT)</h1>
            <p className="text-body-lg mt-3 text-white/80 max-w-2xl leading-relaxed">
              Flying into David the Builder Kutaisi International Airport (KUT)? Rent a car from a verified local Georgian host and explore Imereti, the Georgian highlands, and beyond — with airport delivery, insurance included, and instant booking.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white font-semibold">
              <span className="material-symbols-outlined text-base" style={{ fontSize: '18px' }}>flight_land</span>
              David the Builder Kutaisi International Airport (KUT)
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pt-8 pb-4">
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: 'flight_land', title: 'Airport Pickup', text: 'Kutaisi hosts can deliver to KUT arrivals. Check each listing for airport delivery options.' },
              { icon: 'temple_buddhist', title: 'Explore Imereti', text: 'Gelati Monastery, Prometheus Cave, Sataplia Reserve — all within 30 minutes of KUT airport.' },
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

        <CityPageCars cars={cars} fixedCity="Kutaisi" airportKey="kutaisi" />

        <div className="mx-auto max-w-2xl px-4 pb-8 space-y-4">
          <h2 className="text-h2 font-extrabold text-on-background mb-4">About Kutaisi International Airport</h2>
          <p className="text-body-lg text-secondary leading-relaxed">
            David the Builder Kutaisi International Airport (IATA: KUT) is a major budget airline hub in Georgia, served by Wizz Air, Ryanair, and others from across Europe. It is located approximately 20 km west of Kutaisi city centre.
          </p>
          <p className="text-body-lg text-secondary leading-relaxed">
            A rental car from WAYGO.ge makes KUT the perfect gateway to Imereti — visit Gelati Monastery (UNESCO World Heritage Site), Motsameta Church, Sataplia Nature Reserve with its dinosaur footprints, and the stunning Prometheus Cave, all within easy driving distance.
          </p>
          <div className="pt-4">
            <Link href="/cars/kutaisi" className="text-primary font-bold hover:underline">
              ← View all cars in Kutaisi
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
