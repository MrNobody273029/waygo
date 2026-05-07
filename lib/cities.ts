// Canonical English city names — used as DB values and URL params.
// The order MUST stay in sync with translations.en/ka/ru.common.cities.
export const GEORGIAN_CITIES_EN = [
  'Tbilisi', 'Batumi', 'Kutaisi', 'Rustavi', 'Gori',
  'Zugdidi', 'Poti', 'Akhaltsikhe', 'Mtskheta', 'Telavi',
  'Sighnaghi', 'Borjomi', 'Kobuleti', 'Kazbegi', 'Mestia',
  'Kvareli', 'Akhalkalaki', 'Tskaltubo', 'Lagodekhi', 'Anaklia',
] as const;

export type GeorgianCity = (typeof GEORGIAN_CITIES_EN)[number];

// Only Tbilisi, Kutaisi, Batumi have commercial airports
export const CITY_TO_AIRPORT: Partial<Record<string, 'tbilisi' | 'kutaisi' | 'batumi'>> = {
  Tbilisi: 'tbilisi',
  Kutaisi: 'kutaisi',
  Batumi:  'batumi',
};

// Map any city name in any language → canonical English key
const CITY_ALIASES: Record<string, GeorgianCity> = {
  // English
  Tbilisi: 'Tbilisi', Batumi: 'Batumi', Kutaisi: 'Kutaisi',
  Rustavi: 'Rustavi', Gori: 'Gori', Zugdidi: 'Zugdidi',
  Poti: 'Poti', Akhaltsikhe: 'Akhaltsikhe', Mtskheta: 'Mtskheta',
  Telavi: 'Telavi', Sighnaghi: 'Sighnaghi', Borjomi: 'Borjomi',
  Kobuleti: 'Kobuleti', Kazbegi: 'Kazbegi', Mestia: 'Mestia',
  Kvareli: 'Kvareli', Akhalkalaki: 'Akhalkalaki', Tskaltubo: 'Tskaltubo',
  Lagodekhi: 'Lagodekhi', Anaklia: 'Anaklia',
  // Georgian (KA)
  'თბილისი': 'Tbilisi', 'ბათუმი': 'Batumi', 'ქუთაისი': 'Kutaisi',
  'რუსთავი': 'Rustavi', 'გორი': 'Gori', 'ზუგდიდი': 'Zugdidi',
  'ფოთი': 'Poti', 'ახალციხე': 'Akhaltsikhe', 'მცხეთა': 'Mtskheta',
  'თელავი': 'Telavi', 'სიღნაღი': 'Sighnaghi', 'ბორჯომი': 'Borjomi',
  'ქობულეთი': 'Kobuleti', 'ყაზბეგი': 'Kazbegi', 'მესტია': 'Mestia',
  'ყვარელი': 'Kvareli', 'ახალქალაქი': 'Akhalkalaki', 'წყალტუბო': 'Tskaltubo',
  'ლაგოდეხი': 'Lagodekhi', 'ანაკლია': 'Anaklia',
  // Russian (RU)
  'Тбилиси': 'Tbilisi', 'Батуми': 'Batumi', 'Кутаиси': 'Kutaisi',
  'Рустави': 'Rustavi', 'Гори': 'Gori', 'Зугдиди': 'Zugdidi',
  'Поти': 'Poti', 'Ахалцихе': 'Akhaltsikhe', 'Мцхета': 'Mtskheta',
  'Телави': 'Telavi', 'Сигнахи': 'Sighnaghi', 'Боржоми': 'Borjomi',
  'Кобулети': 'Kobuleti', 'Казбеги': 'Kazbegi', 'Местиа': 'Mestia',
  'Кварели': 'Kvareli', 'Ахалкалаки': 'Akhalkalaki', 'Цхалтубо': 'Tskaltubo',
  'Лагодехи': 'Lagodekhi', 'Анаклия': 'Anaklia',
};

/** Normalise any city string (any language) to the canonical English name. */
export function normalizeCity(city: string): GeorgianCity | null {
  return CITY_ALIASES[city?.trim()] ?? null;
}
