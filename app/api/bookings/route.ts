import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { Resend } from 'resend';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { cars } from '@/lib/sample-data';
import { calculateBooking, DEPOSIT_GEL, insurancePlans, type InsurancePlan } from '@/lib/constants';
import { daysBetween } from '@/lib/utils';
import { authorizeDeposit, createRentalPayment } from '@/lib/payments';
import { bookingConfirmationEmail } from '@/lib/email';

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
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const guestId = (session.user as any).id as string | undefined;
  if (!guestId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

  const input = schema.parse(await req.json());
  const car = cars.find(c => c.id === input.carId);
  if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 });

  const days = daysBetween(input.startDate, input.endDate);
  const totals = calculateBooking(car.dailyPrice, days, input.insurancePlan as InsurancePlan);
  const deliveryCost = input.deliveryCost ?? 0;
  const grandTotal = totals.total + deliveryCost;

  const [payment, hold] = await Promise.all([
    createRentalPayment(totals.total),
    authorizeDeposit(DEPOSIT_GEL),
  ]);

  const booking = await prisma.$transaction(async (tx) => {
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
        status: 'pending',
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

    return b;
  });

  // Send booking confirmation email — fire and forget, does not block response
  const validLangs = ['en', 'ka', 'ru'];
  prisma.profile.findUnique({
    where: { id: guestId },
    select: { email: true, fullName: true, lang: true },
  }).then(guest => {
    if (!guest?.email) return;
    const lang = validLangs.includes(guest.lang)
      ? (guest.lang as 'en' | 'ka' | 'ru')
      : 'en';
    const { html, subject } = bookingConfirmationEmail({
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
        type: car.type,
        transmission: car.transmission,
        fuelType: car.fuelType,
        seats: car.seats,
        location: car.location,
        color: car.color,
        images: car.images,
      },
      totals,
      days,
      insurancePlan: input.insurancePlan,
      grandTotal,
      siteUrl: SITE_URL,
    });
    return resend.emails.send({
      from: 'Drivo.ge <no-reply@waygo.ge>',
      to: guest.email,
      subject,
      html,
    });
  }).catch(console.error);

  return NextResponse.json({
    bookingId: booking.id,
    status: booking.status,
    totals,
    insurance: {
      planType: input.insurancePlan,
      deductibleAmount: insurancePlans[input.insurancePlan as InsurancePlan].deductible,
      status: 'inactive_until_condition_report',
    },
    transactions: [
      { type: 'payment', providerId: payment.providerId, amount: payment.amount, status: payment.status },
      { type: 'deposit_hold', providerId: hold.providerId, amount: hold.amount, status: hold.status },
    ],
  });
}
