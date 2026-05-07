// ── Site URL ──────────────────────────────────────────────────────────────────

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://waygo.ge'
  ).replace(/\/$/, '');
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

// ── Text helpers ──────────────────────────────────────────────────────────────

export function cleanDescription(text: string, maxLength = 155): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

// ── Car metadata ──────────────────────────────────────────────────────────────

export interface CarForSeo {
  id: string;
  brand: string;
  model: string;
  year: number;
  location: string;
  dailyPrice: number;
  transmission: string;
  seats: number;
  fuelType: string;
  type: string;
  description?: string;
  images?: string[];
  verified?: boolean;
}

export function carTitle(car: CarForSeo): string {
  return `Rent ${car.brand} ${car.model} ${car.year} in ${car.location} from ${car.dailyPrice} GEL/day`;
}

export function carDescription(car: CarForSeo): string {
  const verified = car.verified ? 'Verified local host. ' : '';
  return cleanDescription(
    `Rent ${car.year} ${car.brand} ${car.model} in ${car.location} from ${car.dailyPrice} GEL/day. ` +
    `${car.transmission} · ${car.seats} seats · ${car.fuelType}. ` +
    `${verified}Insurance options and deposit protection on WAYGO.ge.`,
  );
}

// ── City SEO ──────────────────────────────────────────────────────────────────

export type SeoCity = 'Tbilisi' | 'Batumi' | 'Kutaisi';

export interface CityMeta {
  slug: string;
  canonical: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  airport: string;
  keywordEn: string;
  keywordKa: string;
  keywordRu: string;
}

const CITY_META: Record<SeoCity, CityMeta> = {
  Tbilisi: {
    slug: 'tbilisi',
    canonical: '/cars/tbilisi',
    title: 'Car Rental in Tbilisi — Rent from Local Hosts',
    description:
      'Rent a car in Tbilisi, Georgia from verified local hosts. Airport pickup, flexible insurance, and 250 GEL deposit protection. Book instantly on WAYGO.ge.',
    h1: 'Car Rental in Tbilisi, Georgia',
    intro:
      'Find the perfect rental car in Tbilisi from a verified local owner. Whether you need a city runabout, an SUV for Kazbegi, or an economy car for the Kakheti wine region, WAYGO.ge connects you with trusted local hosts at transparent daily rates.',
    airport: 'Tbilisi International Airport (TBS)',
    keywordEn: 'car rental Tbilisi · rent a car Tbilisi · Tbilisi airport car rental',
    keywordKa: 'მანქანის ქირაობა თბილისში · მანქანის გაქირავება',
    keywordRu: 'аренда авто Тбилиси · прокат машины Тбилиси',
  },
  Batumi: {
    slug: 'batumi',
    canonical: '/cars/batumi',
    title: 'Car Rental in Batumi — Daily & Weekly Car Hire',
    description:
      'Hire a car in Batumi, Georgia from verified local hosts. Black Sea coastal drives, Adjara mountains, airport pickup. Flexible insurance on WAYGO.ge.',
    h1: 'Car Rental in Batumi, Georgia',
    intro:
      'Explore Batumi and the Adjara region at your own pace with a rental car from a verified local host. Drive the Black Sea boulevard, discover Adjara mountain villages, or cross into Sarpi — all with the freedom of your own wheels.',
    airport: 'Batumi International Airport (BUS)',
    keywordEn: 'car rental Batumi · rent a car Batumi · Batumi airport car rental',
    keywordKa: 'მანქანის ქირაობა ბათუმში · მანქანის გაქირავება',
    keywordRu: 'прокат авто Батуми · аренда машины Батуми',
  },
  Kutaisi: {
    slug: 'kutaisi',
    canonical: '/cars/kutaisi',
    title: 'Car Rental in Kutaisi — Airport & City Car Hire',
    description:
      'Rent a car in Kutaisi from verified local hosts. Perfect for Kutaisi airport arrivals, Gelati monastery visits, and Imereti exploration. Book on WAYGO.ge.',
    h1: 'Car Rental in Kutaisi, Georgia',
    intro:
      'Arriving at Kutaisi International Airport? Rent a car from a verified local host and explore Imereti and the Georgian highlands. Visit Gelati, Motsameta, Sataplia Nature Reserve, and Prometheus Cave with the comfort of your own rental car.',
    airport: 'David the Builder Kutaisi International Airport (KUT)',
    keywordEn: 'car rental Kutaisi · rent a car Kutaisi · Kutaisi airport car rental',
    keywordKa: 'მანქანის ქირაობა ქუთაისში · მანქანის გაქირავება',
    keywordRu: 'аренда авто Кутаиси · прокат машины Кутаиси',
  },
};

export function citySeo(city: SeoCity): CityMeta {
  return CITY_META[city];
}

// ── JSON-LD builders ──────────────────────────────────────────────────────────

export function jsonLdOrganization(): Record<string, unknown> {
  const url = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WAYGO.ge',
    url,
    logo: `${url}/logo-website.svg`,
    description:
      'WAYGO.ge is a peer-to-peer car rental platform in Georgia connecting verified local car owners with guests seeking flexible, insured car hire in Tbilisi, Batumi, Kutaisi, and across Georgia.',
    areaServed: { '@type': 'Country', name: 'Georgia' },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@waygo.ge',
      contactType: 'customer support',
      availableLanguage: ['English', 'Georgian', 'Russian'],
    },
  };
}

export function jsonLdWebSite(): Record<string, unknown> {
  const url = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WAYGO.ge',
    url,
    description:
      'P2P car rental platform in Georgia. Book verified local cars in Tbilisi, Batumi, and Kutaisi with flexible insurance and deposit protection.',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${url}/cars?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function jsonLdBreadcrumb(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function jsonLdFaq(
  items: { question: string; answer: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function jsonLdCarOffer(
  car: CarForSeo,
  pageUrl: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${car.brand} ${car.model} ${car.year}`,
    description:
      car.description ||
      `${car.year} ${car.brand} ${car.model} available for rental in ${car.location}, Georgia.`,
    image: car.images?.[0] ? [car.images[0]] : [],
    brand: { '@type': 'Brand', name: car.brand },
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      priceCurrency: 'GEL',
      price: car.dailyPrice,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: car.dailyPrice,
        priceCurrency: 'GEL',
        unitCode: 'DAY',
        unitText: 'per day',
      },
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'WAYGO.ge', url: getSiteUrl() },
    },
    vehicleConfiguration: car.transmission,
    fuelType: car.fuelType,
    vehicleSeatingCapacity: car.seats,
    bodyType: car.type,
    productionDate: String(car.year),
  };
}
