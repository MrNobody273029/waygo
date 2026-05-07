import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { CarCard } from '@/components/car-card';
import { JsonLd } from '@/components/JsonLd';
import {
  citySeo, absoluteUrl, getSiteUrl,
  jsonLdBreadcrumb, jsonLdFaq,
} from '@/lib/seo';

const city = citySeo('Batumi');

const FAQ_ITEMS = [
  {
    question: 'Is car pickup available at Batumi International Airport (BUS)?',
    answer:
      'Yes. A number of Batumi hosts offer airport delivery to Batumi International Airport (BUS). Some offer this free of charge; others charge a delivery fee. Check each listing for the host\'s airport preferences.',
  },
  {
    question: 'What documents do I need to rent a car in Batumi through WAYGO.ge?',
    answer:
      'A valid driver\'s license and a national ID or passport. Before your first booking you must also complete KYC verification by uploading your license and a selfie on the WAYGO.ge platform.',
  },
  {
    question: 'What is the minimum rental period in Batumi?',
    answer:
      'Most Batumi hosts require a minimum rental of 1 to 3 days, set individually by each host. The minimum period is shown on each car listing.',
  },
  {
    question: 'Can I drive from Batumi to Sarpi or across the border into Turkey?',
    answer:
      'Driving within Georgia is permitted with any WAYGO.ge rental. Cross-border travel (e.g., via Sarpi to Turkey) requires the host\'s explicit permission — confirm with the host before booking.',
  },
  {
    question: 'What is the security deposit for car rentals in Batumi?',
    answer:
      'A 250 GEL deposit is blocked on your card at pickup and fully refunded after the car is returned in the same condition. The deposit is a hold, not a charge.',
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: city.title,
    description: city.description,
    alternates: { canonical: absoluteUrl(city.canonical) },
    openGraph: {
      title: city.title,
      description: city.description,
      url: absoluteUrl(city.canonical),
      type: 'website',
    },
    keywords: city.keywordEn.split(' · '),
  };
}

export default async function BatumiCarsPage() {
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
          { name: city.h1, url: absoluteUrl(city.canonical) },
        ]),
        jsonLdFaq(FAQ_ITEMS),
      ]} />

      <main className="pt-[62px] md:pt-[73px] min-h-screen bg-surface pb-16">
        <div className="bg-primary py-10 px-4">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm text-white/70 mb-3">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              {' / '}
              <Link href="/cars" className="hover:text-white transition-colors">Cars</Link>
              {' / '}
              <span>Batumi</span>
            </p>
            <h1 className="text-h1 font-extrabold text-white">{city.h1}</h1>
            <p className="text-body-lg mt-3 text-white/80 max-w-2xl leading-relaxed">{city.intro}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white font-semibold">
              <span className="material-symbols-outlined text-base" style={{ fontSize: '18px' }}>flight</span>
              {city.airport}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-8 pb-8">
          {cars.length > 0 ? (
            <>
              <h2 className="text-h3 font-bold text-on-background mb-5">
                Available Cars in Batumi
                <span className="ml-2 text-label-sm text-secondary font-normal">({cars.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cars.map(car => <CarCard key={car.id} car={car} />)}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-secondary text-body-lg mb-4">No cars available in Batumi right now.</p>
              <Link href="/cars" className="text-primary font-semibold hover:underline">
                Browse all cars in Georgia →
              </Link>
            </div>
          )}
        </div>

        <div className="mx-auto max-w-2xl px-4 pt-4 pb-8">
          <h2 className="text-h2 font-extrabold text-on-background mb-6">
            Frequently Asked Questions — Car Rental in Batumi
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="rounded-2xl border border-outline-variant/40 bg-white p-5">
                <h3 className="font-bold text-on-background mb-2">{item.question}</h3>
                <p className="text-secondary text-body-md leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
