import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { dbCarToUiCar } from '@/lib/sample-data';
import { HomeContent } from './HomeContent';
import { absoluteUrl, getSiteUrl } from '@/lib/seo';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Rent a Car in Georgia — Verified Local Hosts | WAYGO.ge',
  description:
    'P2P car rental in Tbilisi, Batumi and Kutaisi. Insurance included, 250 GEL deposit, airport pickup. Book a verified local car on WAYGO.ge.',
  alternates: {
    canonical: getSiteUrl(),
    languages: {
      ru: absoluteUrl('/ru'),
      ka: absoluteUrl('/ka'),
      'x-default': getSiteUrl(),
    },
  },
  openGraph: {
    title: 'Rent a Car in Georgia — Verified Local Hosts | WAYGO.ge',
    description:
      'P2P car rental in Tbilisi, Batumi and Kutaisi. Insurance included, 250 GEL deposit, airport pickup.',
    url: getSiteUrl(),
    locale: 'en_US',
    type: 'website',
  },
};

export default async function Home() {
  const dbCars = await prisma.car.findMany({
    where: { isActive: true },
    include: {
      owner: {
        select: {
          fullName: true,
          isVerified: true,
          rating: true,
          reviewCount: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const featuredCars = dbCars.map(dbCarToUiCar);

  return <HomeContent featuredCars={featuredCars} />;
}