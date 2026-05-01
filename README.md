# Georgia P2P Car Sharing MVP

A high-trust, transactional Turo/Getaround-inspired MVP for Georgia, built with Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma, and Neon PostgreSQL.

## What is included
- SSR car listing page with SEO metadata
- Dynamic car detail pages with sticky checkout widget
- 3-tier insurance engine: Basic, Standard, Premium
- Unified 250 GEL deposit authorization logic
- Booking API with payment + deposit-hold transaction records
- Host listing wizard
- Guest verification screen with KYC upload placeholder
- Dashboard for bookings, approvals, and earnings
- Check-in/check-out condition report UI logic
- Prisma schema for Neon PostgreSQL
- Sitemap + robots

## Setup
```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Open http://localhost:3000

## Neon database
Create a free Neon project, copy the pooled PostgreSQL connection string into `DATABASE_URL`, then run:
```bash
npx prisma db push
npm run seed
```

## Payment integration notes
The MVP creates two transaction rows on booking:
1. `payment` for the rental total
2. `deposit_hold` for a fixed 250 GEL authorization

Replace `lib/payments.ts` with Stripe, Bank of Georgia, or TBC endpoints when ready.

## Storage/KYC notes
`app/api/upload/route.ts` is a placeholder. In production use S3/R2/Supabase Storage or a bank-grade KYC provider. Store private document URLs only, never public links.
