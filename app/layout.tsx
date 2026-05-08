import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Manrope } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MobileNav } from '@/components/mobile-nav';
import { JsonLd } from '@/components/JsonLd';
import { jsonLdOrganization, jsonLdWebSite, getSiteUrl } from '@/lib/seo';

const AISupportChat = dynamic(
  () => import('@/components/ai-support-chat').then(m => m.AISupportChat),
  { ssr: false },
);

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'WAYGO.ge — Peer-to-Peer Car Rental in Georgia',
    template: '%s | WAYGO.ge',
  },
  description:
    'Rent verified local cars in Tbilisi, Batumi, and Kutaisi. Flexible insurance, 250 GEL deposit protection, and instant booking from trusted Georgian hosts.',
  keywords: [
    'car rental Georgia', 'rent a car Tbilisi', 'car hire Batumi',
    'Kutaisi car rental', 'P2P car rental Georgia', 'WAYGO',
    'car rental Tbilisi airport', 'car rental Batumi airport',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'WAYGO.ge',
    title: 'WAYGO.ge — Peer-to-Peer Car Rental in Georgia',
    description:
      'Rent verified local cars in Tbilisi, Batumi, and Kutaisi from trusted Georgian hosts. Insurance included, 250 GEL deposit protection.',
    images: [
      {
        url: `${SITE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: 'WAYGO.ge — Car Rental in Georgia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WAYGO.ge — Peer-to-Peer Car Rental in Georgia',
    description:
      'Rent verified local cars in Tbilisi, Batumi, and Kutaisi from trusted Georgian hosts.',
    images: [`${SITE_URL}/og-default.png`],
  },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'en';
  const lang = locale === 'ka' ? 'ka' : locale === 'ru' ? 'ru' : 'en';

  return (
    <html lang={lang} className={manrope.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>
        <JsonLd data={[jsonLdOrganization(), jsonLdWebSite()]} />
        <Providers>
          <div className="min-h-screen relative">
            <Image
              src="/homebk-m.png"
              alt=""
              fill
              priority
              className="object-cover object-top md:hidden -z-10"
              sizes="100vw"
            />
            <Image
              src="/homebk.png"
              alt=""
              fill
              priority
              className="object-cover object-top hidden md:block -z-10"
              sizes="100vw"
            />
            <div className="min-h-screen bg-black/45 relative">
              <Navbar />
              {children}
              <Footer />
            </div>
          </div>
          <AISupportChat />
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
