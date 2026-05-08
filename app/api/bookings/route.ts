import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { Resend } from 'resend';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateBooking, DEPOSIT_GEL, insurancePlans, type InsurancePlan } from '@/lib/constants';
import { daysBetween } from '@/lib/utils';
import { authorizeDeposit, createRentalPayment } from '@/lib/payments';
import { bookingSubmittedEmail, hostBookingRequestEmail } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://waygo.ge';

const schema = z.object({
  carId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  insurancePlan: z.enum(['basic', 'standard', 'premium']),
  deliveryType: z.string().default('none'),
  deliveryCost: z.number().int().min(0).default(0),
  deliveryAddress: z.string().optional(),
  // View-only display currency (financial system always uses GEL)
  displayCurrency: z.enum(['GEL', 'USD', 'EUR']).default('GEL'),
  displayTotal: z.number().int().optional(),
  exchangeRateUsed: z.number().optional(),
});

function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const guestId = (session.user as any).id as string | undefined;
  if (!guestId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const input = schema.parse(await req.json());

  if (new Date(input.endDate) <= new Date(input.startDate)) {
    return NextResponse.json({ error: 'Return date must be after pickup date' }, { status: 400 });
  }

  // Load car from Prisma (not static data)
  const car = await prisma.car.findUnique({
    where: { id: input.carId },
    include: { owner: { select: { id: true, email: true, fullName: true, lang: true } } },
  });
  if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 });

  // Check availability: all dates in range must be in CarAvailability with no bookingId
  const requestedDates = dateRange(input.startDate, input.endDate);
  const availableRows = await prisma.carAvailability.findMany({
    where: {
      carId: input.carId,
      date: { in: requestedDates.map(d => new Date(d)) },
      bookingId: null,
    },
    select: { date: true },
  });
  const availableSet = new Set(availableRows.map(r => r.date.toISOString().split('T')[0]));
  const unavailable = requestedDates.filter(d => !availableSet.has(d));
  if (unavailable.length > 0) {
    return NextResponse.json({ error: 'dates_unavailable', dates: unavailable }, { status: 409 });
  }

  const days = daysBetween(input.startDate, input.endDate);
  const totals = calculateBooking(car.dailyPrice, days, input.insurancePlan as InsurancePlan);
  const deliveryCost = input.deliveryCost ?? 0;
  const grandTotal = totals.total + deliveryCost;

  const [payment, hold] = await Promise.all([
    createRentalPayment(totals.total),
    authorizeDeposit(car.depositGel ?? 250),
  ]);

  const hostApprovalDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

  let booking: Awaited<ReturnType<typeof prisma.booking.create>>;
  try {
   booking = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.create({
      data: {
        guestId,
        carId: input.carId,
        carBrand: car.brand,
        carModel: car.model,
        carYear: car.year,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        totalPrice: grandTotal,
        deliveryType: input.deliveryType ?? 'none',
        deliveryCost,
        deliveryAddress: input.deliveryAddress ?? null,
        status: 'awaiting_host',
        hostApprovalDeadline,
        platformFeeGel: totals.platformFee,
        displayCurrency: input.displayCurrency ?? 'GEL',
        displayTotal: input.displayTotal ?? grandTotal,
        exchangeRateUsed: input.exchangeRateUsed ?? null,
      },
    });

    await tx.insurancePolicy.create({
      data: {
        bookingId: b.id,
        planType: input.insurancePlan,
        deductibleAmount: insurancePlans[input.insurancePlan as InsurancePlan].deductible,
        status: 'inactive',
      },
    });

    await tx.transaction.create({
      data: {
        bookingId: b.id,
        providerId: payment.providerId,
        amount: payment.amount,
        type: 'payment',
        status: payment.status,
      },
    });

    await tx.transaction.create({
      data: {
        bookingId: b.id,
        providerId: hold.providerId,
        amount: hold.amount,
        type: 'deposit_hold',
        status: hold.status,
      },
    });

    // Reserve availability — count must match to detect concurrent bookings
    const reserved = await tx.carAvailability.updateMany({
      where: {
        carId: input.carId,
        date: { in: requestedDates.map(d => new Date(d)) },
        bookingId: null,
      },
      data: { bookingId: b.id },
    });

    if (reserved.count !== requestedDates.length) {
      throw Object.assign(new Error('dates_unavailable'), { code: 'DATES_TAKEN' });
    }

    return b;
  });
  } catch (err: any) {
    if (err?.code === 'DATES_TAKEN') {
      return NextResponse.json({ error: 'dates_unavailable' }, { status: 409 });
    }
    throw err;
  }

  // Send emails — fire and forget
  const validLangs = ['en', 'ka', 'ru'];
  prisma.profile.findUnique({
    where: { id: guestId },
    select: { email: true, fullName: true, lang: true, phone: true, idNumber: true },
  }).then(guest => {
    if (!guest?.email) return;
    const lang = validLangs.includes(guest.lang) ? (guest.lang as 'en' | 'ka' | 'ru') : 'en';

    const emailData = {
      guestName: guest.fullName,
      lang,
      booking: {
        id: booking.id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        deliveryType: booking.deliveryType,
        deliveryCost: booking.deliveryCost,
        deliveryAddress: booking.deliveryAddress,
      },
      car: {
        brand: car.brand,
        model: car.model,
        year: car.year,
        type: car.carType,
        transmission: car.transmission,
        fuelType: car.fuelType,
        seats: car.seats,
        location: car.location,
        color: car.color,
        images: car.imageUrls,
      },
      totals,
      days,
      insurancePlan: input.insurancePlan,
      grandTotal,
      siteUrl: SITE_URL,
      displayCurrency: input.displayCurrency !== 'GEL' ? input.displayCurrency : undefined,
      displayTotal: input.displayCurrency !== 'GEL' ? input.displayTotal : undefined,
      exchangeRateUsed: input.exchangeRateUsed,
    };

    const { html: guestHtml, subject: guestSubject } = bookingSubmittedEmail(emailData);
    const sends: Promise<unknown>[] = [
      resend.emails.send({ from: 'WAYGO <info@waygo.ge>', to: guest.email, subject: guestSubject, html: guestHtml }),
    ];

    if (car.owner?.email) {
      const { html: hostHtml, subject: hostSubject } = hostBookingRequestEmail({
        hostName: car.owner.fullName,
        hostEmail: car.owner.email,
        guestName: guest.fullName,
        guestPhone: guest.phone ?? '',
        guestIdNumber: guest.idNumber ?? '',
        car: { brand: car.brand, model: car.model, year: car.year, imageUrl: car.imageUrls[0] ?? null },
        booking: { id: booking.id, startDate: booking.startDate, endDate: booking.endDate, totalPrice: booking.totalPrice },
        days,
        deadline: hostApprovalDeadline,
        siteUrl: SITE_URL,
      });
      sends.push(resend.emails.send({ from: 'WAYGO <info@waygo.ge>', to: car.owner.email, subject: hostSubject, html: hostHtml }));
    }

    return Promise.all(sends);
  }).catch(console.error);

  return NextResponse.json({
    bookingId: booking.id,
    status: booking.status,
    totals,
    insurance: {
      planType: input.insurancePlan,
      deductibleAmount: insurancePlans[input.insurancePlan as InsurancePlan].deductible,
      status: 'inactive_until_host_approval',
    },
    transactions: [
      { type: 'payment', providerId: payment.providerId, amount: payment.amount, status: payment.status },
      { type: 'deposit_hold', providerId: hold.providerId, amount: hold.amount, status: hold.status },
    ],
  });
}
