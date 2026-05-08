import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl, getSiteUrl } from '@/lib/seo';
import { AboutContent } from './AboutContent';

export const metadata: Metadata = {
  title: 'About WAYGO.ge — P2P Car Rental in Georgia',
  description:
    'WAYGO.ge is Georgia\'s first peer-to-peer car rental platform, connecting verified local car owners with tourists and locals in Tbilisi, Batumi, and Kutaisi.',
  alternates: { canonical: absoluteUrl('/about') },
  openGraph: {
    title: 'About WAYGO.ge — P2P Car Rental in Georgia',
    description:
      'WAYGO.ge is Georgia\'s first peer-to-peer car rental platform, connecting verified local car owners with tourists and locals.',
    url: absoluteUrl('/about'),
    type: 'website',
  },
};

const jsonLdAbout = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About WAYGO.ge',
  url: absoluteUrl('/about'),
  description:
    'WAYGO.ge is a peer-to-peer car rental platform in Georgia connecting verified local car owners with guests seeking flexible, insured car hire.',
  publisher: {
    '@type': 'Organization',
    name: 'WAYGO.ge',
    url: getSiteUrl(),
    logo: `${getSiteUrl()}/logo-website.svg`,
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'GE',
      addressLocality: 'Tbilisi',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@waygo.ge',
      contactType: 'customer support',
      availableLanguage: ['English', 'Georgian', 'Russian'],
    },
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={[jsonLdAbout]} />
      <AboutContent />
    </>
  );
}
