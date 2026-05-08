import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { CarCard } from '@/components/car-card';
import { translations } from '@/lib/i18n';
import { absoluteUrl, getSiteUrl } from '@/lib/seo';

export const revalidate = 300;

const VALID_LOCALES = new Set(['ru', 'ka']);

export function generateStaticParams() {
  return [{ locale: 'ru' }, { locale: 'ka' }];
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!VALID_LOCALES.has(params.locale)) notFound();
  const isRu = params.locale === 'ru';
  const canonical = absoluteUrl(`/${params.locale}`);

  if (isRu) {
    return {
      title: 'Аренда авто в Грузии — от проверенных хозяев | WAYGO.ge',
      description:
        'P2P аренда автомобилей в Тбилиси, Батуми и Кутаиси. Страховка включена, залог 250 GEL, трансфер из аэропорта. Бронируйте на WAYGO.ge.',
      alternates: {
        canonical,
        languages: {
          en: getSiteUrl(),
          ka: absoluteUrl('/ka'),
          'x-default': getSiteUrl(),
        },
      },
      openGraph: {
        title: 'Аренда авто в Грузии — от проверенных хозяев | WAYGO.ge',
        description:
          'P2P аренда автомобилей в Тбилиси, Батуми и Кутаиси. Страховка включена, залог 250 GEL.',
        url: canonical,
        locale: 'ru_RU',
        type: 'website',
      },
    };
  }

  return {
    title: 'მანქანის ქირაობა საქართველოში — ვერიფიცირებული მასპინძლები | WAYGO.ge',
    description:
      'P2P მანქანის ქირაობა თბილისში, ბათუმსა და ქუთაისში. დაზღვევა შედის, 250 GEL დეპოზიტი, აეროპორტის მიწოდება. WAYGO.ge.',
    alternates: {
      canonical,
      languages: {
        en: getSiteUrl(),
        ru: absoluteUrl('/ru'),
        'x-default': getSiteUrl(),
      },
    },
    openGraph: {
      title: 'მანქანის ქირაობა საქართველოში — ვერიფიცირებული მასპინძლები | WAYGO.ge',
      description:
        'P2P მანქანის ქირაობა თბილისში, ბათუმსა და ქუთაისში. დაზღვევა შედის, 250 GEL დეპოზიტი.',
      url: canonical,
      locale: 'ka_GE',
      type: 'website',
    },
  };
}

export default async function LocaleHomePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!VALID_LOCALES.has(params.locale)) notFound();

  const t = params.locale === 'ru' ? translations.ru : translations.ka;

  const dbCars = await prisma.car.findMany({
    where: { isActive: true },
    include: {
      owner: { select: { fullName: true, isVerified: true, rating: true, reviewCount: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });
  const featuredCars = dbCars.map(dbCarToUiCar);

  const cities =
    params.locale === 'ru'
      ? [
          { slug: 'tbilisi', label: 'Тбилиси' },
          { slug: 'batumi', label: 'Батуми' },
          { slug: 'kutaisi', label: 'Кутаиси' },
        ]
      : [
          { slug: 'tbilisi', label: 'თბილისი' },
          { slug: 'batumi', label: 'ბათუმი' },
          { slug: 'kutaisi', label: 'ქუთაისი' },
        ];

  return (
    <main>
      {/* Hero */}
      <section className="min-h-[480px] flex items-end pb-12 px-4">
        <div className="mx-auto max-w-screen-md w-full text-center">
          <p className="inline-block text-white/90 text-label-bold font-semibold bg-white/15 rounded-full px-4 py-1 mb-4 drop-shadow-md">
            {t.hero.badge}
          </p>
          <h1 className="text-[32px] md:text-display font-extrabold text-white leading-tight drop-shadow-lg mb-4">
            {t.hero.title1}
            <span className="text-tertiary-fixed">{t.hero.title2}</span>
          </h1>
          <p className="text-white/80 text-body-lg md:text-body-lg drop-shadow-md mb-8 max-w-xl mx-auto">
            {t.hero.sub}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {cities.map(c => (
              <Link
                key={c.slug}
                href={`/${params.locale}/cars/${c.slug}`}
                className="bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-white/90 transition shadow-md"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured cars */}
      <section className="max-w-screen-2xl mx-auto px-4 md:px-12 py-10 md:py-20">
        <div className="flex justify-between items-end mb-5 md:mb-10">
          <div>
            <p className="text-[12px] md:text-label-bold font-semibold text-white/90 mb-1 drop-shadow-md">
              {t.home.sectionBadge}
            </p>
            <h2 className="text-[26px] md:text-h1 font-bold text-white leading-tight drop-shadow-lg">
              {t.home.sectionTitle}
            </h2>
            <p className="text-white/80 text-[13px] md:text-body-md mt-1 md:mt-2 drop-shadow-md">
              {t.home.sectionSub}
            </p>
          </div>
          <Link
            href="/cars"
            className="hidden md:flex items-center gap-1 text-white font-bold text-label-bold hover:underline shrink-0 drop-shadow-md"
          >
            {t.home.viewAll}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

        {featuredCars.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <span className="material-symbols-outlined text-[52px] text-slate-300">directions_car</span>
            <p className="text-secondary text-label-bold">{t.home.noCars}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {featuredCars.map(c => <CarCard key={c.id} car={c} />)}
          </div>
        )}
      </section>

      {/* Trust section */}
      <section className="max-w-screen-2xl mx-auto px-4 md:px-12 pb-8 md:pb-24">
        <h2 className="text-[22px] md:text-h2 font-bold text-white drop-shadow-lg mb-6 md:mb-10">
          {t.home.trustTitle}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: 'shield', title: t.home.f1Title, text: t.home.f1Text },
            { icon: 'support_agent', title: t.home.f2Title, text: t.home.f2Text },
            { icon: 'verified_user', title: t.home.f3Title, text: t.home.f3Text },
            { icon: 'lock', title: t.home.f4Title, text: t.home.f4Text },
          ].map(f => (
            <div
              key={f.title}
              className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 md:p-6"
            >
              <span className="material-symbols-outlined text-white text-[32px] mb-3 block">{f.icon}</span>
              <h3 className="font-bold text-white text-[14px] md:text-label-bold mb-1">{f.title}</h3>
              <p className="text-white/75 text-[12px] md:text-body-md leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
