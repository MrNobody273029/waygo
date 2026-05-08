import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/cars`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/cars/tbilisi`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/cars/batumi`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/cars/kutaisi`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/safety`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/insurance-terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/cancellation-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/host-rules`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/guest-rules`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
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
