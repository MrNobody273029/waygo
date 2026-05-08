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
  trips?: number;
  rating?: number;
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
  titleKa?: string;
  descriptionKa?: string;
  h1Ka?: string;
  introKa?: string;
  titleRu?: string;
  descriptionRu?: string;
  h1Ru?: string;
  introRu?: string;
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
    titleKa: 'მანქანის ქირაობა თბილისში — ადგილობრივი მასპინძლები',
    descriptionKa:
      'გაქირავეთ მანქანა თბილისში ვერიფიცირებული ადგილობრივი მასპინძლებისგან. აეროპორტის მიწოდება, მოქნილი დაზღვევა და 250 ₾ დეპოზიტის დაცვა. დაჯავშნეთ WAYGO.ge-ზე.',
    h1Ka: 'მანქანის ქირაობა თბილისში',
    introKa:
      'იპოვეთ სრულყოფილი გასაქირავებელი მანქანა თბილისში ვერიფიცირებული ადგილობრივი მფლობელისგან. გჭირდებათ ქალაქის მანქანა, ჯიპი იყაზბეგისთვის თუ ეკონომიური მანქანა კახეთის ღვინის რეგიონისთვის — WAYGO.ge დაგაკავშირებთ სანდო ადგილობრივ მასპინძლებთან.',
    titleRu: 'Аренда авто в Тбилиси — от местных хозяев',
    descriptionRu:
      'Арендуйте автомобиль в Тбилиси у проверенных местных хозяев. Трансфер из аэропорта, гибкая страховка и депозит 250 GEL. Бронируйте на WAYGO.ge.',
    h1Ru: 'Аренда автомобиля в Тбилиси',
    introRu:
      'Найдите идеальный прокатный автомобиль в Тбилиси у проверенного местного владельца. Нужен городской автомобиль, внедорожник для Казбеги или экономичный вариант для Кахетии — WAYGO.ge соединит вас с надёжными местными хозяевами.',
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
    titleKa: 'მანქანის ქირაობა ბათუმში — ყოველდღიური და კვირეული ქირა',
    descriptionKa:
      'გაქირავეთ მანქანა ბათუმში ვერიფიცირებული ადგილობრივი მასპინძლებისგან. შავი ზღვის სანაპირო, აჭარის მთები, აეროპორტის მიწოდება. WAYGO.ge-ზე.',
    h1Ka: 'მანქანის ქირაობა ბათუმში',
    introKa:
      'შეისწავლეთ ბათუმი და აჭარის რეგიონი საკუთარი ტემპით ვერიფიცირებული ადგილობრივი მასპინძლის მანქანით. იმოძრავეთ შავი ზღვის ბულვარზე, აღმოაჩინეთ აჭარის მთის სოფლები ან გადაინაცვლეთ სარფში.',
    titleRu: 'Аренда авто в Батуми — посуточно и понедельно',
    descriptionRu:
      'Арендуйте автомобиль в Батуми у проверенных местных хозяев. Черноморское побережье, горы Аджарии, трансфер из аэропорта. На WAYGO.ge.',
    h1Ru: 'Аренда автомобиля в Батуми',
    introRu:
      'Исследуйте Батуми и Аджарию в своём темпе на арендованном автомобиле от местного хозяина. Прокатитесь по Черноморскому бульвару, откройте для себя горные сёла Аджарии или доедьте до Сарпи.',
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
    titleKa: 'მანქანის ქირაობა ქუთაისში — აეროპორტი და ქალაქი',
    descriptionKa:
      'გაქირავეთ მანქანა ქუთაისში ვერიფიცირებული ადგილობრივი მასპინძლებისგან. ქუთაისის საერთაშორისო აეროპორტი, გელათი, იმერეთის გამოკვლევა. WAYGO.ge.',
    h1Ka: 'მანქანის ქირაობა ქუთაისში',
    introKa:
      'ჩამოფრინდით ქუთაისის საერთაშორისო აეროპორტში? გაქირავეთ მანქანა ვერიფიცირებული ადგილობრივი მასპინძლისგან და შეისწავლეთ იმერეთი. ეწვიეთ გელათს, მოწამეთას, სათაფლიას და პრომეთეს გამოქვაბულს.',
    titleRu: 'Аренда авто в Кутаиси — аэропорт и город',
    descriptionRu:
      'Арендуйте автомобиль в Кутаиси у проверенных местных хозяев. Аэропорт Кутаиси, монастырь Гелати, исследование Имеретии. WAYGO.ge.',
    h1Ru: 'Аренда автомобиля в Кутаиси',
    introRu:
      'Прилетели в Международный аэропорт Кутаиси? Арендуйте автомобиль у проверенного местного хозяина и исследуйте Имеретию. Посетите Гелати, Моцамету, заповедник Сатаплиа и пещеру Прометея.',
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
    legalName: 'WAYGO Georgia',
    url,
    logo: `${url}/logo-website.svg`,
    description:
      'WAYGO.ge is a peer-to-peer car rental platform in Georgia connecting verified local car owners with guests seeking flexible, insured car hire in Tbilisi, Batumi, Kutaisi, and across Georgia.',
    foundingDate: '2024',
    areaServed: { '@type': 'Country', name: 'Georgia' },
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
  };
}

export function jsonLdItemList(items: { url: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: item.url,
    })),
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
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Vehicle', 'Product'],
    name: `${car.brand} ${car.model} ${car.year}`,
    sku: car.id,
    description:
      car.description ||
      `${car.year} ${car.brand} ${car.model} available for rental in ${car.location}, Georgia.`,
    image: car.images?.slice(0, 5) ?? [],
    brand: { '@type': 'Brand', name: car.brand },
    vehicleModelDate: String(car.year),
    vehicleConfiguration: car.transmission,
    fuelType: car.fuelType,
    vehicleSeatingCapacity: car.seats,
    bodyType: car.type,
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
      },
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'WAYGO.ge', url: getSiteUrl() },
      areaServed: { '@type': 'Country', name: 'Georgia' },
    },
  };

  if (car.trips && car.trips > 0 && car.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: car.rating,
      reviewCount: car.trips,
    };
  }

  return schema;
}
