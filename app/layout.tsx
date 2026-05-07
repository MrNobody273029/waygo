import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MobileNav } from '@/components/mobile-nav';
import { AISupportChat } from '@/components/ai-support-chat';
import { JsonLd } from '@/components/JsonLd';
import { jsonLdOrganization, jsonLdWebSite, getSiteUrl } from '@/lib/seo';

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
  },
  twitter: {
    card: 'summary',
    title: 'WAYGO.ge — Peer-to-Peer Car Rental in Georgia',
    description:
      'Rent verified local cars in Tbilisi, Batumi, and Kutaisi from trusted Georgian hosts.',
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
  return (
    <html lang="en" className={manrope.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>
        <JsonLd data={[jsonLdOrganization(), jsonLdWebSite()]} />
        <Providers>
          <div className="min-h-screen bg-no-repeat bg-top bg-cover bg-[url('/homebk-m.png')] md:bg-[url('/homebk.png')]">
            <div className="min-h-screen bg-black/45">
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
