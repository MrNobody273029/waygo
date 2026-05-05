import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { MobileNav } from '@/components/mobile-nav';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'WAYGO.GE — Car Rental in Georgia', template: '%s | WAYGO.GE' },
  description: 'Rent a car anywhere in Georgia. Verified local cars, flexible insurance, and deposit protection.',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
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
 <Providers>
  <div
className="min-h-screen bg-no-repeat bg-top bg-[length:100%_auto]"
    style={{ backgroundImage: "url('/homebk.png')" }}
  >
    <div className="min-h-screen bg-black/45">
      <Navbar />
      {children}
      <Footer />
    </div>
  </div>

  <MobileNav />
</Providers>
      </body>
    </html>
  );
}
