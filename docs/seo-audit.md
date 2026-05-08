# WayGo SEO Audit — Full Report

## Progress Tracker

### Session 1 — 2026-05-08 ✅ DONE
**Fixed in this session:**
- ✅ C6: `Product` → `['Vehicle', 'Product']` schema + `aggregateRating` in `lib/seo.ts`
- ✅ C7: Car detail breadcrumb now includes city (JSON-LD + visible UI)
- ✅ C9: Removed `FAQPage` JSON-LD from city pages (Tbilisi, Batumi, Kutaisi); replaced with `ItemList`
- ✅ C10: Added `noindex` layouts for `checkout`, `review`, `verify`, `verify-email`, `forgot-password`, `edit-car`
- ✅ C11: Removed `/login` and `/register` from `robots.txt` Disallow (they have `noindex` metadata — no conflict)
- ✅ C12: Removed broken `SearchAction` from `WebSite` JSON-LD
- ✅ C13: Deleted dead `app/(main)/layout.tsx` (was causing duplicate Navbar risk)
- ✅ H5: Replaced `force-dynamic` with `revalidate = 300` on homepage; added explicit `metadata`
- ✅ H6: `generateMetadata` on `/cars` page — filtered URLs get `noindex, follow`
- ✅ H10: Twitter card changed to `summary_large_image`
- ✅ H11: Added `/faq` and `/how-it-works` to sitemap; fixed static page `lastModified` (no longer `now`)
- ✅ H13: OG image on car detail now includes `width: 1200, height: 630`
- ✅ i18n: Added Russian + Georgian localized fields to `CityMeta` interface and all 3 cities in `lib/seo.ts` (`titleKa/Ru`, `descriptionKa/Ru`, `h1Ka/Ru`, `introKa/Ru`)
- ✅ Organization JSON-LD: Added `legalName`, `foundingDate`, `address`
- ✅ `jsonLdItemList` helper added to `lib/seo.ts`
- ✅ `CarForSeo` interface: Added `trips?` and `rating?` fields; `toSeo()` passes them; schema emits `aggregateRating` when trips > 0

### Session 2 — 2026-05-08 ✅ DONE
- [x] **C1/C2/C4:** `/ru/` and `/ka/` URL-based locale routing fully implemented
  - `middleware.ts` — sets `NEXT_LOCALE` cookie from URL prefix, auth still guards `/admin` and `/dashboard`
  - `app/layout.tsx` — reads cookie via `cookies()`, sets `<html lang={lang}>` dynamically (en/ru/ka)
  - `app/[locale]/layout.tsx` — validates locale is ru or ka, 404 otherwise
  - `app/[locale]/page.tsx` — server-rendered home in Russian/Georgian with DB featured cars
  - `app/[locale]/cars/[city]/page.tsx` — locale city pages for tbilisi/batumi/kutaisi in ru/ka
- [x] **C5:** Hreflang `alternates.languages` added to all 3 English city pages + home page
  - `app/cars/tbilisi/page.tsx`, `app/cars/batumi/page.tsx`, `app/cars/kutaisi/page.tsx`
  - `app/page.tsx` — English home now has ru/ka hreflang + x-default
- [x] **H8:** Airport landing pages created
  - `app/cars/tbilisi-airport/page.tsx` — TBS airport (IATA code, keywords, BreadcrumbList, ItemList)
  - `app/cars/batumi-airport/page.tsx` — BUS airport
  - `app/cars/kutaisi-airport/page.tsx` — KUT airport (David the Builder + Gelati/Prometheus Cave copy)
- [x] **Sitemap:** locale home pages (/ru, /ka), 6 locale city pages, 3 airport pages added
- [x] **i18n:** `lib/i18n.ts` `about` + `contact` sections added in en/ka/ru (via i18n agent)

### Session 3 — 2026-05-09 ✅ DONE
- [x] **Navbar language switcher** — now navigates to `/ru/` or `/ka/` URL prefix on language switch; `getLocaleUrl()` maps current path to locale equivalent (home + 3 city pages) or falls back to locale home
- [x] **Footer** — added Company column (About, Contact, FAQ), Airport column (TBS, BUS, KUT links), all in en/ka/ru via i18n keys
- [x] **i18n.ts** — added `footer.airportTitle`, `footer.airport1/2/3`, `footer.companyTitle`, `footer.about`, `footer.contact` in all 3 languages
- [x] **about/contact pages** — converted to server metadata + `AboutContent.tsx` / `ContactContent.tsx` client components using `useLang()` — content now renders in active language (en/ka/ru)

### Remaining TODO
- [ ] **H4:** Self-host Material Symbols font (prevents render-blocking external CSS) — low priority
- [x] **M5:** Navbar logo `width`/`height` added (CLS fix) ✅ 2026-05-08
- [x] **H2:** Replace all `<img>` with `next/image` ✅ 2026-05-08
- [x] **H3:** Hero background → `next/image` with `priority` ✅ 2026-05-08
- [x] **H7:** Dynamic city pages (17 Georgian cities) ✅ 2026-05-08
- [x] **M3:** Lazy-load `<AISupportChat>` ✅ 2026-05-08
- [x] **H9:** Default `og:image` + Twitter card ✅ 2026-05-08
- [x] **M8:** Security headers ✅ 2026-05-08

---

**Platform:** WayGo.ge — Peer-to-Peer Car Rental Marketplace (Georgia)  
**Audit Date:** 2026-05-08  
**Target Audiences:** International tourists visiting Georgia · Russian-speaking tourists · Local Georgian residents  
**Languages:** English (en) · Georgian (ka) · Russian (ru)  
**Overall SEO Health: 6.5 / 10**

---

## Top 3 Critical Issues (Summary)

1. **No multilingual SEO** — no language-specific URLs, no hreflang, no localized SSR. Google sees English-only content. Russian/Georgian content only renders after client-side localStorage swap — invisible to crawlers.
2. **`<html lang="en">` hardcoded** — never reflects the user-selected language.
3. **Homepage is a thin page** — no static crawlable text, city links only in a `<select>` dropdown, weak H1.

---

## CRITICAL Issues

### C1. No Multilingual URL Strategy / No hreflang
- **Location:** `app/layout.tsx`, `components/lang-provider.tsx`, every `page.tsx`
- **Problem:** Languages switch via `localStorage` (`waygo-lang`). Server always renders English. Googlebot sees zero Russian or Georgian content. No `/ru/`, `/ka/`, `/en/` paths. Zero `<link rel="alternate" hreflang>` tags.
- **Impact:** Cannot rank for `аренда авто тбилиси` (30k/mo), `მანქანის ქირაობა თბილისში` (5k/mo), or any non-English tourist query.
- **Fix:** Migrate to `/en/`, `/ka/`, `/ru/` subdirectory routing. Use Next.js App Router `[locale]` segment or `next-intl` middleware. Replace localStorage-only switching with URL-based locale. Add `alternates.languages` to all `generateMetadata()` calls. Set `<html lang={locale}>` dynamically.

### C2. `<html lang="en">` Hardcoded
- **Location:** `app/layout.tsx:59`
- **Fix:** After implementing locale routing, set `<html lang={locale}>`.

### C3. Server Renders English for All Locales (SSR/i18n Mismatch)
- **Location:** `components/lang-provider.tsx` — initializes `lang: 'en'` on server; reads `localStorage` only after hydration.
- **Impact:** All social previews, OG cards, CDN-cached HTML, and slow-connection first paints show English regardless of user locale.
- **Fix:** Move locale into URL; server-render the correct language.

### C4. Homepage is a Thin SEO Page
- **Location:** `app/page.tsx` (`force-dynamic`, 3 cars), `app/HomeContent.tsx`
- **Problem:** No static crawlable text. H1 = "Explore Georgia with Waygo" (1 keyword). City links are `<select>` dropdowns — Googlebot cannot follow. No internal links to `/cars/tbilisi`, `/cars/batumi`, `/cars/kutaisi` from the page body.
- **Fix:**
  1. Add server-rendered city link grid: `<Link href="/cars/tbilisi">Car rental in Tbilisi</Link>` etc.
  2. Add 250–400 word static intro paragraph.
  3. Rewrite H1: `"Rent a Car in Georgia — P2P Car Sharing in Tbilisi, Batumi & Kutaisi"`.
  4. Replace `force-dynamic` with `revalidate: 600`.

### C5. City Pages H1/Intro/FAQ Hardcoded in English Only
- **Location:** `app/cars/tbilisi/page.tsx`, `app/cars/batumi/page.tsx`, `app/cars/kutaisi/page.tsx`
- **Problem:** H1 (`city.h1`), intro (`city.intro`), FAQ items — all hardcoded English literals. Never go through `useLang()`. User switches to Russian → navbar/footer translates, H1 stays English.
- **Fix:** Move city H1/intro/FAQ into `lib/i18n.ts` and render per-locale server-side.

### C6. Car Detail `Product` Schema Invalid for a Rental
- **Location:** `lib/seo.ts` `jsonLdCarOffer()` lines 189–223
- **Problems:**
  - `@type: "Product"` should be `@type: ["Car", "Vehicle"]`
  - Missing `aggregateRating` (even when `car.trips > 0`)
  - Missing `sku` (required for Product validation)
  - `brand` = car make ("Toyota") — should be `WAYGO.ge` on the Offer
  - `unitText: 'per day'` is non-standard; use `unitCode: 'DAY'`
- **Fix:**
  ```js
  {
    '@context': 'https://schema.org',
    '@type': ['Car', 'Vehicle'],
    name: `${car.brand} ${car.model} ${car.year}`,
    sku: car.id,
    image: car.images?.slice(0, 5) || [],
    brand: { '@type': 'Brand', name: car.brand },
    vehicleModelDate: String(car.year),
    vehicleTransmission: car.transmission,
    fuelType: car.fuelType,
    seatingCapacity: car.seats,
    bodyType: car.type,
    aggregateRating: car.trips > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: car.rating,
      reviewCount: car.trips,
    } : undefined,
    offers: {
      '@type': 'Offer',
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
    },
  }
  ```

### C7. Internal Link Bottleneck — Car Detail → City Page Link Missing
- **Location:** `app/cars/[id]/CarDetailContent.tsx` lines 75–79
- **Problem:** Breadcrumb is `Cars › BMW X5 2020`. No link to `/cars/tbilisi`. All equity flows to `/cars`, zero to city pages.
- **Fix:** `Cars › Tbilisi › BMW X5 2020` with `<Link href={/cars/${citySlug}}>`. Update `BreadcrumbList` JSON-LD to match. This adds N inbound links to each city page (where N = cars in that city).

### C8. Orphan Page — `/how-it-works` Has Zero Inbound Links
- **Location:** Not linked anywhere in navbar, footer, or any page body. Only in sitemap.
- **Fix:** Add to footer policies array. Add to home page "Information" section.

### C9. Conflicting FAQPage Schema
- **Location:** `app/faq/page.tsx:24–32` + `app/cars/tbilisi/page.tsx` (and batumi, kutaisi)
- **Problem:** City pages emit `FAQPage` JSON-LD but Google deprecated FAQPage rich results for non-government/health sites since August 2023. Also risks double schema when navigating between pages.
- **Fix:** Remove `FAQPage` JSON-LD from city pages. Keep only on `/faq`. Replace city-page FAQ schema with `ItemList` (car listings).

### C10. Several Pages Missing `noindex`
- **Location:** `app/edit-car/[id]/`, `app/checkout/[bookingId]/`, `app/review/[bookingId]/`, `app/verify/`, `app/verify-email/`, `app/forgot-password/`
- **Fix:** Add `metadata: { robots: { index: false, follow: false } }` via layout files for each.

### C11. Robots.txt + `noindex` Conflict on `/login` and `/register`
- **Location:** `app/robots.ts` lines 19–20 vs `app/login/layout.tsx`, `app/register/layout.tsx`
- **Problem:** `Disallow: /login` prevents Google from reading the `noindex` meta tag. Google may index the URL without content.
- **Fix:** Remove `/login` and `/register` from `robots.txt` Disallow. Rely on `noindex` metadata (which is already set).

### C12. `WebSite` JSON-LD `SearchAction` urlTemplate is Broken
- **Location:** `lib/seo.ts` line 154
- **Problem:** Template says `/cars?q={search_term_string}` but `/cars` does not handle a `q` param (accepts `city`, `type`, `brand` etc.).
- **Fix:** Either implement `?q=` search param on `/cars`, or remove `potentialAction` entirely.

### C13. Duplicate `<Navbar>` — Dead Code Bug-in-Waiting
- **Location:** `app/(main)/layout.tsx` renders `<Navbar />`. Root `app/layout.tsx:71` also renders `<Navbar />`. No pages live under `(main)` currently.
- **Fix:** Delete `app/(main)/layout.tsx` entirely.

---

## HIGH Priority Issues

### H1. No `/about` and `/contact` Pages — Major E-E-A-T Gap
- **Problem:** No company identity, no founders, no address, no real phone. Footer shows `+995 32 2XX XXX` placeholder — Google crawls and indexes this.
- **Fix:**
  - Create `app/about/page.tsx`: company story, team, mission, registered entity info.
  - Create `app/contact/page.tsx`: real phone, email, hours, address, contact form + `LocalBusiness` JSON-LD.
  - Replace placeholder phone immediately.

### H2. `<img>` Used Instead of `next/image` Everywhere
- **Location:** `components/car-card.tsx:27`, `app/cars/[id]/CarDetailContent.tsx:96,106`, `components/navbar.tsx:62`, `components/car-picker.tsx:14`, others.
- **Problem:** No AVIF/WebP, no lazy-loading, no responsive `srcset`, no CLS-preventing `width`/`height`. LCP on car detail pages is a raw `<img>` with no `priority`.
- **Fix:** Replace all with `next/image`. Mark first car detail hero image with `priority`. Add alt text: `` `${car.year} ${car.brand} ${car.model} for rent in ${car.location}` ``.

### H3. Hero Background is a CSS `background-image` — Kills LCP
- **Location:** `app/layout.tsx:69` — `bg-[url('/homebk-m.png')]`
- **Problem:** CSS image has no `priority`, no preload, no AVIF/WebP, no responsive `srcset`. This is the LCP element on the homepage.
- **Fix:** Convert to `next/image` with `fill`, `priority`, `sizes="100vw"`. Compress to <100KB mobile / <250KB desktop.

### H4. Material Symbols Render-Blocking from Google CDN
- **Location:** `app/layout.tsx:61–64`
- **Problem:** Variable font axes URL loads ~150–250KB render-blocking from `fonts.googleapis.com`.
- **Fix:** Self-host via `next/font/local` with a subset of only the ~40 icons used in the app. Or at minimum add `<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="">`.

### H5. `force-dynamic` on Homepage Disables ISR/Caching
- **Location:** `app/page.tsx:5`
- **Fix:** Replace with `export const revalidate = 300;`. Same for `/cars` and city pages.

### H6. Filter URLs on `/cars` Have No `noindex` Strategy
- **Location:** `app/cars/page.tsx`
- **Problem:** `/cars?city=Tbilisi&type=SUV&maxPrice=80` is server-rendered with real content → crawl trap.
- **Fix:**
  ```tsx
  export async function generateMetadata({ searchParams }): Promise<Metadata> {
    const isFiltered = Object.keys(searchParams).some(k =>
      ['city','type','transmission','maxPrice','fuel','seats','brand','model'].includes(k)
    );
    return {
      ...baseMetadata,
      robots: isFiltered ? { index: false, follow: true } : { index: true, follow: true },
    };
  }
  ```

### H7. Static City Pages — Only 3 Cities, No Programmatic Coverage
- **Location:** `app/cars/tbilisi/`, `app/cars/batumi/`, `app/cars/kutaisi/`
- **Problem:** `lib/cities.ts` has 20 Georgian cities. Tourists search "rent a car Borjomi", "car rental Mestia", "Kazbegi car hire" — no landing pages exist.
- **Fix:** Convert to dynamic route `app/cars/[city]/page.tsx` with `generateStaticParams()` returning all 20 cities.

### H8. No Airport Landing Pages
- **Fix:** Create `/cars/tbilisi-airport`, `/cars/kutaisi-airport`, `/cars/batumi-airport` — highest-intent tourist queries ("Tbilisi airport car rental" = 8k/mo).

### H9. No `og:image` on Most Pages
- **Location:** Home, `/cars`, city pages, `/faq`, `/safety`, etc. all missing `og:image`.
- **Fix:** Set default OG image in root metadata: `images: [{ url: '/og-image-default.png', width: 1200, height: 630 }]`.

### H10. Twitter Card is `summary` Instead of `summary_large_image`
- **Location:** `app/layout.tsx:43`
- **Fix:** Change to `card: 'summary_large_image'`.

### H11. `/faq` and `/how-it-works` Missing from Sitemap
- **Location:** `app/sitemap.ts`
- **Fix:** Add to `staticPages` array.

### H12. `lib/seo.ts` Localizes Keywords But Not Titles/Descriptions
- **Problem:** `CityMeta` has `keywordKa`/`keywordRu` but title/description/H1/intro only in English.
- **Fix:** Add `titleKa`, `titleRu`, `descriptionKa`, `descriptionRu`, `h1Ka`, `h1Ru`, `introKa`, `introRu` to each city's metadata.

### H13. Car Detail OG Image Missing Width/Height
- **Location:** `app/cars/[id]/page.tsx:64–66`
- **Fix:** `images: [{ url: c.images[0], width: 1200, height: 630, alt: '...' }]`

### H14. Sitemap Uses `now` for Static Page `lastModified`
- **Problem:** Every sitemap fetch reports a new `lastModified` for static pages — Google learns to ignore it.
- **Fix:** Use a fixed build-time date for static pages, not `new Date()`.

### H15. Car-Type × City Landing Pages Missing
- **Fix:** Create `/cars/{city}/{type}` clean URLs for highest-volume facets (SUV, automatic, economy). Set `noindex` on query-param equivalents.

---

## MEDIUM Priority Issues

### M1. `Organization` JSON-LD Missing Key Fields
- **Location:** `lib/seo.ts:123–141`
- **Missing:** `sameAs` (social profiles), `address`, `legalName`, `foundingDate`, `telephone`
- **Fix:** Add these fields to prevent Knowledge Panel gaps.

### M2. No `themeColor`, `viewport`, or `applicationName`
- **Fix:**
  ```ts
  export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#ffffff',
  };
  ```

### M3. `AISupportChat` Hydrates on Every Route
- **Location:** `app/layout.tsx:76`
- **Fix:** Lazy-load: `const AISupportChat = dynamic(() => import('@/components/ai-support-chat'), { ssr: false });`

### M4. Navbar Logo `<img>` Missing `width`/`height`
- **Location:** `components/navbar.tsx:62`
- **Fix:** Add explicit dimensions to prevent CLS.

### M5. `/terms` and `/how-it-works` Missing `canonical`
- **Fix:** Add `alternates: { canonical: absoluteUrl('/terms') }` etc.

### M6. `og:locale` Fixed to `en_US` Everywhere
- **Fix:** After locale routing, add `alternateLocale: ['ka_GE', 'ru_RU']` to OpenGraph metadata.

### M7. `lib/i18n.ts` Ships All 3 Languages to Every User
- **Problem:** ~80–120KB minified gzipped — Russian and Georgian users download English; English users download Russian and Georgian.
- **Fix:** Code-split translations by locale: `const messages = await import(\`../lib/i18n/${locale}.ts\`)`.

### M8. No Security Headers
- **Location:** `next.config.mjs`
- **Fix:**
  ```js
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ],
    }];
  }
  ```

### M9. Mobile Tap Target Sizes Below 44px
- **Location:** Navbar language pill (`py-2 px-3.5` ≈ 38px), footer links.
- **Fix:** Add `min-h-[44px]` to interactive elements below 44px.

### M10. Fake Testimonial on Home Page
- **Location:** `app/HomeContent.tsx` — "Nika B.", "Host since 2023 · 47 Trips"
- **Problem:** Google's spam policy treats fabricated testimonials as deceptive.
- **Fix:** Replace with real reviews when available, or remove until then.

### M11. `images.remotePatterns` Allows All HTTPS Hostnames
- **Location:** `next.config.mjs`
- **Fix:** Restrict to actual hosts used (Cloudinary, S3, Clearbit CDN).

### M12. `vary: Accept-Language` Not Set
- **Fix:** When locale routing is implemented, ensure `Vary: Accept-Language` header is set on all locale-served responses.

---

## LOW Priority Issues

| # | Issue | Location | Fix |
|---|---|---|---|
| L1 | Car gallery secondary images have `alt=""` | `CarDetailContent.tsx:106` | Add descriptive alt text |
| L2 | Unused `Image` import and commented block | `HomeContent.tsx:6,13–22` | Remove dead code |
| L3 | No `<link rel="manifest">` for PWA signals | `app/layout.tsx` | Add `site.webmanifest` |
| L4 | `<br>` in H1 may cause Google to split it into two sentences | `hero-search.tsx` | Use single string |
| L5 | `FAQPage` schema won't yield rich results for car rental sites since 2023 | `app/faq/page.tsx` | Keep schema, but don't rely on it for traffic |
| L6 | No `BlogPosting` / `Article` schema | missing `/blog` | Long-term: add travel blog |
| L7 | `llms.txt` exists only in English | `public/llms.txt` | Add `llms.ka.txt`, `llms.ru.txt` after locale rollout |
| L8 | `<a href>` instead of `<Link>` in some components | `HomeContent.tsx:38,57`, `CarDetailContent.tsx:76` | Replace with `next/link` |
| L9 | Currency switcher may show USD after hydration while JSON-LD says GEL | `currency-provider.tsx` | Add `data-price-gel` attribute for crawler clarity |

---

## Top 20 Queries Where WayGo Cannot Rank (Yet)

| # | Query | Est. Monthly Volume | Root Cause |
|---|---|---|---|
| 1 | аренда авто тбилиси | 30,000 | No /ru/ URLs exist |
| 2 | rent a car in tbilisi | 18,000 | Weak H1, no home→city link |
| 3 | car rental georgia | 12,000 | H1 not keyword-aligned |
| 4 | прокат машины тбилиси | 12,000 | No /ru/ URLs |
| 5 | rent a car at tbilisi airport | 8,000 | No airport landing page |
| 6 | car hire batumi | 5,000 | Same as #2 + no RU content |
| 7 | მანქანის ქირაობა თბილისში | 5,000+ | No /ka/ URLs |
| 8 | rent a car in georgia for tourists | 2,000 | No about/E-E-A-T content |
| 9 | automatic car rental tbilisi | 1,500 | No clean filter URL |
| 10 | rent a car kutaisi airport | 1,500 | No airport page |
| 11 | cheap car rental tbilisi | 5,000 | No price landing page |
| 12 | suv rental georgia | 1,200 | No type landing page |
| 13 | аренда авто батуми | 1,000 | No /ru/ URLs |
| 14 | toyota corolla rent tbilisi | 800 | No brand+model+city page |
| 15 | car rental with insurance georgia | 800 | /insurance-terms is orphaned |
| 16 | one way car rental tbilisi to batumi | 600 | No one-way content |
| 17 | car rental for kazbegi tour | 400 | Mentioned in intro, no page |
| 18 | car hire tbilisi no deposit | 600 | Deposit info not surfaced for SEO |
| 19 | minivan rental georgia | 300 | No /cars/minivan landing page |
| 20 | electric car rental tbilisi | 200 | Filter exists, no clean URL |

---

## Internal Link Graph (Current State)

```
/ (home)
├── navbar → /cars
├── footer → /cars/tbilisi, /cars/batumi, /cars/kutaisi (only links to city pages!)
├── footer → /faq, /safety, /insurance-terms, /host-rules, /guest-rules, /cancellation-policy, /terms
├── NO link to /how-it-works anywhere ← ORPHAN
└── city link in hero is <select> dropdown ← invisible to Googlebot

/cars
└── each <CarCard> → /cars/[slug]

/cars/[id]
├── breadcrumb → /cars ONLY
└── NO link back to /cars/tbilisi ← equity bottleneck

/cars/tbilisi, /cars/batumi, /cars/kutaisi
└── inbound links: footer (1) + sitemap only ← PageRank starvation
```

---

## E-E-A-T Signals Audit

| Signal | Status | Notes |
|---|---|---|
| About page | ❌ Missing | Critical for trust signals |
| Contact page | ❌ Missing | Critical for trust signals |
| Real phone number | ❌ Missing | Footer shows `+995 32 2XX XXX` placeholder |
| Real email | ✅ | `info@waygo.ge` |
| Physical address | ❌ Missing | Not anywhere on site |
| Company registration | ❌ Missing | Only "WAYGO Georgia" — not a legal entity |
| Customer reviews (real) | ❌ Missing | Home shows fake seeded testimonial |
| Host verification badges | ✅ | Shown on car listings |
| Insurance details | ✅ | `/insurance-terms` exists |
| Privacy / Terms | ✅ | `/terms` exists |
| Blog / editorial content | ❌ Missing | No driving guides, city tours, travel content |
| Press mentions | ❌ Missing | No press page |

---

## Schema.org Completeness Summary

| Schema | Status | Missing Fields |
|---|---|---|
| `Organization` | ⚠️ Partial | `sameAs`, `address`, `legalName`, `foundingDate`, `telephone` |
| `WebSite` + `SearchAction` | ⚠️ Broken | `urlTemplate` references `?q=` param that doesn't exist |
| `BreadcrumbList` | ✅ Valid | None |
| `FAQPage` | ⚠️ Valid but deprecated | Won't yield rich results for car rental sites since Aug 2023 |
| `Product` (car listings) | ❌ Wrong type | Should be `Vehicle`/`Car`; missing `sku`, `aggregateRating` |

---

## Prioritized Action Plan

### P0 — Critical (Must do before/at launch)
1. Implement `/[locale]/` URL routing for ka/en/ru (C1)
2. Translate city page H1/intro/FAQ into Russian and Georgian (C5)
3. Emit `hreflang` on every page; update sitemap (C1)
4. Set `<html lang={locale}>` dynamically (C2)
5. Add `noindex` to checkout, review, verify, verify-email, forgot-password, edit-car (C10)
6. Fix `Product` → `Vehicle`/`Car` schema with `aggregateRating` (C6)
7. Add city link grid on home page (server-rendered `<Link>`) (C4)
8. Add city to car detail breadcrumb (C7)
9. Remove `/login`, `/register` from robots.txt Disallow (C11)
10. Delete `app/(main)/layout.tsx` (C13)

### P1 — High (Within 2 weeks of launch)
11. Replace all `<img>` with `next/image` site-wide (H2)
12. Convert hero CSS background to `next/image` with `priority` (H3)
13. Create `/about` and `/contact` pages + `LocalBusiness` schema (H1)
14. Replace `+995 32 2XX XXX` placeholder with real phone (H1)
15. Self-host Material Symbols font (H4)
16. Add `revalidate: 300` to home, `/cars`, city pages; remove `force-dynamic` (H5)
17. Add `noindex` to filtered `/cars` URLs (H6)
18. Add default `og:image` + `twitter: summary_large_image` (H9, H10)
19. Add `/faq`, `/how-it-works` to sitemap (H11)
20. Remove `FAQPage` JSON-LD from city pages; add `ItemList` instead (C9)
21. Fix `WebSite` SearchAction urlTemplate (C12)
22. Rewrite home H1 to be keyword-bearing (C4)
23. Localize city titles/descriptions in `lib/seo.ts` (H12)
24. Lazy-load `<AISupportChat>` and modal components (M3)

### P2 — Medium (Month 2)
25. Dynamic city pages covering all 20 cities (H7)
26. Airport landing pages: `/cars/tbilisi-airport`, `/cars/kutaisi-airport`, `/cars/batumi-airport` (H8)
27. Car-type × city clean URLs (H15)
28. Add `Organization` schema fields: `sameAs`, `address`, `legalName` (M1)
29. Add `viewport`, `themeColor` exports (M2)
30. Add security headers in `next.config.mjs` (M8)
31. Code-split `lib/i18n.ts` by locale (M7)
32. Fix tap target sizes on language pill, footer links (M9)

### P3 — Low (Month 3+)
33. Brand/model landing pages: `/cars/toyota`, `/cars/toyota/prius`
34. Launch `/blog` with Georgian travel/driving content
35. Add dynamic OG image generation per car (Vercel OG)
36. Add `Speakable` schema for voice search
37. Create `llms.ka.txt`, `llms.ru.txt`
38. Add `Article` schema once blog exists

---

## Files Audited

- `app/layout.tsx`, `app/page.tsx`, `app/HomeContent.tsx`
- `app/(main)/layout.tsx`
- `app/robots.ts`, `app/sitemap.ts`
- `app/cars/page.tsx`, `app/cars/CarsContent.tsx`
- `app/cars/tbilisi/page.tsx`, `app/cars/batumi/page.tsx`, `app/cars/kutaisi/page.tsx`
- `app/cars/[id]/page.tsx`, `app/cars/[id]/CarDetailContent.tsx`
- `app/faq/page.tsx`, `app/faq/FaqContent.tsx`
- `app/how-it-works/page.tsx`, `app/safety/page.tsx`, `app/insurance-terms/page.tsx`
- `app/cancellation-policy/page.tsx`, `app/guest-rules/page.tsx`, `app/host-rules/page.tsx`
- `app/terms/page.tsx`, `app/verify/page.tsx`, `app/verify-email/page.tsx`
- `app/forgot-password/page.tsx`, `app/edit-car/[id]/page.tsx`
- `app/checkout/[bookingId]/page.tsx`, `app/review/[bookingId]/page.tsx`
- `app/admin/layout.tsx`, `app/dashboard/page.tsx`, `app/my-cars/page.tsx`, `app/host-rentals/page.tsx`
- `app/login/layout.tsx`, `app/register/layout.tsx`, `app/become-host/layout.tsx`, `app/bookings/layout.tsx`
- `components/navbar.tsx`, `components/footer.tsx`, `components/mobile-nav.tsx`
- `components/hero-search.tsx`, `components/car-card.tsx`, `components/car-picker.tsx`
- `components/lang-provider.tsx`, `components/providers.tsx`, `components/JsonLd.tsx`
- `components/ai-search.tsx`, `components/ai-support-chat.tsx`, `components/booking-widget.tsx`
- `lib/seo.ts`, `lib/i18n.ts`, `lib/faq.ts`, `lib/cities.ts`, `lib/slugs.ts`
- `next.config.mjs`, `package.json`
- `public/llms.txt`
