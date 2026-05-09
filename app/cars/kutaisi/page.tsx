import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { CityPageCars } from '@/components/city-page-cars';
import { JsonLd } from '@/components/JsonLd';
import {
  citySeo, absoluteUrl, getSiteUrl,
  jsonLdBreadcrumb, jsonLdItemList,
} from '@/lib/seo';

const city = citySeo('Kutaisi');

const FAQ_ITEMS = [
  {
    question: 'Are rental cars available at Kutaisi International Airport (KUT)?',
    answer:
      'Yes. Several Kutaisi hosts offer delivery to David the Builder Kutaisi International Airport (KUT). Availability and fees vary by host — check the individual listing before booking.',
  },
  {
    question: 'Can I visit Gelati, Motsameta, and Prometheus Cave by rental car?',
    answer:
      'Absolutely. Renting a car in Kutaisi is the most convenient way to reach Gelati Monastery, Motsameta Church, Sataplia Nature Reserve, and Prometheus Cave — all within 20–30 minutes of the city centre.',
  },
  {
    question: 'How much does it cost to rent a car in Kutaisi?',
    answer:
      'Economy cars typically start from 60–100 GEL/day, mid-range cars from 100–180 GEL/day, and SUVs from 180–350 GEL/day. Prices are set by individual hosts and shown in GEL on WAYGO.ge.',
  },
  {
    question: 'What is the minimum age to rent a car in Kutaisi?',
    answer:
      'You must be at least 18 years old and hold a valid driver\'s license. KYC verification (uploading your license and a selfie) is required before your first booking on WAYGO.ge.',
  },
  {
    question: 'What insurance is included with Kutaisi car rentals?',
    answer:
      'Every WAYGO.ge rental includes Basic insurance (1,000 GEL deductible) at no extra cost. Upgrade to Standard (18 GEL/day, 400 GEL deductible) or Premium (35 GEL/day, zero deductible) at booking.',
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const canonical = absoluteUrl(city.canonical);
  return {
    title: city.title,
    description: city.description,
    alternates: {
      canonical,
      languages: {
        ru: absoluteUrl('/ru/cars/kutaisi'),
        ka: absoluteUrl('/ka/cars/kutaisi'),
        'x-default': canonical,
      },
    },
    openGraph: {
      title: city.title,
      description: city.description,
      url: canonical,
      locale: 'en_US',
      type: 'website',
    },
    keywords: city.keywordEn.split(' · '),
  };
}

export default async function KutaisiCarsPage() {
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
          { name: city.h1, url: absoluteUrl(city.canonical) },
        ]),
        jsonLdItemList(cars.map(c => ({ url: absoluteUrl(`/cars/${c.id}`) }))),
      ]} />

      <main className="pt-[62px] md:pt-[120px] min-h-screen bg-surface pb-16">
        <div className="bg-primary py-10 px-4">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm text-white/70 mb-3">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              {' / '}
              <Link href="/cars" className="hover:text-white transition-colors">Cars</Link>
              {' / '}
              <span>Kutaisi</span>
            </p>
            <h1 className="text-h1 font-extrabold text-white">{city.h1}</h1>
            <p className="text-body-lg mt-3 text-white/80 max-w-2xl leading-relaxed">{city.intro}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white font-semibold">
              <span className="material-symbols-outlined text-base" style={{ fontSize: '18px' }}>flight</span>
              {city.airport}
            </div>
          </div>
        </div>

        <CityPageCars cars={cars} fixedCity="Kutaisi" />

        <div className="mx-auto max-w-2xl px-4 pt-4 pb-8">
          <h2 className="text-h2 font-extrabold text-on-background mb-6">
            Frequently Asked Questions — Car Rental in Kutaisi
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
