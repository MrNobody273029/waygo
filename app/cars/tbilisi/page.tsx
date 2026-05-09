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

const city = citySeo('Tbilisi');

const FAQ_ITEMS = [
  {
    question: 'What types of cars are available for rent in Tbilisi?',
    answer:
      'WAYGO.ge offers economy cars (from 60 GEL/day), compact sedans, SUVs, minivans, and premium vehicles in Tbilisi. All cars are listed by verified local Georgian hosts.',
  },
  {
    question: 'Is airport pickup available at Tbilisi International Airport (TBS)?',
    answer:
      'Yes. Many Tbilisi hosts offer pickup and drop-off at Tbilisi International Airport (TBS), either free of charge or for a small delivery fee. Check the individual car listing for the host\'s airport delivery preference.',
  },
  {
    question: 'What insurance options are available for Tbilisi car rentals?',
    answer:
      'Every WAYGO.ge booking includes Basic insurance (1,000 GEL deductible) at no extra cost. You can upgrade to Standard (18 GEL/day, 400 GEL deductible) or Premium (35 GEL/day, zero deductible) at the time of booking.',
  },
  {
    question: 'What deposit is required to rent a car in Tbilisi?',
    answer:
      'A 250 GEL security deposit is blocked on your card at pickup and fully released when the car is returned without damage. The deposit is never charged — it is only a hold.',
  },
  {
    question: 'Can I drive from Tbilisi to Kazbegi, Kakheti, or Batumi?',
    answer:
      'Yes — driving anywhere within Georgia is permitted. Cross-border travel is subject to the individual host\'s rules. Always check the listing or confirm with the host before booking if you plan to drive abroad.',
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
        ru: absoluteUrl('/ru/cars/tbilisi'),
        ka: absoluteUrl('/ka/cars/tbilisi'),
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

export default async function TbilisiCarsPage() {
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
              <span>Tbilisi</span>
            </p>
            <h1 className="text-h1 font-extrabold text-white">{city.h1}</h1>
            <p className="text-body-lg mt-3 text-white/80 max-w-2xl leading-relaxed">{city.intro}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white font-semibold">
              <span className="material-symbols-outlined text-base" style={{ fontSize: '18px' }}>flight</span>
              {city.airport}
            </div>
          </div>
        </div>

        <CityPageCars cars={cars} fixedCity="Tbilisi" />

        <div className="mx-auto max-w-2xl px-4 pt-4 pb-8">
          <h2 className="text-h2 font-extrabold text-on-background mb-6">
            Frequently Asked Questions — Car Rental in Tbilisi
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
