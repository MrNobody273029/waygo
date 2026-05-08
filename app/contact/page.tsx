import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl, getSiteUrl } from '@/lib/seo';
import { ContactContent } from './ContactContent';

export const metadata: Metadata = {
  title: 'Contact WAYGO.ge — Car Rental Support in Georgia',
  description:
    'Contact WAYGO.ge for support with car rental bookings in Georgia. Email us at info@waygo.ge. Available in English, Georgian, and Russian.',
  alternates: { canonical: absoluteUrl('/contact') },
  openGraph: {
    title: 'Contact WAYGO.ge — Car Rental Support in Georgia',
    description: 'Get in touch with WAYGO.ge support for car rental help in Georgia.',
    url: absoluteUrl('/contact'),
    type: 'website',
  },
};

const jsonLdContact = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact WAYGO.ge',
  url: absoluteUrl('/contact'),
  publisher: {
    '@type': 'LocalBusiness',
    '@id': getSiteUrl(),
    name: 'WAYGO.ge',
    url: getSiteUrl(),
    logo: `${getSiteUrl()}/logo-website.svg`,
    email: 'info@waygo.ge',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GE',
      addressLocality: 'Tbilisi',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '21:00',
    },
    availableLanguage: [
      { '@type': 'Language', name: 'English' },
      { '@type': 'Language', name: 'Georgian' },
      { '@type': 'Language', name: 'Russian' },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={[jsonLdContact]} />
      <ContactContent />
    </>
  );
}
