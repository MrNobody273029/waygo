import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';
import { prisma } from '@/lib/db';
import { GEORGIAN_CITIES_EN } from '@/lib/cities';

const STATIC_LAST_MODIFIED = new Date('2026-05-08');
const STATIC_CITY_SLUGS = new Set(['tbilisi', 'batumi', 'kutaisi']);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  // Top-priority city pages (have custom content)
  const mainCityPages: MetadataRoute.Sitemap = [
    { url: `${base}/cars/tbilisi`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/cars/batumi`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/cars/kutaisi`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/cars/tbilisi-airport`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${base}/cars/batumi-airport`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${base}/cars/kutaisi-airport`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.85 },
  ];

  // Dynamic city pages for remaining 17 cities
  const dynamicCityPages: MetadataRoute.Sitemap = GEORGIAN_CITIES_EN
    .filter(c => !STATIC_CITY_SLUGS.has(c.toLowerCase()))
    .map(c => ({
      url: `${base}/cars/${c.toLowerCase()}`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  // Locale pages (ru + ka)
  const localeHomePages: MetadataRoute.Sitemap = [
    { url: `${base}/ru`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/ka`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
  ];

  const localeCityPages: MetadataRoute.Sitemap = ['ru', 'ka'].flatMap(locale =>
    ['tbilisi', 'batumi', 'kutaisi'].map(city => ({
      url: `${base}/${locale}/cars/${city}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }))
  );

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/cars`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    ...mainCityPages,
    ...dynamicCityPages,
    ...localeHomePages,
    ...localeCityPages,
    { url: `${base}/about`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/faq`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/how-it-works`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/safety`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/insurance-terms`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/cancellation-policy`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/host-rules`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/guest-rules`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/terms`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.4 },
  ];

  let carPages: MetadataRoute.Sitemap = [];
  try {
    const cars = await prisma.car.findMany({
      where: { isActive: true, listingStatus: 'APPROVED' },
      select: { id: true, slug: true, updatedAt: true },
    });
    carPages = cars.map(car => ({
      url: `${base}/cars/${car.slug ?? car.id}`,
      lastModified: car.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // DB unavailable during static build — skip dynamic car pages
  }

  return [...staticPages, ...carPages];
}
