import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { CarCard } from '@/components/car-card';
import { JsonLd } from '@/components/JsonLd';
import {
  citySeo, absoluteUrl, getSiteUrl,
  jsonLdBreadcrumb, jsonLdItemList,
  type SeoCity,
} from '@/lib/seo';

const VALID_LOCALES = new Set(['ru', 'ka']);
const VALID_CITIES: Record<string, SeoCity> = {
  tbilisi: 'Tbilisi',
  batumi: 'Batumi',
  kutaisi: 'Kutaisi',
};

export function generateStaticParams() {
  return ['ru', 'ka'].flatMap(locale =>
    ['tbilisi', 'batumi', 'kutaisi'].map(city => ({ locale, city }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; city: string };
}): Promise<Metadata> {
  if (!VALID_LOCALES.has(params.locale) || !VALID_CITIES[params.city]) notFound();

  const seo = citySeo(VALID_CITIES[params.city]);
  const isRu = params.locale === 'ru';
  const canonical = absoluteUrl(`/${params.locale}/cars/${params.city}`);
  const title = isRu ? seo.titleRu! : seo.titleKa!;
  const description = isRu ? seo.descriptionRu! : seo.descriptionKa!;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: absoluteUrl(seo.canonical),
        ru: absoluteUrl(`/ru/cars/${params.city}`),
        ka: absoluteUrl(`/ka/cars/${params.city}`),
        'x-default': absoluteUrl(seo.canonical),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: isRu ? 'ru_RU' : 'ka_GE',
      type: 'website',
    },
  };
}

export default async function LocaleCityPage({
  params,
}: {
  params: { locale: string; city: string };
}) {
  if (!VALID_LOCALES.has(params.locale) || !VALID_CITIES[params.city]) notFound();

  const seo = citySeo(VALID_CITIES[params.city]);
  const isRu = params.locale === 'ru';
  const h1 = isRu ? seo.h1Ru! : seo.h1Ka!;
  const intro = isRu ? seo.introRu! : seo.introKa!;
  const canonical = absoluteUrl(`/${params.locale}/cars/${params.city}`);

  const dbCars = await prisma.car.findMany({
    where: {
      isActive: true,
      listingStatus: 'APPROVED',
      location: VALID_CITIES[params.city],
    },
    include: {
      owner: { select: { fullName: true, isVerified: true, rating: true, reviewCount: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  const cars = dbCars.map(dbCarToUiCar);

  const homeLabel = isRu ? 'Главная' : 'მთავარი';
  const carsLabel = isRu ? 'Автомобили' : 'მანქანები';
  const availableLabel = isRu ? 'Доступные автомобили в' : 'ხელმისაწვდომი მანქანები';
  const noLabel = isRu ? 'Автомобилей в' : 'მანქანები';
  const noSuffix = isRu ? 'пока нет — загляните позже.' : 'ახლა ხელმისაწვდომი არ არის.';
  const browseLabel = isRu ? 'Смотреть все автомобили в Грузии →' : 'ყველა მანქანა საქართველოში →';

  return (
    <>
      <JsonLd data={[
        jsonLdBreadcrumb([
          { name: homeLabel, url: getSiteUrl() },
          { name: carsLabel, url: absoluteUrl('/cars') },
          { name: h1, url: canonical },
        ]),
        ...(cars.length > 0 ? [jsonLdItemList(cars.map(c => ({ url: absoluteUrl(`/cars/${c.id}`) })))] : []),
      ]} />

      <main className="pt-[62px] md:pt-[73px] min-h-screen bg-surface pb-16">
        <div className="bg-primary py-10 px-4">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm text-white/70 mb-3">
              <Link href={`/${params.locale}`} className="hover:text-white transition-colors">{homeLabel}</Link>
              {' / '}
              <Link href="/cars" className="hover:text-white transition-colors">{carsLabel}</Link>
              {' / '}
              <span>{h1}</span>
            </p>
            <h1 className="text-h1 font-extrabold text-white">{h1}</h1>
            <p className="text-body-lg mt-3 text-white/80 max-w-2xl leading-relaxed">{intro}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white font-semibold">
              <span className="material-symbols-outlined text-base" style={{ fontSize: '18px' }}>flight</span>
              {seo.airport}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-8 pb-8">
          {cars.length > 0 ? (
            <>
              <h2 className="text-h3 font-bold text-on-background mb-5">
                {availableLabel} {seo.slug.charAt(0).toUpperCase() + seo.slug.slice(1)}
                <span className="ml-2 text-label-sm text-secondary font-normal">({cars.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cars.map(car => <CarCard key={car.id} car={car} />)}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-secondary text-body-lg mb-2">{noLabel} {seo.slug} — {noSuffix}</p>
              <Link href="/cars" className="text-primary font-semibold hover:underline">
                {browseLabel}
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
