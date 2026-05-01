# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (runs on port 3001 — NEXTAUTH_URL must match)
npm run build        # Production build
npm run lint         # ESLint
npx prisma db push   # Sync schema changes to Neon DB (run after every schema edit)
npx prisma studio    # Visual DB browser
npm run seed         # Upsert admin account only (admin@waygo.ge / Waygo2026@)
npm run cleanup      # One-time DB cleanup: delete all profiles except admin + ggulordava4@gmail.com
```

After every `prisma/schema.prisma` change, run `npx prisma db push` before starting the dev server, otherwise API routes will throw `column does not exist` errors at runtime.

## Environment

`.env` requires:
```
DATABASE_URL=        # Neon PostgreSQL pooled connection string
NEXTAUTH_SECRET=     # Any random string
NEXTAUTH_URL=        # Must match the actual dev port (e.g. http://localhost:3001)
RESEND_API_KEY=      # Resend API key for transactional emails (from: info@waygo.ge)
```

`NEXTAUTH_URL` must match the port Next.js is actually running on — mismatch causes 401 on all auth callbacks.

## Architecture

**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS v4 · Prisma 6 · Neon PostgreSQL · NextAuth v4 (JWT strategy)

### Server vs Client pattern

Pages that need auth (`getServerSession`) or DB data must be **server components**. Because `useLang()` is a client-side hook, the pattern used throughout is:

- `app/X/page.tsx` — async server component: fetches session + DB data, passes as props
- `app/X/XContent.tsx` — `'use client'` component: receives props, calls `useLang()`, renders UI

Examples: `dashboard/`, `cars/[id]/`, `admin/`.

### i18n

`lib/i18n.ts` exports `translations` (EN + KA + RU) and `type Translations = typeof translations.en`. The context provider (`components/lang-provider.tsx`) persists the chosen language to `localStorage` under the key `drivo-lang`. All static UI strings must go through `const { t } = useLang()`. When adding new keys, add them to **all three** `en`, `ka`, and `ru` objects — TypeScript will catch mismatches because `Translations = typeof translations.en`.

The `as Translations` cast in `LangProvider` is intentional to handle the union type mismatch between en/ka/ru.

### Design system

Tailwind config (`tailwind.config.ts`) defines a **Material Design 3 / AutoShare** colour palette. Use these tokens everywhere — never raw hex or Tailwind default colours:

- `primary` / `primary-container` — blue CTA, buttons
- `tertiary` / `tertiary-fixed` — green success/insurance badges
- `error` / `error-container` — destructive actions
- `surface` / `surface-container-low` — backgrounds
- `outline-variant` — borders
- `secondary` — muted text

Typography scale: `text-display`, `text-h1–h3`, `text-body-md/lg`, `text-label-bold`, `text-label-sm`.

Icons: **Material Symbols Outlined** loaded via Google CDN in `app/layout.tsx`. Use `<span className="material-symbols-outlined">icon_name</span>`.

Font: **Manrope** via `next/font/google`, exposed as CSS var `--font-manrope`.

### Car data

`lib/car-data.ts` — static database of 55+ makes/models, logos (Clearbit), popular brands list, year range. Used by `components/car-picker.tsx` which exports three reusable components:
- `CarBrandPicker` — floating grid panel with logo + search, supports `compact` prop for inline filter bars
- `CarModelPicker` — searchable list, brand-dependent
- `CarYearPicker` — styled `<select>`

`lib/sample-data.ts` — legacy static `Car[]`, no longer used for display. All car listings are loaded from the Prisma `Car` table dynamically.

### Currency

`gel(n)` in `lib/utils.ts` returns `` `${n} ₾` `` — a plain template string. Do **not** use `Intl.NumberFormat` for GEL; it produces different output on server (Node) vs client (browser) and causes hydration errors.

### Auth

NextAuth `authOptions` in `lib/auth.ts`. JWT token carries `id`, `role`, `isVerified`. Session type is extended in `lib/auth.ts` and cast with `(session.user as any).role`. Admin-only routes check `session.user.role === 'ADMIN'` server-side.

Admin credentials: `admin@waygo.ge` / `Waygo2026@`

### API routes

| Route | Purpose |
|---|---|
| `POST /api/auth/register` | Create profile, hash password with bcrypt |
| `POST /api/bookings` | Create booking + InsurancePolicy + 2 Transaction rows (payment + deposit_hold) |
| `POST /api/insurance` | Update insurance plan on a booking |
| `POST /api/upload` | File upload placeholder (returns dummy URL) |
| `POST /api/verification` | Submit KYC documents |
| `POST /api/cars` | Create a car listing |
| `POST /api/bookings/[id]/condition-report` | Submit pickup or return condition report (7 photos required; return gated by `endDate`); updates booking status to `confirmed` or `completed` |
| `POST /api/admin/verifications/[userId]` | Admin approve/reject guest or host verification; sends trilingual HTML email via Resend |

### Booking condition report

`app/bookings/[id]/` — server page + `BookingDetailContent.tsx` client component. Shows 7 photo slots for pickup and return condition reports (`ConditionReport` model). Pickup always shown; return section visible only after `endDate`. Confirming pickup transitions status `pending → confirmed`; confirming return transitions `confirmed → completed`. Photos are locked after confirmation.

The `PhotoGrid` sub-component inside `BookingDetailContent.tsx` is defined at module level (not inside the parent function) to avoid React re-mounting on every state change.

### Admin area

`app/admin/` uses a separate layout (`app/admin/layout.tsx`) with `AdminSidebar`. All admin pages follow the server/client split pattern. Access is gated by `role === 'ADMIN'` check in each page's server component.

`AdminVerificationsContent.tsx` — `GuestCard` and `HostCard` are defined at **module level** (not inside the parent component body). This is intentional: defining them inside the parent caused the textarea cursor to jump on every keystroke because React was unmounting/remounting the component on each render. All shared state is passed as props via `CardSharedProps` interface.

### Email system

`app/api/admin/verifications/[userId]/route.ts` sends HTML emails via Resend on approve/reject actions. The `emailLayout()` helper produces a table-based email with blue gradient header, white body, and CTA button. Templates exist for `approve_guest`, `reject_guest`, `approve_host`, `reject_host` in EN/KA/RU. CTA links: approved_guest→/cars, reject_guest→/dashboard, approve_host→/become-host, reject_host→/my-cars. `SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge'`.
